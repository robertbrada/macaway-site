import { defineConfig } from 'astro/config';

// The page's home is macaway.app, but until that certificate exists the only live URL is
// the project page at robertbrada.github.io/macaway-site/, which serves from a subpath.
// Building for that one needs both set:
//   SITE_URL=https://robertbrada.github.io SITE_BASE=/macaway-site npm run build
const site = process.env.SITE_URL ?? 'https://macaway.app';
const base = process.env.SITE_BASE ?? '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
