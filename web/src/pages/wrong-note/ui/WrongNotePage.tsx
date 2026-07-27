import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Chip, Button, SearchBar, BottomSheet } from '@/shared/ui'
import { CardRow } from '@/widgets/card-row'
import type { CardRowView } from '@/widgets/card-row'
import { StudySetupSheet } from '@/features/study-setup'
import { fetchCards } from '@/entities/card'
import type { Card } from '@/entities/card'

// 분류 칩 — 전체 / 졸업완료(알아요 4번 이상) / 복습대기(졸업완료 아님) / 약점유형(몰라요+헷갈려요 > 알아요)
type Status = 'ALL' | 'GRADUATED' | 'WAITING' | 'WEAK'
const STATUS_LABEL: Record<Status, string> = {
  ALL: '전체',
  GRADUATED: '졸업완료',
  WAITING: '복습대기',
  WEAK: '약점유형',
}

// 발음 로케일 — 상단 토글로 선택, 카드 스피커가 이 국가 발음을 재생
type Locale = 'US' | 'GB'

// 피드 Card → 행 뷰 매핑. 발음·유형 태그는 백엔드 제공(기존 카드는 null)
function toRow(c: Card): CardRowView {
  const isWord = c.type === 'WORD'
  const exams = c.exams ?? []
  const tags = (c.tags ?? []).map((t, i) => ({ label: t, tone: i === 0 ? ('grey' as const) : ('blue' as const) }))
  return {
    id: c.id,
    title: isWord ? (c.word ?? '') : (c.latex ?? c.summary ?? '문제'),
    subtitle: isWord ? (c.contextMeaning ?? '') : (c.summary ?? ''),
    pronunciation: isWord ? (c.pronunciation ?? undefined) : undefined,
    tags: tags.length > 0 ? tags : undefined,
    exams: exams.map((e) => e.title),
    untagged: exams.length === 0,
    showSpeaker: isWord,
  }
}

/** 단어장 (F-04, 구 오답노트) — 06 단어장 */
export function WrongNotePage() {
  const navigate = useNavigate()
  // 영어 전용 MVP — 과목 필터 없이 전체(=영어) 카드 조회
  const { data, isLoading, isError } = useQuery({ queryKey: ['cards', 'ALL'], queryFn: () => fetchCards('ALL') })
  const allCards = data ?? []

  const [status, setStatus] = useState<Status>('ALL')
  const [setupOpen, setSetupOpen] = useState(false)
  const [voice, setVoice] = useState<Locale>('US') // 발음 국가 선택(기본 미국)

  // 분류 — 졸업완료/복습대기는 graduated 로 클라 필터. 약점유형은 등급별 카운트(백엔드) 필요 → 준비 중
  const filtered = allCards.filter((c) => {
    if (status === 'GRADUATED') return c.graduated
    if (status === 'WAITING') return !c.graduated
    if (status === 'WEAK') return false
    return true
  })
  const rows = filtered.map(toRow)
  // 칩 카운트 — 로드된 카드에서 클라 계산(필터와 정합)
  const count: Record<Status, number | null> = {
    ALL: allCards.length,
    GRADUATED: allCards.filter((c) => c.graduated).length,
    WAITING: allCards.filter((c) => !c.graduated).length,
    WEAK: null, // 백엔드 등급 카운트 필요
  }

  // 스피커로 발음 재생 중인 단어 — 듣기 끝날 때까지 그 행 강조
  const [speakingId, setSpeakingId] = useState<number | null>(null)
  const speakingRef = useRef<number | null>(null)

  const handleSpeak = (row: CardRowView) => {
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined
    if (!synth) return
    synth.cancel()
    const u = new SpeechSynthesisUtterance(row.title)
    u.lang = voice === 'US' ? 'en-US' : 'en-GB' // 상단 토글에서 선택한 국가 발음
    u.rate = 0.9
    const clear = () => {
      if (speakingRef.current === row.id) {
        speakingRef.current = null
        setSpeakingId(null)
      }
    }
    u.onend = clear
    u.onerror = clear
    speakingRef.current = row.id
    setSpeakingId(row.id)
    synth.speak(u)
  }

  useEffect(() => {
    return () => window.speechSynthesis?.cancel()
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px var(--spacing-xl) 0',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)' }}>단어장</h1>
        <button
          type="button"
          onClick={() => navigate('/export')}
          style={{
            background: 'var(--color-brand-primary)',
            color: 'var(--color-text-inverse)',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            padding: '5px 12px',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          PDF ↗
        </button>
      </div>

      <div style={{ padding: '12px var(--spacing-xl) 0' }}>
        <SearchBar placeholder="단어 · 문제 · 개념 검색" onClick={() => navigate('/search')} />
      </div>

      {/* 분류 칩 4개 */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px var(--spacing-xl)' }}>
        {(['ALL', 'GRADUATED', 'WAITING', 'WEAK'] as Status[]).map((s) => (
          <div key={s} style={{ flexShrink: 0 }}>
            <Chip active={status === s} onClick={() => setStatus(s)}>
              {count[s] != null ? `${STATUS_LABEL[s]} ${count[s]}` : STATUS_LABEL[s]}
            </Chip>
          </div>
        ))}
      </div>

      {/* 발음 국가 토글 + 정렬 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          padding: '0 var(--spacing-xl) 10px',
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <VoiceToggle label="🇺🇸 미국" active={voice === 'US'} onClick={() => setVoice('US')} />
          <VoiceToggle label="🇬🇧 영국" active={voice === 'GB'} onClick={() => setVoice('GB')} />
        </div>
        <button
          type="button"
          style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, fontWeight: 500, color: 'var(--color-text-brand)', cursor: 'pointer' }}
        >
          몰라요 빈도순 ▾
        </button>
      </div>

      {/* 카드 리스트 — 하단 고정 학습하기/네비를 위한 여백 확보(스크롤) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 var(--spacing-xl) 150px' }}>
        {rows.map((row) => (
          <CardRow
            key={row.id}
            row={row}
            speaking={speakingId === row.id}
            onSpeak={() => handleSpeak(row)}
            onExamTag={row.untagged ? () => navigate('/exam-select', { state: { cardId: row.id } }) : undefined}
            onClick={() => navigator.vibrate?.(12)}
          />
        ))}
        {rows.length === 0 && (
          <p style={{ margin: '40px 0', textAlign: 'center', fontSize: 13, color: 'var(--color-text-tertiary)' }}>
            {isLoading
              ? '불러오는 중…'
              : isError
                ? '카드를 불러오지 못했어요'
                : status === 'WEAK'
                  ? '약점유형 분류는 준비 중이에요 (백엔드 연동 예정)'
                  : '아직 카드가 없어요 — 시험지를 촬영해 단어 카드를 만들어보세요'}
          </p>
        )}
      </div>

      {/* 학습하기 — 하단 네비 바로 위에 고정 */}
      <div
        style={{
          position: 'fixed',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: 'calc(84px + env(safe-area-inset-bottom))',
          width: '100%',
          maxWidth: 430,
          padding: '0 var(--spacing-xl)',
          boxSizing: 'border-box',
          zIndex: 40,
        }}
      >
        <Button block size="lg" onClick={() => setSetupOpen(true)}>
          학습하기
        </Button>
      </div>

      <BottomSheet open={setupOpen} onClose={() => setSetupOpen(false)}>
        <StudySetupSheet
          onStart={(method, type) => {
            setSetupOpen(false)
            if (method === 'PICK') navigate('/study-pick', { state: { type } })
            else navigate(type === 'FLASHCARD' ? '/flashcard' : '/cloze')
          }}
        />
      </BottomSheet>
    </div>
  )
}

// 발음 국가 선택 토글(선택 시 파랑)
function VoiceToggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '5px 12px',
        borderRadius: 'var(--radius-full)',
        fontSize: 12,
        fontWeight: 500,
        cursor: 'pointer',
        background: active ? 'var(--color-brand-weak)' : 'var(--color-bg-primary)',
        color: active ? 'var(--color-text-brand)' : 'var(--color-text-secondary)',
        border: active ? '1px solid transparent' : '1px solid var(--color-border-default)',
      }}
    >
      {label}
    </button>
  )
}
