/**
 * What the page promises about the trial and the price, in one place, so the page and the
 * app can be checked against each other. The price is now set: $14, paid once.
 *
 * The trial and the licence check are built, and a notarised release exists. What is missing
 * is a published download and a checkout, so both switches below are off, and turning either
 * on is a change of one line.
 */
export const TRIAL_DAYS = 14;
export const PRICE = '$14';
export const REFUND_DAYS = 30;

/**
 * Where the Download buttons go. `null` until an archive is published, and while it is `null`
 * every Download button on the site renders disabled. Archives hang off one release in the
 * public repo, so the URL will read:
 * https://github.com/robertbrada/macaway-releases/releases/download/archives/MacAway-1.0.0.zip
 */
export const DOWNLOAD_URL: string | null = null;

/**
 * Our own checkout page, as a path for `link()`. It hands over to Stripe from there, so this
 * site never loads Stripe's script. `CHECKOUT_OPEN` stays false until that page exists, and
 * while it is false the Buy link renders disabled.
 */
export const BUY_PATH = 'buy';
export const CHECKOUT_OPEN = false;
