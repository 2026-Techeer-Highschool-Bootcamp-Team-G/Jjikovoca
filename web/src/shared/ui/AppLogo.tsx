interface Props {
  size?: number
}

/**
 * 앱 로고 마크 — 뷰파인더(찍다) + 형광펜(보카). Figma 앱 아이콘(node 340:1004) 인라인 SVG 재현.
 * 좌표계 viewBox 512: 파란 그라데이션 라운드 스퀘어 + 흰 뷰파인더 브래킷 8개 + 노란 형광펜 marker(기울기 실측 rotate -8).
 */
export function AppLogo({ size = 56 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="jjik-logo-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4593FC" />
          <stop offset="1" stopColor="#2272EB" />
        </linearGradient>
        <linearGradient id="jjik-logo-mk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFEA7A" />
          <stop offset="1" stopColor="#FFD84D" />
        </linearGradient>
        <linearGradient id="jjik-logo-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.18" />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="115" fill="url(#jjik-logo-bg)" />
      <g fill="#FFFFFF">
        <rect x="108" y="108" width="92" height="30" rx="15" />
        <rect x="108" y="108" width="30" height="92" rx="15" />
        <rect x="312" y="108" width="92" height="30" rx="15" />
        <rect x="374" y="108" width="30" height="92" rx="15" />
        <rect x="108" y="374" width="92" height="30" rx="15" />
        <rect x="108" y="312" width="30" height="92" rx="15" />
        <rect x="312" y="374" width="92" height="30" rx="15" />
        <rect x="374" y="312" width="30" height="92" rx="15" />
      </g>
      <rect x="148" y="251" width="216" height="60" rx="30" fill="url(#jjik-logo-mk)" transform="rotate(-8 256 281)" />
      <rect width="512" height="512" rx="115" fill="url(#jjik-logo-sheen)" />
    </svg>
  )
}
