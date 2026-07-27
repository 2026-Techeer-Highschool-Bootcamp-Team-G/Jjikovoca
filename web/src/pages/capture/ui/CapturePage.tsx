import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BottomSheet } from '@/shared/ui'
import {
  CaptureMethodSheet,
  CameraView,
  CropStage,
  CaptureEditor,
  AnalyzingView,
  AnalysisResult,
  analyzeCapture,
  pollAnalyzeJob,
  ocrWords,
} from '@/features/capture'
import type { CaptureResult } from '@/features/capture'
import type { Card } from '@/entities/card'
import { fetchMe } from '@/entities/user'

type Phase = 'method' | 'camera' | 'crop' | 'edit' | 'analyzing' | 'done'

/**
 * 촬영 · AI 분석 플로우 (05, F-02/F-03) — 영어 전용 MVP.
 * 방식 선택 → 사진 촬영(라이브 카메라) / 앨범에서 선택(파일) → 영역 자르기(선택) → 형광펜으로 단어 표시 → 분석.
 * /capture?phase=analyzing 로 진입하면 분석 단계부터 시작(정적 데모 체인 호환).
 */
export function CapturePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const fileRef = useRef<HTMLInputElement>(null)

  const [phase, setPhase] = useState<Phase>(params.get('phase') === 'analyzing' ? 'analyzing' : 'method')
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  // 크롭 단계에서 잘라낸 이미지(없으면=건너뛰면 원본 imageSrc 사용)
  const [croppedSrc, setCroppedSrc] = useState<string | null>(null)
  // 형광펜 영역별 크롭(base64) — WORD 다중 단어 분석. CaptureEditor 에서 추출
  const [cropImages, setCropImages] = useState<string[]>([])
  // 분석 결과 카드(폴링에서 수신) — 결과 화면에 실 카드로 전달
  const [resultCards, setResultCards] = useState<Card[] | null>(null)
  // 분석 오류 — 무음 폴백 대신 실패를 사용자에게 표시
  const [error, setError] = useState<string | null>(null)

  // 영어·수학 모두 결과 카드 화면으로. 폴링이 카드를 주면 그 카드를 결과에 전달
  const finish = (cards?: Card[]) => {
    if (cards && cards.length > 0) setResultCards(cards)
    setPhase('done')
  }

  // 분석: 한도 확인 → analyze 접수(202) → 폴링(COMPLETED 카드 / FAILED·오류는 에러 표시)
  useEffect(() => {
    if (phase !== 'analyzing') return
    let cancelled = false
    let pollTimer: ReturnType<typeof setTimeout> | undefined
    setError(null)
    ;(async () => {
      try {
        const me = await fetchMe()
        if (me.dailyUsed >= me.dailyLimit) {
          navigate('/limit') // 무료 한도 초과
          return
        }
        // 문맥 이미지 — 크롭했으면 잘린 영역, 아니면 원본. 형광펜 크롭 좌표계와 일치한다.
        const src = croppedSrc ?? imageSrc
        // WORD: 형광펜 영역별 크롭 배열을 보낸다(단어마다 카드 생성). 크롭 실패 시 전체 이미지로 폴백.
        const wordCrops = cropImages.length > 0 ? cropImages : src ? [src] : undefined
        // 크롭을 프론트에서 OCR 해 단어 힌트(words)를 함께 보낸다 → 백엔드 단어키 캐시로 Gemini 재호출 절감.
        // AnalyzingView 가 떠 있는 동안 실행돼 OCR 지연이 사용자에게 숨는다. 실패는 "" 폴백(하위호환).
        const words = wordCrops ? await ocrWords(wordCrops) : undefined
        if (cancelled) return
        const { jobId } = await analyzeCapture({
          type: 'WORD',
          fullImage: src ?? undefined,
          cropImages: wordCrops,
          words,
        })
        const poll = async () => {
          if (cancelled) return
          try {
            const r = await pollAnalyzeJob(jobId)
            if (r.status === 'COMPLETED') finish(r.cards) // 실제 분석 카드 전달(서버에 이미 저장됨)
            else if (r.status === 'FAILED') setError(r.error ?? '분석에 실패했어요. 다른 사진으로 다시 시도해 주세요.')
            else pollTimer = setTimeout(poll, 2000)
          } catch (e) {
            if (!cancelled) setError(e instanceof Error ? e.message : '분석 결과를 불러오지 못했어요.')
          }
        }
        poll()
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : '분석을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.')
      }
    })()
    return () => {
      cancelled = true
      if (pollTimer) clearTimeout(pollTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = '' // 같은 파일 다시 선택 가능하게 리셋
    if (!f) return
    // 백엔드 분석은 base64 data URL 을 요구한다. blob: URL(URL.createObjectURL)은 서버가 못 읽어
    // 403(빈 본문)을 유발 → 분석 실패의 직접 원인이므로 FileReader 로 data URL 로 변환해 전송한다.
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageSrc(reader.result)
        setPhase('crop')
      } else {
        setError('이미지를 읽지 못했어요. 다른 사진을 선택해 주세요.')
      }
    }
    reader.onerror = () => setError('이미지를 읽지 못했어요. 다른 사진을 선택해 주세요.')
    reader.readAsDataURL(f)
  }

  const onEditDone = (result: CaptureResult) => {
    setCropImages(result.cropImages)
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
            setPhase('crop')
          }}
          onClose={() => setPhase('method')}
          onPickFile={() => fileRef.current?.click()}
        />
      </>
    )
  }

  if (phase === 'crop' && imageSrc) {
    return (
      <CropStage
        imageSrc={imageSrc}
        onDone={(cropped) => {
          setCroppedSrc(cropped)
          setPhase('edit')
        }}
        onSkip={() => {
          setCroppedSrc(null) // 건너뛰기 → 원본 그대로
          setPhase('edit')
        }}
        onClose={() => setPhase('method')}
      />
    )
  }

  if (phase === 'edit' && imageSrc) {
    return <CaptureEditor imageSrc={croppedSrc ?? imageSrc} onDone={onEditDone} onClose={() => setPhase('method')} />
  }

  if (phase === 'analyzing') {
    if (error) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: '0 32px',
            textAlign: 'center',
            background: 'var(--color-bg-secondary)',
          }}
        >
          <span style={{ fontSize: 40 }} aria-hidden>😵</span>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>{error}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 320 }}>
            <button
              type="button"
              onClick={() => setPhase('method')}
              style={{ height: 48, borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-brand-primary)', color: 'var(--common-white)', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
            >
              다시 촬영하기
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{ height: 48, borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-brand-weak)', color: 'var(--color-text-brand)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}
            >
              닫기
            </button>
          </div>
        </div>
      )
    }
    return <AnalyzingView />
  }

  return <AnalysisResult cards={resultCards} onBack={() => navigate(-1)} />
}
