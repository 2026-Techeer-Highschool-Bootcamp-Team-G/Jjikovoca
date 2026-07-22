import { useNavigate } from 'react-router-dom'
import { Button, IconClose, IconCheck } from '@/shared/ui'

const GRADIENT = 'linear-gradient(180deg, var(--color-brand-weak) 0%, var(--color-bg-primary) 50%)'

const BENEFITS = [
  { title: 'AI 캡처 분석', value: '일 5회 → 일 100회' },
  { title: '오답 힌트 2·3단계', value: '전체 잠금 해제' },
  { title: 'PDF 시험지 (AI 편집)', value: '무제한 생성' },
  { title: '리포트 전체 + 복습 세트', value: '약점 기반 자동 생성' },
]

/** 프리미엄 페이월 (17) — BM */
export function PaywallPage() {
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: GRADIENT }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px var(--spacing-xl) 0' }}>
        <button
          type="button"
          aria-label="닫기"
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', display: 'inline-flex' }}
        >
          <IconClose />
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '8px var(--spacing-xl) 0' }}>
        <span style={{ fontSize: 44 }} aria-hidden>
          ⭐
        </span>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          찍어보카 프리미엄
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-secondary)' }}>
          잠겨 있던 힌트·리포트·PDF를 전부 열어보세요
        </p>

        <div
          style={{
            width: '100%',
            marginTop: 16,
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 16,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {BENEFITS.map((b) => (
            <div key={b.title} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: 'var(--color-text-brand)', display: 'inline-flex', flexShrink: 0 }}>
                <IconCheck size={18} />
              </span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                {b.title}
              </span>
              <span style={{ fontSize: 12, color: 'var(--color-text-brand)' }}>{b.value}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            position: 'relative',
            width: '100%',
            marginTop: 4,
            background: 'var(--color-brand-weak)',
            border: '1.5px solid var(--color-brand-primary)',
            borderRadius: 16,
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)' }}>월 ₩4,900</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            언제든 해지 · 해지 후에도 만료일까지 이용
          </span>
          <span
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              fontSize: 10,
              fontWeight: 500,
              color: 'var(--color-text-inverse)',
              background: 'var(--color-brand-primary)',
              borderRadius: 'var(--radius-full)',
              padding: '3px 8px',
            }}
          >
            커피 1잔 값
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, alignSelf: 'flex-start' }}>
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              background: 'var(--color-brand-primary)',
              color: 'var(--color-text-inverse)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
            }}
            aria-hidden
          >
            ✓
          </span>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            (필수) 만 14세 이상이거나 법정대리인 동의를 받았어요
          </span>
        </div>
      </div>

      <div style={{ background: 'var(--color-bg-primary)', padding: '12px var(--spacing-xl) 32px' }}>
        <Button block size="lg" onClick={() => navigate('/pay')}>
          프리미엄 시작하기
        </Button>
      </div>
    </div>
  )
}
