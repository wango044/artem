import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Markup, Telegraf, session } from 'telegraf';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const barberAssetsDir = path.join(rootDir, 'public', 'assets', 'a-lustov');
const assetPath = (fileName) => path.join(barberAssetsDir, fileName);

const botToken = process.env.BOT_TOKEN;
const botUsername = process.env.BOT_USERNAME || 'barber_concierge_bot';
const adminChatId = process.env.ADMIN_CHAT_ID;
const siteUrl = process.env.SITE_URL || 'http://127.0.0.1:5175/';
const directTelegramUrl = process.env.DIRECT_TELEGRAM_URL || 'https://t.me/A_Lustov';
const isDryRun = process.argv.includes('--dry-run');

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
};

function botDeepLink(payload) {
  return `https://t.me/${botUsername}?start=${payload}`;
}

function mainKeyboard() {
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

function bookingServiceKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('Стрижка', 'booking:service:haircut'), Markup.button.callback('Борода', 'booking:service:beard')],
    [Markup.button.callback('Стрижка + борода', 'booking:service:combo')],
    [Markup.button.callback('Хочу консультацию', 'booking:service:consult')],
    [Markup.button.callback('В меню', 'home')],
  ]);
}

function skipKeyboard() {
  return Markup.inlineKeyboard([[Markup.button.callback('Пропустить', 'booking:skip-comment')]]);
}

function resetSession(ctx) {
  ctx.session.mode = null;
  ctx.session.quiz = null;
  ctx.session.booking = null;
}

async function safeAnswer(ctx) {
  if (ctx.callbackQuery) {
    await ctx.answerCbQuery().catch(() => {});
  }
}

async function showHome(ctx, source = 'default') {
  resetSession(ctx);
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
  resetSession(ctx);
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
      { source: assetPath(item.image) },
      {
        caption: item.caption,
        ...Markup.inlineKeyboard([[Markup.button.callback('Хочу похожее', `booking:preset:${category.id}`)]]),
      },
    );
  }

  if (category.video) {
    await ctx.replyWithVideo(
      { source: assetPath(category.video) },
      {
        caption: 'Видео-процесс: хороший формат, если хочется понять атмосферу и технику.',
      },
    ).catch(async () => {
      await ctx.reply('Видео не отправилось с этой машины, но фото-подборка выше доступна.');
    });
  }

  await ctx.reply('Можно открыть другую подборку или сразу перейти к записи.', portfolioMenuKeyboard());
}

async function startQuiz(ctx) {
  ctx.session.mode = 'quiz';
  ctx.session.quiz = {
    step: 0,
    answers: {},
  };
  await sendQuizStep(ctx);
}

async function sendQuizStep(ctx) {
  const quiz = ctx.session.quiz;
  const step = quizSteps[quiz.step];

  if (!step) {
    await finishQuiz(ctx);
    return;
  }

  const buttons = step.options.map(([label, value]) => [Markup.button.callback(label, `quiz:answer:${step.key}:${value}`)]);
  await ctx.reply(`Вопрос ${quiz.step + 1}/${quizSteps.length}\n${step.question}`, Markup.inlineKeyboard(buttons));
}

async function finishQuiz(ctx) {
  const answers = ctx.session.quiz?.answers || {};
  const wantsLowCare = answers.care === 'low';
  const wantsBold = answers.mood === 'bold';
  const hasBeard = answers.beard === 'yes' || answers.beard === 'maybe';

  const title = wantsBold
    ? 'Выразительный кроп или фейд с сильной текстурой'
    : wantsLowCare
      ? 'Собранная форма без сложной ежедневной укладки'
      : 'Текстурная форма с аккуратным финишем';

  const beardLine = hasBeard
    ? 'Бороду лучше сразу включить в работу, чтобы стрижка и контур смотрелись одним образом.'
    : 'Бороду можно не трогать, фокус будет на силуэте и чистой линии волос.';

  resetSession(ctx);
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

async function startBooking(ctx, preset = null) {
  ctx.session.mode = 'booking';
  ctx.session.booking = {
    step: 'service',
    data: {
      source: preset || ctx.startPayload || 'bot',
    },
  };

  await ctx.reply('Соберу короткую заявку. Сначала выбери формат визита.', bookingServiceKeyboard());
}

async function askBookingStep(ctx) {
  const booking = ctx.session.booking;

  if (booking.step === 'name') {
    await ctx.reply('Как тебя зовут?');
    return;
  }

  if (booking.step === 'time') {
    await ctx.reply('Когда удобно прийти? Можно написать свободно: например, "завтра после 18:00" или "на выходных".');
    return;
  }

  if (booking.step === 'contact') {
    await ctx.reply('Оставь телефон или удобный контакт. Telegram username я тоже приложу к заявке.');
    return;
  }

  if (booking.step === 'comment') {
    await ctx.reply('Добавь комментарий, референс или фото текущей стрижки. Если нечего добавить, нажми "Пропустить".', skipKeyboard());
  }
}

async function finishBooking(ctx) {
  const booking = ctx.session.booking;
  const data = booking.data;
  const user = ctx.from;
  const username = user?.username ? `@${user.username}` : 'не указан';

  const summary = [
    'Новая заявка к Артёму',
    '',
    `Услуга: ${leadLabels[data.service] || data.service || 'не выбрана'}`,
    `Имя: ${data.name || 'не указано'}`,
    `Время: ${data.time || 'не указано'}`,
    `Контакт: ${data.contact || 'не указан'}`,
    `Telegram: ${username}`,
    `Комментарий: ${data.comment || 'нет'}`,
    `Источник: ${data.source || 'bot'}`,
  ].join('\n');

  if (adminChatId) {
    await ctx.telegram.sendMessage(adminChatId, summary);
    if (data.photoFileId) {
      await ctx.telegram.sendPhoto(adminChatId, data.photoFileId, { caption: `Референс от ${data.name || username}` });
    }
    await ctx.reply(
      'Готово. Заявка ушла Артёму, он сможет ответить и уточнить время.',
      Markup.inlineKeyboard([[Markup.button.callback('В меню', 'home')]]),
    );
  } else {
    await ctx.reply(
      [
        'Заявка собрана. Сейчас в настройках бота не указан ADMIN_CHAT_ID, поэтому я не могу сам отправить её мастеру.',
        '',
        summary,
        '',
        'Нажми кнопку ниже и отправь эти данные Артёму в личку.',
      ].join('\n'),
      Markup.inlineKeyboard([
        [Markup.button.url('Написать Артёму', directTelegramUrl)],
        [Markup.button.callback('В меню', 'home')],
      ]),
    );
  }

  resetSession(ctx);
}

function normalizePayload(payload = '') {
  if (payload.startsWith('portfolio')) return 'portfolio';
  if (payload.startsWith('style_quiz')) return 'style_quiz';
  if (payload.startsWith('booking')) return 'booking';
  return payload;
}

function createBot() {
  if (!botToken) {
    throw new Error('BOT_TOKEN is required. Copy .env.example to .env and add the Telegram token.');
  }

  const bot = new Telegraf(botToken);
  bot.use(session({ defaultSession: () => ({ mode: null, quiz: null, booking: null }) }));

  bot.start(async (ctx) => {
    const payload = normalizePayload(ctx.startPayload);
    if (payload === 'portfolio') {
      await showPortfolioMenu(ctx);
      return;
    }
    if (payload === 'style_quiz') {
      await startQuiz(ctx);
      return;
    }
    if (payload === 'booking') {
      await startBooking(ctx, ctx.startPayload);
      return;
    }
    await showHome(ctx, payload ? 'site' : 'default');
  });

  bot.command('menu', (ctx) => showHome(ctx));
  bot.command('portfolio', (ctx) => showPortfolioMenu(ctx));
  bot.command('quiz', (ctx) => startQuiz(ctx));
  bot.command('book', (ctx) => startBooking(ctx));
  bot.command('id', (ctx) => ctx.reply(`Chat ID: ${ctx.chat.id}`));

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
    await startQuiz(ctx);
  });

  bot.action(/^quiz:answer:([^:]+):([^:]+)$/, async (ctx) => {
    await safeAnswer(ctx);
    if (ctx.session.mode !== 'quiz' || !ctx.session.quiz) {
      await startQuiz(ctx);
      return;
    }

    const [, key, value] = ctx.match;
    ctx.session.quiz.answers[key] = value;
    ctx.session.quiz.step += 1;
    await sendQuizStep(ctx);
  });

  bot.action('booking:start', async (ctx) => {
    await safeAnswer(ctx);
    await startBooking(ctx);
  });

  bot.action(/^booking:preset:(.+)$/, async (ctx) => {
    await safeAnswer(ctx);
    await startBooking(ctx, ctx.match[1]);
  });

  bot.action(/^booking:service:(.+)$/, async (ctx) => {
    await safeAnswer(ctx);
    ctx.session.mode = 'booking';
    ctx.session.booking ||= { step: 'service', data: {} };
    ctx.session.booking.data.service = ctx.match[1];
    ctx.session.booking.step = 'name';
    await askBookingStep(ctx);
  });

  bot.action('booking:skip-comment', async (ctx) => {
    await safeAnswer(ctx);
    if (ctx.session.mode === 'booking' && ctx.session.booking?.step === 'comment') {
      await finishBooking(ctx);
    }
  });

  bot.on('photo', async (ctx, next) => {
    if (ctx.session.mode !== 'booking' || ctx.session.booking?.step !== 'comment') {
      await next();
      return;
    }

    const photos = ctx.message.photo || [];
    ctx.session.booking.data.photoFileId = photos.at(-1)?.file_id;
    ctx.session.booking.data.comment = ctx.message.caption || 'Фото-референс без комментария';
    await finishBooking(ctx);
  });

  bot.on('text', async (ctx, next) => {
    const text = ctx.message.text.trim();
    if (text.startsWith('/')) {
      await next();
      return;
    }

    if (ctx.session.mode !== 'booking' || !ctx.session.booking) {
      await ctx.reply('Я могу показать портфолио, подобрать стрижку или собрать заявку.', mainKeyboard());
      return;
    }

    const booking = ctx.session.booking;
    if (booking.step === 'name') {
      booking.data.name = text;
      booking.step = 'time';
      await askBookingStep(ctx);
      return;
    }

    if (booking.step === 'time') {
      booking.data.time = text;
      booking.step = 'contact';
      await askBookingStep(ctx);
      return;
    }

    if (booking.step === 'contact') {
      booking.data.contact = text;
      booking.step = 'comment';
      await askBookingStep(ctx);
      return;
    }

    if (booking.step === 'comment') {
      booking.data.comment = text;
      await finishBooking(ctx);
    }
  });

  bot.catch((error, ctx) => {
    console.error(`Bot error for update ${ctx.update?.update_id}:`, error);
  });

  return bot;
}

if (isDryRun) {
  console.log(JSON.stringify({
    ok: true,
    botUsername,
    deepLinks: {
      booking: botDeepLink('booking_site'),
      portfolio: botDeepLink('portfolio_site'),
      quiz: botDeepLink('style_quiz_site'),
    },
    portfolioCategories: portfolioCategories.map((category) => category.id),
    adminForwarding: Boolean(adminChatId),
  }, null, 2));
} else {
  const bot = createBot();
  bot.launch().then(() => {
    console.log(`Telegram bot @${botUsername} is running.`);
  });

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}
