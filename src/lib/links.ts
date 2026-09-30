// Every in-page URL goes through here. The site is built twice: at the root for
// macaway.app, and under /macaway-site for the github.io project page, where a hard-coded
// leading slash would 404.
const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** A page or asset path, without a leading slash. `link('')` is the home page. */
export const link = (path: string) => `${base}/${path}`.replace(/\/$/, '') || '/';

/**
 * Where people write in. A placeholder on the site's own domain: the mailbox does not
 * exist yet, so set it up (or change this) before the page is public. It is here rather
 * than typed into each page so that is a one-line job.
 */
export const CONTACT_EMAIL = 'support@macaway.app';

/** Where the "Who built this" section points. Both open in a new tab. */
export const MAKER_LINKEDIN = 'https://www.linkedin.com/in/robert-brada-252474112/';
export const MAKER_PORTFOLIO = 'https://robertbrada.github.io/portfolio/';
