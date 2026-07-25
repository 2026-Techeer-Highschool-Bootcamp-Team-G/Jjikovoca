export interface TabDef<K extends string> {
  key: K
  label: string
}

interface Props<K extends string> {
  tabs: TabDef<K>[]
  value: K
  onChange: (key: K) => void
}

// TDS Tab (9:21). Selected: 텍스트 강조 + 2px 브랜드 인디케이터 / Default: tertiary.
// 인디케이터는 버튼별 on/off 가 아니라 단일 바가 선택 탭 위치로 슬라이드(부드러운 전환).
export function Tabs<K extends string>({ tabs, value, onChange }: Props<K>) {
  const selectedIndex = Math.max(0, tabs.findIndex((t) => t.key === value))
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        height: 46,
        background: 'var(--color-bg-primary)',
        borderBottom: '1px solid var(--color-border-default)',
      }}
    >
      {tabs.map((tab) => {
        const selected = tab.key === value
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: 12,
              paddingBottom: 12,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                fontSize: 15,
                fontWeight: selected ? 500 : 400,
                color: selected ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                transition: 'color 0.2s ease',
              }}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
      {/* 슬라이딩 인디케이터 — 선택 탭 위치로 transform 이동(끊김 없이 부드럽게) */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: 2,
          width: `${100 / tabs.length}%`,
          background: 'var(--color-brand-primary)',
          transform: `translateX(${selectedIndex * 100}%)`,
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </div>
  )
}
