interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_WS_URL?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_USER_GUIDE_BASE_URL?: string;
  readonly DEV?: boolean;
  readonly PROD?: boolean;
  readonly MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Vite's `?raw` query — bundles a file as a string. Used in tests that lint
// CSS source (e.g. tokens.css reduced-motion block) without pulling node:fs.
declare module "*?raw" {
  const content: string;
  export default content;
}
