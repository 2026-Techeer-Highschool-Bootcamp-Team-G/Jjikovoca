import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { NavigationBar, Button, TextField } from '@/shared/ui'
import { DdayCard } from '@/widgets/dday-card'
import { fetchExams, createExam, updateExam, deleteExam, tagRecentCards } from '@/entities/exam'
import type { Exam } from '@/entities/exam'

type Subject = 'ALL' | 'ENGLISH' | 'MATH'
const SUBJECTS: { key: Subject; label: string }[] = [
  { key: 'ALL', label: '전과목' },
  { key: 'ENGLISH', label: '영어' },
  { key: 'MATH', label: '수학' },
]

const label = { fontSize: 13, fontWeight: 500, color: 'var(--color-text-tertiary)' } as const

/** 시험 D-day 관리 (F-19/F-29) — 16 시험 D-day 관리. 등록·수정·삭제·최근 카드 태그 */
export function ExamPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [subject, setSubject] = useState<Subject>('ALL')
  const [name, setName] = useState('')
  const [date, setDate] = useState('2026-10-14')
  const [editingId, setEditingId] = useState<number | null>(null)

  const examsQ = useQuery({ queryKey: ['exams'], queryFn: fetchExams })
  const exams = examsQ.data ?? []
  const refresh = () => qc.invalidateQueries({ queryKey: ['exams'] })

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setSubject('ALL')
    setDate('2026-10-14')
  }

  // 등록/수정 겸용 — editingId 있으면 PATCH, 없으면 POST
  const save = useMutation({
    mutationFn: () => {
      const patch = { title: name.trim(), subject: subject === 'ALL' ? null : subject, examDate: date }
      return editingId ? updateExam(editingId, patch) : createExam(patch)
    },
    onSuccess: () => {
      refresh()
      resetForm()
    },
  })
  const del = useMutation({ mutationFn: (id: number) => deleteExam(id), onSuccess: refresh })
  const nudge = useMutation({ mutationFn: (id: number) => tagRecentCards(id) })

  const startEdit = (e: Exam) => {
    setEditingId(e.id)
    setName(e.title)
    setSubject((e.subject as Subject | null) ?? 'ALL')
    setDate(e.examDate)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <NavigationBar title="시험 일정" onBack={() => navigate(-1)} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '12px var(--spacing-xl) 24px' }}>
        <span style={label}>다가오는 시험</span>
        {exams.length === 0 ? (
          <p style={{ margin: '8px 0', fontSize: 13, color: 'var(--color-text-tertiary)' }}>
            {examsQ.isLoading ? '불러오는 중…' : '등록된 시험이 없어요 — 아래에서 시험을 등록해보세요'}
          </p>
        ) : (
          exams.map((e) => (
            <div key={e.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <DdayCard title={e.title} dday={e.dday} />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <ActionBtn onClick={() => startEdit(e)}>수정</ActionBtn>
                <ActionBtn onClick={() => nudge.mutate(e.id)} disabled={nudge.isPending}>
                  최근 카드 태그
                </ActionBtn>
                <ActionBtn danger onClick={() => del.mutate(e.id)} disabled={del.isPending}>
                  삭제
                </ActionBtn>
                {nudge.data && nudge.variables === e.id && (
                  <span style={{ fontSize: 12, color: 'var(--color-text-brand)' }}>{nudge.data.taggedCount}개 태그됨</span>
                )}
              </div>
            </div>
          ))
        )}

        <span style={{ ...label, marginTop: 8 }}>{editingId ? '시험 수정' : '새 시험 등록'}</span>
        <TextField label="시험 이름" value={name} onChange={setName} placeholder="예: 9월 모의고사" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)' }}>과목</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {SUBJECTS.map((s) => {
              const active = subject === s.key
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSubject(s.key)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 13,
                    fontWeight: 500,
                    background: active ? 'var(--color-brand-primary)' : 'transparent',
                    color: active ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                    border: active ? '1px solid transparent' : '1px solid var(--color-border-default)',
                    cursor: 'pointer',
                  }}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>

        <TextField
          label="시험 날짜"
          type="date"
          value={date}
          onChange={setDate}
          helper="등록하면 시험일에 맞춰 복습 일정을 다시 짜드려요"
        />

        <div style={{ display: 'flex', gap: 8 }}>
          {editingId && (
            <Button block size="lg" variant="weak" onClick={resetForm}>
              취소
            </Button>
          )}
          <Button
            block
            size="lg"
            onClick={() => save.mutate()}
            disabled={name.trim() === '' || save.isPending}
            style={{ opacity: name.trim() ? 1 : 0.4 }}
          >
            {save.isPending ? '저장 중…' : editingId ? '수정하기' : '등록하기'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// 시험 카드 액션 버튼 (수정·태그·삭제)
function ActionBtn({
  children,
  onClick,
  danger = false,
  disabled = false,
}: {
  children: string
  onClick: () => void
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '6px 12px',
        borderRadius: 'var(--radius-full)',
        fontSize: 12,
        fontWeight: 500,
        background: 'transparent',
        color: danger ? 'var(--color-danger-primary)' : 'var(--color-text-secondary)',
        border: `1px solid ${danger ? 'var(--color-danger-primary)' : 'var(--color-border-default)'}`,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  )
}
