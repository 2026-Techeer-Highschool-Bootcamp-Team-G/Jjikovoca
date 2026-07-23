import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { IconClose } from '@/shared/ui'

interface Props {
  onCapture: (dataUrl: string) => void
  onClose: () => void
  onPickFile: () => void // 카메라 불가 시 앨범 폴백
}

// 실시간 촬영 안내(QA #6) — 프레이밍 문구는 순환, 어두우면 조명 안내로 대체
const FRAMING_HINTS = ['📄 문제를 프레임에 맞춰 주세요', '📏 조금 더 가까이 대주세요']
const DARK_HINT = '🔅 조명이 어두워요 — 밝은 곳에서 촬영해요'

// 사진 촬영 — getUserMedia 라이브 프리뷰 + 셔터로 프레임 캡처 (F-02 실촬영)
export function CameraView({ onCapture, onClose, onPickFile }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [recognized, setRecognized] = useState(false) // 프레임 인식(반짝임 전환)
  const [captured, setCaptured] = useState<string | null>(null) // 촬영 후 미리보기(QA #4)
  const [hint, setHint] = useState(FRAMING_HINTS[0]) // 실시간 촬영 안내(QA #6)

  // 카메라가 켜지면 잠깐 스캔 후 "인식됨"으로 전환
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

  // 실시간 촬영 안내(QA #6) — 프레임 밝기를 주기적으로 샘플링해 어두우면 조명 안내, 아니면 프레이밍 문구 순환
  useEffect(() => {
    if (!ready || captured) return
    let i = 0
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const tick = () => {
      const v = videoRef.current
      let dark = false
      if (v && v.videoWidth) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          try {
            ctx.drawImage(v, 0, 0, 32, 32)
            const { data } = ctx.getImageData(0, 0, 32, 32)
            let sum = 0
            for (let p = 0; p < data.length; p += 4) {
              sum += 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2]
            }
            dark = sum / (data.length / 4) < 55
          } catch {
            /* 샘플링 불가(보안 제약 등) 시 밝기 안내 생략 */
          }
        }
      }
      if (dark) setHint(DARK_HINT)
      else {
        setHint(FRAMING_HINTS[i % FRAMING_HINTS.length])
        i += 1
      }
    }
    tick()
    const id = setInterval(tick, 1800)
    return () => clearInterval(id)
  }, [ready, captured])

  const shoot = () => {
    const v = videoRef.current
    if (!v || !v.videoWidth) return
    // 인식 프레임(종이) 영역만 크롭 — 편집 단계에서도 같은 프레임만 보이도록.
    const preview = v.parentElement
    const Wp = preview?.clientWidth ?? v.clientWidth
    const Hp = preview?.clientHeight ?? v.clientHeight
    const Vw = v.videoWidth
    const Vh = v.videoHeight
    const fw = Math.min(0.76 * Wp, 300)
    const fh = fw * (420 / 300)
    const fx = (Wp - fw) / 2
    const fy = (Hp - fh) / 2
    const scale = Math.max(Wp / Vw, Hp / Vh)
    const offsetX = (Vw * scale - Wp) / 2
    const offsetY = (Vh * scale - Hp) / 2
    let sx = (fx + offsetX) / scale
    let sy = (fy + offsetY) / scale
    let sw = fw / scale
    let sh = fh / scale
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
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    // QA #4: 촬영한 사진을 잠깐 보여준 뒤 편집 화면으로 전환(실제 카메라 감성)
    setCaptured(dataUrl)
    setTimeout(() => onCapture(dataUrl), 520)
  }

  const showHint = ready && !captured && (hint === DARK_HINT || !recognized)

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

            {/* 실시간 촬영 안내 배너 (QA #6) — 상단 */}
            {showHint && (
              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
                  background: hint === DARK_HINT ? 'rgba(255,193,66,0.92)' : 'rgba(0,0,0,0.55)',
                  color: hint === DARK_HINT ? 'var(--yellow-900)' : 'rgba(255,255,255,0.95)',
                  fontSize: 12.5,
                  fontWeight: 600,
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-full)',
                  backdropFilter: 'blur(4px)',
                }}
                aria-hidden
              >
                {hint}
              </div>
            )}

            {/* 촬영 미리보기 (QA #4) — 찍은 사진을 잠깐 보여줌 */}
            {captured && <CapturePreview src={captured} />}
          </div>

          {/* 촬영 버튼 (QA #3 크게·인식 시 강조) */}
          <div style={{ position: 'relative', width: 84, height: 84, margin: '18px 0 40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {recognized && !captured && (
              <span
                style={{
                  position: 'absolute',
                  width: 84,
                  height: 84,
                  borderRadius: '50%',
                  border: '3px solid var(--color-brand-primary)',
                  animation: 'jjik-shutter-pulse 1.4s ease-out infinite',
                  pointerEvents: 'none',
                }}
                aria-hidden
              />
            )}
            <button
              type="button"
              aria-label="촬영"
              onClick={shoot}
              disabled={!recognized || !!captured}
              style={{
                width: 84,
                height: 84,
                borderRadius: '50%',
                border: `5px solid ${recognized ? 'var(--color-brand-primary)' : 'rgba(255,255,255,0.35)'}`,
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: recognized ? 'pointer' : 'default',
                opacity: recognized ? 1 : 0.4,
                boxShadow: recognized ? '0 4px 18px rgba(49,130,246,0.5)' : 'none',
                transition: 'border-color 200ms ease-out, box-shadow 200ms ease-out',
              }}
            >
              <span style={{ width: 66, height: 66, borderRadius: '50%', background: 'var(--common-white)' }} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// 촬영 미리보기 (QA #4) — 캡처 이미지 + 화이트 플래시 + 완료 체크
function CapturePreview({ src }: { src: string }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--grey-900)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden>
      <img
        src={src}
        alt=""
        style={{ maxWidth: '76%', maxHeight: '80%', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.5)', animation: 'jjik-highlight-in 180ms ease-out' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'var(--common-white)', animation: 'jjik-flash 420ms ease-out forwards', pointerEvents: 'none' }} />
      <span
        style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--color-success-primary)',
          color: 'var(--common-white)',
          fontSize: 13,
          fontWeight: 700,
          padding: '7px 14px',
          borderRadius: 'var(--radius-full)',
        }}
      >
        ✓ 촬영 완료
      </span>
    </div>
  )
}

const BRACKET_ON = '#ffe45e'
const SPARKS = [
  { left: '22%', top: '18%', size: 16 },
  { left: '70%', top: '30%', size: 12 },
  { left: '46%', top: '68%', size: 14 },
]

// 인식 프레임 (05-2→05-3) — 프레임 밖은 검정 마스크. 스캔 중: 흰 브래킷 + 스캔 라인 /
// 인식됨: 옐로 브래킷 + 글로우 펄스 + 스파클 + 상단 완료 칩 + 중앙 체크(✓) 팝 (QA #2)
function RecognitionFrame({ recognized }: { recognized: boolean }) {
  const color = recognized ? BRACKET_ON : 'rgba(255,255,255,0.6)'
  const bracketAnim = recognized ? 'jjik-bracket-in 220ms ease-out' : undefined
  return (
    <div
      style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}
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
        {/* 인식 완료 — 초록 상단 칩 (QA #2) */}
        {recognized && (
          <span
            style={{
              position: 'absolute',
              top: -40,
              left: '50%',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              background: 'var(--color-success-primary)',
              color: 'var(--common-white)',
              fontSize: 12,
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 4px 12px rgba(5,192,114,0.45)',
              animation: 'jjik-bracket-in 220ms ease-out',
            }}
          >
            ✓ 인식 완료! 지금 촬영하세요
          </span>
        )}
        {/* 인식 완료 — 중앙 체크(✓) 팝 (QA #2, 완료 순간을 분명히) */}
        {recognized && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--color-success-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--common-white)',
              fontSize: 34,
              fontWeight: 700,
              boxShadow: '0 6px 22px rgba(5,192,114,0.5)',
              animation: 'jjik-check-pop 900ms ease-out forwards',
            }}
          >
            ✓
          </div>
        )}
        <Corner style={{ top: -6, left: -6, borderTop: `3px solid ${color}`, borderLeft: `3px solid ${color}`, borderTopLeftRadius: 12, animation: bracketAnim }} />
        <Corner style={{ top: -6, right: -6, borderTop: `3px solid ${color}`, borderRight: `3px solid ${color}`, borderTopRightRadius: 12, animation: bracketAnim }} />
        <Corner style={{ bottom: -6, left: -6, borderBottom: `3px solid ${color}`, borderLeft: `3px solid ${color}`, borderBottomLeftRadius: 12, animation: bracketAnim }} />
        <Corner style={{ bottom: -6, right: -6, borderBottom: `3px solid ${color}`, borderRight: `3px solid ${color}`, borderBottomRightRadius: 12, animation: bracketAnim }} />
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

        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', width: 88, height: 88, borderRadius: '50%', border: '2px solid rgba(49,130,246,0.45)', animation: 'jjik-breathe 1.7s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', width: 58, height: 58, borderRadius: '50%', border: '2px solid rgba(49,130,246,0.85)', animation: 'jjik-breathe 1.7s ease-in-out 0.22s infinite' }} />
          <span style={{ fontSize: 24 }}>📷</span>
        </div>

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
