import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavigationBar } from '@/shared/ui'
import { FlashcardView } from '@/features/flashcard'
import type { FlashcardData } from '@/features/flashcard'
import { GradeButtons } from '@/features/study-grade'
import type { Grade } from '@/features/study-grade'

const INDEX = 3
const TOTAL = 12

// 백엔드 연결 전 데모 (프로토타입 10 플래시카드와 동일)
const sample: FlashcardData = {
  word: 'sound',
  pronunciation: '[saʊnd]',
  conceptEmoji: '⚖️',
  pos: '형용사',
  meaning: '타당한, 믿을 만한',
  dictNote: '사전 뜻: 소리; 건전한; 타당한 — 이 지문에서는 ③',
  frontTags: [
    { label: '형용사', tone: 'grey' },
    { label: '📚 학업', tone: 'blue' },
    { label: '다의어', tone: 'blue' },
  ],
  backTags: [
    { label: '📚 학업', tone: 'blue' },
    { label: '다의어', tone: 'red' },
  ],
  example: {
    pre: 'Her argument was ',
    highlight: 'sound',
    post: ' and convincing.',
    translation: '그녀의 주장은 타당하고 설득력 있었다.',
  },
}

/** 플래시카드 (F-05) — 10 플래시카드 */
export function FlashcardPage() {
  const navigate = useNavigate()
  const [flipped, setFlipped] = useState(false)

  const handleGrade = (grade: Grade) => {
    // v2: study_log 기록 + 다음 카드 로드. 데모는 '알아요' 4연속 졸업(10-3)으로 이동.
    if (grade === 'KNOW') {
      navigate('/card-done')
      return
    }
    setFlipped(false)
  }

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
        title="플래시카드"
        onBack={() => navigate(-1)}
        right={
          <span style={{ fontSize: 15, color: 'var(--color-text-brand)' }}>
            {INDEX} / {TOTAL}
          </span>
        }
      />

      <div style={{ padding: '12px var(--spacing-xl) 0' }}>
        <div
          style={{
            height: 4,
            borderRadius: 2,
            background: 'var(--color-border-default)',
            overflow: 'hidden',
          }}
        >
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

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px var(--spacing-xl) 0',
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-brand-weak)',
            color: 'var(--color-brand-primary)',
          }}
        >
          🧠 3일 뒤 잊을 확률 78%
        </span>
        {!flipped && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-warning-weak)',
              color: 'var(--yellow-900)',
            }}
          >
            ⚡ +10 XP
          </span>
        )}
      </div>

      <div style={{ padding: '16px var(--spacing-xl) 0' }}>
        <FlashcardView data={sample} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
      </div>

      <div style={{ marginTop: 'auto', padding: '0 var(--spacing-xl) 8px' }}>
        <GradeButtons onGrade={handleGrade} />
      </div>

      <p
        style={{
          margin: 0,
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--color-text-tertiary)',
          padding: '8px var(--spacing-xl) 24px',
        }}
      >
        {flipped
          ? '알아요 → Box 3 (7일 뒤 복습) · 소요 시간 자동 기록 중 ⏱ 4.2초'
          : '복습할수록 잊는 간격이 늘어나요 — 너에게 맞춘 다음 복습일로'}
      </p>
    </div>
  )
}
