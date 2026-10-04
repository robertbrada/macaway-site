import type { PostHog } from 'posthog-js';

// Not a secret: a PostHog project key is meant to be seen. Without one nothing loads and
// nothing is sent. See .env.example.
const POSTHOG_KEY = import.meta.env.PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

type Properties = Record<string, unknown>;

let posthogClient: PostHog | null = null;

const WEB_ADDRESS = /^([a-z][a-z0-9+.-]*:\/\/|\/)/i;

/**
 * Cuts every web address short at the first `?` or `#`. /thanks carries the Stripe session id,
 * and the licence key is worked out from that id, so it must not leave the browser. This goes
 * by the look of the value because PostHog sends the address under several names.
 */
function stripQueryStrings(bag: Properties | undefined) {
  if (!bag) return;
  for (const [key, value] of Object.entries(bag)) {
    if (typeof value === 'string' && WEB_ADDRESS.test(value)) {
      bag[key] = value.replace(/[?#].*$/, '');
    } else if (value && typeof value === 'object') {
      stripQueryStrings(value as Properties);
    }
  }
}

const CLICKABLE = 'a, button, summary';

const textOf = (el: Element) => (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 80);

/** `data-track-place` wins, because the Download button sits in four places. */
function placeOf(el: Element) {
  const marked = el.closest<HTMLElement>('[data-track-place]');
  if (marked) return marked.dataset.trackPlace;
  const section = el.closest('section[id]');
  if (section) return section.id;
  return el.closest('header') ? 'header' : el.closest('footer') ? 'footer' : 'main';
}

/**
 * One listener for the whole site, so a new button is counted without a call being added for
 * it. `data-track` names the clicks worth their own event; the rest are `link_clicked`.
 */
function countClicks() {
  document.addEventListener(
    'click',
    (event) => {
      const el = (event.target as Element | null)?.closest(CLICKABLE);
      if (!el) return;
      // The Download button with no release behind it, and the Buy link while checkout is shut.
      if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') return;

      const properties: Properties = { text: textOf(el), place: placeOf(el) };

      if (el instanceof HTMLAnchorElement) {
        properties.href = el.href.replace(/[?#].*$/, '');
        properties.external = el.protocol.startsWith('http') && el.host !== location.host;
      }

      // The browser toggles the question after this, so this is where it is heading.
      if (el.tagName === 'SUMMARY') properties.opened = !el.closest('details')?.open;

      const name = (el as HTMLElement).dataset.track ?? 'link';
      posthogClient?.capture(`${name}_clicked`, properties);
    },
    { capture: true }
  );
}

/** Imported late so PostHog stays off the critical path, and is never fetched without a key. */
export function startAnalytics() {
  if (!POSTHOG_KEY) return;

  void import('posthog-js').then(({ default: posthog }) => {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      defaults: '2025-05-24',
      // The privacy page promises page views and clicks and nothing more, so these win over
      // whatever the PostHog project is set to. `memory` writes no cookie and no localStorage,
      // which is why the site needs no consent banner.
      autocapture: false,
      disable_session_recording: true,
      persistence: 'memory',
      person_profiles: 'identified_only',
      before_send: (event) => {
        if (event) {
          stripQueryStrings(event.properties);
          stripQueryStrings(event.$set);
          stripQueryStrings(event.$set_once);
        }
        return event;
      },
    });
    posthogClient = posthog;
  });

  countClicks();
}
