import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { NavigationBar, Button } from '@/shared/ui'
import { activatePremium } from '@/entities/user'

type Method = 'TOSS' | 'CARD'

/** 결제 (18) — 모의 결제(v1.3). 실 PG 미연동 */
export function PayPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [method, setMethod] = useState<Method>('TOSS')

  // 모의 결제 활성화 — 성공 시 프리미엄 상태(me) 갱신 후 완료. 실패는 성공으로 가리지 않음
  const pay = useMutation({
    mutationFn: activatePremium,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] })
      navigate('/pay-done')
    },
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg-secondary)' }}>
      <NavigationBar title="결제" onBack={() => navigate(-1)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: '16px var(--spacing-xl)' }}>
        <div
          style={{
            position: 'relative',
            background: 'var(--color-bg-primary)',
            borderRadius: 16,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>
            ⭐ 찍어보카 프리미엄 (월 구독)
          </span>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            오늘 결제 후 매월 20일 자동 결제
          </span>
          <span style={{ position: 'absolute', right: 16, bottom: 16, fontSize: 18, fontWeight: 700, color: 'var(--color-text-brand)' }}>
            ₩4,900
          </span>
        </div>

        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-tertiary)', marginTop: 4 }}>
          결제 수단
        </span>
        <MethodCard
          selected={method === 'TOSS'}
          icon="💙"
          title="토스페이"
          sub="간편결제 · 즉시 완료"
          onClick={() => setMethod('TOSS')}
        />
        <MethodCard
          selected={method === 'CARD'}
          icon="💳"
          title="신용·체크카드"
          sub="모든 카드사 지원"
          onClick={() => setMethod('CARD')}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          <AgreeRow text="(필수) 정기결제 이용약관 동의" />
          <AgreeRow text="(필수) 전자금융거래 이용약관 동의" />
        </div>

        <p style={{ margin: 0, textAlign: 'center', fontSize: 11, color: 'var(--color-text-tertiary)' }}>
          🔐 토스페이먼츠 안전결제 · 결제 정보는 저장되지 않아요
        </p>
      </div>

      <div style={{ background: 'var(--color-bg-primary)', padding: '12px var(--spacing-xl) 32px' }}>
        {pay.isError && (
          <p style={{ margin: '0 0 10px', textAlign: 'center', fontSize: 12, color: 'var(--color-error-primary, #e5484d)' }}>
            {pay.error instanceof Error ? pay.error.message : '결제에 실패했어요. 다시 시도해 주세요.'}
          </p>
        )}
        <Button block size="lg" onClick={() => pay.mutate()} disabled={pay.isPending}>
          {pay.isPending ? '결제 중…' : '₩4,900 결제하기'}
        </Button>
      </div>
    </div>
  )
}

function MethodCard({
  selected,
  icon,
  title,
  sub,
  onClick,
}: {
  selected: boolean
  icon: string
  title: string
  sub: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        textAlign: 'left',
        height: 64,
        padding: '0 14px',
        background: 'var(--color-bg-primary)',
        border: selected ? '1.5px solid var(--color-brand-primary)' : '1px solid var(--color-border-default)',
        borderRadius: 14,
        cursor: 'pointer',
      }}
    >
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>
          {icon} {title}
        </span>
        <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{sub}</span>
      </div>
      <span
        style={{
          width: 20,
          height: 20,
          flexShrink: 0,
          borderRadius: '50%',
          border: '2px solid',
          borderColor: selected ? 'var(--color-brand-primary)' : 'var(--color-border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected && <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-brand-primary)' }} />}
      </span>
    </button>
  )
}

function AgreeRow({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: 5,
          background: 'var(--color-brand-primary)',
          color: 'var(--color-text-inverse)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 700,
        }}
        aria-hidden
      >
        ✓
      </span>
      <span style={{ flex: 1, fontSize: 12, color: 'var(--color-text-secondary)' }}>{text}</span>
      <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>보기</span>
    </div>
  )
}
