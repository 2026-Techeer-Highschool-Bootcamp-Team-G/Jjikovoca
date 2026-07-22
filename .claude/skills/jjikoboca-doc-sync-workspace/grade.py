#!/usr/bin/env python3
"""iteration-1 자동 채점 — grep + sqlglot로 assertion 판정, 각 run에 grading.json 생성."""
import json, re, os, subprocess, sys

IT = "/Users/chosunghoon/Desktop/Second_Brain/Project/EduLens/Jjikovoca/Jjikovoca/.claude/skills/jjikoboca-doc-sync-workspace/iteration-1"
ORIG = "/Users/chosunghoon/Desktop/Second_Brain/Project/EduLens/Jjikovoca/context"
SQLGLOT_PY = "/tmp/sqlglot_venv/bin/python3"

def read(path):
    try:
        return open(path, encoding="utf-8").read()
    except Exception:
        return ""

def doc(docs, prefix):
    for f in os.listdir(docs):
        if f.startswith(prefix):
            return read(os.path.join(docs, f))
    return ""

def create_tables(md):
    """마크다운에서 CREATE TABLE ... ) ...; 블록들을 대략 추출."""
    blocks = re.findall(r"CREATE TABLE.*?\n\)\s*ENGINE[^;]*;", md, re.S | re.I)
    if not blocks:
        blocks = re.findall(r"CREATE TABLE.*?\n\);", md, re.S | re.I)
    return blocks

def sqlglot_ok(md):
    blocks = create_tables(md)
    if not blocks:
        return None, "CREATE TABLE 블록 미발견"
    script = "import sqlglot,sys\nsql=sys.stdin.read()\n" \
             "[sqlglot.parse_one(s,read='mysql') for s in sql.split('\\x00') if s.strip()]\nprint('OK')"
    try:
        r = subprocess.run([SQLGLOT_PY, "-c", script], input="\x00".join(blocks),
                           capture_output=True, text=True, timeout=60)
        return (r.returncode == 0 and "OK" in r.stdout), (r.stdout + r.stderr).strip()[:200]
    except Exception as e:
        return None, f"실행불가: {e}"

def orig_lacks(prefix, needle):
    return needle.lower() not in doc(ORIG, prefix).lower()

def grade(eval_name, docs):
    d02, d03, d04, d17 = (doc(docs, p) for p in ("02", "03", "04", "17"))
    A = []
    def add(text, passed, ev): A.append({"text": text, "passed": bool(passed), "evidence": ev})
    sg_ok, sg_ev = sqlglot_ok(d03)

    if eval_name in ("difficulty-field", "difficulty"):
        has = "example_difficulty" in d03.lower() or "difficulty" in d03.lower()
        add("03 ERD에 난이도 컬럼 추가", has and re.search(r"EASY.*NORMAL.*HARD", d03, re.I) is not None,
            "example_difficulty+CHECK" if has else "미발견")
        add("04 API에 난이도 필드 반영", "difficulty" in d04.lower(),
            "exampleDifficulty" if "exampledifficulty" in d04.lower() else ("difficulty 언급" if "difficulty" in d04.lower() else "없음"))
        add("02 요구사항에 난이도 기능 기술", "난이도" in d02, "난이도 언급" if "난이도" in d02 else "없음")
        consistent = all(re.search(r"EASY", x, re.I) and re.search(r"HARD", x, re.I) for x in (d02, d03, d04))
        add("enum EASY/NORMAL/HARD가 02·03·04 일관", consistent, "3문서 모두 EASY/HARD 표기" if consistent else "일부 누락")
        add("03 버전 증가+변경 이력", "2026-07-23" in d03, "2026-07-23 이력" if "2026-07-23" in d03 else "날짜 미기재")
        add("03 DDL sqlglot 파싱 성공", sg_ok, sg_ev)
        add("원본 context 미변경", orig_lacks("03", "example_difficulty"), "원본 03에 신규 컬럼 없음")

    elif eval_name == "streak-freeze":
        add("02에 F-30 스트릭 프리즈 정의", "F-30" in d02 and ("프리즈" in d02 or "freeze" in d02.lower()),
            "F-30 정의" if "F-30" in d02 else "없음")
        add("03에 프리즈 저장 구조 추가", "freeze" in d03.lower(), "freeze 컬럼/테이블" if "freeze" in d03.lower() else "없음")
        add("04에 프리즈 필드/엔드포인트 반영", "freeze" in d04.lower(), "freeze 필드" if "freeze" in d04.lower() else "없음")
        add("17 사용자플로우 반영", "freeze" in d17.lower() or "프리즈" in d17, "17 반영" if ("freeze" in d17.lower() or "프리즈" in d17) else "미반영")
        add("버전 증가+변경 이력", "2026-07-23" in d03 and "2026-07-23" in d02, "02·03 이력 기재")
        add("03 DDL sqlglot 파싱 성공", sg_ok, sg_ev)
        add("원본 context 미변경", orig_lacks("02", "F-30"), "원본 02에 F-30 없음")

    elif eval_name == "remove-duration":
        live = re.sub(r"🗑.*", "", d03)  # 제거 마커 줄 제외 근사
        gone = "duration_ms" not in re.sub(r"(제거|삭제|🗑|~~).*duration_ms.*", "", d03)
        add("03 study_log에서 duration_ms 제거", "duration_ms" not in create_tables_join(d03),
            "DDL에 duration_ms 없음" if "duration_ms" not in create_tables_join(d03) else "DDL에 잔존")
        add("04에서 durationMs 참조 정리", "durationms" not in strip_removed(d04).lower(),
            "라이브 durationMs 없음")
        add("03 버전 증가+변경 이력", "2026-07-23" in d03, "2026-07-23 이력" if "2026-07-23" in d03 else "없음")
        add("03 study_log DDL sqlglot 파싱 성공", sg_ok, sg_ev)
        add("대상 외 문서 duration_ms 잔존 없음", "duration_ms" not in strip_removed(d17), "17 잔존 없음")
        add("원본 context 미변경(원본엔 duration_ms 존재)", "duration_ms" in doc(ORIG, "03"), "원본 03에 duration_ms 그대로")
    return A

def create_tables_join(md):
    return "\n".join(create_tables(md))

def strip_removed(md):
    # 제거 마커/변경이력 줄 제거 근사 → 라이브 참조만 남김
    return "\n".join(l for l in md.splitlines() if not re.search(r"제거|삭제|🗑|~~|변경 ?이력|changelog", l, re.I))

def main():
    results = {}
    for e in sorted(os.listdir(IT)):
        ep = os.path.join(IT, e)
        if not os.path.isdir(ep) or not e.startswith("eval-"):
            continue
        name = e.split("-", 2)[2]
        for cfg in ("with_skill", "without_skill"):
            docs = os.path.join(ep, cfg, "docs")
            if not os.path.isdir(docs):
                continue
            A = grade(name, docs)
            out = {"expectations": A}
            json.dump(out, open(os.path.join(ep, cfg, "grading.json"), "w"), ensure_ascii=False, indent=2)
            p = sum(1 for a in A if a["passed"])
            results[f"{e}/{cfg}"] = f"{p}/{len(A)}"
    print(json.dumps(results, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
