import 'dotenv/config';

const botToken = process.env.BOT_TOKEN;
const webhookUrl = process.env.WEBHOOK_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/bot` : '');
const webhookSecret = process.env.WEBHOOK_SECRET;

if (!botToken) {
  throw new Error('BOT_TOKEN is required.');
}

if (!webhookUrl) {
  throw new Error('WEBHOOK_URL is required. Example: https://your-project.vercel.app/api/bot');
}

const body = new URLSearchParams({
  url: webhookUrl,
  drop_pending_updates: 'true',
  allowed_updates: JSON.stringify(['message', 'callback_query']),
});

if (webhookSecret) {
  body.set('secret_token', webhookSecret);
}

const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
  method: 'POST',
  body,
});

const payload = await response.json();

if (!response.ok || !payload.ok) {
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  webhookUrl,
  secretEnabled: Boolean(webhookSecret),
  telegram: payload,
}, null, 2));
