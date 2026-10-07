// 학습 — 복습 방식 3종 → 퀴즈 유형 2종 → 플래시카드/빈칸 → 알헷몰 평가 → 완료 (FR-12·FR-10·FR-05·FR-06)
const {
  FlashCard: StudyFlashCard, ClozeCard: StudyCloze, GradeButtons: StudyGradeButtons, StudyOptionCard: StudyOption,
  NavigationBar: StudyNav, StudyLoading: StudyLoadingView, SuccessGraphic: StudySuccess, Button: StudyButton,
  CardRow: StudyCardRow, TagFilterTabs: StudyTagTabs,
} = window.DesignSystem_1cf846

const MODES = [
  { key: 'TAG', emoji: '🏷️', title: '태그로 복습', description: '시험 태그·사용자 태그에 담긴 단어만 모아 풀어요' },
  { key: 'PICK', emoji: '✅', title: '직접 골라 복습', description: '단어장에서 원하는 단어만 다중 선택해요' },
  { key: 'WRONG', emoji: '🔥', title: '오답률 높은 단어', description: '몰라요 > 알아요 인 단어를 몰라요 빈도순으로 출제해요' },
]

function StudyScreen({ onExit }) {
  const [step, setStep] = React.useState('mode')
  const [mode, setMode] = React.useState(null)
  const [type, setType] = React.useState(null)
  const [tag, setTag] = React.useState('EXAM_MID')
  const [picked, setPicked] = React.useState([1, 3])
  const [index, setIndex] = React.useState(0)
  const [flipped, setFlipped] = React.useState(false)
  const [answer, setAnswer] = React.useState('')
  const [judged, setJudged] = React.useState(false)

  const queue = React.useMemo(() => {
    if (mode === 'TAG') return window.WORDS.filter((w) => window.matchesTag(w, tag))
    if (mode === 'PICK') return window.WORDS.filter((w) => picked.includes(w.id))
    if (mode === 'WRONG') return window.WORDS.filter((w) => w.ratings.dontKnow > w.ratings.know).sort((a, b) => b.ratings.dontKnow - a.ratings.dontKnow)
    return window.WORDS
  }, [mode, tag, picked])

  const total = queue.length
  const card = queue[index]
  const correct = card && answer.trim().toLowerCase() === card.word.toLowerCase()

  const next = () => {
    setFlipped(false)
    setAnswer('')
    setJudged(false)
    if (index + 1 >= total) setStep('done')
    else setIndex(index + 1)
  }

  React.useEffect(() => {
    if (step !== 'loading') return
    const t = setTimeout(() => setStep('quiz'), 1100)
    return () => clearTimeout(t)
  }, [step])

  const shell = (title, children, onBack) => (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: 'var(--color-bg-primary)' }}>
      <StudyNav title={title} onBack={onBack || onExit} />
      {children}
    </div>
  )

  if (step === 'mode') {
    return shell('복습 방식', (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '8px var(--spacing-xl) 32px' }}>
        <p style={{ margin: '0 0 4px', fontSize: 13, color: 'var(--color-text-secondary)' }}>어떤 단어로 복습할지 먼저 골라요</p>
        {MODES.map((m) => (
          <StudyOption
            key={m.key}
            emoji={m.emoji}
            title={m.title}
            description={m.description}
            meta={m.key === 'WRONG' ? window.WORDS.filter((w) => w.ratings.dontKnow > w.ratings.know).length + '개' : undefined}
            selected={mode === m.key}
            onClick={() => setMode(m.key)}
          />
        ))}

        {mode === 'TAG' && (
          <div style={{ marginTop: 4, padding: '12px 0 0', borderTop: '1px solid var(--color-border-default)' }}>
            <span style={{ display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)' }}>태그 선택</span>
            <StudyTagTabs items={window.TAG_TABS.filter((t) => t.key !== 'ALL')} active={tag} onSelect={setTag} />
          </div>
        )}

        {mode === 'PICK' && (
          <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0 0', borderTop: '1px solid var(--color-border-default)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)' }}>단어 선택 {picked.length}개</span>
            {window.WORDS.map(window.toRow).map((row) => (
              <StudyCardRow
                key={row.id}
                row={row}
                selectable
                selected={picked.includes(row.id)}
                onClick={() => setPicked((p) => (p.includes(row.id) ? p.filter((x) => x !== row.id) : [...p, row.id]))}
              />
            ))}
          </div>
        )}

        <div style={{ marginTop: 8 }}>
          <StudyButton block size="lg" disabled={!mode || (mode === 'PICK' && picked.length === 0)} onClick={() => mode && setStep('type')}>
            다음
          </StudyButton>
        </div>
      </div>
    ))
  }

  if (step === 'type') {
    return shell('퀴즈 유형', (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '8px var(--spacing-xl) 32px' }}>
        <p style={{ margin: '0 0 4px', fontSize: 13, color: 'var(--color-text-secondary)' }}>단어 {total}개로 어떻게 인출할까요?</p>
        <StudyOption emoji="🃏" title="플래시카드" description="앞면 단어·연상 이미지 → 뒤집어 뜻과 예문 확인" selected={type === 'FLASH'} onClick={() => setType('FLASH')} />
        <StudyOption emoji="✏️" title="예문 빈칸 채우기" description="예문의 빈칸에 단어를 직접 써서 인출해요" selected={type === 'CLOZE'} onClick={() => setType('CLOZE')} />
        <div style={{ marginTop: 8 }}>
          <StudyButton block size="lg" disabled={!type} onClick={() => setStep('loading')}>학습 시작</StudyButton>
        </div>
      </div>
    ), () => setStep('mode'))
  }

  if (step === 'loading') return shell(type === 'CLOZE' ? '빈칸 채우기' : '플래시카드', <StudyLoadingView />)

  if (step === 'done') {
    return shell('학습 완료', (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0 32px 120px' }}>
        <StudySuccess />
        <h2 style={{ margin: '8px 0 0', fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', animation: 'jjik-rise-in 0.4s ease-out both' }}>
          {total}개 복습 완료!
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-secondary)', textAlign: 'center' }}>연속 16일 · +40XP 를 받았어요</p>
        <div style={{ width: '100%', marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <StudyButton block size="lg" onClick={onExit}>단어장으로 돌아가기</StudyButton>
          <StudyButton block size="lg" variant="ghost" onClick={() => { setIndex(0); setStep('mode'); setMode(null); setType(null) }}>
            다른 방식으로 더 하기
          </StudyButton>
        </div>
      </div>
    ))
  }

  return shell(index + 1 + ' / ' + total, (
    <>
      <div style={{ padding: '0 var(--spacing-xl)' }}>
        <div style={{ height: 4, borderRadius: 2, background: 'var(--color-bg-secondary)', overflow: 'hidden' }}>
          <div style={{ width: ((index + 1) / total) * 100 + '%', height: '100%', background: 'var(--color-brand-primary)', borderRadius: 2, transition: 'width 0.3s var(--ease-standard)' }} />
        </div>
      </div>
      <div style={{ padding: '16px var(--spacing-xl) 0' }}>
        {type === 'CLOZE' ? (
          <StudyCloze
            sentence={card.example.replace(new RegExp(card.word, 'i'), '___')}
            translation={judged ? card.exampleTranslation : undefined}
            value={answer}
            onChange={setAnswer}
            onSubmit={() => setJudged(true)}
            judged={judged}
            correct={correct}
            word={card.word}
            meaning={card.meaning}
            hint={'첫 글자 ' + card.word[0] + ' · ' + card.word.length + '글자'}
          />
        ) : (
          <StudyFlashCard card={window.toCard(card)} height={500} flipped={flipped} onFlip={() => setFlipped((v) => !v)} />
        )}
      </div>
      <div style={{ padding: '16px var(--spacing-xl) 24px' }}>
        {type === 'CLOZE' && !judged ? (
          <StudyButton block size="lg" disabled={!answer.trim()} onClick={() => setJudged(true)}>정답 확인</StudyButton>
        ) : (
          <StudyGradeButtons onGrade={next} />
        )}
      </div>
    </>
  ))
}

window.StudyScreen = StudyScreen
