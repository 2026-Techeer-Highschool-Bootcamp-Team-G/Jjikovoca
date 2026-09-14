// 앱 셸 — 폰 프레임 + 하단 탭 + 화면 전환 + 테마(FR-17). 촬영 FAB 은 캡처 보상 이펙트를 재생한다.
const { BottomNav: ShellNav, CaptureFlash: ShellFlash, NavigationBar: ShellNavBar, Badge: ShellBadge, OfflineNotice: ShellOffline, SegmentedControl: ShellSegmented } = window.DesignSystem_1cf846

function App() {
  const [screen, setScreen] = React.useState('login')
  const [tab, setTab] = React.useState('home')
  const [flash, setFlash] = React.useState(false)
  const [theme, setTheme] = React.useState('light')
  const [offline, setOffline] = React.useState(false)

  const resolved = theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme

  const capture = () => {
    setFlash(true)
    setTimeout(() => setFlash(false), 700)
  }

  let body = null
  if (offline) body = <ShellOffline description="단어장을 불러오지 못했어요 — 연결을 확인하고 다시 시도해주세요" onRetry={() => setOffline(false)} />
  else if (screen === 'login') body = <window.LoginScreen onLogin={() => setScreen('app')} />
  else if (screen === 'study') body = <window.StudyScreen onExit={() => setScreen('app')} />
  else if (screen === 'notifications') body = <NotificationsScreen onBack={() => setScreen('app')} />
  else if (tab === 'home') body = <window.HomeScreen onBell={() => setScreen('notifications')} />
  else if (tab === 'vocab') body = <window.VocabScreen onStudy={() => setScreen('study')} />
  else if (tab === 'my') body = <window.MyScreen onLogout={() => setScreen('login')} theme={theme} onTheme={setTheme} />
  else body = <window.ReportScreen />

  const showNav = screen === 'app' && !offline

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div className="phone" data-theme={resolved} style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="scroll">{body}</div>
        {showNav && <ShellNav active={tab} onSelect={setTab} onCapture={capture} />}
        <ShellFlash active={flash} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <ShellSegmented
          size="sm"
          value={theme}
          onChange={setTheme}
          options={[{ value: 'light', label: '라이트' }, { value: 'dark', label: '다크' }, { value: 'system', label: '시스템' }]}
        />
        <button
          type="button"
          onClick={() => setOffline((v) => !v)}
          style={{ height: 32, padding: '0 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border-default)', background: offline ? 'var(--color-danger-weak)' : 'var(--color-bg-primary)', color: offline ? 'var(--color-text-danger)' : 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)', fontSize: 12, cursor: 'pointer' }}
        >
          {offline ? '온라인으로 복귀' : '오프라인 상태 보기'}
        </button>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'center', maxWidth: 460 }}>
        로그인 → 홈 → 단어장(태그별 분류 · 알/헷/몰 누적) → 학습(방식 3종 → 유형 2종 → 플래시카드·빈칸) → 리포트 → 마이(활성 시험 · 테마 · 구독).
      </p>
    </div>
  )
}

// 08 알림 — 목록형(NotificationsPage.tsx)
function NotificationsScreen({ onBack }) {
  const items = [
    { title: '오늘 복습할 단어 14개가 준비됐어요', time: '오전 8:00', unread: true },
    { title: '중간고사 D-7 — 몰라요 단어 6개가 남았어요', time: '어제', unread: true },
    { title: '연속 16일 달성! +40XP', time: '2일 전', unread: false },
  ]
  return (
    <div style={{ minHeight: '100%', background: 'var(--color-bg-primary)' }}>
      <ShellNavBar title="알림" onBack={onBack} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '14px var(--spacing-xl)', borderBottom: '1px solid var(--color-border-default)' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 15, color: 'var(--color-text-primary)' }}>{it.title}</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{it.time}</span>
            </div>
            {it.unread && <ShellBadge color="blue" variant="weak">새 알림</ShellBadge>}
          </div>
        ))}
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
