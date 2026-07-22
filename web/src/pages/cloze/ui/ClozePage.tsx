import { useNavigate } from 'react-router-dom'
import { NavigationBar, Button } from '@/shared/ui'
import { ClozeCard, OptionGrid } from '@/features/cloze'
import type { ClozeQuestion } from '@/features/cloze'

const INDEX = 2
const TOTAL = 10

// 백엔드 연결 전 데모 (프로토타입 11 빈칸 퀴즈와 동일)
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

/** 빈칸 퀴즈 (F-06) — 11-1. 보기를 고르면 정답(11-2)·오답(11-3) 결과 화면으로 이동 */
export function ClozePage() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'var(--color-bg-secondary)',
      }}
    >
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
        <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>빈칸에 들어갈 단어를 고르세요</span>

        <ClozeCard question={question} graded={false} correct={false} />

        <OptionGrid
          options={question.options}
          answer={question.answer}
          selected={null}
          graded={false}
          onSelect={(word) => navigate(word === question.answer ? '/cloze-correct' : '/cloze-wrong')}
        />

        <div style={{ marginTop: 'auto', paddingTop: 8 }}>
          <Button block size="lg" disabled style={{ opacity: 0.4 }}>
            다음 문제
          </Button>
        </div>

        <p style={{ margin: 0, textAlign: 'center', fontSize: 12, color: 'var(--color-text-tertiary)' }}>
          숙어 take ___ of — 보기를 고르면 바로 채점돼요
        </p>
      </div>
    </div>
  )
}
