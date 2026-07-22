import { StepItem } from './StepItem'
import type { MathStep } from '../model/types'

interface Props {
  steps: MathStep[]
  openSteps: Set<number>
  highlightStep?: number
  onToggle: (no: number) => void
}

export function StepAccordion({ steps, openSteps, highlightStep, onToggle }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {steps.map((step) => (
        <StepItem
          key={step.no}
          step={step}
          open={openSteps.has(step.no)}
          highlighted={step.no === highlightStep}
          onToggle={() => onToggle(step.no)}
        />
      ))}
    </div>
  )
}
