/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 비우면 상대경로(/api) 사용. 다른 오리진 API 지정 시에만 설정 (05 §2-1) */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
