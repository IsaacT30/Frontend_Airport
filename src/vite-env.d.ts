/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FLIGHTS_API_URL: string
  readonly VITE_AIRPORT_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
