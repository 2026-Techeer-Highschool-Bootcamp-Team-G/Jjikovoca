import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { NavigationBar } from '@/shared/ui'
import { mediaUrl } from '@/shared/api'
import { fetchArchive } from '@/entities/card'
import type { ArchiveItem } from '@/entities/card'

/** 원문 보관함 (F-27) — 15 원문 보관함. 캡처 원문을 일자별 썸네일로 열람 */
export function ArchivePage() {
  const navigate = useNavigate()
  // 실 API — 백엔드 원문 썸네일(imageUrl)을 일자별로 표시. 없으면 빈 상태
  const { data, isLoading, isError } = useQuery({ queryKey: ['archive'], queryFn: () => fetchArchive() })
  const days = data ?? []

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'var(--color-bg-primary)',
      }}
    >
      <NavigationBar title="원문 보관함" onBack={() => navigate(-1)} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 26, padding: '16px var(--spacing-xl) 20px' }}>
        {days.map((day) => (
          <div key={day.date} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-tertiary)' }}>
              {day.date}
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 13 }}>
              {day.items.map((item) => (
                <ArchiveThumb key={item.cardId} item={item} />
              ))}
            </div>
          </div>
        ))}

        {days.length === 0 && (
          <p style={{ margin: '40px 0', textAlign: 'center', fontSize: 13, color: 'var(--color-text-tertiary)' }}>
            {isLoading ? '불러오는 중…' : isError ? '원문을 불러오지 못했어요' : '아직 보관된 원문이 없어요 — 시험지를 촬영해보세요'}
          </p>
        )}

        {days.length > 0 && (
          <p style={{ margin: 0, textAlign: 'center', fontSize: 11, color: 'var(--grey-500)' }}>
            캡처한 시험지 원문은 여기 일자별로 보관돼요 — 카드는 학습에 집중!
          </p>
        )}
      </div>
    </div>
  )
}

// 원문 썸네일 — 실제 크롭 이미지(imageUrl) + 유형 표식(WORD=형광펜 / PROBLEM=파란 테두리)
function ArchiveThumb({ item }: { item: ArchiveItem }) {
  return (
    <button
      type="button"
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1',
        background: 'var(--grey-50)',
        border: item.type === 'PROBLEM' ? '1.5px solid var(--color-brand-primary)' : '1px solid var(--color-border-default)',
        borderRadius: 12,
        overflow: 'hidden',
        padding: 0,
        cursor: 'pointer',
      }}
    >
      <img
        src={mediaUrl(item.imageUrl)}
        alt="캡처 원문"
        loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      {item.type === 'WORD' && (
        <span
          style={{
            position: 'absolute',
            left: 6,
            bottom: 6,
            width: 22,
            height: 6,
            borderRadius: 3,
            background: 'var(--color-highlight)',
            opacity: 0.9,
          }}
        />
      )}
    </button>
  )
}
