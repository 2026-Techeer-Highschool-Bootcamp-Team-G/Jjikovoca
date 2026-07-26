import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ListRow } from '@/shared/ui'
import { fetchMe, deactivatePremium } from '@/entities/user'
import { fetchExpSummary } from '@/entities/exp'
import { fetchExams } from '@/entities/exam'

// ISO → "M월 D일"
function mmdd(iso?: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : `${d.getMonth() + 1}월 ${d.getDate()}일`
}

/** 마이페이지 (14 마이) — 프로필·프리미엄·학습·계정 */
export function MyPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  // 실 API — 실패/빈 응답을 가짜값으로 가리지 않고 실값 또는 빈/0 상태로 표시
  const me = useQuery({ queryKey: ['me'], queryFn: fetchMe })
  const exp = useQuery({ queryKey: ['exp-summary'], queryFn: fetchExpSummary })
  const exams = useQuery({ queryKey: ['exams'], queryFn: fetchExams })

  const nickname = me.data?.nickname ?? ''
  const email = me.data?.email ?? ''
  const premium = me.data?.premium ?? false
  const premiumAmount = me.data?.premiumAmount ?? 4900
  const premiumExpiry = mmdd(me.data?.premiumExpiresAt)
  const level = exp.data?.level ?? 0
  const expVal = exp.data?.exp ?? 0
  const nextExp = exp.data?.nextLevelExp ?? 0
  const nearest = exams.data?.[0]
  const examLabel = nearest ? `${nearest.title} D-${nearest.dday}` : '시험 미등록'

  // 프리미엄 해지 — 해지해도 만료일까지 이용 가능
  const cancel = useMutation({
    mutationFn: deactivatePremium,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '12px var(--spacing-xl) 0' }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          마이페이지
        </h1>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px var(--spacing-xl) 0' }}>
        <ProfileCard nickname={nickname} email={email} level={level} exp={expVal} nextExp={nextExp} />
        <PremiumCard
          premium={premium}
          amount={premiumAmount}
          expiry={premiumExpiry}
          canceled={cancel.isSuccess}
          canceling={cancel.isPending}
          onManage={() => navigate('/paywall')}
          onCancel={() => cancel.mutate()}
        />
      </div>

      <SectionLabel>학습</SectionLabel>
      <ListRow
        title="📅 시험 일정"
        value={examLabel}
        valueColor="var(--color-brand-primary)"
        divider
        onClick={() => navigate('/exam')}
      />
      <ListRow title="📁 원문 보관함" showArrow onClick={() => navigate('/archive')} />

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

function ProfileCard({
  nickname,
  email,
  level,
  exp,
  nextExp,
}: {
  nickname: string
  email: string
  level: number
  exp: number
  nextExp: number
}) {
  const ratio = nextExp > 0 ? Math.min(1, exp / nextExp) : 0
  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--color-bg-primary)',
        borderRadius: 16,
        padding: 16,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)' }}>{nickname}</span>
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
            Lv.{level} 단어 헌터
          </span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{email}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--color-bg-secondary)', overflow: 'hidden' }}>
            <div style={{ width: `${ratio * 100}%`, height: '100%', background: 'var(--color-brand-primary)', borderRadius: 3 }} />
          </div>
          <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>{exp}/{nextExp}</span>
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

function PremiumCard({
  premium,
  amount,
  expiry,
  canceled,
  canceling,
  onManage,
  onCancel,
}: {
  premium: boolean
  amount: number
  expiry: string
  canceled: boolean
  canceling: boolean
  onManage: () => void
  onCancel: () => void
}) {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: 64,
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
        {premium ? '⭐ 프리미엄 이용 중' : '무료 플랜 이용 중'}
      </span>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>
        {premium ? `월 ₩${amount.toLocaleString()} · 다음 결제 ${expiry}` : '프리미엄으로 더 많은 기능을 열어보세요'}
      </span>
      {premium &&
        (canceled ? (
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>해지됨 · {expiry}까지 이용 가능</span>
        ) : (
          <button
            type="button"
            onClick={onCancel}
            disabled={canceling}
            style={{
              alignSelf: 'flex-start',
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: 11,
              color: 'rgba(255,255,255,0.5)',
              textDecoration: 'underline',
              cursor: canceling ? 'default' : 'pointer',
            }}
          >
            {canceling ? '처리 중…' : '구독 해지'}
          </button>
        ))}
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
        {premium ? '관리 ›' : '업그레이드 ›'}
      </button>
    </div>
  )
}
