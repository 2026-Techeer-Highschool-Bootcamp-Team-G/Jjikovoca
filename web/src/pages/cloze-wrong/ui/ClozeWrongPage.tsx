import { useNavigate } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { NavigationBar } from '@/shared/ui'
import { ClozeCard, OptionGrid, ClozeFeedback } from '@/features/cloze'
import type { ClozeQuestion } from '@/features/cloze'
import { GradeButtons } from '@/features/study-grade'
import type { Grade } from '@/features/study-grade'

const INDEX = 2
const TOTAL = 10

// 프로토타입 11-3 빈칸 퀴즈 — 오답 (185:1020)과 동일. 오답(care) 선택 후 채점된 상태를 고정 렌더.
const question: ClozeQuestion = {
  pre: 'Dr. Reyes, who had taken ',
  post: ' of the project, resolved the crisis early.',
  answer: 'charge',
  translationBlank: '프로젝트를 (    )하게 된 박사가 위기를 해결했다.',
  translationFilled: '프로젝트를 맡게 된 레예스 박사가 위기를 일찍 해결했다.',
  options: [
    { word: 'care', meaning: '돌보다, 보살핌' },
    { word: 'charge', meaning: '책임; 요금' },
    { word: 'control', meaning: '통제하다, 지배하다' },
    { word: 'note', meaning: '메모; 주목하다' },
  ],
  wordPhrase: 'take charge of — ~을 책임지다, 맡다',
  correctNote: '예문 속에서는 "프로젝트를 맡아"라는 뜻으로 쓰였어요.',
  wrongNote: '이 카드는 Box 0으로 이동 — 내일 다시 만나요',
}

const pageStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  background: 'var(--color-bg-secondary)',
}

/** 11-3 빈칸 퀴즈 — 오답 (F-06) — 오답 판정 결과 화면 */
export function ClozeWrongPage() {
  const navigate = useNavigate()
  const handleGrade = (_grade: Grade) => navigate(-1)

  return (
    <div style={pageStyle}>
      <NavigationBar
        title="빈칸 퀴즈"
        onBack={() => navigate(-1)}
        right={
          <span style={{ fontSize: 15, color: 'var(--color-text-brand)' }}>
            {INDEX} / {TOTAL}
          </span>
        }
      />

      <div style={{ padding: '12px var(--spacing-xl) 0' }}>
        <div style={{ height: 4, borderRadius: 2, background: 'var(--color-border-default)', overflow: 'hidden' }}>
          <div
            style={{
              width: `${(INDEX / TOTAL) * 100}%`,
              height: '100%',
              borderRadius: 2,
              background: 'var(--color-brand-primary)',
            }}
          />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: '16px var(--spacing-xl)' }}>
        <ClozeCard question={question} graded correct={false} />

        <OptionGrid
          options={question.options}
          answer={question.answer}
          selected="care"
          graded
          onSelect={() => {}}
        />

        <ClozeFeedback question={question} correct={false} />

        <div style={{ marginTop: 'auto', paddingTop: 8 }}>
          <GradeButtons onGrade={handleGrade} />
        </div>
      </div>
    </div>
  )
}
