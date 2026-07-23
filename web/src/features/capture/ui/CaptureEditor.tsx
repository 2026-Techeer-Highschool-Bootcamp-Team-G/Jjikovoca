import { useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode, SVGProps } from 'react'
import { IconClose, Button } from '@/shared/ui'

type Mode = 'highlighter' | 'box'
type Pt = { x: number; y: number }
type Stroke = { mode: 'highlighter'; points: Pt[] }
type Box = { mode: 'box'; x: number; y: number; w: number; h: number }
type Region = Stroke | Box

export interface CaptureResult {
  regions: number
  hasBox: boolean // 네모 박스(문제)가 있으면 수학으로 분석
}

interface Props {
  imageSrc: string
  onDone: (result: CaptureResult) => void
  onClose: () => void
}

const HL_STROKE = 'rgba(255,205,0,0.9)' // 형광펜 밑칠 — 진한 노랑

// 자유곡선 길이(px) — 아주 짧은 톡은 무시하려고 사용
function strokeLen(pts: Pt[]) {
  let d = 0
  for (let i = 1; i < pts.length; i++) d += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
  return d
}

// 삭제 배지 위치 — 박스는 우상단, 형광펜은 궤적 바운딩박스 우상단 (QA #5)
function regionAnchor(r: Region): Pt {
  if (r.mode === 'box') return { x: r.x + r.w, y: r.y }
  let maxX = -Infinity
  let minY = Infinity
  for (const p of r.points) {
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
  }
  return { x: maxX, y: minY }
}

// 촬영/선택 이미지 위에서 형광펜(손으로 칠하기)·네모 박스(드래그)로 표시 (F-02 듀얼 제스처)
export function CaptureEditor({ imageSrc, onDone, onClose }: Props) {
  const [mode, setMode] = useState<Mode>('highlighter')
  const [regions, setRegions] = useState<Region[]>([])
  const [draftStroke, setDraftStroke] = useState<Pt[] | null>(null)
  const [draftBox, setDraftBox] = useState<Box | null>(null)
  const [tip, setTip] = useState<Pt | null>(null)
  const areaRef = useRef<HTMLDivElement>(null)
  const strokeRef = useRef<Pt[] | null>(null)
  const startRef = useRef<Pt | null>(null)
  const boxRef = useRef<Box | null>(null) // 그리는 중인 박스 — 커밋 이중 실행(두 겹) 방지

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
    setTip(p)
    if (mode === 'highlighter') {
      strokeRef.current = [p]
      setDraftStroke([p])
    } else {
      startRef.current = p
      const b0: Box = { mode: 'box', x: p.x, y: p.y, w: 0, h: 0 }
      boxRef.current = b0
      setDraftBox(b0)
    }
  }

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const p = toLocal(e)
    if (strokeRef.current) {
      // 형광펜 — 지나간 손의 궤적을 그대로 따라 칠한다
      strokeRef.current = [...strokeRef.current, p]
      setDraftStroke(strokeRef.current)
      setTip(p)
    } else if (startRef.current) {
      const s = startRef.current
      const box: Box = { mode: 'box', x: Math.min(s.x, p.x), y: Math.min(s.y, p.y), w: Math.abs(p.x - s.x), h: Math.abs(p.y - s.y) }
      boxRef.current = box
      setDraftBox(box)
      setTip(p)
    }
  }

  const onUp = () => {
    if (strokeRef.current) {
      const pts = strokeRef.current
      strokeRef.current = null
      if (strokeLen(pts) > 12) setRegions((r) => [...r, { mode: 'highlighter', points: pts }])
      setDraftStroke(null)
    } else if (startRef.current) {
      const b = boxRef.current
      boxRef.current = null
      startRef.current = null
      if (b && b.w > 8 && b.h > 8) setRegions((r) => [...r, b])
      setDraftBox(null)
    }
    setTip(null)
  }

  const undo = () => setRegions((r) => r.slice(0, -1))
  const removeRegion = (idx: number) => setRegions((r) => r.filter((_, i) => i !== idx)) // QA #5

  const strokes = regions.filter((r): r is Stroke => r.mode === 'highlighter')
  const boxes = regions.filter((r): r is Box => r.mode === 'box')

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
            width: '100%',
            maxHeight: '74vh',
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
            style={{ display: 'block', width: '100%', height: 'auto', maxHeight: '74vh', objectFit: 'contain', pointerEvents: 'none' }}
          />

          {/* 형광펜 — 손으로 칠한 궤적을 그대로 마커 스트로크로 (multiply로 글자 위에 겹침) */}
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', mixBlendMode: 'multiply', overflow: 'visible' }}
            aria-hidden
          >
            {strokes.map((s, i) => (
              <MarkerStroke key={i} points={s.points} />
            ))}
            {draftStroke && draftStroke.length > 1 && <MarkerStroke points={draftStroke} />}
          </svg>

          {/* 네모 박스 — 점선 마칭 앤츠 */}
          {boxes.map((b, i) => (
            <BoxView key={i} b={b} />
          ))}
          {draftBox && <BoxView b={draftBox} />}

          {/* 영역 삭제 배지 (QA #5) — 잘못 표시한 곳을 탭해 개별 삭제 */}
          {regions.map((r, idx) => {
            const a = regionAnchor(r)
            return (
              <button
                key={`del-${idx}`}
                type="button"
                aria-label="표시 삭제"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  removeRegion(idx)
                }}
                style={{
                  position: 'absolute',
                  left: a.x,
                  top: a.y,
                  transform: 'translate(-50%, -50%)',
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  border: '1.5px solid rgba(255,255,255,0.85)',
                  background: 'rgba(17,20,26,0.82)',
                  color: 'var(--common-white)',
                  fontSize: 13,
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 1px 5px rgba(0,0,0,0.45)',
                  touchAction: 'none',
                }}
              >
                ×
              </button>
            )
          })}

          {/* 형광펜 펜 끝 스파클 — 손 끝을 따라다님 (F-02 반짝임) */}
          {draftStroke && tip && (
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
        {regions.length > 0
          ? '잘못 표시한 곳은 × 를 눌러 지울 수 있어요'
          : mode === 'highlighter'
            ? '모르는 단어 위를 형광펜으로 직접 칠하세요'
            : '모르는 문제와 풀이에 네모 박스로 드래그하세요'}
      </span>

      <ModeToggle mode={mode} onHighlighter={() => setMode('highlighter')} onBox={() => setMode('box')} />

      <div style={{ width: '100%', padding: '16px var(--spacing-xl) 32px' }}>
        <Button
          block
          size="lg"
          disabled={regions.length === 0}
          style={{ opacity: regions.length === 0 ? 0.4 : 1 }}
          onClick={() => onDone({ regions: regions.length, hasBox: boxes.length > 0 })}
        >
          {regions.length === 0 ? '표시할 부분을 칠하거나 드래그하세요' : `${regions.length}곳 분석하기`}
        </Button>
      </div>
    </div>
  )
}

// 형광펜 마커 스트로크 — 넓은 반투명 밑칠 + 진한 코어로 마커 질감
function MarkerStroke({ points }: { points: Pt[] }) {
  const d = points.map((p) => `${p.x},${p.y}`).join(' ')
  return (
    <g style={{ animation: 'jjik-highlight-shimmer 1.6s ease-in-out infinite' }}>
      <polyline points={d} fill="none" stroke={HL_STROKE} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
      <polyline points={d} fill="none" stroke="rgba(255,221,0,1)" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  )
}

// 네모 박스 — SVG 마칭 앤츠(점선 행진)
function BoxView({ b }: { b: Box }) {
  const w = Math.max(0, b.w)
  const h = Math.max(0, b.h)
  return (
    <svg style={{ position: 'absolute', left: b.x, top: b.y, width: w, height: h, overflow: 'visible', pointerEvents: 'none' }} aria-hidden>
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
function ModeToggle({ mode, onHighlighter, onBox }: { mode: Mode; onHighlighter: () => void; onBox: () => void }) {
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
