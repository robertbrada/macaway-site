// Every in-page URL goes through here. The site is built twice: at the root for
// macaway.app, and under /macaway-site for the github.io project page, where a hard-coded
// leading slash would 404.
const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** A page or asset path, without a leading slash. `link('')` is the home page. */
export const link = (path: string) => `${base}/${path}`.replace(/\/$/, '') || '/';
