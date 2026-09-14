// 01 로그인 — 상단 브랜드 히어로 + 입력 2개 + CTA 2개 (LoginPage.tsx 재현)
const { Button: LoginButton, TextField: LoginTextField, AppLogo: LoginLogo } = window.DesignSystem_1cf846

function LoginScreen({ onLogin }) {
  const [email, setEmail] = React.useState('minji@school.kr')
  const [password, setPassword] = React.useState('••••••••')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100%', background: 'var(--gradient-auth)', padding: '0 var(--spacing-xl)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingTop: 100 }}>
        <div style={{ borderRadius: 'var(--radius-logo-24)', boxShadow: 'var(--shadow-logo)', display: 'flex' }}>
          <LoginLogo size={96} />
        </div>
        <h1 style={{ margin: '12px 0 0', fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)' }}>찍어보카</h1>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-secondary)' }}>내 시험지로 만든 나만의 단어장</p>
      </div>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 32 }}>
        <LoginTextField value={email} onChange={setEmail} placeholder="이메일" type="email" />
        <LoginTextField value={password} onChange={setPassword} placeholder="비밀번호" type="password" />
        <LoginButton block size="lg" onClick={onLogin}>로그인</LoginButton>
        <LoginButton block size="lg" variant="weak">이메일로 회원가입</LoginButton>
      </div>
      <p style={{ margin: '16px 0 0', fontSize: 12, color: 'var(--color-text-tertiary)' }}>소셜 로그인은 다음 버전에서 제공돼요</p>
    </div>
  )
}

window.LoginScreen = LoginScreen
