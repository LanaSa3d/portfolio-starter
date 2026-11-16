// Shared page chrome: theme, navbar (with mobile menu), modal, footer and page metadata.
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useContent } from './content.jsx'
import { useLang } from './i18n.jsx'
import { PortfolioMark } from './marks.jsx'

/* ── THEME ──────────────────────────────────────────────── */
export const PALETTES = {
  // Mizan green: the design system Yara built to replace "11 shades of green".
  mizan: { '--paper':'#f3f0e6','--paper-2':'#e8e4d6','--ink':'#1f2a24','--ink-soft':'#4c5a50','--accent':'#2f6b4f','--accent-soft':'#a9c9b3','--line':'#2c3a31' },
  night: { '--paper':'#121815','--paper-2':'#1a221d','--ink':'#e6eee7','--ink-soft':'#a3b3a7','--accent':'#7cc49a','--accent-soft':'#2f5a42','--line':'#5f7466' },
  sand:  { '--paper':'#f4ede0','--paper-2':'#ebe1cf','--ink':'#2a2520','--ink-soft':'#5a4f44','--accent':'#a8532f','--accent-soft':'#e2b39a','--line':'#3a2f26' },
};

export const TWEAKS_KEY = 'yara_tweaks';

export function applyPalette(name) {
  const p = PALETTES[name] || PALETTES.mizan;
  Object.entries(p).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  document.documentElement.dataset.theme = name === 'night' ? 'dark' : 'light';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', p['--paper']);
}

export function setTweak(key, value) {
  window.__tweaks = { ...(window.__tweaks || {}), [key]: value };
  try { localStorage.setItem(TWEAKS_KEY, JSON.stringify(window.__tweaks)); } catch (_) {}
  window.postMessage({ type: '__tweaks_updated' }, '*');
  window.__rebuildTweaks?.();
}

export function useTweaks() {
  const [tweaks, setTweaks] = React.useState(() => ({ ...(window.__tweaks || {}) }));
  React.useEffect(() => {
    const h = (e) => { if (e.data?.type === '__tweaks_updated') setTweaks({ ...window.__tweaks }); };
    window.addEventListener('message', h);
    return () => window.removeEventListener('message', h);
  }, []);
  React.useEffect(() => { applyPalette(tweaks.palette); }, [tweaks.palette]);
  return tweaks;
}

/* ── HOOKS ──────────────────────────────────────────────── */
export function useMediaQuery(query) {
  const get = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches;
  const [matches, setMatches] = React.useState(get);
  React.useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const m = window.matchMedia(query);
    const h = () => setMatches(m.matches);
    h();
    m.addEventListener?.('change', h);
    return () => m.removeEventListener?.('change', h);
  }, [query]);
  return matches;
}

export const useIsMobile = () => useMediaQuery('(max-width: 767px)');

// Sets the document title and description for each route.
export function usePageMeta(title, description) {
  React.useEffect(() => {
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && description) meta.setAttribute('content', description);
  }, [title, description]);
}

export function cvHref(person) {
  return (import.meta.env.BASE_URL || '/') + person.cvFile;
}

/* ── NAVBAR ─────────────────────────────────────────────── */
export const NAV_LINKS = [
  { id: 'home', key: 'nav.home' },
  { id: 'about', key: 'nav.about' },
  { id: 'projects', key: 'nav.work' },
  { id: 'experience', key: 'nav.experience' },
  { id: 'research', key: 'nav.research' },
  { id: 'speaking', key: 'nav.speaking' },
  { id: 'recognition', key: 'nav.awards' },
  { id: 'contact', key: 'nav.contact' },
];

export function Navbar() {
  const { person } = useContent();
  const { lang, t, setLang } = useLang();
  const tweaks = useTweaks();
  const location = useLocation();
  const onHome = location.pathname === '/' || location.pathname === '';
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState('');

  React.useEffect(() => {
    if (!onHome) { setActiveSection(''); return undefined; }
    const update = () => {
      const marker = window.scrollY + window.innerHeight * .38;
      let active = '';
      NAV_LINKS.forEach(({ id }) => {
        const section = document.getElementById(id);
        if (section && section.offsetTop <= marker) active = id;
      });
      setActiveSection(active);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [onHome]);

  React.useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    h();
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  React.useEffect(() => { setOpen(false); }, [location.pathname, location.hash]);

  React.useEffect(() => {
    if (!open) return undefined;
    const h = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open]);

  const isDark = tweaks.palette === 'night';
  const LinkTag = ({ id, children, ...rest }) => (onHome
    ? <a href={'#' + id} {...rest}>{children}</a>
    : <Link to={'/#' + id} {...rest}>{children}</Link>);

  return (
    <header className={'site-nav' + (scrolled || !onHome ? ' is-solid' : '')}>
      <a className="skip-link" href="#main">{t('nav.skip')}</a>
      <nav className="site-nav-inner" aria-label="Main">
        <Link to="/" className="site-nav-brand" aria-label={t('nav.home', { name: person.displayName })}>
          <span className="site-nav-mark" aria-hidden="true"><PortfolioMark /></span>
          <span className="site-nav-name">{person.displayName}</span>
        </Link>
        <ul className="site-nav-links">
          {NAV_LINKS.map((l) => (
            <li key={l.id}><LinkTag id={l.id} className={activeSection === l.id ? 'is-active' : undefined} aria-current={activeSection === l.id ? 'location' : undefined}>{l.id === 'home' ? (lang === 'ar' ? 'الرئيسية' : 'Home') : t(l.key)}</LinkTag></li>
          ))}
        </ul>
        <div className="site-nav-actions">
          <button className="lang-btn" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} aria-label={t('nav.langLabel')} lang={lang === 'ar' ? 'en' : 'ar'}>{t('nav.lang')}</button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setTweak('palette', isDark ? 'mizan' : 'night')}
            aria-label={isDark ? t('nav.light') : t('nav.dark')}
            title={isDark ? t('nav.light') : t('nav.dark')}
          >
            {isDark ? '☀' : '☾'}
          </button>
          <a className="btn btn-ink site-nav-cv" href={cvHref(person)} download>{t('nav.cv')}</a>
          <button
            type="button"
            className="icon-btn site-nav-burger"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </nav>
      {open && (
        <div id="mobile-menu" className="mobile-menu anim-fadeIn">
          <ul>
            {NAV_LINKS.map((l) => (
              <li key={l.id}><LinkTag id={l.id} onClick={() => setOpen(false)}>{l.id === 'home' ? (lang === 'ar' ? 'الرئيسية' : 'Home') : t(l.key)}</LinkTag></li>
            ))}
            <li><a href={cvHref(person)} download>{t('nav.cvLong')}</a></li>
          </ul>
        </div>
      )}
    </header>
  );
}

/* ── MODAL ──────────────────────────────────────────────── */
export function Modal({ title, eyebrow, onClose, children, width = 620 }) {
  const { t } = useLang();
  const closeRef = React.useRef(null);
  const boxRef = React.useRef(null);
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  React.useEffect(() => {
    const previous = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onCloseRef.current();
      if (e.key === 'Tab' && boxRef.current) {
        const f = boxRef.current.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, []);

  return (
    <div className="modal-wrap anim-fadeIn" onClick={onClose}>
      <div
        ref={boxRef}
        className="modal-box anim-slideUp"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            {eyebrow && <div className="eyebrow">// {eyebrow}</div>}
            <h2 className="modal-title">{title}</h2>
          </div>
          <button ref={closeRef} type="button" className="icon-btn" onClick={onClose} aria-label={t('modal.close')}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

/* ── FOOTER ─────────────────────────────────────────────── */
export function Footer() {
  const { person } = useContent();
  const { t } = useLang();
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <div>
          <div className="site-footer-name">{person.name}</div>
          <div className="mono muted">{person.titles.join(' · ')}</div>
        </div>
        <div className="mono muted site-footer-note">
          {t('footer.note')}
        </div>
      </div>
    </footer>
  );
}
