// UI 키트용 가짜 데이터 — 요구사항 v3.2 기준(다중 태그·알헷몰 누적·활성 시험·구독 플랜)
const ACTIVE_EXAM = { label: '중간고사', dday: 7, date: '9월 20일' }

const WORDS = [
  { id: 1, word: 'inevitable', pronunciation: '[ɪnˈevɪtəbl]', meaning: '피할 수 없는', emoji: '⚖️',
    tags: ['#수능특강', '#중요', '#형용사'], exams: [ACTIVE_EXAM], ratings: { know: 4, confused: 2, dontKnow: 1 },
    example: 'A change of plan seemed inevitable.', exampleTranslation: '계획 변경은 피할 수 없어 보였다.' },
  { id: 2, word: 'diligent', pronunciation: '[ˈdɪlɪdʒənt]', meaning: '성실한', emoji: '📚',
    tags: ['#내신', '#형용사'], exams: [], ratings: { know: 1, confused: 3, dontKnow: 5 },
    example: 'She is a diligent student.', exampleTranslation: '그는 성실한 학생이다.' },
  { id: 3, word: 'fluctuate', pronunciation: '[ˈflʌktʃueɪt]', meaning: '변동하다', emoji: '📈',
    tags: ['#수능특강', '#동사', '#독해'], exams: [ACTIVE_EXAM], ratings: { know: 0, confused: 2, dontKnow: 6 },
    example: 'Prices fluctuate with demand.', exampleTranslation: '가격은 수요에 따라 변동한다.' },
  { id: 4, word: 'remarkable', pronunciation: '[rɪˈmɑːrkəbl]', meaning: '놀라운', emoji: '✨',
    tags: ['#듣기', '#형용사'], exams: [], ratings: { know: 6, confused: 1, dontKnow: 0 },
    example: 'He made remarkable progress.', exampleTranslation: '그는 놀라운 발전을 이뤘다.' },
  { id: 5, word: 'consequence', pronunciation: '[ˈkɑːnsɪkwens]', meaning: '결과', emoji: '🧩',
    tags: ['#수능특강', '#명사'], exams: [{ label: '기말고사', dday: 46 }], ratings: { know: 2, confused: 4, dontKnow: 3 },
    example: 'Every choice has a consequence.', exampleTranslation: '모든 선택에는 결과가 있다.' },
]

// 단어장 상단 태그 필터 탭 — 시험 태그가 앞, 사용자 태그가 뒤 (FR-04)
const TAG_TABS = [
  { key: 'ALL', label: '전체', count: WORDS.length },
  { key: 'EXAM_MID', label: ACTIVE_EXAM.label, kind: 'exam', dday: ACTIVE_EXAM.dday, count: 2 },
  { key: 'EXAM_FIN', label: '기말고사', kind: 'exam', dday: 46, count: 1 },
  { key: '#수능특강', label: '#수능특강', count: 3 },
  { key: '#형용사', label: '#형용사', count: 3 },
  { key: '#동사', label: '#동사', count: 1 },
  { key: '#내신', label: '#내신', count: 1 },
]

const matchesTag = (w, key) => {
  if (key === 'ALL') return true
  if (key === 'EXAM_MID') return w.exams.some((e) => e.label === ACTIVE_EXAM.label)
  if (key === 'EXAM_FIN') return w.exams.some((e) => e.label === '기말고사')
  return w.tags.includes(key)
}

const wrongRate = (w) => w.ratings.dontKnow - w.ratings.know

const toRow = (w) => ({
  id: w.id,
  title: w.word,
  pronunciation: w.pronunciation,
  subtitle: w.meaning,
  tags: w.tags.map((label) => ({ label })),
  exams: w.exams,
  untagged: w.exams.length === 0,
  ratings: w.ratings,
  showSpeaker: true,
  example: w.example,
  exampleTranslation: w.exampleTranslation,
})

const toCard = (w) => ({
  word: w.word,
  pronunciation: w.pronunciation,
  meaning: w.meaning,
  emoji: w.emoji,
  example: w.example,
  exampleTranslation: w.exampleTranslation,
  tags: [...w.exams.map((e) => ({ label: e.label, kind: 'exam', dday: e.dday })), ...w.tags.map((label) => ({ label }))],
})

const ME = { nickname: '민지', email: 'minji@school.kr', level: 7, exp: 320, nextExp: 500, streakDays: 16, plan: 'PLUS', planAmount: 3900, planRenewal: '10월 4일', quotaUsed: 12, quotaLimit: 20 }

// 학습 리포트 (FR-09) — 방사형 차트 없음, 도넛 + 주간 막대 + 약한 단어 Top3
const REPORT = {
  month: '9월',
  newWords: 38,
  accuracy: 78,
  studyMinutes: 214,
  ratingMix: [
    { label: '알아요', value: 62, color: 'var(--color-rating-know)' },
    { label: '헷갈려요', value: 24, color: 'var(--color-rating-confused)' },
    { label: '몰라요', value: 14, color: 'var(--color-rating-dont-know)' },
  ],
  weekly: [
    { label: '월', value: 12 }, { label: '화', value: 24 }, { label: '수', value: 8 },
    { label: '목', value: 31 }, { label: '금', value: 18 }, { label: '토', value: 42 }, { label: '일', value: 26 },
  ],
  grass: Array.from({ length: 91 }, (_, i) => (i < 40 ? (i % 7 === 0 ? 0 : (i % 5) % 5) : [0, 1, 2, 3, 4, 3, 2][i % 7])),
  weakTop3: [WORDS[2], WORDS[1], WORDS[4]],
}

const PLANS = [
  { name: 'Free', price: 0, quota: '사진 분석 하루 3회', features: ['플래시카드·빈칸 퀴즈', '단어장 다중 태그'] },
  { name: 'Plus', price: 3900, quota: '사진 분석 하루 20회', recommended: true, features: ['AI 연상 이미지 무제한', '시험지 PDF 내보내기'] },
  { name: 'Pro', price: 6900, quota: '사진 분석 하루 40회', features: ['AI 오답 시험지', '학습 리포트 상세 지표'] },
]

Object.assign(window, { WORDS, TAG_TABS, ACTIVE_EXAM, REPORT, PLANS, ME, toRow, toCard, matchesTag, wrongRate })
