import { IconChevronRight, IconClock, IconFire } from '@/shared/ui'

interface Props {
  level: number
  heroTitle: string
  exp: number
  nextExp: number
  streakDays: number
  questLabel: string
  onQuestClick?: () => void
}

// 게임 상태 카드 (30:240, F-11/12) — 레벨·XP바·연속일 + 일일 퀘스트 행
export function GameStatusCard({
  level,
  heroTitle,
  exp,
  nextExp,
  streakDays,
  questLabel,
  onQuestClick,
}: Props) {
  const ratio = nextExp > 0 ? Math.min(1, exp / nextExp) : 0
  return (
    <section
      style={{
        background: 'var(--color-brand-weak)',
        borderRadius: 'var(--radius-lg)',
        padding: '12px 14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
              Lv.{level} {heroTitle}
            </span>
            <span
              style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', display: 'inline-flex', alignItems: 'center', gap: 3 }}
            >
              <span
                aria-hidden
                title={`연속 ${streakDays}일`}
                style={{
                  display: 'inline-flex',
                  color: 'var(--color-warning-primary, #ff8a3d)',
                  filter: streakDays >= 14 ? 'drop-shadow(0 0 5px rgba(255,120,40,0.65))' : undefined,
                }}
              >
                <IconFire size={16} />
              </span>
              연속 {streakDays}일
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <div
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                background: 'var(--color-bg-primary)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${ratio * 100}%`,
                  height: '100%',
                  background: 'var(--color-brand-primary)',
                  borderRadius: 3,
                }}
              />
            </div>
            <span
              style={{ fontSize: 11, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}
            >
              {exp} / {nextExp} XP
            </span>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.7)', margin: '12px 0 10px' }} />

      <button
        type="button"
        onClick={onQuestClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          width: '100%',
          background: 'none',
          border: 'none',
          padding: 0,
          color: 'var(--color-text-brand)',
        }}
      >
        <IconClock size={16} />
        <span
          style={{
            flex: 1,
            textAlign: 'left',
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--color-text-brand)', // 앱 전체 파란 톤과 통일(기존 무지개 → 브랜드 파랑)
          }}
        >
          {questLabel}
        </span>
        <IconChevronRight size={14} />
      </button>
    </section>
  )
}
