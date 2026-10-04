/// <reference types="astro/client" />

// Both are read in the browser, so both have to be PUBLIC_: Astro writes them into the
// bundle at build time. Neither is a secret; a PostHog project key is meant to be seen.
interface ImportMetaEnv {
  readonly PUBLIC_POSTHOG_KEY?: string;
  readonly PUBLIC_POSTHOG_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
