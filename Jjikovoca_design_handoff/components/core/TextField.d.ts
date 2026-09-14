/** 폼 입력 한 줄 — 회색 채움 필드(테두리 없음). 로그인·회원가입·시험 등록에 사용. */
export interface TextFieldProps {
  label?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  /** 필드 아래 11px 회색 보조 설명 */
  helper?: string
  type?: string
}
export declare function TextField(props: TextFieldProps): JSX.Element
