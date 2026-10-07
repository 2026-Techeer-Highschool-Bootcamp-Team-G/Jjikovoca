// 03 홈 — 헤더 + D-day 카드 + 플래시카드 캐러셀 (HomePage.tsx / RecentCarousel.tsx 재현)
const { AppHeader: HomeHeader, DdayCard: HomeDday, FlashCard: HomeFlashCard } = window.DesignSystem_1cf846

function HomeScreen({ onBell }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 100 }}>
      <HomeHeader onBell={onBell} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '6px var(--spacing-xl) 0' }}>
        <HomeDday title="중간고사" dday={12} memoryRate={68} todayDue={14} onClick={() => {}} />
      </div>
      <div style={{ padding: '16px 0 24px' }}>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '4px 0 8px', scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}>
          <div style={{ flex: '0 0 8%' }} aria-hidden />
          {window.WORDS.map((w) => (
            <div key={w.id} style={{ flex: '0 0 84%', scrollSnapAlign: 'center' }}>
              <HomeFlashCard card={window.toCard(w)} height={500} />
            </div>
          ))}
          <div style={{ flex: '0 0 8%' }} aria-hidden />
        </div>
      </div>
    </div>
  )
}

window.HomeScreen = HomeScreen
