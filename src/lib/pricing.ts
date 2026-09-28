/**
 * What the page promises about the trial and the price, in one place, so the page and the
 * app can be checked against each other. The price is now set: $14.99, paid once.
 *
 * None of it is built yet: there is no release, no trial code in the app and no checkout.
 * So both of the switches below are off, and turning either on is a change of one line.
 */
export const TRIAL_DAYS = 14;
export const PRICE = '$14.99';
export const REFUND_DAYS = 30;

/**
 * Where the Download buttons go. `null` until a notarised release exists, and while it is
 * `null` every Download button on the site renders disabled.
 */
export const DOWNLOAD_URL: string | null = null;

/**
 * Our own checkout page, as a path for `link()`. It hands over to Stripe from there, so this
 * site never loads Stripe's script. `CHECKOUT_OPEN` stays false until that page exists, and
 * while it is false the Buy link renders disabled.
 */
export const BUY_PATH = 'buy';
export const CHECKOUT_OPEN = false;
