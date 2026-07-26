import { NavLink, Link } from 'react-router-dom'
import type { ComponentType } from 'react'
import { IconBook, IconChart, IconHome, IconUser, AppLogo } from '@/shared/ui'

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

// 하단 내비게이션 (21:22) — 5탭 + 중앙 앱 로고 FAB(촬영 진입, 돌출, 라벨 없음)
export function BottomNav() {
  return (
    <nav
      style={{
        // 하단 고정 — 앱 폭(480) 중앙 정렬. FAB(absolute)의 positioned 컨테이너도 겸함
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 480,
        zIndex: 50,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'flex-start',
        // 스마트폰 하단 인디케이터(safe-area)만큼 여백 추가
        height: 'calc(82px + env(safe-area-inset-bottom))',
        padding: '8px 24px calc(24px + env(safe-area-inset-bottom))',
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
          top: -16,
          transform: 'translateX(-50%)',
          width: 56,
          height: 56,
          // 로고 자체가 라운드 스퀘어 배경(rx 22.5%)을 가지므로 래퍼 반경을 맞춰 그림자가 로고 형태를 따르게 한다
          borderRadius: 13,
          display: 'flex',
          boxShadow: 'var(--shadow-fab)',
        }}
      >
        <AppLogo size={56} />
      </Link>
    </nav>
  )
}
