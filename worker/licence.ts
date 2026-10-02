const KEY_VERSION = 1;
const LICENCE_ID_BYTES = 8;

const decodeBase64 = (text: string) =>
  Uint8Array.from(atob(text), (character) => character.charCodeAt(0));

const encodeBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

/**
 * The format `Licence.swift` reads: a version byte, the licence ID, then the signature of
 * both. The ID comes from the session, so the same purchase always makes the same key and
 * issuing it twice is safe.
 */
export async function licenceKeyForSession(sessionId: string, privateKeyPkcs8: string) {
  const sessionDigest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(sessionId),
  );

  const signedPart = new Uint8Array(1 + LICENCE_ID_BYTES);
  signedPart[0] = KEY_VERSION;
  signedPart.set(new Uint8Array(sessionDigest, 0, LICENCE_ID_BYTES), 1);

  const signingKey = await crypto.subtle.importKey(
    'pkcs8',
    decodeBase64(privateKeyPkcs8),
    'Ed25519',
    false,
    ['sign'],
  );
  const signature = new Uint8Array(
    await crypto.subtle.sign('Ed25519', signingKey, signedPart),
  );

  const licenceKey = new Uint8Array(signedPart.length + signature.length);
  licenceKey.set(signedPart);
  licenceKey.set(signature, signedPart.length);

  return encodeBase64Url(licenceKey);
}
