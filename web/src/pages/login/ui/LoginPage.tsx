import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Button, TextField } from '@/shared/ui'
import { login } from '@/features/auth'

const GRADIENT = 'linear-gradient(180deg, var(--color-brand-weak) 0%, var(--color-bg-primary) 55%)'

/** 로그인 (F-01) — 01 로그인 */
export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  // 가드가 넘긴 원래 목적지로 복귀(없으면 홈)
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { mutate, isPending, error } = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: () => navigate(from, { replace: true }),
  })
  const canSubmit = email.trim() !== '' && password !== '' && !isPending

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        background: GRADIENT,
        padding: '0 var(--spacing-xl)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingTop: 100 }}>
        <BrandLogo />
        <h1 style={{ margin: '12px 0 0', fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          찍어보카
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-secondary)' }}>
          내 시험지로 만든 나만의 단어장
        </p>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 32 }}>
        <TextField value={email} onChange={setEmail} placeholder="이메일" type="email" />
        <TextField value={password} onChange={setPassword} placeholder="비밀번호" type="password" />
        {error && (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-danger)' }}>
            {(error as Error).message}
          </p>
        )}
        <Button block size="lg" onClick={() => mutate()} disabled={!canSubmit}>
          {isPending ? '로그인 중…' : '로그인'}
        </Button>
        <Button block size="lg" variant="weak" onClick={() => navigate('/register')}>
          이메일로 회원가입
        </Button>
      </div>

      <p style={{ margin: '16px 0 0', fontSize: 12, color: 'var(--color-text-tertiary)' }}>
        소셜 로그인은 다음 버전에서 제공돼요
      </p>
    </div>
  )
}

// 앱 로고 (26:205) — 블루 스쿼클 + 흰 뷰파인더 브래킷 + 노란 형광펜 스트립
function BrandLogo() {
  const bracket = (pos: CSSProperties): CSSProperties => ({
    position: 'absolute',
    width: 16,
    height: 16,
    ...pos,
  })
  return (
    <div
      style={{
        position: 'relative',
        width: 96,
        height: 96,
        borderRadius: 24,
        background: 'linear-gradient(180deg, #4593fc, #2272eb)',
        overflow: 'hidden',
        boxShadow: '0 8px 18px rgba(25,31,40,0.14)',
      }}
      aria-hidden
    >
      <span style={bracket({ top: 20, left: 20, borderTop: '3px solid #fff', borderLeft: '3px solid #fff', borderTopLeftRadius: 4 })} />
      <span style={bracket({ top: 20, right: 20, borderTop: '3px solid #fff', borderRight: '3px solid #fff', borderTopRightRadius: 4 })} />
      <span style={bracket({ bottom: 20, left: 20, borderBottom: '3px solid #fff', borderLeft: '3px solid #fff', borderBottomLeftRadius: 4 })} />
      <span style={bracket({ bottom: 20, right: 20, borderBottom: '3px solid #fff', borderRight: '3px solid #fff', borderBottomRightRadius: 4 })} />
      <span
        style={{
          position: 'absolute',
          left: 27,
          top: 42,
          width: 42,
          height: 11,
          borderRadius: 6,
          background: 'linear-gradient(180deg, #ffea7a, #ffd84d)',
          transform: 'rotate(-6deg)',
          boxShadow: '0 1px 2px rgba(14,61,140,0.28)',
        }}
      />
    </div>
  )
}
