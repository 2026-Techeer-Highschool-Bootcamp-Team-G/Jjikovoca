import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Tabs, Chip, Button, SearchBar, BottomSheet } from '@/shared/ui'
import { CardRow } from '@/widgets/card-row'
import type { CardRowView } from '@/widgets/card-row'
import { StudySetupSheet } from '@/features/study-setup'
import { fetchCards } from '@/entities/card'
import type { Card, FeedSubject } from '@/entities/card'

const SUBJECT_TABS: { key: FeedSubject; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'ENGLISH', label: '영어' },
  { key: 'MATH', label: '수학' },
]

type Status = 'ALL' | 'GRADUATED' | 'WAITING' | 'WEAK' | 'UNTAGGED'
const STATUS_CHIPS: { key: Status; label: string }[] = [
  { key: 'ALL', label: '전체 128' },
  { key: 'GRADUATED', label: '졸업완료 13' },
  { key: 'WAITING', label: '복습대기 15' },
  { key: 'WEAK', label: '약점유형' },
  { key: 'UNTAGGED', label: '시험 미지정' },
]

// 백엔드 연결 전 데모 데이터 (프로토타입 06 오답노트와 동일)
const sampleRows: CardRowView[] = [
  {
    id: 1,
    title: 'sound',
    pronunciation: '[saʊnd]',
    subtitle: '타당한, 믿을 만한 · n. 소리',
    tags: [
      { label: '형용사', tone: 'grey' },
      { label: '학업', tone: 'blue' },
    ],
    typeBadge: { label: '다의어', color: 'red' },
    exams: ['중간고사'],
    showSpeaker: true,
  },
  {
    id: 2,
    title: 'take charge of',
    subtitle: '~을 책임지다, 맡다',
    tags: [
      { label: '동사구', tone: 'grey' },
      { label: '회사', tone: 'blue' },
    ],
    typeBadge: { label: '숙어', color: 'blue' },
    exams: ['중간고사'],
    showSpeaker: true,
  },
  {
    id: 3,
    title: 'x² − 5x + 6 = 0 의 두 근',
    subtitle: '이차방정식 · 인수분해 · 사고 단계 4개',
    tags: [
      { label: '수학', tone: 'grey' },
      { label: '문제', tone: 'blue' },
    ],
    untagged: true,
  },
]

// 피드 Card → 행 뷰 매핑. pronunciation·품사 tags·유형 배지는 피드 미제공(후속 백엔드)
function toRow(c: Card): CardRowView {
  const isWord = c.type === 'WORD'
  const exams = c.exams ?? []
  return {
    id: c.id,
    title: isWord ? (c.word ?? '') : (c.latex ?? c.summary ?? '문제'),
    subtitle: isWord ? (c.contextMeaning ?? '') : (c.summary ?? ''),
    exams: exams.map((e) => e.title),
    untagged: exams.length === 0,
    showSpeaker: isWord,
  }
}

/** 오답노트 (F-04) — 06 오답노트 */
export function WrongNotePage() {
  const navigate = useNavigate()
  const [subject, setSubject] = useState<FeedSubject>('ALL')
  // 실 피드 조회 — 백엔드 실패/미가동 시 목업 폴백(데모 유지)
  const { data } = useQuery({ queryKey: ['cards', subject], queryFn: () => fetchCards(subject), retry: 0 })
  const rows = data ? data.map(toRow) : sampleRows
  const [status, setStatus] = useState<Status>('ALL')
  const [setupOpen, setSetupOpen] = useState(false)
  // 스피커로 발음 재생 중인 단어 — 듣기 끝날 때까지 그 행을 강조 (오답노트 QA)
  const [speakingId, setSpeakingId] = useState<number | null>(null)
  const speakingRef = useRef<number | null>(null)

  // 발음 재생: 이전 재생을 취소하고 그 단어로 강조를 옮긴다. onend/onerror에 강조 해제
  const handleSpeak = (row: CardRowView) => {
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined
    if (!synth) return
    synth.cancel() // 이전 발음 중단 → 강조가 여러 단어에 남지 않도록
    const u = new SpeechSynthesisUtterance(row.title)
    u.lang = 'en-US'
    u.rate = 0.9
    const clear = () => {
      if (speakingRef.current === row.id) {
        speakingRef.current = null
        setSpeakingId(null)
      }
    }
    u.onend = clear
    u.onerror = clear
    speakingRef.current = row.id
    setSpeakingId(row.id)
    synth.speak(u)
  }

  // 화면을 떠날 때 재생 중이면 멈춘다
  useEffect(() => {
    return () => window.speechSynthesis?.cancel()
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px var(--spacing-xl) 0',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          오답노트
        </h1>
        <button
          type="button"
          onClick={() => navigate('/export')}
          style={{
            background: 'var(--color-brand-primary)',
            color: 'var(--color-text-inverse)',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            padding: '5px 12px',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          PDF ↗
        </button>
      </div>

      <div style={{ padding: '12px var(--spacing-xl) 0' }}>
        <SearchBar placeholder="단어 · 문제 · 개념 검색" onClick={() => navigate('/search')} />
      </div>

      <div style={{ marginTop: 12, background: 'var(--color-bg-primary)' }}>
        <Tabs tabs={SUBJECT_TABS} value={subject} onChange={setSubject} />
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          padding: '12px var(--spacing-xl)',
        }}
      >
        {STATUS_CHIPS.map((c) => (
          <div key={c.key} style={{ flexShrink: 0 }}>
            <Chip active={status === c.key} onClick={() => setStatus(c.key)}>
              {c.label}
            </Chip>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 var(--spacing-xl)' }}>
        <Button block size="lg" onClick={() => setSetupOpen(true)}>
          학습하기
        </Button>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '12px var(--spacing-xl) 8px',
        }}
      >
        <button
          type="button"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--color-text-brand)',
            cursor: 'pointer',
          }}
        >
          몰라요 빈도순 ▾
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 var(--spacing-xl)' }}>
        {rows.map((row) => (
          <CardRow
            key={row.id}
            row={row}
            speaking={speakingId === row.id}
            onSpeak={() => handleSpeak(row)}
            onExamTag={row.untagged ? () => navigate('/exam-select') : undefined}
            onClick={() =>
              navigate(row.untagged ? '/math-problem' : row.id === 2 ? '/cloze' : '/flashcard')
            }
          />
        ))}
      </div>

      <div style={{ padding: '12px var(--spacing-xl) 24px' }}>
        <button
          type="button"
          style={{
            width: '100%',
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border-default)',
            color: 'var(--color-text-secondary)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          더보기 124개 ▾
        </button>
      </div>

      <BottomSheet open={setupOpen} onClose={() => setSetupOpen(false)}>
        <StudySetupSheet
          onStart={(method, type) => {
            setSetupOpen(false)
            if (method === 'PICK') navigate('/study-pick')
            else navigate(type === 'FLASHCARD' ? '/flashcard' : '/cloze')
          }}
        />
      </BottomSheet>
    </div>
  )
}
