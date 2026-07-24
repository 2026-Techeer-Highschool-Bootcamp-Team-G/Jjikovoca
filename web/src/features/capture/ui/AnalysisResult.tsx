import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { NavigationBar, Button } from '@/shared/ui'
import { FlipCard } from '@/widgets/recent-cards'
import { fetchCards, cardToRecent } from '@/entities/card'
import type { Card, FeedSubject } from '@/entities/card'

interface Props {
  isMath: boolean
  /** 분석 결과 카드(폴링에서 전달). 없으면 방금 저장된 최신 카드를 조회 */
  card?: Card | null
  onBack: () => void
}

// 분석 완료 — 분석 카드는 이미 서버에 저장됨(/api/cards). 결과 카드를 보여주고 홈/오답노트로 유도
export function AnalysisResult({ isMath, card, onBack }: Props) {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const subject: FeedSubject = isMath ? 'MATH' : 'ENGLISH'

  // 분석 카드가 넘어오지 않으면(폴백/스킵) 방금 저장된 최신 카드를 조회
  const latest = useQuery({ queryKey: ['cards', subject], queryFn: () => fetchCards(subject), enabled: !card })
  const resolved = card ?? latest.data?.[0] ?? null
  const recent = resolved ? cardToRecent(resolved) : null

  // 새 카드가 홈 캐러셀/오답노트에 반영되도록 카드 목록 캐시 무효화
  useEffect(() => {
    qc.invalidateQueries({ queryKey: ['cards'] })
  }, [qc, resolved?.id])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg-secondary)' }}>
      <NavigationBar title={isMath ? '수학 카드' : '영어 카드'} onBack={onBack} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: '16px var(--spacing-xl)' }}>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)' }}>
          ✨ AI가 카드를 만들어 오답노트에 저장했어요 — 탭해서 {isMath ? '풀이' : '뜻'}을 확인해요
        </p>
        {recent ? (
          <FlipCard card={recent} height={380} />
        ) : (
          <p style={{ margin: '40px 0', textAlign: 'center', fontSize: 13, color: 'var(--color-text-tertiary)' }}>
            {latest.isLoading ? '카드를 불러오는 중…' : '카드를 불러오지 못했어요'}
          </p>
        )}
      </div>

      <div style={{ padding: '0 var(--spacing-xl) 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Button block size="lg" onClick={() => navigate('/')}>
          홈에서 확인하기
        </Button>
        <Button block size="lg" variant="weak" onClick={() => navigate('/wrong-note')}>
          오답노트로 가기
        </Button>
      </div>
    </div>
  )
}
