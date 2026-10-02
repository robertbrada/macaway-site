const STRIPE_API = 'https://api.stripe.com/v1';
const SIGNATURE_TOLERANCE_SECONDS = 300;

export interface PaidSession {
  id: string;
  buyerEmail: string | null;
}

export interface StripeEvent {
  type: string;
  data: { object: { id: string } };
}

export async function fetchPaidSession(
  sessionId: string,
  secretKey: string,
): Promise<PaidSession | null> {
  const response = await fetch(
    `${STRIPE_API}/checkout/sessions/${encodeURIComponent(sessionId)}`,
    { headers: { Authorization: `Bearer ${secretKey}` } },
  );
  if (!response.ok) return null;

  const session = (await response.json()) as {
    id: string;
    payment_status: string;
    customer_details?: { email?: string | null };
  };
  if (session.payment_status === 'unpaid') return null;

  // Stripe also sends the buyer's name and home address. We do not read them.
  return { id: session.id, buyerEmail: session.customer_details?.email ?? null };
}

export async function verifiedWebhookEvent(
  request: Request,
  signingSecret: string,
): Promise<StripeEvent | null> {
  const header = request.headers.get('stripe-signature') ?? '';
  const body = await request.text();

  const timestamp = /t=(\d+)/.exec(header)?.[1];
  const signatures = [...header.matchAll(/v1=([a-f0-9]{64})/g)].map((match) => match[1]);
  if (!timestamp || signatures.length === 0) return null;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > SIGNATURE_TOLERANCE_SECONDS) return null;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(signingSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const signedPayload = new TextEncoder().encode(`${timestamp}.${body}`);

  // Stripe sends more than one signature while a signing secret is being replaced.
  for (const signature of signatures) {
    const bytes = Uint8Array.from(signature.match(/../g)!, (pair) => parseInt(pair, 16));
    if (await crypto.subtle.verify('HMAC', key, bytes, signedPayload)) {
      return JSON.parse(body) as StripeEvent;
    }
  }
  return null;
}
