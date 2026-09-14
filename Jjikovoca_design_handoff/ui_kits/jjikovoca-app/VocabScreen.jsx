// 06 단어장 — 태그별 자동 분류 피드(FR-04) + 알/헷/몰 누적(FR-18) + 복습 진입(FR-10)
const { Button: VocabButton, SearchBar: VocabSearchBar, CardRow: VocabCardRow, BottomSheet: VocabSheet, TagFilterTabs: VocabTagTabs, TagChip: VocabTagChip } = window.DesignSystem_1cf846

function VocabScreen({ onStudy }) {
  const [tag, setTag] = React.useState('ALL')
  const [voice, setVoice] = React.useState('US')
  const [speaking, setSpeaking] = React.useState(null)
  const [sheet, setSheet] = React.useState(false)
  const [tagSheet, setTagSheet] = React.useState(null)
  const [sort, setSort] = React.useState('WRONG')

  const words = window.WORDS.filter((w) => window.matchesTag(w, tag))
  const rows = [...words].sort((a, b) => (sort === 'WRONG' ? window.wrongRate(b) - window.wrongRate(a) : a.id - b.id)).map(window.toRow)

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px var(--spacing-xl) 0' }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)' }}>단어장</h1>
      </div>
      <div style={{ padding: '12px var(--spacing-xl) 0' }}>
        <VocabSearchBar placeholder="단어 · 뜻 · 태그 검색" />
      </div>
      <div style={{ padding: '10px var(--spacing-xl) 0' }}>
        <VocabTagTabs items={window.TAG_TABS} active={tag} onSelect={setTag} onManage={() => setTagSheet('manage')} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '12px var(--spacing-xl) 10px' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <VoiceToggle label="🇺🇸 미국" active={voice === 'US'} onClick={() => setVoice('US')} />
          <VoiceToggle label="🇬🇧 영국" active={voice === 'GB'} onClick={() => setVoice('GB')} />
        </div>
        <button
          type="button"
          onClick={() => setSort((s) => (s === 'WRONG' ? 'RECENT' : 'WRONG'))}
          style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, fontWeight: 500, color: 'var(--color-text-brand)', cursor: 'pointer' }}
        >
          {sort === 'WRONG' ? '몰라요 빈도순 ▾' : '최근 추가순 ▾'}
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 var(--spacing-xl) 176px' }}>
        {rows.map((row) => (
          <VocabCardRow
            key={row.id}
            row={row}
            speaking={speaking === row.id}
            onSpeak={() => {
              setSpeaking(row.id)
              setTimeout(() => setSpeaking(null), 1400)
            }}
            onMoreTags={() => setTagSheet(row)}
            onExamTag={row.untagged ? () => setTagSheet(row) : undefined}
            expandable
          />
        ))}
        {rows.length === 0 && (
          <p style={{ margin: '40px 0', textAlign: 'center', fontSize: 13, color: 'var(--color-text-tertiary)' }}>
            이 태그에 담긴 단어가 아직 없어요 — 시험지를 촬영해보세요
          </p>
        )}
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 108, padding: '0 var(--spacing-xl)', boxSizing: 'border-box', zIndex: 40 }}>
        <VocabButton block size="lg" onClick={() => setSheet(true)}>학습하기</VocabButton>
      </div>

      <VocabSheet open={sheet} onClose={() => setSheet(false)}>
        <h3 style={{ margin: '4px 0 0', fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)' }}>어떤 단어로 복습할까요?</h3>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)' }}>복습 방식을 고르면 퀴즈 유형을 이어서 선택해요</p>
        <VocabButton block size="lg" onClick={() => { setSheet(false); onStudy() }}>복습 방식 고르기</VocabButton>
        <VocabButton block size="lg" variant="ghost">단어 시험지 PDF 만들기</VocabButton>
      </VocabSheet>

      <VocabSheet open={Boolean(tagSheet)} onClose={() => setTagSheet(null)}>
        <h3 style={{ margin: '4px 0 0', fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {tagSheet && tagSheet.title ? tagSheet.title + ' 태그' : '태그 관리'}
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)' }}>태그는 개수 제한 없이 붙일 수 있어요</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '4px 0 8px' }}>
          {(tagSheet && tagSheet.exams ? tagSheet.exams : [window.ACTIVE_EXAM]).map((e) => (
            <VocabTagChip key={e.label} kind="exam" label={e.label} dday={e.dday} onRemove={() => {}} />
          ))}
          {(tagSheet && tagSheet.tags ? tagSheet.tags.map((t) => t.label) : ['#수능특강', '#형용사', '#동사', '#내신', '#중요', '#독해', '#듣기']).map((label) => (
            <VocabTagChip key={label} label={label} onRemove={() => {}} />
          ))}
        </div>
        <VocabButton block size="lg" variant="weak" onClick={() => setTagSheet(null)}>+ 태그 추가</VocabButton>
      </VocabSheet>
    </div>
  )
}

function VoiceToggle({ label, active, onClick }) {
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

Object.assign(window, { VocabScreen, VoiceToggle })
