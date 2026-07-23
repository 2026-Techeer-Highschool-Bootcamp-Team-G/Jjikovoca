import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { NavigationBar, Badge, Button } from '@/shared/ui'
import { fetchMathQueue } from '@/features/math-review'

type Reason = '개념' | '실수' | '오독' | '시간'
const REASONS: Reason[] = ['개념', '실수', '오독', '시간']

/** 오답 문제 상세 (05-9, F-26) — AI 분석 완료 후 정답 비공개 힌트 뷰 */
export function MathProblemPage() {
  const navigate = useNavigate()
  const [reason, setReason] = useState<Reason>('실수')
  // 실 큐에서 문제 제목 — 미가동 시 데모 폴백
  const math = useQuery({ queryKey: ['math'], queryFn: () => fetchMathQueue(), retry: 0 })
  const title = math.data?.[0]?.latex ?? 'x² − 5x + 6 = 0 의 두 근을 구하시오.'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg-secondary)' }}>
      <NavigationBar title="오답 문제" onBack={() => navigate(-1)} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px var(--spacing-xl) 24px' }}>
        {/* 문제 카드 — 탭하면 사고과정 복습(12) 시작 */}
        <button
          type="button"
          onClick={() => navigate('/math-review')}
          style={{
            textAlign: 'left',
            background: 'var(--color-bg-primary)',
            border: 'none',
            borderRadius: 16,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            cursor: 'pointer',
          }}
        >
          <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 8, padding: '24px 16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <span style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {title}
            </span>
            <span style={{ width: 260, height: 7, borderRadius: 3.5, background: '#d1d6db' }} />
            <span style={{ width: 180, height: 7, borderRadius: 3.5, background: '#d1d6db' }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Badge color="grey" variant="weak">수학</Badge>
            <Badge color="blue" variant="weak">이차방정식 · 인수분해</Badge>
            <Badge color="red" variant="weak">몰라요 2회</Badge>
          </div>
        </button>

        {/* AI 풀이 진단 */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--color-warning-weak)', borderRadius: 12, padding: '10px 14px' }}>
          <span style={{ fontSize: 16 }} aria-hidden>✍️</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-warning-primary)' }}>
              AI 풀이 진단 — 네 풀이를 읽어봤어요
            </span>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
              3단계(이항)에서 부호가 안 바뀌었어요. 거기서부터 다시 풀어봐요!
            </span>
          </div>
        </div>

        {/* 힌트 1 공개 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: 'var(--color-brand-weak)', borderRadius: 12, padding: '12px 16px' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-brand)' }}>💡 힌트 1</span>
          <span style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>
            곱해서 6, 더해서 5가 되는 두 수를 찾아보세요
          </span>
        </div>

        {/* 잠긴 힌트 2·3 */}
        {[
          { label: '힌트 2 — 인수분해 형태' },
          { label: '힌트 3 — 마지막 단계' },
        ].map((h) => (
          <div
            key={h.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 48,
              padding: '0 16px',
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 12,
            }}
          >
            <span style={{ fontSize: 14, color: 'var(--color-text-tertiary)' }}>{h.label}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-brand)' }}>🔒 프리미엄</span>
          </div>
        ))}

        <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
          정답은 보여주지 않아요 — 단계별 힌트로 직접 풀어요
        </span>

        {/* 오답 원인 태깅 */}
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', marginTop: 4 }}>
          지난번엔 왜 틀렸었나요?
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          {REASONS.map((r) => {
            const active = reason === r
            return (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 500,
                  background: active ? 'var(--color-brand-primary)' : 'var(--color-bg-primary)',
                  color: active ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                  border: active ? '1px solid transparent' : '1px solid var(--color-border-default)',
                  cursor: 'pointer',
                }}
              >
                {r}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ marginTop: 'auto', background: 'var(--color-bg-primary)', padding: '12px var(--spacing-xl) 32px' }}>
        <Button block size="lg" onClick={() => navigate('/wrong-note')}>
          오답 노트로 가기
        </Button>
      </div>
    </div>
  )
}
