import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { NavigationBar, Button, TextField } from '@/shared/ui'
import { register } from '@/features/auth'

const GRADIENT = 'linear-gradient(180deg, var(--color-brand-weak) 0%, var(--color-bg-primary) 55%)'

/** 회원가입 (F-01) — 02 회원가입 */
export function RegisterPage() {
  const navigate = useNavigate()
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const { mutate, isPending, error } = useMutation({
    mutationFn: () => register(email, password, nickname || undefined),
    onSuccess: () => navigate('/'),
  })

  // 클라 검증: 이메일·6자 이상 비밀번호·비밀번호 확인 일치
  const mismatch = confirm !== '' && password !== confirm
  const canSubmit =
    email.trim() !== '' && password.length >= 6 && password === confirm && !isPending

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: GRADIENT }}>
      <NavigationBar title="회원가입" onBack={() => navigate(-1)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, padding: '20px var(--spacing-xl) 32px' }}>
        <TextField label="닉네임" value={nickname} onChange={setNickname} placeholder="보카마스터" />
        <TextField label="이메일" value={email} onChange={setEmail} placeholder="voca@ddikbo.com" type="email" />
        <TextField
          label="비밀번호"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          type="password"
          helper="6자 이상 입력해 주세요"
        />
        <TextField
          label="비밀번호 확인"
          value={confirm}
          onChange={setConfirm}
          placeholder="••••••••"
          type="password"
        />
        {mismatch && (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-danger)' }}>
            비밀번호가 일치하지 않아요
          </p>
        )}
        {error && (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-danger)' }}>
            {(error as Error).message}
          </p>
        )}

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <Button block size="lg" onClick={() => mutate()} disabled={!canSubmit}>
            {isPending ? '가입 중…' : '가입하기'}
          </Button>
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--color-text-tertiary)', cursor: 'pointer' }}
          >
            이미 계정이 있나요?{' '}
            <span style={{ fontWeight: 500, color: 'var(--color-text-brand)' }}>로그인</span>
          </button>
        </div>
      </div>
    </div>
  )
}
