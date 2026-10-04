# MacAway site — house rules

The site that sells MacAway, a menu bar app that locks your Mac when you walk away from it.
Astro with no client framework — four pages, `/`, `/privacy`, `/thanks` and `/lost-key` — plus
`worker/`, the Cloudflare Worker that takes the money and issues the licence keys.

## Wording

The page is read by people whose first language is not English. Write for them.

- **Short, ordinary words.** "It works without the internet", not "fully offline
  operation". "A flat battery", not "a depleted power source". If a word would make
  someone reach for a dictionary, it is the wrong word.
- **Say what the thing is, not what it is called.** Headings describe the section:
  "What the icon means", not "One look tells you if you're covered". Invented product
  phrases read as marketing and get skipped.
- **Actionable headings where there is a choice to make.** "Choose how it locks" beats
  "Two settings, one switch".
- **Second person, present tense.** "Your Mac locks itself", not "the Mac will be
  locked".
- **One idea per sentence.** Two short sentences beat one with a semicolon.
- **No em-dash pile-ups, no "simply", no "seamlessly", no "powerful".**

Headings that are currently right, as a reference for tone: *Locks your Mac when you forget to*
· *How it works* · *Choose how it locks* · *What the icon means* ·
*Nothing leaves your Mac*.

## Design

- Clean, friendly, professional. Restraint over decoration — the app does one small
  thing, and the page should look like it.
- **Icons must carry meaning.** A device, a Bluetooth mark and a padlock on the three
  steps tell the story on their own, so they belong. An icon chip beside a list item
  whose heading already says it is clutter, so it does not.
- **No uniform card grids.** Four identical rounded boxes each with a tinted icon square
  reads as filler. Hairline-divided rows in a two-column block read as considered.
- **Controls copied from the app should look like the app's.** The mode switch is
  content-width and centred with a 7-9px corner, not a full-width pill.
- A section that needs only a small label gets one `h2.eyebrow` rather than an eyebrow
  plus a headline that repeats it. Keeping it an `h2` keeps the document outline.
- Let a section's picture, heading and one subtitle do the work before adding anything
  else.
- Simple, predictable colour: a white band, a green-tinted band, a neutral grey band for
  the section the dark settings panel sits on, ink for text, one green that means
  "MacAway is doing its job", and amber only where the app itself uses amber for the
  stricter mode. Everything lives in `src/styles/tokens.css`; do not invent colours
  further down.
- `public/icon.png` is the app's own icon, extracted straight from
  `mac/Resources/AppIcon.icns` (`iconutil -c iconset`, the 512x512 slice). Re-extract it
  rather than redrawing it when the app's icon changes. It is the Apple touch icon and the
  link preview image.
- The browser tab icon is the header's shield instead: `public/favicon.svg` copies
  `src/components/ShieldMark.astro` with the ink and green tokens written out, and
  `public/favicon.png` is rendered from it with sharp at 64px. Change all three together.
- Typeface is Satoshi, self-hosted in `public/fonts`. Nothing is loaded from a third
  party — the privacy page says so, so keep it true. It is under ITF's Free Font
  Licence, which forbids modification **including subsetting and format conversion**, so
  never "optimise" the woff2; ship it exactly as downloaded. See
  `public/fonts/satoshi-NOTICE.txt`.
- **`mailto:` on phones only.** On a desktop it opens a mail client plenty of people have
  never set up, so there the address is plain text to read and copy; under 720px it
  becomes a tappable link. `src/components/CopyEmail.astro` does both, and the address
  lives once, in `src/lib/links.ts`. No copy button — it read as clutter.
- An icon set beside text scales in `em` with that text, and is centred on the cap
  height of the first line, not on the line box. A fixed-pixel icon next to a heading
  that scales needs a different nudge at every breakpoint, which is how it ends up
  looking off.

## Claims about the app

**Never state something about the app without checking the source.** The app is a
separate repo at `~/Documents/Personal/macaway` (Swift, `mac/Sources/MacAwayCore`). The
site's own older copy is not evidence.

Verified on 2026-10-01, and worth re-checking before you lean on any of it:

- The app contacts one thing: its own update feed at `macaway.app/appcast.xml`, through
  Sparkle. Nothing else — no analytics, and the licence is checked on the Mac. Any claim that
  it "connects to nothing" is now wrong.
- No password handling. No Keychain, `SecItem` or `LocalAuthentication`. Locking goes
  through `SACLockScreenImmediate` in the private `login.framework`.
- One permission. `mac/Resources/Info.plist` declares only
  `NSBluetoothAlwaysUsageDescription`.
- A followed device going quiet counts as away whatever the cause
  (`App/FollowedDevice.swift`). But when the Mac's *own* Bluetooth is unavailable,
  nothing counts as away (`App/GuardController.swift`) — so "if it can't tell, it locks"
  is true of the device and must not be widened to the Mac.
- The two profiles are Home (−80 dBm, 15 s) and In public (−65 dBm, 5 s), from
  `App/LockProfile.swift`, with the slider ends (-60 to -95 dBm) and the ten waits from
  `LockSettings`. `src/components/LockPanel.astro` mirrors all of it; if they change in
  the app, change them here.

## The worker

`wrangler.jsonc` carries `assets` for the built pages and `main` for `worker/`, so the worker
runs only for paths with no file behind them.

- `/buy` asks Stripe for a Checkout Session and redirects to it. Deliberately not a Payment
  Link: a link cannot set `cancel_url`, so leaving checkout dropped people on stripe.com.
- `/api/licence?session_id=…` refuses anything unpaid, then returns the key. `/thanks` fetches
  it and shows it.
- `/api/stripe-webhook` verifies Stripe's signature and emails the same key through Resend.

The key is a function of the Checkout Session id, so one purchase always yields one key and
nothing has to be stored: there is no customer list and no order table here. Of everything
Stripe hands over, only `customer_details.email` is read; the buyer's name and home address are
left alone, and the privacy page says so.

`worker/licence.ts` has to keep matching `Licence.swift` in the app's repo. `npm test` checks it
against the same vector that repo's own tests pin, so a drift fails loudly rather than shipping
keys the app rejects.

Four secrets, set with `wrangler secret put` and never readable afterwards: `STRIPE_SECRET_KEY`
(restricted — Checkout Sessions write, Prices and Products read, which is all the worker calls),
`STRIPE_WEBHOOK_SECRET`, `LICENCE_PRIVATE_KEY` (PKCS#8, because Workers refuse a raw private
key) and `RESEND_API_KEY`. `CHECKOUT_PRICE_ID` and the two addresses are plain vars in
`wrangler.jsonc`, and the live price must be swapped together with the live secret key.

## Counting clicks

PostHog counts page views and clicks. `src/lib/analytics.ts` is all of it, started from
`Base.astro` so every page has it.

- **One listener counts every link, button and FAQ question**, so a new button is counted
  without a call being added for it. `data-track="download"` names that element's event
  `download_clicked`; anything without one is `link_clicked`. `data-track-place` is how the
  four Download buttons are told apart.
- **No autocapture, no session replay, and no cookie**, whatever the PostHog project's own
  settings say. `persistence: 'memory'` is why the site needs no consent banner; the cost is
  that someone counts as new on every page load, so visitor counts are really visit counts.
- **Every address is cut at the first `?`.** `/thanks` carries the Stripe session id, and the
  licence key is worked out from that id. The scrubbing goes by the look of the value, not by
  a list of property names, because PostHog sends the address under several. `utm_*` arrives
  separately and survives, so campaigns still work.
- Without `PUBLIC_POSTHOG_KEY` nothing is loaded and nothing is sent, and PostHog drops out of
  the build. Set it in Cloudflare's build settings, or in `.env.local` to try it locally.
- **The privacy page says what is counted.** Change it whenever this changes.

## Building

`npm run dev` serves on 4321. `npm run build` and `npm test` are the gates — `npm run check`
needs `@astrojs/check`, which is not installed. Node runs the TypeScript tests directly, so
there is no test framework to install. Deploying is a push: Cloudflare builds `main`.
