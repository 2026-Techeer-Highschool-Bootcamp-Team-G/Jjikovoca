import { useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { IconClose, Button } from '@/shared/ui'

type Pt = { x: number; y: number }
type Rect = { x: number; y: number; w: number; h: number } // area 로컬 표시좌표(px)
type Handle = 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w'

interface Props {
  imageSrc: string
  /** 확정 — 잘라낸 이미지(base64 dataURL) */
  onDone: (cropped: string) => void
  /** 건너뛰기 — 원본 그대로 다음 단계로 */
  onSkip: () => void
  onClose: () => void
}

const MIN = 40 // 크롭 최소 변(px)
const HIT = 26 // 핸들 히트 반경(px)
const INSET = 0.08 // 초기 크롭 여백 비율

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(v, hi))

// 이미지 표시 영역(objectFit:contain 레터박스 제외) — area rect + naturalWH 로 계산
function imageBox(areaW: number, areaH: number, nw: number, nh: number): Rect {
  const scale = Math.min(areaW / nw, areaH / nh)
  const w = nw * scale
  const h = nh * scale
  return { x: (areaW - w) / 2, y: (areaH - h) / 2, w, h }
}

// 눌린 지점이 어느 핸들/본체인지 — 8핸들 히트테스트 후 내부면 move
function hitTest(p: Pt, r: Rect): Handle | null {
  const near = (hx: number, hy: number) => Math.hypot(p.x - hx, p.y - hy) <= HIT
  const { x, y, w, h } = r
  if (near(x, y)) return 'nw'
  if (near(x + w, y)) return 'ne'
  if (near(x, y + h)) return 'sw'
  if (near(x + w, y + h)) return 'se'
  if (near(x + w / 2, y)) return 'n'
  if (near(x + w / 2, y + h)) return 's'
  if (near(x + w, y + h / 2)) return 'e'
  if (near(x, y + h / 2)) return 'w'
  if (p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h) return 'move'
  return null
}

// 핸들 드래그 적용 — 표시영역(box) 경계와 최소 크기 안에서 rect 갱신
function applyDrag(orig: Rect, target: Handle, dx: number, dy: number, box: Rect): Rect {
  if (target === 'move') {
    return {
      x: clamp(orig.x + dx, box.x, box.x + box.w - orig.w),
      y: clamp(orig.y + dy, box.y, box.y + box.h - orig.h),
      w: orig.w,
      h: orig.h,
    }
  }
  let left = orig.x
  let right = orig.x + orig.w
  let top = orig.y
  let bottom = orig.y + orig.h
  if (target === 'nw' || target === 'sw' || target === 'w') left = clamp(orig.x + dx, box.x, right - MIN)
  if (target === 'nw' || target === 'ne' || target === 'n') top = clamp(orig.y + dy, box.y, bottom - MIN)
  if (target === 'ne' || target === 'se' || target === 'e') right = clamp(right + dx, left + MIN, box.x + box.w)
  if (target === 'sw' || target === 'se' || target === 's') bottom = clamp(bottom + dy, top + MIN, box.y + box.h)
  return { x: left, y: top, w: right - left, h: bottom - top }
}

// 촬영/선택 이미지에서 관심 영역만 사각으로 잘라내는 화면(F-02 선행 단계, 선택적)
export function CropStage({ imageSrc, onDone, onSkip, onClose }: Props) {
  const areaRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const boxRef = useRef<Rect | null>(null) // 이미지 표시 영역(크롭 한계)
  const dragRef = useRef<{ target: Handle; start: Pt; orig: Rect } | null>(null)
  const [rect, setRect] = useState<Rect | null>(null)

  const localOf = (e: ReactPointerEvent): Pt => {
    const r = areaRef.current?.getBoundingClientRect()
    return { x: e.clientX - (r?.left ?? 0), y: e.clientY - (r?.top ?? 0) }
  }

  // 이미지 로드 후 표시영역 계산 → 초기 크롭(8% 안쪽)
  const onImgLoad = () => {
    const area = areaRef.current
    const img = imgRef.current
    if (!area || !img || !img.naturalWidth) return
    const r = area.getBoundingClientRect()
    const box = imageBox(r.width, r.height, img.naturalWidth, img.naturalHeight)
    boxRef.current = box
    setRect({ x: box.x + box.w * INSET, y: box.y + box.h * INSET, w: box.w * (1 - 2 * INSET), h: box.h * (1 - 2 * INSET) })
  }

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!rect) return
    const p = localOf(e)
    const target = hitTest(p, rect)
    if (!target) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { target, start: p, orig: rect }
  }

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current
    const box = boxRef.current
    if (!d || !box) return
    const p = localOf(e)
    setRect(applyDrag(d.orig, d.target, p.x - d.start.x, p.y - d.start.y, box))
  }

  const onUp = () => {
    dragRef.current = null
  }

  // 확정 — 크롭 영역(표시좌표)을 원본 픽셀로 환산해 canvas 로 잘라 base64 생성
  const confirm = () => {
    const img = imgRef.current
    const box = boxRef.current
    if (!img || !box || !rect || !img.naturalWidth) return onSkip()
    const scale = box.w / img.naturalWidth // contain 배율(가로·세로 동일)
    const sx = clamp((rect.x - box.x) / scale, 0, img.naturalWidth)
    const sy = clamp((rect.y - box.y) / scale, 0, img.naturalHeight)
    const sw = clamp(rect.w / scale, 1, img.naturalWidth - sx)
    const sh = clamp(rect.h / scale, 1, img.naturalHeight - sy)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(sw)
    canvas.height = Math.round(sh)
    const ctx = canvas.getContext('2d')
    if (!ctx) return onSkip()
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
    onDone(canvas.toDataURL('image/jpeg', 0.95))
  }

  const maskOutside = 'rgba(0,0,0,0.55)'

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
        <span style={{ fontSize: 17, fontWeight: 500, color: 'var(--common-white)' }}>영역 자르기</span>
        <button
          type="button"
          onClick={onSkip}
          style={{ position: 'absolute', right: 16, background: 'none', border: 'none', color: 'var(--color-brand-primary)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
        >
          건너뛰기
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0 12px' }}>
        <div
          ref={areaRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          style={{ position: 'relative', width: '100%', height: '74vh', touchAction: 'none', userSelect: 'none', overflow: 'hidden', borderRadius: 12 }}
        >
          <img
            ref={imgRef}
            src={imageSrc}
            alt="촬영한 시험지"
            draggable={false}
            onLoad={onImgLoad}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
          />

          {rect && (
            <>
              {/* 크롭 밖 어둡게 — 큰 spread 그림자로 rect 바깥 전체를 덮음 */}
              <div
                style={{
                  position: 'absolute',
                  left: rect.x,
                  top: rect.y,
                  width: rect.w,
                  height: rect.h,
                  boxShadow: `0 0 0 9999px ${maskOutside}`,
                  border: '1.5px solid rgba(255,255,255,0.95)',
                  pointerEvents: 'none',
                }}
              />
              {/* 삼분할 그리드 */}
              <div style={{ position: 'absolute', left: rect.x, top: rect.y, width: rect.w, height: rect.h, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', left: '33.33%', top: 0, bottom: 0, borderLeft: '1px solid rgba(255,255,255,0.35)' }} />
                <div style={{ position: 'absolute', left: '66.66%', top: 0, bottom: 0, borderLeft: '1px solid rgba(255,255,255,0.35)' }} />
                <div style={{ position: 'absolute', top: '33.33%', left: 0, right: 0, borderTop: '1px solid rgba(255,255,255,0.35)' }} />
                <div style={{ position: 'absolute', top: '66.66%', left: 0, right: 0, borderTop: '1px solid rgba(255,255,255,0.35)' }} />
              </div>
              {/* 모서리 핸들 시각 표시(히트는 area 전체 hitTest 로 처리, pointerEvents:none) */}
              {(['nw', 'ne', 'sw', 'se'] as const).map((h) => {
                const cx = h === 'nw' || h === 'sw' ? rect.x : rect.x + rect.w
                const cy = h === 'nw' || h === 'ne' ? rect.y : rect.y + rect.h
                return (
                  <div
                    key={h}
                    style={{
                      position: 'absolute',
                      left: cx,
                      top: cy,
                      width: 18,
                      height: 18,
                      transform: 'translate(-50%, -50%)',
                      borderRadius: 4,
                      border: '2.5px solid var(--color-brand-primary)',
                      background: 'rgba(255,255,255,0.95)',
                      pointerEvents: 'none',
                    }}
                  />
                )
              })}
            </>
          )}
        </div>
      </div>

      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 12, textAlign: 'center', padding: '0 24px' }}>
        모서리를 끌어 분석할 영역만 남기세요 · 필요 없으면 건너뛰기
      </span>

      <div style={{ width: '100%', padding: '0 var(--spacing-xl) 32px' }}>
        <Button block size="lg" onClick={confirm}>
          이 영역으로 계속
        </Button>
      </div>
    </div>
  )
}
