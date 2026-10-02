import assert from 'node:assert/strict';
import test from 'node:test';

import { licenceKeyForSession } from './licence.ts';

const SESSION_ID = 'cs_test_a15sIGHsmohLBFEVgvlT1RCLssgaH9U2oH0UdzDul8jrUgFKpI8BPo89fK';

const fromBase64 = (text: string) => Uint8Array.from(Buffer.from(text, 'base64'));
const fromBase64Url = (text: string) =>
  fromBase64(text.replace(/-/g, '+').replace(/_/g, '/'));
const licenceIdOf = (bytes: Uint8Array) =>
  bytes.slice(1, 9).reduce((total, byte) => (total << 8n) | BigInt(byte), 0n);

async function throwawaySigner() {
  const pair = await crypto.subtle.generateKey('Ed25519', true, ['sign', 'verify']);
  return {
    publicKey: pair.publicKey,
    privateKeyPkcs8: Buffer.from(
      await crypto.subtle.exportKey('pkcs8', pair.privateKey),
    ).toString('base64'),
  };
}

test('the key pinned by the app its own tests is read as licence ID 0x0123456789ABCDEF', async () => {
  const publicKey = await crypto.subtle.importKey(
    'raw',
    fromBase64('qsrYAxJ4Jj3UyUPGXHOvnsAD9sSetybGbaKINd6oRb8='),
    'Ed25519',
    false,
    ['verify'],
  );
  const bytes = fromBase64Url(
    'AQEjRWeJq83vuUNc0vDRgB2bDvxiCEQtPm6VZG_Qnf0nio113FKYZmbB' +
      'GlbPET6U3Kwk_y5LCkFwGNSpFyXPy7fqLPurmu-RAg',
  );

  assert.equal(bytes.length, 73);
  assert.equal(bytes[0], 1);
  assert.equal(licenceIdOf(bytes), 0x0123456789abcdefn);
  assert.ok(await crypto.subtle.verify('Ed25519', publicKey, bytes.slice(9), bytes.slice(0, 9)));
});

test('a key issued for a paid session verifies and carries the session as its licence ID', async () => {
  const signer = await throwawaySigner();
  const issued = await licenceKeyForSession(SESSION_ID, signer.privateKeyPkcs8);
  const bytes = fromBase64Url(issued);
  const digest = new Uint8Array(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(SESSION_ID)),
  );

  assert.equal(issued.length, 98);
  assert.equal(bytes[0], 1);
  assert.ok(await crypto.subtle.verify('Ed25519', signer.publicKey, bytes.slice(9), bytes.slice(0, 9)));
  assert.equal(licenceIdOf(bytes), licenceIdOf(Uint8Array.of(0, ...digest.slice(0, 8))));
  assert.ok(licenceIdOf(bytes) > 2n ** 53n);
});

test('the same session always gives the same key, so issuing it twice is safe', async () => {
  const signer = await throwawaySigner();

  assert.equal(
    await licenceKeyForSession(SESSION_ID, signer.privateKeyPkcs8),
    await licenceKeyForSession(SESSION_ID, signer.privateKeyPkcs8),
  );
});
