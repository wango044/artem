import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Markup, Telegraf } from 'telegraf';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const barberAssetsDir = path.join(rootDir, 'public', 'assets', 'a-lustov');
const assetPath = (fileName) => path.join(barberAssetsDir, fileName);

const DEFAULT_BOT_USERNAME = 'barber_concierge_bot';
const BOOKING_PREFIX = 'Заявка для Артёма';

const portfolioCategories = [
  {
    id: 'forms',
    title: 'Стрижки и форма',
    intro: 'Сильные силуэты, чистые переходы и текстура, которая держится после визита.',
    items: [
      {
        image: '49c2747c513843d6.jpg',
        caption: 'Текстурная форма с плотным верхом и аккуратной линией виска.',
      },
      {
        image: '830528251769ee7e.jpg',
        caption: 'Классика с мягким переходом: собрано, спокойно, без лишней жесткости.',
      },
      {
        image: '4c317637b8f0c612.jpg',
        caption: 'Фронтальная текстура для образа, который выглядит свежо без сложной укладки.',
      },
    ],
  },
  {
    id: 'beard',
    title: 'Борода и окантовка',
    intro: 'Окантовка, плотность и баланс лица: борода должна выглядеть намеренно.',
    items: [
      {
        image: '97401270d38c5ac5.jpg',
        caption: 'Плотная борода, чистый контур и спокойный мужской силуэт.',
      },
      {
        image: '5191ff964d990882.jpg',
        caption: 'Аккуратная работа с линиями, чтобы форма читалась даже через несколько дней.',
      },
    ],
  },
  {
    id: 'process',
    title: 'Процесс и детали',
    intro: 'Короткий взгляд на технику: форма собирается через консультацию, точность и финиш.',
    items: [
      {
        image: 'f39215400f1693a4.jpg',
        caption: 'Рабочий момент: контроль формы, линии и финального направления волос.',
      },
      {
        image: '4cda8df2bfd05aa7.jpg',
        caption: 'Детали, по которым видно руку мастера: переходы, фронт и чистота силуэта.',
      },
    ],
    video: 'reel-hero.mp4',
  },
];

const quizSteps = [
  {
    key: 'length',
    question: 'Какая длина ближе сейчас?',
    options: [
      ['Короткая', 'short'],
      ['Средняя', 'medium'],
      ['Отращиваю', 'long'],
    ],
  },
  {
    key: 'care',
    question: 'Сколько времени готов тратить на укладку утром?',
    options: [
      ['Почти нисколько', 'low'],
      ['5 минут норм', 'medium'],
      ['Готов заморочиться', 'high'],
    ],
  },
  {
    key: 'mood',
    question: 'Какой эффект нужен?',
    options: [
      ['Аккуратно', 'clean'],
      ['Заметно обновить', 'fresh'],
      ['Сильно поменять', 'bold'],
    ],
  },
  {
    key: 'beard',
    question: 'Бороду тоже трогаем?',
    options: [
      ['Да', 'yes'],
      ['Нет', 'no'],
      ['Посоветоваться', 'maybe'],
    ],
  },
];

const leadLabels = {
  haircut: 'Стрижка',
  beard: 'Борода',
  combo: 'Стрижка + борода',
  consult: 'Подбор образа',
  forms: 'Похожее на работы: стрижки и форма',
  process: 'Похожее на работы: процесс и детали',
  quiz: 'Подбор после квиза',
};

function getConfig() {
  const siteUrl = process.env.SITE_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://127.0.0.1:5175');

  return {
    botToken: process.env.BOT_TOKEN,
    botUsername: process.env.BOT_USERNAME || DEFAULT_BOT_USERNAME,
    adminChatId: process.env.ADMIN_CHAT_ID,
    siteUrl: siteUrl.replace(/\/+$/, ''),
    directTelegramUrl: process.env.DIRECT_TELEGRAM_URL || 'https://t.me/A_Lustov',
  };
}

function isLocalSiteUrl(siteUrl) {
  return /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(?::\d+)?/i.test(siteUrl);
}

function botDeepLink(payload, botUsername = DEFAULT_BOT_USERNAME) {
  return `https://t.me/${botUsername}?start=${payload}`;
}

function mediaInput(fileName) {
  const { siteUrl } = getConfig();
  if (isLocalSiteUrl(siteUrl)) {
    return { source: assetPath(fileName) };
  }

  return `${siteUrl}/assets/a-lustov/${fileName}`;
}

function mainKeyboard() {
  const { siteUrl, directTelegramUrl } = getConfig();

  return Markup.inlineKeyboard([
    [Markup.button.callback('Подобрать стрижку', 'quiz:start')],
    [Markup.button.callback('Портфолио', 'portfolio:menu'), Markup.button.callback('Записаться', 'booking:start')],
    [Markup.button.url('Открыть сайт', siteUrl), Markup.button.url('Написать Артёму', directTelegramUrl)],
  ]);
}

function portfolioMenuKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('Стрижки и форма', 'portfolio:forms')],
    [Markup.button.callback('Борода', 'portfolio:beard'), Markup.button.callback('Процесс', 'portfolio:process')],
    [Markup.button.callback('Подобрать образ', 'quiz:start'), Markup.button.callback('Записаться', 'booking:start')],
    [Markup.button.callback('В меню', 'home')],
  ]);
}

function bookingServiceKeyboard(source = 'bot') {
  return Markup.inlineKeyboard([
    [Markup.button.callback('Стрижка', `booking:service:haircut:${source}`), Markup.button.callback('Борода', `booking:service:beard:${source}`)],
    [Markup.button.callback('Стрижка + борода', `booking:service:combo:${source}`)],
    [Markup.button.callback('Хочу консультацию', `booking:service:consult:${source}`)],
    [Markup.button.callback('В меню', 'home')],
  ]);
}

function bookingReplyKeyboard() {
  return Markup.forceReply();
}

async function safeAnswer(ctx) {
  if (ctx.callbackQuery) {
    await ctx.answerCbQuery().catch(() => {});
  }
}

async function showHome(ctx, source = 'default') {
  const text = [
    'Привет. Я Telegram-консьерж Артёма Лустова.',
    '',
    'Могу показать портфолио, быстро подобрать направление стрижки и собрать заявку так, чтобы мастеру сразу было понятно, что ты хочешь.',
    '',
    source === 'site' ? 'Ты пришёл с сайта, поэтому начнём с самого полезного.' : 'Выбери, с чего начнём.',
  ].join('\n');

  await ctx.reply(text, mainKeyboard());
}

async function showPortfolioMenu(ctx) {
  await ctx.reply(
    'Портфолио можно смотреть как подборку: форма, борода или процесс. Внутри каждой карточки есть короткое пояснение, что именно сделано.',
    portfolioMenuKeyboard(),
  );
}

async function showPortfolioCategory(ctx, categoryId) {
  const category = portfolioCategories.find((item) => item.id === categoryId) || portfolioCategories[0];
  await ctx.reply(`${category.title}\n\n${category.intro}`);

  for (const item of category.items) {
    await ctx.replyWithPhoto(
      mediaInput(item.image),
      {
        caption: item.caption,
        ...Markup.inlineKeyboard([[Markup.button.callback('Хочу похожее', `booking:preset:${category.id}`)]]),
      },
    );
  }

  if (category.video) {
    await ctx.replyWithVideo(
      mediaInput(category.video),
      {
        caption: 'Видео-процесс: хороший формат, если хочется понять атмосферу и технику.',
      },
    ).catch(async () => {
      await ctx.reply('Видео не отправилось, но фото-подборка выше доступна.');
    });
  }

  await ctx.reply('Можно открыть другую подборку или сразу перейти к записи.', portfolioMenuKeyboard());
}

async function sendQuizStep(ctx, stepIndex = 0, answers = []) {
  const step = quizSteps[stepIndex];

  if (!step) {
    await finishQuiz(ctx, answers);
    return;
  }

  const buttons = step.options.map(([label, value]) => {
    const nextAnswers = [...answers, value].join(',');
    return [Markup.button.callback(label, `q:${stepIndex}:${nextAnswers}`)];
  });

  await ctx.reply(`Вопрос ${stepIndex + 1}/${quizSteps.length}\n${step.question}`, Markup.inlineKeyboard(buttons));
}

async function finishQuiz(ctx, answers = []) {
  const [, care, mood, beard] = answers;
  const wantsLowCare = care === 'low';
  const wantsBold = mood === 'bold';
  const hasBeard = beard === 'yes' || beard === 'maybe';

  const title = wantsBold
    ? 'Выразительный кроп или фейд с сильной текстурой'
    : wantsLowCare
      ? 'Собранная форма без сложной ежедневной укладки'
      : 'Текстурная форма с аккуратным финишем';

  const beardLine = hasBeard
    ? 'Бороду лучше сразу включить в работу, чтобы стрижка и контур смотрелись одним образом.'
    : 'Бороду можно не трогать, фокус будет на силуэте и чистой линии волос.';

  await ctx.reply(
    [
      'Мой быстрый вывод:',
      '',
      title,
      beardLine,
      '',
      'Лучше всего показать Артёму текущую длину и 1-2 референса. Бот может собрать это в заявку прямо сейчас.',
    ].join('\n'),
    Markup.inlineKeyboard([
      [Markup.button.callback('Показать похожие работы', 'portfolio:forms')],
      [Markup.button.callback('Собрать заявку', 'booking:preset:quiz')],
      [Markup.button.callback('В меню', 'home')],
    ]),
  );
}

async function startBooking(ctx, source = 'bot') {
  await ctx.reply('Соберу короткую заявку. Сначала выбери формат визита.', bookingServiceKeyboard(source));
}

function makeBookingPrompt(serviceId, source = 'bot') {
  const label = leadLabels[serviceId] || serviceId || 'Консультация';

  return [
    BOOKING_PREFIX,
    `Услуга: ${label}`,
    `Источник: ${source}`,
    '',
    'Ответь на это сообщение одним текстом:',
    '1. имя',
    '2. удобный день/время',
    '3. телефон или Telegram',
    '4. комментарий, что хочется сделать',
    '',
    'Можно ответить фото с подписью, если хочешь сразу показать текущую стрижку или референс.',
  ].join('\n');
}

function parseBookingPrompt(text = '') {
  if (!text.includes(BOOKING_PREFIX)) {
    return null;
  }

  const service = text.match(/Услуга:\s*(.+)/)?.[1]?.trim() || 'не выбрана';
  const source = text.match(/Источник:\s*(.+)/)?.[1]?.trim() || 'bot';

  return { service, source };
}

function userContactLine(user) {
  if (!user) return 'не указан';
  if (user.username) return `@${user.username}`;
  return `${user.first_name || ''} ${user.last_name || ''}`.trim() || `id ${user.id}`;
}

function buildLeadSummary(ctx, bookingMeta, leadText) {
  return [
    'Новая заявка к Артёму',
    '',
    `Услуга: ${bookingMeta.service}`,
    `Источник: ${bookingMeta.source}`,
    `Telegram: ${userContactLine(ctx.from)}`,
    '',
    'Сообщение клиента:',
    leadText || 'Фото-референс без текстового комментария',
  ].join('\n');
}

async function replyBookingFallback(ctx, summary) {
  const { directTelegramUrl } = getConfig();

  await ctx.reply(
    [
      'Заявка собрана.',
      '',
      summary,
      '',
      'Чтобы Артём точно увидел её сейчас, нажми кнопку ниже и отправь эти данные ему в личку.',
    ].join('\n'),
    Markup.inlineKeyboard([
      [Markup.button.url('Написать Артёму', directTelegramUrl)],
      [Markup.button.callback('В меню', 'home')],
    ]),
  );
}

async function finishBookingFromReply(ctx, bookingMeta, leadText, photoFileId = null) {
  const { adminChatId } = getConfig();
  const summary = buildLeadSummary(ctx, bookingMeta, leadText);

  if (adminChatId) {
    await ctx.telegram.sendMessage(adminChatId, summary);
    if (photoFileId) {
      await ctx.telegram.sendPhoto(adminChatId, photoFileId, { caption: `Референс от ${userContactLine(ctx.from)}` });
    }
    await ctx.reply(
      'Готово. Заявка ушла Артёму, он сможет ответить и уточнить время.',
      Markup.inlineKeyboard([[Markup.button.callback('В меню', 'home')]]),
    );
    return;
  }

  await replyBookingFallback(ctx, summary);
}

function normalizePayload(payload = '') {
  if (payload.startsWith('portfolio')) return 'portfolio';
  if (payload.startsWith('style_quiz')) return 'style_quiz';
  if (payload.startsWith('booking')) return 'booking';
  return payload;
}

export function getBotInfo() {
  const { botUsername, adminChatId, siteUrl } = getConfig();

  return {
    ok: true,
    mode: 'webhook-ready',
    botUsername,
    siteUrl,
    deepLinks: {
      booking: botDeepLink('booking_site', botUsername),
      portfolio: botDeepLink('portfolio_site', botUsername),
      quiz: botDeepLink('style_quiz_site', botUsername),
    },
    portfolioCategories: portfolioCategories.map((category) => category.id),
    adminForwarding: Boolean(adminChatId),
  };
}

export function createBot() {
  const { botToken } = getConfig();

  if (!botToken) {
    throw new Error('BOT_TOKEN is required. Add it to Vercel environment variables or local .env.');
  }

  const bot = new Telegraf(botToken);

  bot.start(async (ctx) => {
    const payload = normalizePayload(ctx.startPayload);
    if (payload === 'portfolio') {
      await showPortfolioMenu(ctx);
      return;
    }
    if (payload === 'style_quiz') {
      await sendQuizStep(ctx);
      return;
    }
    if (payload === 'booking') {
      await startBooking(ctx, ctx.startPayload || 'site');
      return;
    }
    await showHome(ctx, payload ? 'site' : 'default');
  });

  bot.command('menu', (ctx) => showHome(ctx));
  bot.command('portfolio', (ctx) => showPortfolioMenu(ctx));
  bot.command('quiz', (ctx) => sendQuizStep(ctx));
  bot.command('book', (ctx) => startBooking(ctx));
  bot.command('id', (ctx) => ctx.reply(
    [
      `Chat ID: ${ctx.chat.id}`,
      '',
      'Чтобы заявки приходили сюда автоматически, добавь это значение в Vercel как ADMIN_CHAT_ID и сделай redeploy проекта.',
    ].join('\n'),
  ));

  bot.action('home', async (ctx) => {
    await safeAnswer(ctx);
    await showHome(ctx);
  });

  bot.action('portfolio:menu', async (ctx) => {
    await safeAnswer(ctx);
    await showPortfolioMenu(ctx);
  });

  bot.action(/^portfolio:(forms|beard|process)$/, async (ctx) => {
    await safeAnswer(ctx);
    await showPortfolioCategory(ctx, ctx.match[1]);
  });

  bot.action('quiz:start', async (ctx) => {
    await safeAnswer(ctx);
    await sendQuizStep(ctx);
  });

  bot.action(/^q:(\d+):([a-z,]+)$/, async (ctx) => {
    await safeAnswer(ctx);
    const currentStep = Number(ctx.match[1]);
    const answers = ctx.match[2].split(',').filter(Boolean);
    await sendQuizStep(ctx, currentStep + 1, answers);
  });

  bot.action('booking:start', async (ctx) => {
    await safeAnswer(ctx);
    await startBooking(ctx);
  });

  bot.action(/^booking:preset:(.+)$/, async (ctx) => {
    await safeAnswer(ctx);
    await startBooking(ctx, ctx.match[1]);
  });

  bot.action(/^booking:service:([^:]+):?([^:]*)$/, async (ctx) => {
    await safeAnswer(ctx);
    const [, serviceId, source] = ctx.match;
    await ctx.reply(makeBookingPrompt(serviceId, source || 'bot'), bookingReplyKeyboard());
  });

  bot.on('photo', async (ctx, next) => {
    const bookingMeta = parseBookingPrompt(ctx.message.reply_to_message?.text);
    if (!bookingMeta) {
      await next();
      return;
    }

    const photos = ctx.message.photo || [];
    await finishBookingFromReply(ctx, bookingMeta, ctx.message.caption || '', photos.at(-1)?.file_id);
  });

  bot.on('text', async (ctx, next) => {
    const text = ctx.message.text.trim();
    if (text.startsWith('/')) {
      await next();
      return;
    }

    const bookingMeta = parseBookingPrompt(ctx.message.reply_to_message?.text);
    if (bookingMeta) {
      await finishBookingFromReply(ctx, bookingMeta, text);
      return;
    }

    await ctx.reply('Я могу показать портфолио, подобрать стрижку или собрать заявку.', mainKeyboard());
  });

  bot.catch((error, ctx) => {
    console.error(`Bot error for update ${ctx.update?.update_id}:`, error);
  });

  return bot;
}
