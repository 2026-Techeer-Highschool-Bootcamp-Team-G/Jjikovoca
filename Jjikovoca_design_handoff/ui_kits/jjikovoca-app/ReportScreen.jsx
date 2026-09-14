// 리포트 — 새 단어/정답률 도넛 + 주간 학습 시간 + 학습 잔디 + 약한 단어 Top3 (FR-09·FR-14)
const { DonutChart: RepDonut, MiniBarChart: RepBars, StreakGrid: RepGrass, CardRow: RepRow, ListHeader: RepHeader } = window.DesignSystem_1cf846

function ReportScreen() {
  const r = window.REPORT
  return (
    <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 120 }}>
      <header style={{ padding: '12px var(--spacing-xl) 0' }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)' }}>학습 리포트</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--color-text-secondary)' }}>{r.month} · 새로 추가한 단어 {r.newWords}개 · 학습 {r.studyMinutes}분</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px var(--spacing-xl) 0' }}>
        <Panel title="단어 정답률">
          <RepDonut centerValue={r.accuracy + '%'} centerLabel="정답률" segments={r.ratingMix} />
        </Panel>

        <Panel title="주간 학습 시간 분포">
          <RepBars data={r.weekly} />
        </Panel>

        <Panel title="학습 잔디">
          <RepGrass days={r.grass} streakDays={16} />
        </Panel>
      </div>

      <RepHeader title="나의 약한 단어 Top 3" link="단어장에서 보기" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 var(--spacing-xl)' }}>
        {r.weakTop3.map(window.toRow).map((row) => <RepRow key={row.id} row={row} />)}
      </div>
    </div>
  )
}

function Panel({ title, children }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-card-14)' }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{title}</span>
      {children}
    </section>
  )
}

Object.assign(window, { ReportScreen })
