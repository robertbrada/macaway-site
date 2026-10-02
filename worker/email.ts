export interface LicenceEmail {
  to: string;
  licenceKey: string;
  keyPageUrl: string;
  from: string;
  replyTo: string;
}

export async function sendLicenceKey(email: LicenceEmail, resendApiKey: string) {
  const text = [
    'Thank you for buying MacAway.',
    '',
    'Your licence key:',
    '',
    email.licenceKey,
    '',
    'Open MacAway, click the gear, choose "Enter licence key…" and paste it in.',
    '',
    'You can see this key again at any time:',
    email.keyPageUrl,
  ].join('\n');

  const html = `
    <p>Thank you for buying MacAway.</p>
    <p>Your licence key:</p>
    <p style="font-family:ui-monospace,monospace;word-break:break-all">${email.licenceKey}</p>
    <p>Open MacAway, click the gear, choose "Enter licence key…" and paste it in.</p>
    <p>You can see this key again at any time:<br><a href="${email.keyPageUrl}">${email.keyPageUrl}</a></p>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: email.from,
      reply_to: email.replyTo,
      to: email.to,
      subject: 'Your MacAway licence key',
      text,
      html,
    }),
  });

  return response.ok;
}
