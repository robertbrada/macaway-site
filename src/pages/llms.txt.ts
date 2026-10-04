import type { APIRoute } from 'astro';

import { CONTACT_EMAIL } from '../lib/links';
import { DOWNLOAD_URL, PRICE, REFUND_DAYS, TRIAL_DAYS } from '../lib/pricing';

// Built from pricing.ts so the price here cannot drift from the price on the page.
const body = `# MacAway

MacAway locks your Mac when you walk away from it. It follows an iPhone or Apple Watch you
already carry, over Bluetooth, and locks the screen when that device moves out of range or
stops answering.

## Facts

- macOS 13 or later. One build for Apple silicon and Intel.
- ${PRICE} once, tax included. No subscription.
- ${TRIAL_DAYS}-day trial, no card.
- Full refund within ${REFUND_DAYS} days.
- One purchase covers every Mac you own.
- Not on the Mac App Store: locking the screen instantly needs a private macOS API.

## How it works

The Mac is the Bluetooth central and measures the distance itself. Nothing is installed on the
phone or the watch and they need no app: any iPhone or Apple Watch signed in to the same Apple
ID works. There is no account and no server, and the only thing the app contacts is its own
update feed.

When MacAway cannot tell where you are, it locks. That is deliberate. A false lock costs one
click; a missed lock costs your screen.

## Privacy

Everything MacAway remembers stays on your Mac. It never reads, stores or types your password.

## Links

- Home: https://macaway.app
- Privacy: https://macaway.app/privacy
- Lost licence key: https://macaway.app/lost-key${DOWNLOAD_URL ? `\n- Download: ${DOWNLOAD_URL}` : ''}
- Support: ${CONTACT_EMAIL}
`;

export const GET: APIRoute = () =>
  new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
