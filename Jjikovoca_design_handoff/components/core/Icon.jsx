import React from 'react'

// Toss 스타일 라인 아이콘 (24px 그리드, 2px 스트로크, currentColor) — web/src/shared/ui/icons.tsx 세트를 그대로 이식
export const ICON_NAMES = [
  'menu','search','bell','clock','calendar','fire','check','refresh','trophy',
  'chevron-right','chevron-left','close','speaker','home','book','vocab','chart','user','camera',
]

const PATHS = {
  menu: <g><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></g>,
  search: <g><circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" /></g>,
  bell: <g><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></g>,
  clock: <g><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></g>,
  calendar: <g><rect x="3" y="4.5" width="18" height="16.5" rx="2" /><path d="M3 9.5h18" /><path d="M8 2.5v4M16 2.5v4" /></g>,
  fire: <path d="M12 2c1 3 4 4.6 4 8.5A4 4 0 0 1 8 11c0-1.3.5-2.2 1.2-3C9.9 9.4 11 8 12 2z" />,
  check: <polyline points="5 12 10 17 19 7" />,
  refresh: <g><path d="M21 12a9 9 0 1 1-3-6.7" /><polyline points="21 3 21 9 15 9" /></g>,
  trophy: <g><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10v5a5 5 0 0 1-10 0z" /><path d="M7 5H4v2a3 3 0 0 0 3 3" /><path d="M17 5h3v2a3 3 0 0 1-3 3" /></g>,
  'chevron-right': <polyline points="9 6 15 12 9 18" />,
  'chevron-left': <polyline points="15 6 9 12 15 18" />,
  close: <g><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></g>,
  speaker: <g><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /></g>,
  home: <g><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></g>,
  book: <g><rect x="5" y="3" width="14" height="18" rx="2" /><line x1="9" y1="7" x2="15" y2="7" /><line x1="9" y1="11" x2="13" y2="11" /></g>,
  vocab: <g><path d="M12 6.5v13" /><path d="M12 6.5C10.3 5.3 7.8 4.8 4 5.2v12.6c3.8-.4 6.3.1 8 1.3" /><path d="M12 6.5c1.7-1.2 4.2-1.7 8-1.3v12.6c-3.8-.4-6.3.1-8 1.3" /></g>,
  chart: <g><line x1="6" y1="20" x2="6" y2="14" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="18" y1="20" x2="18" y2="10" /></g>,
  user: <g><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></g>,
  camera: <g><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></g>,
}

export function Icon({ name, size = 24, style, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={style}
      {...rest}
    >
      {PATHS[name] || null}
    </svg>
  )
}
