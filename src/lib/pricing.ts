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
 * Where the Download buttons go. Point it at the newest archive on every release; Sparkle
 * takes people forward from there. Setting it to `null` disables every Download button again.
 */
export const DOWNLOAD_URL: string | null =
  'https://github.com/robertbrada/macaway-releases/releases/download/archives/MacAway-1.0.1.zip';

/**
 * `/buy` is served by the worker, which opens a Stripe checkout and redirects to it, so this
 * site never loads Stripe's script. Setting `CHECKOUT_OPEN` to false disables the Buy link,
 * which is the way to stop selling without taking the page down.
 */
export const BUY_PATH = 'buy';
export const CHECKOUT_OPEN = true;
