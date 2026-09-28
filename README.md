# macaway-site

The public landing page for MacAway, a menu bar app that locks your Mac within seconds of
you walking away, following the iPhone or Apple Watch already on you over Bluetooth.

**Not released yet.** There is nothing to download, and nobody outside has run the app. The
app's source is in a separate private repository; only the site lives here.

## Building it

```bash
npm install
npm run build
```

The output lands in `dist/`. `npm run dev` serves it at <http://localhost:4321>.

The page's home is `macaway.app`. Until that certificate exists the only live URL is the
GitHub project page, which serves from a subpath and needs both variables set:

```bash
SITE_URL=https://robertbrada.github.io SITE_BASE=/macaway-site npm run build
```

## What is in here

| | |
|---|---|
| `src/pages` | `/` and `/privacy` |
| `src/components` | header, footer, the hero, the settings panel, the shield icons, the Download button |
| `src/icons/paths.ts` | shield path data, extracted from the app's own artwork |
| `src/lib/pricing.ts` | the trial, the price, and the two switches that turn on Download and Buy |
| `public/` | the app icon, the tab icon, the self-hosted Satoshi variable font and its notice, `robots.txt` |

The page carries `noindex, nofollow` and `robots.txt` disallows everything, deliberately,
until there is a release worth finding.
