import type { Grade } from '../model/types'

const BUTTONS: { grade: Grade; label: string; bg: string; fg: string }[] = [
  { grade: 'DONT_KNOW', label: '몰라요', bg: 'var(--color-danger-weak)', fg: 'var(--color-text-danger)' },
  { grade: 'CONFUSED', label: '헷갈려요', bg: 'var(--color-brand-weak)', fg: 'var(--color-text-brand)' },
  { grade: 'KNOW', label: '알아요', bg: 'var(--color-brand-primary)', fg: 'var(--color-text-inverse)' },
]

// 알/헷/몰 3버튼 (24:144) — 플래시카드·빈칸·수학 복습 공통
export function GradeButtons({ onGrade }: { onGrade: (grade: Grade) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {BUTTONS.map((b) => (
        <button
          key={b.grade}
          type="button"
          onClick={() => onGrade(b.grade)}
          style={{
            flex: 1,
            height: 48,
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: b.bg,
            color: b.fg,
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {b.label}
        </button>
      ))}
    </div>
  )
}
