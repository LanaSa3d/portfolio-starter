// Home page: the interactive desk hero, then the CV told as sections.
import React from 'react'
import { useLocation } from 'react-router-dom'
import { DeskScene } from './scene.jsx'
import { MugCompanion } from './mug-companion.jsx'
import ScrollPath from './scroll-path.jsx'
import { useContent } from './content.jsx'
import { useLang } from './i18n.jsx'
import { Modal, cvHref, useTweaks, usePageMeta, useIsMobile, Footer } from './layout.jsx'
import {
  AboutSection, HighlightsSection, ProjectsSection, ExperienceSection, ResearchSection,
  SpeakingSection, LeadershipSection, RecognitionSection, SkillsSection, ContactSection,
  CertTable, AwardList, LanguagesList, InterestsList, ProfileLinks, useReveal,
} from './home-sections.jsx'

const CERT_COLORS = ['#2f6b4f', '#2d5f8a', '#7a4a2a', '#5a3a7a'];

const shorten = (text, max) => (text.length > max ? text.slice(0, max - 1).trimEnd() + '…' : text);
const initials = (text) => text.split(/\s+/).map((w) => w[0]).join('').slice(0, 4).toUpperCase();

// Screen-reader names for the desk objects and pinned notes.
const A11Y = {
  en: {
    items: {
      laptop: 'Laptop: web projects', phone: 'Phone: mobile projects', notebook: 'Notebook: get in touch',
      mug: 'Coffee mug: spawn a companion', camera: 'Film camera: off the clock, interests and languages',
      chess: 'Chess knight: interests', inkpot: 'Ink pot and reed pen: research, thesis and publications', medal: 'Medal: awards and recognition',
    },
    cards: {
      identity: 'About Yara', about: 'Education', currently: 'Current role', stack: 'Core skills', contact: 'Contact',
      honors: 'Awards', certs: 'Certifications', latest: 'Speaking and media', work: 'Projects', tweaks: 'Customize the desk',
    },
  },
  ar: {
    items: {
      laptop: 'الحاسوب المحمول: مشاريع الويب', phone: 'الهاتف: مشاريع الجوال', notebook: 'الدفتر: للتواصل',
      mug: 'كوب القهوة: أظهر رفيقًا', camera: 'الكاميرا الفيلمية: خارج أوقات العمل، الاهتمامات واللغات',
      chess: 'حصان الشطرنج: الاهتمامات', inkpot: 'المحبرة والقلم القصب: البحث والأطروحة والمنشورات', medal: 'الميدالية: الجوائز والتقدير',
    },
    cards: {
      identity: 'نبذة عن يارا', about: 'التعليم', currently: 'الدور الحالي', stack: 'المهارات الأساسية', contact: 'التواصل',
      honors: 'الجوائز', certs: 'الشهادات المهنية', latest: 'المحاضرات والإعلام', work: 'المشاريع', tweaks: 'تخصيص المكتب',
    },
  },
};

// Turns the CV into the short notes pinned on the desk board.
export function buildDeskCards(cv, t, lang = 'en') {
  const { person, experience, education, awards, patents, certifications, speaking, projects } = cv;
  const now = experience[0];
  // Earned certificates first (newest first, as in the CV), the in-progress one last.
  const certs = [...certifications.items.filter((c) => c.id), ...certifications.items.filter((c) => !c.id)];
  const keynote = speaking.talks[0];
  const a11y = A11Y[lang] || A11Y.en;
  return {
    labels: {
      hello: t('desk.hello'), education: t('desk.education'), currently: t('desk.currently'), stack: t('desk.stack'),
      contact: t('desk.contact'), honors: t('desk.honors'), certs: t('desk.certs'), projects: t('desk.projects'), customize: t('desk.customize'),
    },
    cardLabels: a11y.cards,
    itemLabels: a11y.items,
    intro: { label: t('desk.introLabel'), text: t('desk.intro') },
    identity: {
      name: person.displayName,
      title: person.titles[0],
      status: person.titles.slice(1).join(' · '),
      location: person.location,
    },
    about: { lines: t('desk.edu', { school: education[0].school, award: shorten(education[0].details[1], 34) }) },
    currently: { heading: now.org, detail: person.titles[0], extra: t('desk.since', { date: now.start }) },
    stack: { items: t('desk.stackItems', { n: cv.skills.length }) },
    contact: {
      lines: [person.email.split('@')[0], '@' + person.email.split('@')[1], person.phone, person.location, t('desk.links')],
    },
    social: [], // profiles open from the contact card instead
    honors: { lines: [t('desk.awards', { n: awards.length }), t('desk.patents', { n: patents.length }), t('desk.top40'), t('desk.fullList')] },
    certs: {
      entries: certs.map((c, i) => ({
        org: c.id ? c.id.split('-')[0] : initials(c.issuer),
        color: CERT_COLORS[i % CERT_COLORS.length],
        name: shorten(c.name, 34),
        dur: shorten(c.issuer, 28) + ' · ' + (c.year || c.status),
      })),
      more: t('desk.more', { n: certs.length - 4 }),
    },
    latest: { eyebrow: t('desk.onStage'), heading: t('desk.talks', { n: speaking.total }), action: t('desk.keynote', { year: keynote.year }) },
    work: { heading: t('desk.projectsN', { n: projects.length }), action: t('desk.open') },
    tweaks: { heading: t('desk.tweaks'), action: t('desk.tweaksAction') },
    resume: {
      eyebrow: t('desk.download'),
      title: t('desk.cvTitle'),
      name: person.name,
      line1: person.titles[0],
      line2: t('desk.cvLine2', { city: person.location.split('،')[0].split(',')[0] }),
      href: cvHref(person),
      filename: person.cvFile,
      button: t('desk.downloadPdf'),
    },
  };
}

function whiteboardHtml(person, t) {
  return (
    `<div style="text-align:center;font-weight:600;font-size:29px">${t('desk.board', { name: person.firstName })}</div>` +
    `<div style="text-align:center;font-size:19px;opacity:.85">${person.titles.join(' · ')}</div>` +
    `<div style="text-align:center;font-size:17px;opacity:.75;margin-top:6px">${t('desk.hint')}</div>`
  );
}

export function Home() {
  const cv = useContent();
  const { t, lang } = useLang();
  const { person, education, speaking } = cv;
  const tweaks = useTweaks();
  const location = useLocation();
  const isMobile = useIsMobile();
  const heroRef = React.useRef(null);

  const [laptopHovered, setLaptopHovered] = React.useState(false);
  const [phoneHovered, setPhoneHovered] = React.useState(false);
  const [modal, setModal] = React.useState(null);
  const [platform, setPlatform] = React.useState(null);

  const sep = lang === 'ar' ? '، ' : ', ';
  usePageMeta(
    t('meta.home', { name: person.displayName, title: person.titles[0] }),
    t('meta.homeDesc', { full: person.name, titles: person.titles.join(sep), location: person.location })
  );
  useReveal(lang);

  // Arriving from another page with /#section: scroll there once the page renders.
  React.useEffect(() => {
    if (!location.hash) return;
    const el = document.querySelector(location.hash);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 60);
  }, [location.hash]);

  const scrollTo = (hash) => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
  const toggleTweaks = () => document.getElementById('tweaks')?.classList.toggle('on');

  /* ── mug companion ── */
  const [isCoarse] = React.useState(() => typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches);
  const [companion, setCompanion] = React.useState(null);
  const [bounds, setBounds] = React.useState({ width: window.innerWidth, height: window.innerHeight });
  const [pointer, setPointer] = React.useState({ x: window.innerWidth / 2, y: window.innerHeight * 0.62 });

  React.useEffect(() => {
    const sync = () => {
      const r = heroRef.current?.getBoundingClientRect();
      setBounds({ width: r?.width || window.innerWidth, height: r?.height || window.innerHeight });
    };
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  React.useEffect(() => {
    const move = (e) => {
      const r = heroRef.current?.getBoundingClientRect();
      setPointer({ x: e.clientX - (r?.left || 0), y: e.clientY - (r?.top || 0) });
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  const spawnCompanion = () => setCompanion((c) => c || {
    family: ['base', 'hero', 'monster', 'skeleton'][Math.floor(Math.random() * 4)],
    mode: isCoarse ? 'desk' : 'follow',
    phase: 'spawning',
  });

  /* ── desk interactions ── */
  const handleItemClick = (id) => {
    if (id === 'laptop') { setPlatform('web'); scrollTo('#projects'); }
    else if (id === 'phone') { setPlatform('mobile'); scrollTo('#projects'); }
    else if (id === 'notebook') scrollTo('#contact');
    else if (id === 'inkpot') scrollTo('#research');
    else if (id === 'medal') setModal('awards');
    else if (id === 'camera' || id === 'chess') setModal('offclock');
    else if (id === 'mug') spawnCompanion();
  };

  const handleBoardClick = (id) => {
    const map = {
      identity: () => scrollTo('#about'),
      about: () => setModal('education'),
      currently: () => scrollTo('#experience'),
      stack: () => scrollTo('#skills'),
      contact: () => setModal('profiles'),
      honors: () => setModal('awards'),
      certs: () => setModal('certs'),
      latest: () => setModal('speaking'),
      work: () => { setPlatform(null); scrollTo('#projects'); },
      tweaks: toggleTweaks,
    };
    map[id]?.();
  };

  const cards = React.useMemo(() => buildDeskCards(cv, t, lang), [cv, t, lang]);
  const close = React.useCallback(() => setModal(null), []);
  const q = (text) => (lang === 'ar' ? `«${text}»` : `“${text}”`);

  return (
    <>
      <main id="main">
        <div
          ref={heroRef}
          id="home"
          className="desk-hero"
          dir="ltr"
          style={isMobile ? { aspectRatio: '2100 / 1200', height: 'auto' } : undefined}
        >
          <h1 className="visually-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>{person.name}{sep}{person.titles.join(sep)}</h1>
          <div className="desk-hero-scene">
            <DeskScene
              onLaptopEnter={() => setLaptopHovered(true)}
              onLaptopLeave={() => setLaptopHovered(false)}
              onPhoneEnter={() => setPhoneHovered(true)}
              onPhoneLeave={() => setPhoneHovered(false)}
              onItemClick={handleItemClick}
              onBoardClick={handleBoardClick}
              onMugClick={spawnCompanion}
              laptopHovered={laptopHovered}
              phoneHovered={phoneHovered}
              laptopKind={tweaks.laptop}
              phoneKind={tweaks.phone}
              cardData={cards}
              whiteboardText={whiteboardHtml(person, t)}
              rtl={lang === 'ar'}
              mugHidden={!!companion}
            />
          </div>
          <MugCompanion
            companion={companion}
            pointer={pointer}
            bounds={bounds}
            onDismiss={() => setCompanion((c) => (c && c.phase !== 'dying' ? { ...c, phase: 'dying' } : c))}
            onSpawned={() => setCompanion((c) => (c ? { ...c, phase: 'active' } : c))}
            onDeathComplete={() => setCompanion(null)}
          />
        </div>

        <AboutSection />
        <HighlightsSection />
        <ProjectsSection platform={platform} onClearPlatform={() => setPlatform(null)} />
        <ExperienceSection />
        <ResearchSection />
        <SpeakingSection />
        <LeadershipSection />
        <RecognitionSection />
        <SkillsSection />
        <ContactSection />
        <ScrollPath />
      </main>
      <Footer />

      {modal === 'education' && (
        <Modal eyebrow={t('desk.education')} title={t('modal.education')} onClose={close}>
          <ul className="modal-list">
            {education.map((ed) => (
              <li key={ed.start}>
                <strong>{ed.degree}</strong>
                <span>{ed.school} · {ed.location} · {ed.start} – {ed.end}</span>
                {ed.details.map((d) => <span key={d} className="muted">{d}</span>)}
              </li>
            ))}
          </ul>
        </Modal>
      )}
      {modal === 'awards' && (
        <Modal eyebrow={t('modal.honors')} title={t('modal.awards')} onClose={close} width={720}>
          <AwardList awards={cv.awards} compact />
          <h3 className="sub-title">{t('modal.patents')}</h3>
          <ul className="modal-list">
            {cv.patents.map((p) => <li key={p.title}><strong>{p.title}</strong><span>{p.number} · {p.status}</span></li>)}
          </ul>
        </Modal>
      )}
      {modal === 'certs' && (
        <Modal eyebrow={t('modal.certsEyebrow')} title={t('modal.certs', { count: cv.certifications.items.length })} onClose={close} width={920}>
          <p className="muted">{cv.certifications.note}</p>
          <CertTable items={cv.certifications.items} />
        </Modal>
      )}
      {modal === 'speaking' && (
        <Modal eyebrow={t('modal.stage')} title={t('modal.speaking')} onClose={close} width={720}>
          <p className="muted">{speaking.note}</p>
          <ul className="modal-list">
            {speaking.talks.map((tk) => <li key={tk.year + tk.event}><strong>{t('talk.' + tk.type)}: {q(tk.title)}</strong><span>{tk.event} · {tk.city} · {tk.year}</span></li>)}
            {speaking.media.map((m) => <li key={m.outlet + m.date}><strong>{m.type}: {m.title}</strong><span>{m.outlet} · {m.date}{m.extra ? ' · ' + m.extra : ''}</span></li>)}
          </ul>
        </Modal>
      )}
      {modal === 'profiles' && (
        <Modal eyebrow={t('modal.profilesEyebrow')} title={t('modal.profiles', { name: person.firstName })} onClose={close}>
          <ProfileLinks links={person.links} />
        </Modal>
      )}
      {modal === 'offclock' && (
        <Modal eyebrow={t('modal.offclockEyebrow')} title={t('modal.offclock')} onClose={close}>
          <InterestsList interests={cv.interests} />
          <h3 className="sub-title">{t('contact.languages')}</h3>
          <LanguagesList languages={cv.languages} />
        </Modal>
      )}
    </>
  );
}
