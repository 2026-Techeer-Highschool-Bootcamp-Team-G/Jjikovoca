import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode, SVGProps } from 'react'
import { IconClose, Button } from '@/shared/ui'

type Pt = { x: number; y: number }
type Stroke = { points: Pt[] }
type Mode = 'draw' | 'pan'
type View = { z: number; tx: number; ty: number }

export interface CaptureResult {
  regions: number
  cropImages: string[] // 형광펜 영역별 원본 크롭(base64) — WORD 다중 단어 분석용
}

interface Props {
  imageSrc: string
  onDone: (result: CaptureResult) => void
  onClose: () => void
}

const HL_STROKE = 'rgba(255,205,0,0.9)' // 형광펜 밑칠 — 진한 노랑
const MIN_Z = 1
const MAX_Z = 5
const PAD_X = 6 // 크롭 좌우 여유(px, z=1 표시 기준)
const PAD_Y = 3 // 크롭 상하 여유 — 위/아래 줄 침범을 줄이려 좌우보다 작게

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(v, hi))

// 자유곡선 길이(px) — 아주 짧은 톡은 무시하려고 사용
function strokeLen(pts: Pt[]) {
  let d = 0
  for (let i = 1; i < pts.length; i++) d += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
  return d
}

// 삭제 배지 위치 — 형광펜 궤적 바운딩박스 우상단 (QA #5)
function strokeAnchor(s: Stroke): Pt {
  let maxX = -Infinity
  let minY = Infinity
  for (const p of s.points) {
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
  }
  return { x: maxX, y: minY }
}

// 촬영/선택 이미지 위에서 형광펜으로 모르는 단어를 표시 (F-02).
// 핀치/휠로 확대(zoom)·이동(pan)해 두꺼운 획이 인접 단어를 덮지 않게 정밀 타겟한다.
export function CaptureEditor({ imageSrc, onDone, onClose }: Props) {
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [draftStroke, setDraftStroke] = useState<Pt[] | null>(null)
  const [tip, setTip] = useState<Pt | null>(null)
  const [mode, setMode] = useState<Mode>('draw')
  const [view, setView] = useState<View>({ z: 1, tx: 0, ty: 0 })

  const areaRef = useRef<HTMLDivElement>(null) // transform 적용 안 되는 고정 뷰포트(좌표 기준)
  const imgRef = useRef<HTMLImageElement>(null)
  const strokeRef = useRef<Pt[] | null>(null)
  const viewRef = useRef<View>(view) // 이벤트 핸들러에서 최신 view 참조
  const pointers = useRef<Map<number, Pt>>(new Map()) // 활성 포인터(핀치 판정)
  const pinchRef = useRef<{ dist: number; mid: Pt; z: number; tx: number; ty: number } | null>(null)
  const panRef = useRef<Pt | null>(null) // 직전 팬 포인터 위치

  const setViewSynced = (next: View) => {
    viewRef.current = next
    setView(next)
  }

  // 화면 좌표(area 로컬) → z=1 표시좌표. 저장은 항상 이 좌표계 → buildCrops 역산이 줌과 무관해진다.
  const toDisplay = (clientX: number, clientY: number): Pt => {
    const r = areaRef.current?.getBoundingClientRect()
    if (!r) return { x: 0, y: 0 }
    const { z, tx, ty } = viewRef.current
    return { x: (clientX - r.left - tx) / z, y: (clientY - r.top - ty) / z }
  }

  // 팬 경계 — 확대된 이미지가 뷰포트 밖으로 새지 않도록 translate 를 클램프
  const clampView = (v: View): View => {
    const r = areaRef.current?.getBoundingClientRect()
    if (!r) return v
    const z = clamp(v.z, MIN_Z, MAX_Z)
    return { z, tx: clamp(v.tx, r.width * (1 - z), 0), ty: clamp(v.ty, r.height * (1 - z), 0) }
  }

  const midpoint = (a: Pt, b: Pt): Pt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })
  const distance = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y)
  const localOf = (e: ReactPointerEvent): Pt => {
    const r = areaRef.current?.getBoundingClientRect()
    return { x: e.clientX - (r?.left ?? 0), y: e.clientY - (r?.top ?? 0) }
  }

  const cancelDraft = () => {
    strokeRef.current = null
    setDraftStroke(null)
    setTip(null)
  }

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointers.current.size >= 2) {
      // 두 손가락 → 핀치 줌 시작. 진행 중이던 형광펜 획은 폐기
      cancelDraft()
      const [a, b] = [...pointers.current.values()]
      const v = viewRef.current
      pinchRef.current = {
        dist: distance(a, b),
        mid: midpoint(localOf({ clientX: a.x, clientY: a.y } as ReactPointerEvent), localOf({ clientX: b.x, clientY: b.y } as ReactPointerEvent)),
        z: v.z,
        tx: v.tx,
        ty: v.ty,
      }
      return
    }

    if (mode === 'pan') {
      panRef.current = { x: e.clientX, y: e.clientY }
      return
    }
    // 형광펜 — z=1 표시좌표로 시작점 저장
    const p = toDisplay(e.clientX, e.clientY)
    strokeRef.current = [p]
    setDraftStroke([p])
    setTip(p)
  }

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    // 핀치 줌 — 두 손가락 중점을 고정점으로 스케일
    if (pinchRef.current && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()]
      const ratio = distance(a, b) / (pinchRef.current.dist || 1)
      const newZ = clamp(pinchRef.current.z * ratio, MIN_Z, MAX_Z)
      const m = pinchRef.current.mid
      const tx = m.x - (m.x - pinchRef.current.tx) * (newZ / pinchRef.current.z)
      const ty = m.y - (m.y - pinchRef.current.ty) * (newZ / pinchRef.current.z)
      setViewSynced(clampView({ z: newZ, tx, ty }))
      return
    }

    if (mode === 'pan' && panRef.current) {
      const v = viewRef.current
      const next = clampView({ z: v.z, tx: v.tx + (e.clientX - panRef.current.x), ty: v.ty + (e.clientY - panRef.current.y) })
      panRef.current = { x: e.clientX, y: e.clientY }
      setViewSynced(next)
      return
    }

    if (strokeRef.current) {
      const p = toDisplay(e.clientX, e.clientY)
      strokeRef.current = [...strokeRef.current, p]
      setDraftStroke(strokeRef.current)
      setTip(p)
    }
  }

  const endPointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinchRef.current = null
    if (mode === 'pan') {
      panRef.current = null
      return
    }
    if (strokeRef.current) {
      const pts = strokeRef.current
      strokeRef.current = null
      if (strokeLen(pts) > 12) setStrokes((s) => [...s, { points: pts }])
      setDraftStroke(null)
    }
    setTip(null)
  }

  // 휠 줌 — 커서를 고정점으로. React onWheel 은 passive 라 preventDefault 가 안 먹어 native 로 등록
  useEffect(() => {
    const el = areaRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const r = el.getBoundingClientRect()
      const c = { x: e.clientX - r.left, y: e.clientY - r.top }
      const v = viewRef.current
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1
      const newZ = clamp(v.z * factor, MIN_Z, MAX_Z)
      const tx = c.x - (c.x - v.tx) * (newZ / v.z)
      const ty = c.y - (c.y - v.ty) * (newZ / v.z)
      setViewSynced(clampView({ z: newZ, tx, ty }))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const undo = () => setStrokes((s) => s.slice(0, -1))
  const removeStroke = (idx: number) => setStrokes((s) => s.filter((_, i) => i !== idx)) // QA #5

  // 형광펜 stroke(=z=1 표시좌표) 별 바운딩박스로 원본 이미지를 canvas 크롭 → base64 배열.
  // base 크기는 offsetWidth/Height(레이아웃 크기, transform 무시)로 — getBoundingClientRect 는 줌 transform 에 오염된다.
  const buildCrops = (): string[] => {
    const img = imgRef.current
    if (!img || !img.naturalWidth) return []
    const nw = img.naturalWidth
    const nh = img.naturalHeight
    const baseW = img.offsetWidth
    const baseH = img.offsetHeight
    const scale = Math.min(baseW / nw, baseH / nh)
    if (!(scale > 0)) return []
    const offX = (baseW - nw * scale) / 2 // contain 레터박스 여백
    const offY = (baseH - nh * scale) / 2
    const crops: string[] = []
    for (const s of strokes) {
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity
      for (const p of s.points) {
        if (p.x < minX) minX = p.x
        if (p.y < minY) minY = p.y
        if (p.x > maxX) maxX = p.x
        if (p.y > maxY) maxY = p.y
      }
      // 표시(z=1) 좌표 → 원본 픽셀 좌표
      const sx = Math.max(0, (minX - PAD_X - offX) / scale)
      const sy = Math.max(0, (minY - PAD_Y - offY) / scale)
      const ex = Math.min(nw, (maxX + PAD_X - offX) / scale)
      const ey = Math.min(nh, (maxY + PAD_Y - offY) / scale)
      const sw = Math.max(1, ex - sx)
      const sh = Math.max(1, ey - sy)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(sw)
      canvas.height = Math.round(sh)
      const ctx = canvas.getContext('2d')
      if (!ctx) continue
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
      crops.push(canvas.toDataURL('image/jpeg', 0.9))
    }
    return crops
  }

  const invZ = 1 / view.z // 배지·스파클을 원래 크기로 유지하는 역스케일

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
        <span style={{ fontSize: 17, fontWeight: 500, color: 'var(--common-white)' }}>단어 위를 칠하기</span>
        {strokes.length > 0 && (
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
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          style={{
            position: 'relative',
            width: '100%',
            maxHeight: '74vh',
            touchAction: 'none',
            cursor: mode === 'pan' ? 'grab' : 'crosshair',
            userSelect: 'none',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          {/* 줌/팬 래퍼 — 이미지와 형광펜 SVG를 함께 변환해 좌표계를 일치시킨다 */}
          <div style={{ transformOrigin: '0 0', transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.z})` }}>
            <img
              ref={imgRef}
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

            {/* 영역 삭제 배지 (QA #5) — 잘못 표시한 곳을 탭해 개별 삭제. 줌에도 크기 유지(역스케일) */}
            {strokes.map((s, idx) => {
              const a = strokeAnchor(s)
              return (
                <button
                  key={`del-${idx}`}
                  type="button"
                  aria-label="표시 삭제"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation()
                    removeStroke(idx)
                  }}
                  style={{
                    position: 'absolute',
                    left: a.x,
                    top: a.y,
                    transform: `translate(-50%, -50%) scale(${invZ})`,
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
              <span
                style={{
                  position: 'absolute',
                  left: tip.x,
                  top: tip.y,
                  transform: `translate(-50%, -50%) scale(${invZ})`,
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
            )}
          </div>
        </div>
      </div>

      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 12, textAlign: 'center', padding: '0 24px' }}>
        {strokes.length > 0
          ? '잘못 표시한 곳은 × 를 눌러 지울 수 있어요'
          : mode === 'pan'
            ? '드래그해서 이동 · 두 손가락/휠로 확대'
            : '모르는 단어 위를 칠하세요 · 두 손가락/휠로 확대하면 정확해요'}
      </span>

      <ModeToggle mode={mode} onDraw={() => setMode('draw')} onPan={() => setMode('pan')} />

      <div style={{ width: '100%', padding: '16px var(--spacing-xl) 32px' }}>
        <Button
          block
          size="lg"
          disabled={strokes.length === 0}
          style={{ opacity: strokes.length === 0 ? 0.4 : 1 }}
          onClick={() => onDone({ regions: strokes.length, cropImages: buildCrops() })}
        >
          {strokes.length === 0 ? '모르는 단어를 칠해주세요' : `${strokes.length}곳 분석하기`}
        </Button>
      </div>
    </div>
  )
}

// 형광펜 마커 스트로크 — 얇은 반투명 밑칠 + 진한 코어(인접 단어 침범 완화)
function MarkerStroke({ points }: { points: Pt[] }) {
  const d = points.map((p) => `${p.x},${p.y}`).join(' ')
  return (
    <g style={{ animation: 'jjik-highlight-shimmer 1.6s ease-in-out infinite' }}>
      <polyline points={d} fill="none" stroke={HL_STROKE} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
      <polyline points={d} fill="none" stroke="rgba(255,221,0,1)" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  )
}

// 형광펜 / 이동 모드 토글
function ModeToggle({ mode, onDraw, onPan }: { mode: Mode; onDraw: () => void; onPan: () => void }) {
  return (
    <div style={{ display: 'inline-flex', gap: 4, padding: 4, borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.14)' }}>
      <Seg active={mode === 'draw'} icon={<IconHighlighter size={16} />} label="형광펜" onClick={onDraw} />
      <Seg active={mode === 'pan'} icon={<IconMove size={16} />} label="이동" onClick={onPan} />
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

function IconMove({ size = 16, ...rest }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...rest}>
      <path d="M8 2v12M2 8h12" />
      <path d="M8 2 6.3 3.8M8 2l1.7 1.8M8 14l-1.7-1.8M8 14l1.7-1.8M2 8l1.8-1.7M2 8l1.8 1.7M14 8l-1.8-1.7M14 8l-1.8 1.7" />
    </svg>
  )
}
