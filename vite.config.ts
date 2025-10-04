/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OAUTH_CLIENT_ID: string
  // добавь сюда другие переменные при необходимости
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
