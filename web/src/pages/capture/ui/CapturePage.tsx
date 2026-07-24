import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BottomSheet } from '@/shared/ui'
import {
  CaptureMethodSheet,
  CameraView,
  CaptureEditor,
  AnalyzingView,
  AnalysisResult,
  analyzeCapture,
  pollAnalyzeJob,
} from '@/features/capture'
import type { CaptureResult } from '@/features/capture'
import type { Card } from '@/entities/card'
import { fetchMe } from '@/entities/user'

type Phase = 'method' | 'camera' | 'edit' | 'analyzing' | 'done'

/**
 * 촬영 · AI 분석 플로우 (05, F-02/F-03).
 * 방식 선택 → 사진 촬영(라이브 카메라) / 앨범에서 선택(파일) → 드래그로 형광펜·네모 박스 크롭 → 분석.
 * 네모 박스(문제)가 있으면 수학 분석(→ 05-9), 형광펜만이면 영어 분석(→ 결과).
 * /capture?phase=analyzing[&subject=math] 로 진입하면 분석 단계부터 시작(정적 데모 체인 호환).
 */
export function CapturePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const fileRef = useRef<HTMLInputElement>(null)

  const [phase, setPhase] = useState<Phase>(params.get('phase') === 'analyzing' ? 'analyzing' : 'method')
  const [isMath, setIsMath] = useState(params.get('subject') === 'math')
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  // 분석 결과 카드(폴링에서 수신) — 결과 화면에 실 카드로 전달
  const [resultCards, setResultCards] = useState<Card[] | null>(null)

  // 영어·수학 모두 결과 카드 화면으로. 폴링이 카드를 주면 그 카드를 결과에 전달
  const finish = (cards?: Card[]) => {
    if (cards && cards.length > 0) setResultCards(cards)
    setPhase('done')
  }

  // 분석: 한도 확인 → analyze 접수(202) → 폴링. 실패/미가동 시 데모 타이머 폴백(탭하면 즉시 결과)
  useEffect(() => {
    if (phase !== 'analyzing') return
    let cancelled = false
    let pollTimer: ReturnType<typeof setTimeout> | undefined
    const fallback = setTimeout(() => finish(), 2800) // 폴백: 응답 지연 시 결과 화면(최신 카드 조회)
    ;(async () => {
      try {
        const me = await fetchMe()
        if (me.dailyUsed >= me.dailyLimit) {
          clearTimeout(fallback)
          navigate('/limit') // 무료 한도 초과
          return
        }
        // ⚠️ CaptureEditor가 크롭 base64를 아직 만들지 않음 → fullImage best-effort(크롭 추출은 후속)
        const { jobId } = await analyzeCapture({
          type: isMath ? 'PROBLEM' : 'WORD',
          fullImage: imageSrc ?? undefined,
          cropImages: imageSrc && !isMath ? [imageSrc] : undefined,
          cropImage: imageSrc && isMath ? imageSrc : undefined,
        })
        const poll = async () => {
          if (cancelled) return
          const r = await pollAnalyzeJob(jobId)
          if (r.status === 'COMPLETED') {
            clearTimeout(fallback)
            finish(r.cards) // 실제 분석 카드 전달(서버에 이미 저장됨)
          } else if (r.status === 'FAILED') {
            clearTimeout(fallback)
            finish()
          } else {
            pollTimer = setTimeout(poll, 2000)
          }
        }
        poll()
      } catch {
        // 폴백 타이머가 데모 결과로 진행 (백엔드 미가동 등)
      }
    })()
    return () => {
      cancelled = true
      clearTimeout(fallback)
      if (pollTimer) clearTimeout(pollTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isMath])

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = '' // 같은 파일 다시 선택 가능하게 리셋
    if (!f) return
    setImageSrc(URL.createObjectURL(f))
    setPhase('edit')
  }

  const onEditDone = (result: CaptureResult) => {
    setIsMath(result.hasBox)
    setPhase('analyzing')
  }

  const hiddenFileInput = (
    <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
  )

  if (phase === 'method') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)' }}>
        {hiddenFileInput}
        <BottomSheet open onClose={() => navigate(-1)}>
          <CaptureMethodSheet
            onCamera={() => setPhase('camera')}
            onAlbum={() => fileRef.current?.click()}
            onCancel={() => navigate(-1)}
          />
        </BottomSheet>
      </div>
    )
  }

  if (phase === 'camera') {
    return (
      <>
        {hiddenFileInput}
        <CameraView
          onCapture={(dataUrl) => {
            setImageSrc(dataUrl)
            setPhase('edit')
          }}
          onClose={() => setPhase('method')}
          onPickFile={() => fileRef.current?.click()}
        />
      </>
    )
  }

  if (phase === 'edit' && imageSrc) {
    return <CaptureEditor imageSrc={imageSrc} onDone={onEditDone} onClose={() => setPhase('method')} />
  }

  if (phase === 'analyzing') {
    return (
      <div onClick={() => finish()} style={{ cursor: 'pointer' }}>
        <AnalyzingView subject={isMath ? 'MATH' : 'ENGLISH'} />
      </div>
    )
  }

  return <AnalysisResult isMath={isMath} card={resultCards?.[0] ?? null} onBack={() => navigate(-1)} />
}
