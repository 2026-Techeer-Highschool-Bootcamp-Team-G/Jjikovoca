import { useNavigate } from 'react-router-dom'
import { NavigationBar } from '@/shared/ui'

type CaptureType = 'WORD' | 'PROBLEM'

// 백엔드 연결 전 데모 (프로토타입 15 원문 보관함) — 일자별 크롭 유형
const DAYS: { date: string; items: CaptureType[] }[] = [
  { date: '오늘 · 7월 21일', items: ['WORD', 'PROBLEM', 'WORD'] },
  { date: '어제 · 7월 20일', items: ['PROBLEM', 'WORD', 'WORD'] },
  { date: '7월 19일', items: ['WORD', 'PROBLEM'] },
]

/** 원문 보관함 (F-27) — 15 원문 보관함. 캡처 원문을 일자별 썸네일(형광펜/박스 구분)로 열람 */
export function ArchivePage() {
  const navigate = useNavigate()

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
        {DAYS.map((day) => (
          <div key={day.date} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-tertiary)' }}>
              {day.date}
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 13 }}>
              {day.items.map((type, i) => (
                <ArchiveThumb key={i} type={type} />
              ))}
            </div>
          </div>
        ))}

        <p style={{ margin: 0, textAlign: 'center', fontSize: 11, color: 'var(--grey-500)' }}>
          캡처한 시험지 원문은 여기 일자별로 보관돼요 — 카드는 학습에 집중!
        </p>
      </div>
    </div>
  )
}

// 원문 썸네일 (87:677) — 문서 스켈레톤 + 유형 표식(WORD=형광펜 노란 스트립 / PROBLEM=파란 박스)
function ArchiveThumb({ type }: { type: CaptureType }) {
  const line = (top: string, width: string) => ({
    position: 'absolute' as const,
    left: '12.6%',
    top,
    width,
    height: 5,
    borderRadius: 2.5,
    background: 'var(--grey-200)',
  })
  return (
    <button
      type="button"
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1',
        background: 'var(--grey-50)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 12,
        overflow: 'hidden',
        padding: 0,
        cursor: 'pointer',
      }}
    >
      <span style={line('12.6%', '72.8%')} />
      <span style={line('27.2%', '72.8%')} />
      <span style={line('41.7%', '72.8%')} />
      <span style={line('56.3%', '45.6%')} />
      {type === 'WORD' && (
        <span
          style={{
            position: 'absolute',
            left: '28.2%',
            top: '25.2%',
            width: '33%',
            height: 9,
            borderRadius: 3,
            background: 'var(--color-highlight)',
            opacity: 0.85,
          }}
        />
      )}
      {type === 'PROBLEM' && (
        <span
          style={{
            position: 'absolute',
            left: '8.7%',
            top: '20.4%',
            width: '80.6%',
            height: '42.7%',
            border: '1.5px solid var(--color-brand-primary)',
            borderRadius: 6,
          }}
        />
      )}
    </button>
  )
}
