import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavigationBar, Button, TextField } from '@/shared/ui'
import { DdayCard } from '@/widgets/dday-card'

type Subject = 'ALL' | 'ENGLISH' | 'MATH'
const SUBJECTS: { key: Subject; label: string }[] = [
  { key: 'ALL', label: '전과목' },
  { key: 'ENGLISH', label: '영어' },
  { key: 'MATH', label: '수학' },
]

const label = { fontSize: 13, fontWeight: 500, color: 'var(--color-text-tertiary)' } as const

/** 시험 D-day 관리 (F-19/F-29) — 16 시험 D-day 관리 */
export function ExamPage() {
  const navigate = useNavigate()
  const [subject, setSubject] = useState<Subject>('ALL')
  const [name, setName] = useState('')
  const [date, setDate] = useState('2026-10-14')

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'var(--color-bg-primary)',
      }}
    >
      <NavigationBar title="시험 일정" onBack={() => navigate(-1)} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '12px var(--spacing-xl) 24px' }}>
        <span style={label}>다가오는 시험</span>
        <DdayCard title="중간고사" dday={7} memoryRate={62} todayDue={12} />
        <DdayCard title="기말고사" dday={38} subtitle="전과목 · 시험일 기준으로 복습 일정 재배치됨" />

        <span style={{ ...label, marginTop: 8 }}>새 시험 등록</span>
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

        <Button block size="lg" onClick={() => navigate(-1)}>
          등록하기
        </Button>
      </div>
    </div>
  )
}
