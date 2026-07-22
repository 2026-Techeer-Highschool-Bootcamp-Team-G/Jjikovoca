import { useNavigate } from 'react-router-dom'
import { ListRow } from '@/shared/ui'

/** 마이페이지 (14 마이) — 프로필·프리미엄·학습·계정 */
export function MyPage() {
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '12px var(--spacing-xl) 0' }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          마이페이지
        </h1>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px var(--spacing-xl) 0' }}>
        <ProfileCard />
        <PremiumCard onManage={() => navigate('/paywall')} />
      </div>

      <SectionLabel>학습</SectionLabel>
      <ListRow
        title="📅 시험 일정"
        value="중간고사 D-7"
        valueColor="var(--color-brand-primary)"
        divider
        onClick={() => navigate('/exam')}
      />
      <ListRow
        title="📁 원문 보관함"
        value="오늘 3장"
        valueColor="var(--color-brand-primary)"
        onClick={() => navigate('/archive')}
      />

      <SectionLabel>계정</SectionLabel>
      <ListRow title="📢 공지사항" showArrow />

      <button
        type="button"
        onClick={() => navigate('/withdraw')}
        style={{
          margin: '24px 0',
          background: 'none',
          border: 'none',
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--color-text-tertiary)',
          cursor: 'pointer',
        }}
      >
        로그아웃 &nbsp;·&nbsp; 탈퇴하기
      </button>
    </div>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <span
      style={{
        padding: '20px var(--spacing-xl) 8px',
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--color-text-tertiary)',
      }}
    >
      {children}
    </span>
  )
}

function ProfileCard() {
  const ratio = 320 / 400
  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--color-bg-primary)',
        borderRadius: 16,
        padding: 16,
        display: 'flex',
        gap: 14,
        alignItems: 'center',
      }}
    >
      <span
        style={{
          width: 56,
          height: 56,
          flexShrink: 0,
          borderRadius: 28,
          background: 'var(--color-brand-weak)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
        }}
        aria-hidden
      >
        🦉
      </span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)' }}>테스터</span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: 'var(--color-text-brand)',
              background: 'var(--color-brand-weak)',
              borderRadius: 'var(--radius-full)',
              padding: '2px 8px',
            }}
          >
            Lv.5 단어 헌터
          </span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>test@edulens.kr</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--color-bg-secondary)', overflow: 'hidden' }}>
            <div style={{ width: `${ratio * 100}%`, height: '100%', background: 'var(--color-brand-primary)', borderRadius: 3 }} />
          </div>
          <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>320/400</span>
        </div>
      </div>
      <button
        type="button"
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          background: 'none',
          border: 'none',
          padding: 0,
          fontSize: 12,
          color: 'var(--color-text-tertiary)',
          cursor: 'pointer',
        }}
      >
        편집 ›
      </button>
    </div>
  )
}

function PremiumCard({ onManage }: { onManage: () => void }) {
  return (
    <div
      style={{
        position: 'relative',
        height: 64,
        borderRadius: 14,
        background: 'linear-gradient(90deg, #191f28, #333d4b)',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 4,
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--common-white)' }}>
        ⭐ 프리미엄 이용 중
      </span>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>
        월 ₩4,900 · 다음 결제 8월 20일
      </span>
      <button
        type="button"
        onClick={onManage}
        style={{
          position: 'absolute',
          top: 20,
          right: 16,
          background: 'none',
          border: 'none',
          padding: 0,
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--color-highlight)',
          cursor: 'pointer',
        }}
      >
        관리 ›
      </button>
    </div>
  )
}
