import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { NavigationBar, Button } from '@/shared/ui'
import { createExport } from '@/features/export'

type ExportType = 'MATH' | 'WORD'
type Range = 'DONT' | 'CONFUSED' | 'ALL'

const RANGES: { key: Range; label: string }[] = [
  { key: 'DONT', label: '몰라요만' },
  { key: 'CONFUSED', label: '헷갈려요만' },
  { key: 'ALL', label: '전체' },
]

/** PDF 내보내기 (08-1, F-07) — 프리미엄 전용 AI 편집 시험지 */
export function ExportPage() {
  const navigate = useNavigate()
  const [type, setType] = useState<ExportType>('WORD')
  const [range, setRange] = useState<Range>('DONT')

  // 생성 요청 — 성공 시 downloadUrl 전달, 실패/미가동 시에도 결과 화면으로(폴백)
  const create = useMutation({
    mutationFn: () => createExport({ type: type === 'WORD' ? 'PDF_WORDTEST' : 'PDF_NOTE' }),
    onSuccess: (r) => navigate('/export-done', { state: { downloadUrl: r.downloadUrl } }),
    onError: () => navigate('/export-done'),
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg-secondary)' }}>
      <NavigationBar title="PDF 내보내기" onBack={() => navigate(-1)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: '16px var(--spacing-xl)' }}>
        <TypeCard
          selected={type === 'MATH'}
          emoji="📝"
          title="수학 오답 문제 시험지"
          sub="틀린 문제만 모아 재구성 · 힌트/정답지 분리"
          onClick={() => setType('MATH')}
        />
        <TypeCard
          selected={type === 'WORD'}
          emoji="📄"
          title="영어 단어 시험지"
          sub="몰라요 단어로 빈칸 시험지 · 답지 포함"
          onClick={() => setType('WORD')}
        />

        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', marginTop: 4 }}>
          범위
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          {RANGES.map((r) => {
            const active = range === r.key
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 12,
                  fontWeight: 500,
                  background: active ? 'var(--color-brand-weak)' : 'var(--color-bg-primary)',
                  color: active ? 'var(--color-text-brand)' : 'var(--color-text-secondary)',
                  border: active ? '1px solid transparent' : '1px solid var(--color-border-default)',
                  cursor: 'pointer',
                }}
              >
                {r.label}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 16, background: 'var(--color-bg-primary)', borderRadius: 16, padding: 16 }}>
          <A4Mock />
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
              AI가 편집해 드려요
            </span>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {['약한 단어 우선 선별', '빈칸 문제 자동 배치', '개인 코멘트 삽입', '답지 페이지 분리'].map((t) => (
                <li key={t} style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>· {t}</li>
              ))}
            </ul>
            <span style={{ fontSize: 11, lineHeight: 1.4, color: 'var(--color-text-tertiary)', marginTop: 4 }}>
              인쇄 최적화 A4 · 생성 후 다운로드/인쇄/공유
            </span>
          </div>
        </div>

        <p style={{ margin: 0, textAlign: 'center', fontSize: 12, color: 'var(--color-text-tertiary)' }}>
          🔒 프리미엄 전용 · AI 편집 1회 사용
        </p>
      </div>

      <div style={{ background: 'var(--color-bg-primary)', padding: '12px var(--spacing-xl) 32px' }}>
        <Button block size="lg" onClick={() => create.mutate()} disabled={create.isPending}>
          {create.isPending ? '생성 중…' : '📄 PDF 만들기'}
        </Button>
      </div>
    </div>
  )
}

function TypeCard({
  selected,
  emoji,
  title,
  sub,
  onClick,
}: {
  selected: boolean
  emoji: string
  title: string
  sub: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        textAlign: 'left',
        height: 72,
        padding: '0 13px',
        background: 'var(--color-bg-primary)',
        border: selected ? '1.5px solid var(--color-brand-primary)' : '1px solid var(--color-border-default)',
        borderRadius: 14,
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: 12,
          background: 'var(--color-brand-weak)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
        }}
        aria-hidden
      >
        {emoji}
      </span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>{title}</span>
        <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{sub}</span>
      </div>
      <span
        style={{
          width: 20,
          height: 20,
          flexShrink: 0,
          borderRadius: '50%',
          border: '2px solid',
          borderColor: selected ? 'var(--color-brand-primary)' : 'var(--color-border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected && <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-brand-primary)' }} />}
      </span>
    </button>
  )
}

// A4 미리보기 목업 (49:344)
function A4Mock() {
  return (
    <div
      style={{
        width: 130,
        flexShrink: 0,
        aspectRatio: '140 / 198',
        background: 'var(--common-white)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 6,
        boxShadow: '0 4px 10px rgba(25,31,40,0.12)',
        padding: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        overflow: 'hidden',
      }}
      aria-hidden
    >
      <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--color-text-primary)' }}>찍어보카 단어 시험지</span>
      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 6, color: 'var(--color-text-tertiary)' }}>{n}.</span>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--grey-300)' }} />
          <div style={{ width: 28, height: 8, borderRadius: 2, border: '1px solid var(--grey-300)' }} />
        </div>
      ))}
      <div
        style={{
          marginTop: 'auto',
          borderRadius: 4,
          padding: '4px 6px',
          background: 'linear-gradient(180deg, #ffea7a, #ffd84d)',
          fontSize: 6.5,
          fontWeight: 500,
          color: 'var(--yellow-900)',
        }}
      >
        💬 AI: 다의어 sound는 문맥 확인 필수!
      </div>
    </div>
  )
}
