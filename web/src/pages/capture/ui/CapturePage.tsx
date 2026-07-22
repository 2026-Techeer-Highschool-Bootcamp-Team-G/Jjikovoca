import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BottomSheet } from '@/shared/ui'
import { CaptureMethodSheet, CameraView, CaptureEditor, AnalyzingView, AnalysisResult } from '@/features/capture'
import type { CaptureResult } from '@/features/capture'

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

  const finish = () => (isMath ? navigate('/math-problem') : setPhase('done'))

  // AI 분석 대기(실제 p95 10초)를 데모용으로 축약 — 탭하면 즉시 결과로도 진행
  useEffect(() => {
    if (phase !== 'analyzing') return
    const t = setTimeout(finish, 2800)
    return () => clearTimeout(t)
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
      <div onClick={finish} style={{ cursor: 'pointer' }}>
        <AnalyzingView subject={isMath ? 'MATH' : 'ENGLISH'} />
      </div>
    )
  }

  return <AnalysisResult onBack={() => navigate(-1)} onGoNote={() => navigate('/wrong-note')} />
}
