// Every in-page URL goes through here. The site is built twice: at the root for
// macaway.app, and under /macaway-site for the github.io project page, where a hard-coded
// leading slash would 404.
const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** A page or asset path, without a leading slash. `link('')` is the home page. */
export const link = (path: string) => `${base}/${path}`.replace(/\/$/, '') || '/';

/**
 * Where people write in, through Cloudflare Email Routing. Five places point at it, including
 * `/lost-key`, so a buyer who loses their key has nowhere else to go if it stops forwarding.
 * It is here rather than typed into each page so changing it is a one-line job.
 */
export const CONTACT_EMAIL = 'support@macaway.app';

/** Where the "Who built this" section points. Both open in a new tab. */
export const MAKER_LINKEDIN = 'https://www.linkedin.com/in/robert-brada-252474112/';
export const MAKER_PORTFOLIO = 'https://robertbrada.github.io/portfolio/';

/**
 * The Product Hunt page where someone who uses MacAway can leave a review. The badge beside
 * it is `public/product-hunt-review.svg`, saved from Product Hunt rather than hotlinked, so
 * opening this page tells Product Hunt nothing.
 */
export const PRODUCT_HUNT_REVIEW =
  'https://www.producthunt.com/products/macaway/reviews/new?utm_source=badge-product_review&utm_medium=badge&utm_source=badge-macaway';
