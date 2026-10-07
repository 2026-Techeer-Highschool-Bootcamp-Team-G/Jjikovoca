// 14 마이 — 프로필 + 성장 + 활성 시험(FR-11) + 테마 설정(FR-17) + 구독 플랜(FR-19)
const { ListRow: MyListRow, GameStatusCard: MyGameStatus, SegmentedControl: MySegmented, PlanCard: MyPlanCard, BottomSheet: MySheet, TagChip: MyTagChip, Button: MyButton, StreakGrid: MyGrass } = window.DesignSystem_1cf846

function MyScreen({ onLogout, theme, onTheme }) {
  const me = window.ME
  const [activeExam, setActiveExam] = React.useState(true)
  const [plans, setPlans] = React.useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 120 }}>
      <header style={{ padding: '12px var(--spacing-xl) 0' }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)' }}>마이페이지</h1>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px var(--spacing-xl) 0' }}>
        <div style={{ position: 'relative', background: 'var(--color-bg-primary)', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)' }}>{me.nickname}</span>
              <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-brand)', background: 'var(--color-brand-weak)', borderRadius: 'var(--radius-full)', padding: '2px 8px' }}>
                Lv.{me.level} 단어 헌터
              </span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{me.email}</span>
          </div>
          <button type="button" style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', padding: 0, fontSize: 12, color: 'var(--color-text-tertiary)', cursor: 'pointer' }}>
            편집 ›
          </button>
        </div>

        <MyGameStatus
          level={me.level}
          heroTitle="단어 헌터"
          exp={me.exp}
          nextExp={me.nextExp}
          streakDays={me.streakDays}
          questLabel="오늘의 복습 — 단어 10개 3/10 · 달성 시 +40XP"
        />

        <section style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-card-14)' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>학습 잔디</span>
          <MyGrass days={window.REPORT.grass} weeks={9} cell={11} showLegend={false} />
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16, background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-card-14)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>활성 시험</span>
            <span style={{ marginLeft: 'auto' }}>
              <MyTagChip kind="exam" label={window.ACTIVE_EXAM.label} dday={window.ACTIVE_EXAM.dday} />
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
            켜두면 시험 D-day까지 새로 촬영한 단어에 '{window.ACTIVE_EXAM.label}' 태그가 자동으로 붙어요
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MySegmented
              size="sm"
              value={activeExam ? 'on' : 'off'}
              onChange={(v) => setActiveExam(v === 'on')}
              options={[{ value: 'on', label: '자동 태깅 ON' }, { value: 'off', label: 'OFF' }]}
            />
            <button type="button" style={{ marginLeft: 'auto', background: 'none', border: 'none', padding: 0, fontSize: 12, fontWeight: 500, color: 'var(--color-text-brand)', cursor: 'pointer' }}>
              시험 등록 ›
            </button>
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16, background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-card-14)' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>화면 테마</span>
          <MySegmented
            block
            value={theme}
            onChange={onTheme}
            options={[{ value: 'light', label: '라이트' }, { value: 'dark', label: '다크' }, { value: 'system', label: '시스템 자동' }]}
          />
        </section>

        <div style={{ position: 'relative', minHeight: 64, borderRadius: 'var(--radius-card-14)', background: 'var(--gradient-premium)', padding: '12px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--common-white)' }}>⭐ Plus 이용 중</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>
            월 ₩{me.planAmount.toLocaleString()} · 다음 결제 {me.planRenewal} · 사진 분석 {me.quotaUsed}/{me.quotaLimit}회
          </span>
          <button type="button" style={{ alignSelf: 'flex-start', background: 'none', border: 'none', padding: 0, fontSize: 11, color: 'rgba(255,255,255,0.5)', textDecoration: 'underline', cursor: 'pointer' }}>
            구독 해지
          </button>
          <button
            type="button"
            onClick={() => setPlans(true)}
            style={{ position: 'absolute', top: 20, right: 16, background: 'none', border: 'none', padding: 0, fontSize: 12, fontWeight: 500, color: 'var(--color-highlight)', cursor: 'pointer' }}
          >
            플랜 변경 ›
          </button>
        </div>
      </div>

      <SectionLabel>학습</SectionLabel>
      <MyListRow title="📅 시험 일정" value={window.ACTIVE_EXAM.label + ' D-' + window.ACTIVE_EXAM.dday} valueColor="var(--color-brand-primary)" divider onClick={() => {}} />
      <MyListRow title="🏷️ 태그 관리" value="7개" divider onClick={() => {}} />
      <MyListRow title="🔔 알림" value="시험 D-day 리마인더" onClick={() => {}} />

      <SectionLabel>계정</SectionLabel>
      <MyListRow title="🔒 개인정보 처리방침" divider onClick={() => {}} />
      <MyListRow title="📄 이용약관" divider onClick={() => {}} />
      <MyListRow title="🚪 로그아웃" onClick={onLogout} />

      <button type="button" style={{ margin: '24px 0', background: 'none', border: 'none', textAlign: 'center', fontSize: 12, color: 'var(--color-text-tertiary)', textDecoration: 'underline', cursor: 'pointer' }}>
        회원 탈퇴 (데이터 즉시 파기)
      </button>

      <MySheet open={plans} onClose={() => setPlans(false)}>
        <h3 style={{ margin: '4px 0 0', fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)' }}>구독 플랜</h3>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)' }}>일일 사진 분석 한도를 늘려요</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 0' }}>
          {window.PLANS.map((p) => (
            <MyPlanCard
              key={p.name}
              name={p.name}
              price={p.price === 0 ? '무료' : p.price}
              quota={p.quota}
              features={p.features}
              recommended={p.recommended}
              current={p.name === 'Plus'}
              onSelect={() => setPlans(false)}
            />
          ))}
        </div>
        <p style={{ margin: 0, fontSize: 11, lineHeight: 1.6, color: 'var(--color-text-tertiary)' }}>
          매월 자동 갱신 · 해지는 스토어 구독 관리에서 언제든 가능해요 · 결제는 App Store / Google Play 인앱결제로만 진행돼요
        </p>
        <MyButton block size="lg" variant="ghost" onClick={() => setPlans(false)}>닫기</MyButton>
      </MySheet>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <span style={{ padding: '20px var(--spacing-xl) 8px', fontSize: 13, fontWeight: 500, color: 'var(--color-text-tertiary)' }}>{children}</span>
  )
}

window.MyScreen = MyScreen
