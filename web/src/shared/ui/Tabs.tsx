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
export function Tabs<K extends string>({ tabs, value, onChange }: Props<K>) {
  return (
    <div
      style={{
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
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              paddingTop: 12,
              background: 'none',
              border: 'none',
            }}
          >
            <span
              style={{
                fontSize: 15,
                fontWeight: selected ? 500 : 400,
                color: selected ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
              }}
            >
              {tab.label}
            </span>
            <span
              style={{
                height: 2,
                width: '100%',
                background: selected ? 'var(--color-brand-primary)' : 'transparent',
              }}
            />
          </button>
        )
      })}
    </div>
  )
}
