import 'dotenv/config';
import { createBot, getBotInfo } from '../bot/app.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const bot = createBot();

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');
  return rawBody ? JSON.parse(rawBody) : {};
}

function hasValidSecret(req) {
  const expectedSecret = process.env.WEBHOOK_SECRET;
  if (!expectedSecret) {
    return true;
  }

  return req.headers['x-telegram-bot-api-secret-token'] === expectedSecret;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(getBotInfo());
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  if (!hasValidSecret(req)) {
    res.status(401).json({ ok: false, error: 'Invalid Telegram webhook secret' });
    return;
  }

  try {
    const update = await readJsonBody(req);
    await bot.handleUpdate(update);
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    res.status(500).json({ ok: false });
  }
}
