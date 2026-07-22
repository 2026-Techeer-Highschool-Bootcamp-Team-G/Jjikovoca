import { IconSearch } from './icons'

interface Props {
  placeholder?: string
  onClick?: () => void
}

// 검색 진입 바 (41:236) — 탭 시 통합 검색(07)으로. 표시 전용(입력은 검색 화면에서).
export function SearchBar({ placeholder = '검색', onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        height: 44,
        padding: '0 14px',
        background: 'var(--color-bg-primary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--color-text-tertiary)',
        cursor: 'pointer',
      }}
    >
      <IconSearch size={18} />
      <span style={{ fontSize: 14 }}>{placeholder}</span>
    </button>
  )
}
