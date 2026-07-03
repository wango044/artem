import 'dotenv/config';
import { createBot, getBotInfo } from './app.js';

const isDryRun = process.argv.includes('--dry-run');

if (isDryRun) {
  console.log(JSON.stringify(getBotInfo(), null, 2));
} else {
  const bot = createBot();
  bot.launch({ dropPendingUpdates: true }).then(() => {
    console.log(`Telegram bot @${getBotInfo().botUsername} is running in polling mode.`);
  });

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}
