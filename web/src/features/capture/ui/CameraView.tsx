import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { IconClose } from '@/shared/ui'

interface Props {
  onCapture: (dataUrl: string) => void
  onClose: () => void
  onPickFile: () => void // 카메라 불가 시 앨범 폴백
}

// 사진 촬영 — getUserMedia 라이브 프리뷰 + 셔터로 프레임 캡처 (F-02 실촬영)
export function CameraView({ onCapture, onClose, onPickFile }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [recognized, setRecognized] = useState(false) // 프레임 인식(반짝임 전환)

  // 카메라가 켜지면 잠깐 스캔 후 "인식됨"으로 전환 — 브래킷 옐로 + 글로우 펄스 + 스파클
  useEffect(() => {
    if (!ready) return
    const t = setTimeout(() => setRecognized(true), 900)
    return () => clearTimeout(t)
  }, [ready])

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelled = false
    const md = navigator.mediaDevices
    if (!md?.getUserMedia) {
      setError('이 브라우저에서는 카메라를 열 수 없어요.')
      return
    }
    md.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        stream = s
        const v = videoRef.current
        if (v) {
          v.srcObject = s
          v.play().then(() => setReady(true)).catch(() => setReady(true))
        }
      })
      .catch(() => setError('카메라 권한이 없어요. 권한을 허용하거나 앨범에서 선택해 주세요.'))
    return () => {
      cancelled = true
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const shoot = () => {
    const v = videoRef.current
    if (!v || !v.videoWidth) return
    // 인식 프레임(종이) 영역만 크롭 — 편집 단계에서도 같은 프레임만 보이도록.
    // RecognitionFrame과 동일 규칙: width 76%(max 300), aspect 300:420, 프리뷰 중앙.
    const preview = v.parentElement
    const Wp = preview?.clientWidth ?? v.clientWidth
    const Hp = preview?.clientHeight ?? v.clientHeight
    const Vw = v.videoWidth
    const Vh = v.videoHeight
    const fw = Math.min(0.76 * Wp, 300)
    const fh = fw * (420 / 300)
    const fx = (Wp - fw) / 2
    const fy = (Hp - fh) / 2
    // objectFit: cover 매핑 (프리뷰 좌표 → 비디오 소스 좌표)
    const scale = Math.max(Wp / Vw, Hp / Vh)
    const offsetX = (Vw * scale - Wp) / 2
    const offsetY = (Vh * scale - Hp) / 2
    let sx = (fx + offsetX) / scale
    let sy = (fy + offsetY) / scale
    let sw = fw / scale
    let sh = fh / scale
    // 소스 경계 클램프
    sx = Math.max(0, Math.min(sx, Vw))
    sy = Math.max(0, Math.min(sy, Vh))
    sw = Math.min(sw, Vw - sx)
    sh = Math.min(sh, Vh - sy)
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(sw))
    canvas.height = Math.max(1, Math.round(sh))
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(v, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
    onCapture(canvas.toDataURL('image/jpeg', 0.92))
  }

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: 'var(--grey-900)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 56, width: '100%', position: 'relative', zIndex: 2 }}>
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          style={{ position: 'absolute', left: 12, background: 'none', border: 'none', color: 'var(--common-white)', cursor: 'pointer', display: 'inline-flex' }}
        >
          <IconClose />
        </button>
        <span style={{ fontSize: 17, fontWeight: 500, color: 'var(--common-white)' }}>촬영</span>
      </div>

      {error ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 32px', textAlign: 'center' }}>
          <span style={{ fontSize: 40 }} aria-hidden>📷</span>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: 'rgba(255,255,255,0.85)' }}>{error}</p>
          <button
            type="button"
            onClick={onPickFile}
            style={{ padding: '12px 24px', borderRadius: 'var(--radius-lg)', border: 'none', background: 'var(--color-brand-primary)', color: 'var(--common-white)', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
          >
            앨범에서 선택
          </button>
        </div>
      ) : (
        <>
          <div style={{ flex: 1, width: '100%', position: 'relative', overflow: 'hidden' }}>
            <video
              ref={videoRef}
              playsInline
              muted
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: ready ? 1 : 0,
                transition: 'opacity 500ms ease',
              }}
            />
            {!ready ? <CameraLoading /> : <RecognitionFrame recognized={recognized} />}
          </div>

          {!recognized && (
            <span
              style={{
                background: 'rgba(255,255,255,0.14)',
                color: 'rgba(255,255,255,0.8)',
                fontSize: 12,
                fontWeight: 500,
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                margin: '18px 0 0',
              }}
            >
              문제를 프레임에 맞춰 주세요
            </span>
          )}

          <button
            type="button"
            aria-label="촬영"
            onClick={shoot}
            disabled={!recognized}
            style={{
              margin: '18px 0 40px',
              width: 72,
              height: 72,
              borderRadius: '50%',
              border: `4px solid ${recognized ? 'var(--color-brand-primary)' : 'rgba(255,255,255,0.35)'}`,
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: recognized ? 'pointer' : 'default',
              opacity: recognized ? 1 : 0.4,
              transition: 'border-color 200ms ease-out',
            }}
          >
            <span style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--common-white)' }} />
          </button>
        </>
      )}
    </div>
  )
}

const BRACKET_ON = '#ffe45e'
const SPARKS = [
  { left: '22%', top: '18%', size: 16 },
  { left: '70%', top: '30%', size: 12 },
  { left: '46%', top: '68%', size: 14 },
]

// 인식 프레임 (05-2→05-3) — 프레임 밖은 검정 마스크(Figma 동일). 스캔 중: 흰 브래킷 + 스캔 라인 /
// 인식됨: 옐로 브래킷 + 엣지 글로우 펄스 + 스파클 + 상단 인식 칩
function RecognitionFrame({ recognized }: { recognized: boolean }) {
  const color = recognized ? BRACKET_ON : 'rgba(255,255,255,0.6)'
  const bracketAnim = recognized ? 'jjik-bracket-in 220ms ease-out' : undefined
  return (
    <div
      style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}
      aria-hidden
    >
      {/* 프레임(종이) 크롭 영역 — box-shadow 스프레드로 바깥을 검정 처리 */}
      <div
        style={{
          position: 'relative',
          width: '76%',
          maxWidth: 300,
          aspectRatio: '300 / 420',
          borderRadius: 12,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.82)',
        }}
      >
        {/* 인식됨: 프레임 엣지 옐로 글로우 펄스 */}
        {recognized && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 12,
              border: '2px solid rgba(255,228,94,0.75)',
              boxShadow: '0 0 20px rgba(255,228,94,0.55), inset 0 0 14px rgba(255,228,94,0.3)',
              animation: 'jjik-edge-glow 1.2s ease-in-out infinite',
            }}
          />
        )}
        {/* 스캔 중: 프레임 안을 훑는 파란 스캔 라인 */}
        {!recognized && (
          <div style={{ position: 'absolute', inset: 0, borderRadius: 12, overflow: 'hidden' }}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: 2,
                background: 'linear-gradient(90deg, rgba(49,130,246,0) 0%, rgba(49,130,246,0.85) 50%, rgba(49,130,246,0) 100%)',
                animation: 'jjik-scan 2s ease-in-out infinite',
              }}
            />
          </div>
        )}
        {/* 상단 인식 칩 */}
        {recognized && (
          <span
            style={{
              position: 'absolute',
              top: -40,
              left: '50%',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              background: BRACKET_ON,
              color: 'var(--yellow-900)',
              fontSize: 12,
              fontWeight: 500,
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              animation: 'jjik-bracket-in 220ms ease-out',
            }}
          >
            ✨ 인식됐어요! 지금 찍어보세요
          </span>
        )}
        {/* 코너 브래킷 */}
        <Corner style={{ top: -6, left: -6, borderTop: `3px solid ${color}`, borderLeft: `3px solid ${color}`, borderTopLeftRadius: 12, animation: bracketAnim }} />
        <Corner style={{ top: -6, right: -6, borderTop: `3px solid ${color}`, borderRight: `3px solid ${color}`, borderTopRightRadius: 12, animation: bracketAnim }} />
        <Corner style={{ bottom: -6, left: -6, borderBottom: `3px solid ${color}`, borderLeft: `3px solid ${color}`, borderBottomLeftRadius: 12, animation: bracketAnim }} />
        <Corner style={{ bottom: -6, right: -6, borderBottom: `3px solid ${color}`, borderRight: `3px solid ${color}`, borderBottomRightRadius: 12, animation: bracketAnim }} />
        {/* 인식됨: 스파클 */}
        {recognized &&
          SPARKS.map((s, i) => (
            <span
              key={i}
              style={{ position: 'absolute', left: s.left, top: s.top, fontSize: s.size, color: BRACKET_ON, animation: `jjik-twinkle 0.6s ease-in-out ${i * 0.2}s infinite` }}
            >
              ✦
            </span>
          ))}
      </div>
    </div>
  )
}

function Corner({ style }: { style: CSSProperties }) {
  return <div style={{ position: 'absolute', width: 28, height: 28, ...style }} />
}

// 카메라 로딩 (토스식) — 프레임 스켈레톤 + 사선 시머 스윕 + 오토포커스 브리딩 링 + 통통 튀는 점
function CameraLoading() {
  const lineColor = 'rgba(255,255,255,0.55)'
  const lineAnim = 'jjik-edge-glow 1.6s ease-in-out infinite'
  return (
    <div
      style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26 }}
      aria-hidden
    >
      <div
        style={{
          position: 'relative',
          width: '76%',
          maxWidth: 300,
          aspectRatio: '300 / 420',
          borderRadius: 12,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.82)',
        }}
      >
        {/* 스켈레톤 시머 스윕 */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: 12, overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '45%',
              background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0) 100%)',
              animation: 'jjik-shimmer-sweep 1.6s ease-in-out infinite',
            }}
          />
        </div>

        {/* 오토포커스 브리딩 링 + 카메라 글리프 */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', width: 88, height: 88, borderRadius: '50%', border: '2px solid rgba(49,130,246,0.45)', animation: 'jjik-breathe 1.7s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', width: 58, height: 58, borderRadius: '50%', border: '2px solid rgba(49,130,246,0.85)', animation: 'jjik-breathe 1.7s ease-in-out 0.22s infinite' }} />
          <span style={{ fontSize: 24 }}>📷</span>
        </div>

        {/* 코너 브래킷 — 은은한 펄스 */}
        <Corner style={{ top: -6, left: -6, borderTop: `3px solid ${lineColor}`, borderLeft: `3px solid ${lineColor}`, borderTopLeftRadius: 12, animation: lineAnim }} />
        <Corner style={{ top: -6, right: -6, borderTop: `3px solid ${lineColor}`, borderRight: `3px solid ${lineColor}`, borderTopRightRadius: 12, animation: lineAnim }} />
        <Corner style={{ bottom: -6, left: -6, borderBottom: `3px solid ${lineColor}`, borderLeft: `3px solid ${lineColor}`, borderBottomLeftRadius: 12, animation: lineAnim }} />
        <Corner style={{ bottom: -6, right: -6, borderBottom: `3px solid ${lineColor}`, borderRight: `3px solid ${lineColor}`, borderBottomRightRadius: 12, animation: lineAnim }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>카메라를 준비하고 있어요</span>
        <div style={{ display: 'flex', gap: 5 }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-brand-primary)', animation: `jjik-dots 1.2s ease-in-out ${i * 0.16}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
