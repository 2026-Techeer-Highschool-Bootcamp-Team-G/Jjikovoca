import katex from 'katex'
import 'katex/dist/katex.min.css'

/**
 * LaTeX 문자열을 HTML 로 렌더 (문제 수식 표시 — F-26 등).
 * 렌더 실패 시 원문을 그대로 반환해 화면이 깨지지 않게 한다.
 */
export function renderLatex(tex: string, displayMode = false): string {
  try {
    return katex.renderToString(tex, { displayMode, throwOnError: false })
  } catch {
    return tex
  }
}
