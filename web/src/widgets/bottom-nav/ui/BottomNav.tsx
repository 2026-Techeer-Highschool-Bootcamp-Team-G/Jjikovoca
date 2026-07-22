import { NavLink, Link } from 'react-router-dom'
import type { ComponentType } from 'react'
import { IconBook, IconCamera, IconChart, IconHome, IconUser } from '@/shared/ui'

interface Item {
  to: string
  label: string
  icon: ComponentType<{ size?: number }>
  end?: boolean
}

const LEFT: Item[] = [
  { to: '/', label: '홈', icon: IconHome, end: true },
  { to: '/wrong-note', label: '오답노트', icon: IconBook },
]
const RIGHT: Item[] = [
  { to: '/report', label: '리포트', icon: IconChart },
  { to: '/my', label: '마이', icon: IconUser },
]

function NavItem({ item }: { item: Item }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      style={({ isActive }) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        flex: 1,
        color: isActive ? 'var(--color-text-brand)' : 'var(--color-text-tertiary)',
      })}
    >
      {({ isActive }) => (
        <>
          <Icon size={24} />
          <span style={{ fontSize: 10, fontWeight: isActive ? 500 : 400 }}>{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

// 하단 내비게이션 (21:22) — 5탭 + 중앙 카메라 FAB(돌출, 라벨 없음)
export function BottomNav() {
  return (
    <nav
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        height: 82,
        padding: '8px 24px 24px',
        background: 'var(--color-bg-primary)',
        borderTop: '1px solid var(--color-border-default)',
      }}
    >
      {LEFT.map((item) => (
        <NavItem key={item.to} item={item} />
      ))}
      <div style={{ flex: 1 }} aria-hidden />
      {RIGHT.map((item) => (
        <NavItem key={item.to} item={item} />
      ))}
      <Link
        to="/capture"
        aria-label="촬영"
        style={{
          position: 'absolute',
          left: '50%',
          top: -15,
          transform: 'translateX(-50%)',
          width: 54,
          height: 54,
          borderRadius: 27,
          background: 'var(--color-brand-primary)',
          color: 'var(--color-text-inverse)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-fab)',
        }}
      >
        <IconCamera size={24} />
      </Link>
    </nav>
  )
}
