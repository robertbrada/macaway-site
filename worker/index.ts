import { sendLicenceKey } from './email.ts';
import { licenceKeyForSession } from './licence.ts';
import { fetchPaidSession, verifiedWebhookEvent } from './stripe.ts';

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  CHECKOUT_URL: string;
  LICENCE_EMAIL_FROM: string;
  SUPPORT_EMAIL: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  LICENCE_PRIVATE_KEY: string;
  RESEND_API_KEY: string;
}

const PAID_EVENTS = ['checkout.session.completed', 'checkout.session.async_payment_succeeded'];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (url.pathname === '/buy') return Response.redirect(env.CHECKOUT_URL, 302);
    if (url.pathname === '/api/licence') return licenceForSession(url, env);
    if (url.pathname === '/api/stripe-webhook') return emailKeyForPayment(request, env);

    return env.ASSETS.fetch(request);
  },
};

async function licenceForSession(url: URL, env: Env) {
  const sessionId = url.searchParams.get('session_id');
  if (!sessionId) return json({ error: 'no session' }, 400);

  const session = await fetchPaidSession(sessionId, env.STRIPE_SECRET_KEY);
  if (!session) return json({ error: 'no paid purchase' }, 404);

  return json({ licenceKey: await licenceKeyForSession(session.id, env.LICENCE_PRIVATE_KEY) });
}

async function emailKeyForPayment(request: Request, env: Env) {
  const origin = new URL(request.url).origin;
  const event = await verifiedWebhookEvent(request, env.STRIPE_WEBHOOK_SECRET);
  if (!event) return new Response('bad signature', { status: 400 });
  if (!PAID_EVENTS.includes(event.type)) return new Response('ignored');

  const session = await fetchPaidSession(event.data.object.id, env.STRIPE_SECRET_KEY);
  if (!session?.buyerEmail) return new Response('no address to send to');

  const sent = await sendLicenceKey(
    {
      to: session.buyerEmail,
      licenceKey: await licenceKeyForSession(session.id, env.LICENCE_PRIVATE_KEY),
      keyPageUrl: `${origin}/thanks?session_id=${session.id}`,
      from: env.LICENCE_EMAIL_FROM,
      replyTo: env.SUPPORT_EMAIL,
    },
    env.RESEND_API_KEY,
  );

  // A failure here is answered with an error on purpose, so Stripe sends the event again.
  return sent ? new Response('sent') : new Response('could not send', { status: 500 });
}
