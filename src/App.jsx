import {
  ArrowUpRight,
  Award,
  Camera,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageCircle,
  Scissors,
  Send,
  Sparkles,
} from 'lucide-react';
import CircularGallery from './components/react-bits/CircularGallery.jsx';

const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'barber_concierge_bot';
const botLink = (payload) => `https://t.me/${botUsername}?start=${payload}`;
const telegramUrl = botLink('booking_site_hero');
const portfolioBotUrl = botLink('portfolio_site');
const quizBotUrl = botLink('style_quiz_site');
const asset = (name) => `/assets/a-lustov/${name}`;

const navItems = [
  ['Главная', '#top'],
  ['Работы', '#works'],
  ['Подход', '#approach'],
  ['Запись', '#booking'],
];

const heroHighlights = [
  ['01', 'Форма', 'Силуэт под лицо, рост волос и привычную укладку.'],
  ['02', 'Борода', 'Окантовка, плотность и симметрия без случайности.'],
  ['03', 'Финиш', 'Укладка, которую легко повторить дома.'],
  ['04', 'Уход', 'Понятные средства и режим после визита.'],
];

const galleryItems = [
  { image: asset('49c2747c513843d6.jpg') },
  { image: asset('830528251769ee7e.jpg') },
  { image: asset('4c317637b8f0c612.jpg') },
  { image: asset('4cda8df2bfd05aa7.jpg') },
  { image: asset('8d65aca55f468ca9.jpg') },
  { image: asset('f39215400f1693a4.jpg') },
  { image: asset('97401270d38c5ac5.jpg') },
  { image: asset('5191ff964d990882.jpg') },
];

const services = [
  {
    icon: Scissors,
    title: 'Стрижка',
    text: 'Форма под черты лица, рост волос и привычную укладку.',
  },
  {
    icon: Award,
    title: 'Борода',
    text: 'Чистая окантовка, плотность, симметрия и аккуратный финиш.',
  },
  {
    icon: Sparkles,
    title: 'Груминг',
    text: 'Советы по уходу, укладке и продуктам без лишней сложности.',
  },
];

const approachCards = [
  {
    icon: CheckCircle2,
    title: 'Сначала консультация',
    text: 'Артём уточняет образ жизни, привычки укладки и то, как стрижка должна выглядеть через две недели.',
  },
  {
    icon: Clock3,
    title: 'Быстро, но точно',
    text: 'Скорость не съедает качество: силуэт, переходы, окантовка и текстура собираются в один чистый результат.',
  },
  {
    icon: Award,
    title: 'Чемпионатный опыт',
    text: 'Опыт международных чемпионатов помогает видеть форму целиком и держать детали на уровне.',
  },
  {
    icon: Sparkles,
    title: 'Финиш, который живёт',
    text: 'После кресла понятно, чем укладывать волосы и как поддерживать форму дома.',
  },
];

const processImages = [
  asset('49c2747c513843d6.jpg'),
  asset('830528251769ee7e.jpg'),
  asset('4c317637b8f0c612.jpg'),
  asset('f39215400f1693a4.jpg'),
];

function SmartLink({ href, children, className = '' }) {
  const external = href.startsWith('http');
  return (
    <a className={className} href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
      {children}
    </a>
  );
}

function CtaButton({ href, children, variant = 'primary' }) {
  return (
    <SmartLink href={href} className={`cta-button ${variant === 'secondary' ? 'is-secondary' : ''}`}>
      {children}
      <ArrowUpRight />
    </SmartLink>
  );
}

function ServiceCard({ service }) {
  const Icon = service.icon;
  return (
    <article className="service-card">
      <Icon />
      <h3>{service.title}</h3>
      <p>{service.text}</p>
    </article>
  );
}

function ApproachCard({ card }) {
  const Icon = card.icon;
  return (
    <article className="approach-card">
      <Icon />
      <h3>{card.title}</h3>
      <p>{card.text}</p>
    </article>
  );
}

export default function App() {
  return (
    <div className="site-shell">
      <header className="top-nav" id="top">
        <a className="brand-lockup" href="#top" aria-label="Артём Лустов">
          <img src={asset('logo-al.png')} alt="" />
          <span>Артём Лустов</span>
        </a>
        <nav aria-label="Основная навигация">
          {navItems.map(([label, href]) => (
            <a href={href} key={href}>{label}</a>
          ))}
        </nav>
        <SmartLink href={telegramUrl} className="nav-cta">
          Запись
          <Send />
        </SmartLink>
      </header>

      <main>
        <section className="hero-section" aria-label="Артём Лустов">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="location-line"><MapPin /> Минск</p>
              <h1>Артём Лустов</h1>
              <p className="hero-subtitle">
                Барбер-эксперт по мужскому грумингу: стрижка, борода, форма и укладка, которые выглядят собранно не только в день визита.
              </p>
              <div className="hero-actions">
                <CtaButton href={telegramUrl}>
                  <Send />
                  Записаться в Telegram
                </CtaButton>
                <CtaButton href="#works" variant="secondary">
                  <Camera />
                  Смотреть работы
                </CtaButton>
              </div>
            </div>

            <div className="hero-media" aria-label="Барберский бренд-визуал">
              <figure className="portrait-frame">
                <img src={asset('hero-tools.png')} alt="Барберские инструменты и монограмма AL" />
              </figure>
              <figure className="detail-frame brand-mark-frame">
                <img src={asset('logo-al.png')} alt="Логотип AL" />
              </figure>
              <div className="hero-note">
                <Award />
                <span>Призёр чемпионатов. Чистая техника, сильная форма, понятный уход.</span>
              </div>
            </div>
          </div>

          <div className="hero-bottom">
            <div className="proof-panel">
              <strong>475</strong>
              <span>публикаций с работами</span>
              <strong>1 041</strong>
              <span>аудитория Instagram</span>
            </div>
            <div className="hero-highlight-strip" aria-label="Ключевые направления">
              {heroHighlights.map(([number, title, text]) => (
                <article className="hero-highlight" key={title}>
                  <strong>{number}</strong>
                  <span>{title}</span>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="services-section" aria-label="Направления">
          {services.map((service) => (
            <ServiceCard service={service} key={service.title} />
          ))}
        </section>

        <section className="works-section" id="works">
          <div className="section-head">
            <p>Портфолио</p>
            <h2>Работы, по которым видно руку мастера</h2>
          </div>
          <div className="gallery-frame">
            <CircularGallery
              items={galleryItems}
              bend={2.2}
              textColor="#f2f4ee"
              borderRadius={0.025}
              font="bold 28px Geist Variable, system-ui"
              scrollSpeed={2}
              scrollEase={0.045}
            />
          </div>
        </section>

        <section className="approach-section" id="approach">
          <div className="section-head">
            <p>Подход</p>
            <h2>Не просто убрать длину, а собрать образ</h2>
          </div>
          <div className="approach-grid">
            {approachCards.map((card) => (
              <ApproachCard card={card} key={card.title} />
            ))}
          </div>
        </section>

        <section className="process-section" aria-label="Процесс работы">
          <div className="process-video">
            <video src={asset('reel-hero.mp4')} muted autoPlay loop playsInline poster={asset('33585dcdc8742e31.jpg')} />
          </div>
          <div className="process-copy">
            <p>В кресле</p>
            <h2>Консультация, техника, финиш</h2>
            <span>
              Сначала фиксируем задачу и референсы. Потом Артём собирает силуэт, показывает укладку и объясняет, как поддерживать форму дома.
            </span>
            <div className="mini-gallery">
              {processImages.map((src, index) => (
                <img src={src} alt={`Процесс работы ${index + 1}`} key={src} />
              ))}
            </div>
          </div>
        </section>

        <section className="booking-section" id="booking">
          <div>
            <p>Telegram-консьерж</p>
            <h2>Бот покажет работы, подберёт форму и соберёт заявку</h2>
            <span>
              Не нужно сразу формулировать задачу мастеру. Бот проведёт по портфолио,
              задаст несколько вопросов и соберёт короткую заявку с референсами.
            </span>
            <div className="bot-flow">
              <span><Camera /> Портфолио внутри Telegram</span>
              <span><Sparkles /> Подбор стрижки за минуту</span>
              <span><MessageCircle /> Заявка с контактом и временем</span>
            </div>
          </div>
          <div className="booking-actions">
            <CtaButton href={quizBotUrl}>
              <Sparkles />
              Подобрать стрижку
            </CtaButton>
            <CtaButton href={portfolioBotUrl} variant="secondary">
              <Camera />
              Портфолио в боте
            </CtaButton>
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>Артём Лустов | Барбер-эксперт | Минск</span>
        <nav>
          <a href="#works">Работы</a>
          <a href="#approach">Подход</a>
          <a href={telegramUrl} target="_blank" rel="noreferrer">Telegram-бот</a>
        </nav>
      </footer>
    </div>
  );
}
