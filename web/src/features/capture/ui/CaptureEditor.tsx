import { useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode, SVGProps } from 'react'
import { IconClose, Button } from '@/shared/ui'

type Mode = 'highlighter' | 'box'
interface Rect {
  x: number
  y: number
  w: number
  h: number
  mode: Mode
}

export interface CaptureResult {
  regions: number
  hasBox: boolean // 네모 박스(문제)가 있으면 수학으로 분석
}

interface Props {
  imageSrc: string
  onDone: (result: CaptureResult) => void
  onClose: () => void
}

// 촬영/선택 이미지 위에서 형광펜(단어)·네모 박스(문제)를 드래그로 크롭 (F-02 듀얼 제스처)
export function CaptureEditor({ imageSrc, onDone, onClose }: Props) {
  const [mode, setMode] = useState<Mode>('highlighter')
  const [regions, setRegions] = useState<Rect[]>([])
  const [draft, setDraft] = useState<Rect | null>(null)
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null) // 펜 끝(형광펜 드래그 중 스파클)
  const areaRef = useRef<HTMLDivElement>(null)
  const startRef = useRef<{ x: number; y: number } | null>(null)

  const toLocal = (e: ReactPointerEvent) => {
    const r = areaRef.current?.getBoundingClientRect()
    if (!r) return { x: 0, y: 0 }
    return {
      x: Math.max(0, Math.min(e.clientX - r.left, r.width)),
      y: Math.max(0, Math.min(e.clientY - r.top, r.height)),
    }
  }

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    const p = toLocal(e)
    startRef.current = p
    setDraft({ x: p.x, y: p.y, w: 0, h: 0, mode })
    setTip(p)
  }
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = startRef.current
    if (!s) return
    const p = toLocal(e)
    setTip(p)
    setDraft({
      x: Math.min(s.x, p.x),
      y: Math.min(s.y, p.y),
      w: Math.abs(p.x - s.x),
      h: Math.abs(p.y - s.y),
      mode,
    })
  }
  const onUp = () => {
    if (draft && draft.w > 8 && draft.h > 8) setRegions((r) => [...r, draft])
    setDraft(null)
    setTip(null)
    startRef.current = null
  }

  const undo = () => setRegions((r) => r.slice(0, -1))

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--grey-900)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 56, width: '100%', position: 'relative' }}>
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          style={{ position: 'absolute', left: 12, background: 'none', border: 'none', color: 'var(--common-white)', cursor: 'pointer', display: 'inline-flex' }}
        >
          <IconClose />
        </button>
        <span style={{ fontSize: 17, fontWeight: 500, color: 'var(--common-white)' }}>드래그로 표시</span>
        {regions.length > 0 && (
          <button
            type="button"
            onClick={undo}
            style={{ position: 'absolute', right: 16, background: 'none', border: 'none', color: 'var(--color-brand-primary)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >
            되돌리기
          </button>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0 12px' }}>
        <div
          ref={areaRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          style={{
            position: 'relative',
            maxWidth: '100%',
            maxHeight: '62vh',
            touchAction: 'none',
            cursor: 'crosshair',
            userSelect: 'none',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <img
            src={imageSrc}
            alt="촬영한 시험지"
            draggable={false}
            style={{ display: 'block', maxWidth: '100%', maxHeight: '62vh', pointerEvents: 'none' }}
          />
          {regions.map((r, i) => (
            <RegionView key={i} r={r} />
          ))}
          {draft && <RegionView r={draft} draft />}
          {/* 형광펜 펜 끝 스파클 — 손으로 칠하는 느낌 (F-02 반짝임, 펜 끝을 따라다님) */}
          {tip && draft?.mode === 'highlighter' && (
            <>
              <span
                style={{
                  position: 'absolute',
                  left: tip.x,
                  top: tip.y,
                  transform: 'translate(-50%, -50%)',
                  fontSize: 20,
                  color: '#ffd84d',
                  pointerEvents: 'none',
                  filter: 'drop-shadow(0 0 5px rgba(255,216,77,0.95))',
                  animation: 'jjik-twinkle 0.45s ease-in-out infinite',
                }}
                aria-hidden
              >
                ✦
              </span>
              <span
                style={{
                  position: 'absolute',
                  left: tip.x - 11,
                  top: tip.y - 9,
                  transform: 'translate(-50%, -50%)',
                  fontSize: 11,
                  color: '#fff6c9',
                  pointerEvents: 'none',
                  animation: 'jjik-twinkle 0.45s ease-in-out 0.15s infinite',
                }}
                aria-hidden
              >
                ✦
              </span>
            </>
          )}
        </div>
      </div>

      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 12, textAlign: 'center', padding: '0 24px' }}>
        {mode === 'highlighter'
          ? '모르는 단어에 형광펜을 긋듯 드래그하세요'
          : '모르는 문제와 풀이에 네모 박스로 드래그하세요'}
      </span>

      <ModeToggle mode={mode} onHighlighter={() => setMode('highlighter')} onBox={() => setMode('box')} />

      <div style={{ width: '100%', padding: '16px var(--spacing-xl) 32px' }}>
        <Button
          block
          size="lg"
          disabled={regions.length === 0}
          style={{ opacity: regions.length === 0 ? 0.4 : 1 }}
          onClick={() => onDone({ regions: regions.length, hasBox: regions.some((r) => r.mode === 'box') })}
        >
          {regions.length === 0 ? '표시할 부분을 드래그하세요' : `${regions.length}곳 분석하기`}
        </Button>
      </div>
    </div>
  )
}

// 표시 영역 렌더 — 형광펜(손칠 마커·잉크 시머) / 네모 박스(점선 마칭 앤츠)
function RegionView({ r, draft = false }: { r: Rect; draft?: boolean }) {
  if (r.mode === 'highlighter') {
    return (
      <div
        style={{
          position: 'absolute',
          left: r.x,
          top: r.y,
          width: r.w,
          height: r.h,
          borderRadius: 7,
          background: 'linear-gradient(180deg, rgba(255,238,130,0.78), rgba(255,214,64,0.82))',
          mixBlendMode: 'multiply',
          boxShadow: '0 0 12px rgba(255,214,64,0.65)',
          transformOrigin: 'center top',
          animation: draft ? 'jjik-highlight-in 140ms ease-out' : 'jjik-highlight-shimmer 1.5s ease-in-out infinite',
        }}
        aria-hidden
      />
    )
  }
  const w = Math.max(0, r.w)
  const h = Math.max(0, r.h)
  return (
    <svg
      style={{ position: 'absolute', left: r.x, top: r.y, width: w, height: h, overflow: 'visible', pointerEvents: 'none' }}
      aria-hidden
    >
      <rect
        x={1.5}
        y={1.5}
        width={Math.max(0, w - 3)}
        height={Math.max(0, h - 3)}
        rx={8}
        fill="rgba(255,228,94,0.12)"
        stroke="#ffe45e"
        strokeWidth={3}
        strokeDasharray="10 8"
        style={{ animation: 'jjik-march 0.6s linear infinite' }}
      />
    </svg>
  )
}

// 형광펜 / 네모 박스 모드 토글
function ModeToggle({
  mode,
  onHighlighter,
  onBox,
}: {
  mode: Mode
  onHighlighter: () => void
  onBox: () => void
}) {
  return (
    <div style={{ display: 'inline-flex', gap: 4, padding: 4, borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.14)' }}>
      <Seg active={mode === 'highlighter'} icon={<IconHighlighter size={16} />} label="형광펜" onClick={onHighlighter} />
      <Seg active={mode === 'box'} icon={<IconPlus size={16} />} label="네모 박스" onClick={onBox} />
    </div>
  )
}

function Seg({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: 'none',
        cursor: active ? 'default' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
        borderRadius: 'var(--radius-full)',
        background: active ? 'var(--common-white)' : 'transparent',
        color: active ? 'var(--grey-900)' : 'rgba(255,255,255,0.75)',
        fontSize: 13,
        fontWeight: 500,
      }}
    >
      {icon}
      {label}
    </button>
  )
}

function IconHighlighter({ size = 16, ...rest }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...rest}>
      <path d="M3.7 12.5 2.8 14.2h2.4l.8-1.5" />
      <path d="M10.5 3.5l2 2-5.3 5.3-2.6.6.6-2.6z" />
    </svg>
  )
}

function IconPlus({ size = 16, ...rest }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden {...rest}>
      <line x1="8" y1="3.3" x2="8" y2="12.7" />
      <line x1="3.3" y1="8" x2="12.7" y2="8" />
    </svg>
  )
}
