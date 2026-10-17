/// <reference types="vite/client" />

declare const __GLOBAL_PFP__: string;

interface ImportMetaEnv {
  readonly VITE_GLOBAL_PFP?: string;
  readonly VITE_LASTFM_API_KEY?: string;
  readonly VITE_LASTFM_USERNAME?: string;
  readonly LASTFM_API_KEY?: string;
  readonly LASTFM_USERNAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
