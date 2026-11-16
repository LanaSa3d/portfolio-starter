// Home page sections. CV content comes from useContent(); UI words come from useLang().
import React from 'react'
import { PortfolioMark, ProjectMark } from './marks.jsx'
import { Link } from 'react-router-dom'
import { useContent } from './content.jsx'
import { useLang, statusLabel } from './i18n.jsx'
import { cvHref, useMediaQuery } from './layout.jsx'
import { resolveGallery, resolveCover } from './images.js'
import { FeaturedGalleryFan, ProjectGalleryOverlayEnhanced } from './gallery.jsx'

/* ── SHARED ─────────────────────────────────────────────── */
function SectionHead({ eyebrow, title, accent, intro }) {
  return (
    <div className="section-head reveal">
      <div className="eyebrow">// {eyebrow}</div>
      <h2 className="section-title">
        {title}{accent && <> <em>{accent}</em></>}
      </h2>
      {intro && <p className="section-intro">{intro}</p>}
    </div>
  );
}

export function Chips({ items, small }) {
  return (
    <ul className={'chips' + (small ? ' chips-sm' : '')}>
      {items.map((t) => <li key={t} className="chip-tag">{t}</li>)}
    </ul>
  );
}

// Adds .is-visible to .reveal elements as they scroll in (skipped for reduced motion).
export function useReveal(dep) {
  React.useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.is-visible)');
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.add('is-visible'));
      return undefined;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [dep]);
}

/* ── ABOUT ──────────────────────────────────────────────── */
export function AboutSection() {
  const { person, summary, experience, education, languages } = useContent();
  const { t } = useLang();
  const current = experience[0];
  const phd = education[0];
  const phrases = person.titles;
  const [idx, setIdx] = React.useState(0);
  const [shown, setShown] = React.useState('');
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => { setIdx(0); setShown(''); setDeleting(false); }, [phrases]);

  React.useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const phrase = phrases[idx % phrases.length] || '';
    if (reduce) { setShown(phrase); return undefined; }
    let tm;
    if (!deleting && shown.length < phrase.length) tm = setTimeout(() => setShown(phrase.slice(0, shown.length + 1)), 55);
    else if (!deleting) tm = setTimeout(() => setDeleting(true), 1900);
    else if (shown.length > 0) tm = setTimeout(() => setShown(shown.slice(0, -1)), 28);
    else { setDeleting(false); setIdx((i) => (i + 1) % phrases.length); }
    return () => clearTimeout(tm);
  }, [shown, deleting, idx, phrases]);

  return (
    <section id="about" className="section section-paper">
      <div className="container about-grid">
        <div className="reveal">
          <div className="eyebrow">// {t('about.eyebrow')}</div>
          <h1 className="about-name" tabIndex={0} onPointerMove={(event) => {
            if (event.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            event.currentTarget.querySelectorAll('.name-part').forEach((part) => {
              const box = part.getBoundingClientRect();
              part.style.setProperty('--spot-x', `${event.clientX - box.left}px`);
              part.style.setProperty('--spot-y', `${event.clientY - box.top}px`);
            });
          }} onPointerLeave={(event) => {
            event.currentTarget.querySelectorAll('.name-part').forEach((part) => {
              part.style.removeProperty('--spot-x');
              part.style.removeProperty('--spot-y');
            });
          }}>
            <span className="about-name-words">{person.name.replace(/,?\s*PhD$/i, '').split(/\s+(?=Al-Mansouri$|المنصوري$)/).map((part) => <span className="name-part" key={part}>{part}</span>)}</span>
            <span className="about-name-mark" aria-hidden="true"><PortfolioMark /></span>
          </h1>
          <p className="about-typed" aria-label={phrases.join(', ')}>
            <span aria-hidden="true">{shown}</span><span className="caret" aria-hidden="true" />
          </p>
          <p className="about-summary">{summary}</p>
          <div className="about-actions">
            <a href="#projects" className="btn btn-ink">{t('about.cta')}</a>
            <a href={cvHref(person)} download className="btn btn-ghost">{t('about.cv')}</a>
          </div>
        </div>
        <aside className="facts-card reveal" aria-label={t('about.now')}>
          <dl>
            <div><dt>{t('about.now')}</dt><dd>{current.role}<span>{current.org} · {t('about.since', { date: current.start })}</span></dd></div>
            <div><dt>{t('about.based')}</dt><dd>{person.location}</dd></div>
            <div><dt>{t('about.education')}</dt><dd>{phd.degree}<span>{phd.school} · {phd.end}</span></dd></div>
            <div><dt>{t('about.languages')}</dt><dd>{languages.map((l) => l.name).join(' · ')}</dd></div>
          </dl>
        </aside>
      </div>
    </section>
  );
}

/* ── CAREER HIGHLIGHTS ──────────────────────────────────── */
function CountUp({ value, suffix }) {
  const ref = React.useRef(null);
  const [n, setN] = React.useState(value);
  React.useEffect(() => {
    const el = ref.current;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!el || reduce || typeof IntersectionObserver === 'undefined') return undefined;
    let raf;
    let started = false;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;
      io.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / 1200);
        setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      setN(0);
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value]);
  return <span ref={ref} className="ltr">{n.toLocaleString('en-US')}{suffix}</span>;
}

export function HighlightsSection() {
  const { highlights } = useContent();
  const { t } = useLang();
  return (
    <section id="highlights" className="section section-ink" aria-labelledby="highlights-title">
      <div className="container">
        <div className="eyebrow eyebrow-invert">// {t('highlights.eyebrow')}</div>
        <h2 id="highlights-title" className="visually-hidden">{t('highlights.title')}</h2>
        <ul className="highlights-grid">
          {highlights.map((h) => (
            <li key={h.value + h.label} className="highlight" title={h.text}>
              <div className="highlight-value"><CountUp value={h.value} suffix={h.suffix} /></div>
              <div className="highlight-label">{h.label}</div>
              <div className="highlight-note">{h.note}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── PROJECTS ───────────────────────────────────────────── */
const PROJECT_FILTERS = ['all', 'product', 'system', 'research'];

export function useProjectGallery() {
  const [open, setOpen] = React.useState(null); // { project, index }
  const overlay = open && (
    <div dir="ltr">
      <ProjectGalleryOverlayEnhanced
        projectName={open.project.name}
        items={resolveGallery(open.project)}
        activeIndex={open.index}
        onChangeIndex={(i) => setOpen((o) => ({ ...o, index: i }))}
        onClose={() => setOpen(null)}
      />
    </div>
  );
  return [overlay, (project, index) => setOpen({ project, index })];
}

function ProjectMeta({ p }) {
  return <div className="project-meta mono">{p.org} · {p.period}</div>;
}

function ProjectFeature({ p, flip, onOpenGallery }) {
  const { t } = useLang();
  const gallery = resolveGallery(p);
  const cover = gallery[0];
  const isMobile = useMediaQuery('(max-width: 767px)');
  return (
    <article className={'project-feature reveal' + (flip ? ' is-flipped' : '')} style={{ '--project-accent': p.accent }}>
      <div className="project-feature-copy">
        <ProjectMeta p={p} />
        <h3 className="project-feature-title"><ProjectMark slug={p.slug} /><Link to={'/projects/' + p.slug}>{p.name}</Link></h3>
        <p className="project-tagline">{p.tagline}</p>
        <dl className="par">
          <div><dt>{t('label.problem')}</dt><dd>{p.problem}</dd></div>
          <div><dt>{t('label.result')}</dt><dd>{p.result}</dd></div>
        </dl>
        {p.award && <p className="award-badge">★ {p.award}</p>}
        <Chips items={p.tech} small />
        <div className="project-actions">
          <Link to={'/projects/' + p.slug} className="btn btn-ink">{t('projects.read')}</Link>
          <span className="mono muted">{p.role} · {p.team}</span>
        </div>
      </div>
      <div className="project-feature-media" dir="ltr">
        {cover ? (
          <button type="button" className="project-cover" onClick={() => onOpenGallery(p, 0)} aria-label={t('projects.openGallery', { name: p.name })}>
            <img src={cover.url} alt={cover.alt} loading="lazy" width="1600" height="1000" />
          </button>
        ) : <div className="project-cover project-cover-empty" aria-hidden="true">{p.shortName || p.name}</div>}
        {gallery.length > 1 && (
          <FeaturedGalleryFan
            projectName={p.name}
            items={gallery.slice(1)}
            isMobile={isMobile}
            onOpen={(i) => onOpenGallery(p, i + 1)}
          />
        )}
      </div>
    </article>
  );
}

function ProjectTile({ p }) {
  const { t } = useLang();
  const cover = resolveCover(p);
  return (
    <article className="project-tile reveal" style={{ '--project-accent': p.accent }}>
      <Link to={'/projects/' + p.slug} className="project-tile-link">
        <div className="project-tile-media">
          {cover ? <img src={cover.url} alt={cover.alt} loading="lazy" width="1600" height="1000" /> : <span aria-hidden="true">{p.shortName || p.name}</span>}
        </div>
        <div className="project-tile-body">
          <ProjectMeta p={p} />
          <h3 className="project-tile-title"><ProjectMark slug={p.slug} />{p.name}</h3>
          <p className="project-tile-copy">{p.result}</p>
          <Chips items={p.tech} small />
          <span className="project-tile-cta mono">{t('projects.tile')}</span>
        </div>
      </Link>
    </article>
  );
}

export function ProjectsSection({ platform, onClearPlatform }) {
  const { projects } = useContent();
  const { t } = useLang();
  const [filter, setFilter] = React.useState('all');
  const [overlay, openGallery] = useProjectGallery();

  const visible = projects.filter((p) =>
    (filter === 'all' || p.category === filter) &&
    (!platform || p.platform === platform || p.platform === 'both'));
  const featured = visible.filter((p) => p.featured);
  const rest = visible.filter((p) => !p.featured);
  const platformName = platform === 'mobile' ? t('projects.mobile') : t('projects.web');

  useReveal(filter + (platform || ''));

  return (
    <section id="projects" className="section section-paper-2">
      <div className="container">
        <SectionHead
          eyebrow={t('projects.eyebrow')}
          title={t('projects.title')}
          accent={t('projects.accent')}
          intro={t('projects.intro', { count: projects.length })}
        />
        <div className="filter-row" role="group" aria-label={t('projects.filter')}>
          {PROJECT_FILTERS.map((f) => (
            <button key={f} type="button" className={'filter-btn' + (filter === f ? ' is-active' : '')} aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {t('projects.' + f)}
            </button>
          ))}
          {platform && (
            <button type="button" className="filter-btn is-active" onClick={onClearPlatform} aria-label={t('projects.clear', { name: platformName })}>
              {platformName} ✕
            </button>
          )}
        </div>

        <div className="project-features">
          {featured.map((p, i) => <ProjectFeature key={p.slug} p={p} flip={i % 2 === 1} onOpenGallery={openGallery} />)}
        </div>
        {rest.length > 0 && (
          <div className="project-tiles">
            {rest.map((p) => <ProjectTile key={p.slug} p={p} />)}
          </div>
        )}
        {visible.length === 0 && <p className="muted">{t('projects.none')}</p>}
      </div>
      {overlay}
    </section>
  );
}

/* ── EXPERIENCE ─────────────────────────────────────────── */
export function ExperienceSection() {
  const { experience } = useContent();
  const { t } = useLang();
  const [activeIndex, setActiveIndex] = React.useState(0);
  React.useEffect(() => {
    const items = document.querySelectorAll('#experience .timeline-item');
    if (!items.length || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver((entries) => {
      entries.filter((entry) => entry.isIntersecting).forEach((entry) => setActiveIndex(Number(entry.target.dataset.journeyIndex)));
    }, { rootMargin: '-18% 0px -60% 0px', threshold: 0 });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [experience]);
  return (
    <section id="experience" className="section section-paper">
      <div className="container">
        <SectionHead eyebrow={t('exp.eyebrow')} title={t('exp.title')} accent={t('exp.accent')} intro={t('exp.intro')} />
        <div className="journey-layout">
        <ol className="timeline">
          {experience.map((e, index) => (
            <li key={e.role + e.start} data-journey-index={index} className={'timeline-item kind-' + e.kind + (activeIndex === index ? ' is-current' : '')}>
              <div className="timeline-when mono">{e.start} – {e.end}</div>
              <div className="timeline-dot" aria-hidden="true" />
              <div className="timeline-body">
                <span className="journey-step mono" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                {e.kind !== 'work' && <span className={'kind-badge kind-badge-' + e.kind}>{t('kind.' + e.kind)}</span>}
                <h3 className="timeline-role">{e.role}</h3>
                <div className="timeline-org">{[e.org, e.location].filter(Boolean).join(' · ')}</div>
                <ul className="timeline-bullets">
                  {e.bullets.map((b) => <li key={b}>{b}</li>)}
                </ul>
                {e.tech.length > 0 && <Chips items={e.tech} small />}
              </div>
            </li>
          ))}
        </ol>
        </div>
      </div>
    </section>
  );
}

/* ── RESEARCH: education, thesis, patents, publications ── */
function ArabicReadingLab() {
  const { lang } = useLang();
  const [size, setSize] = React.useState(27);
  const [spacing, setSpacing] = React.useState('comfortable');
  const [width, setWidth] = React.useState(32);
  const [sample, setSample] = React.useState(0);
  const [focus, setFocus] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const ar = lang === 'ar';
  const samples = [
    { labelAr: 'مقال', labelEn: 'Article', title: 'واجهة عربية مصمّمة للقراءة', text: 'تبدأ التجربة الجيدة من وضوح الكلمة. حين يتّسع السطر وتتنفّس الحروف، يصبح الوصول إلى المعلومة أسهل وأكثر راحة.' },
    { labelAr: 'منتج', labelEn: 'Product', title: 'خطوة أخيرة قبل المتابعة', text: 'راجع تفاصيل طلبك بعناية. يمكنك العودة لتعديل المعلومات في أي وقت، وسنحفظ تقدّمك حتى تتابع من حيث توقّفت.' },
    { labelAr: 'بحث', labelEn: 'Research', title: 'ملاحظة من الدراسة', text: 'تؤثّر كثافة النص وتباعد السطور في طريقة قراءة الواجهات العربية. جرّب الإعدادات المختلفة ولاحظ ما يتغيّر في تجربتك.' },
  ];
  return <div className={'reading-lab' + (open ? ' is-open' : '')}>
    <button type="button" className="reading-lab-toggle" aria-expanded={open} aria-controls="reading-lab-panel" onClick={() => setOpen(!open)}>
    <div className="reading-lab-head">
      <div><span className="eyebrow">// {ar ? 'مختبر القراءة' : 'READING LAB'}</span><h3>{ar ? 'جرّب تجربة القراءة العربية' : 'Explore Arabic reading comfort'}</h3><p>{ar ? 'غيّر حجم الخط والتباعد لترى كيف تتغيّر راحة القراءة.' : 'Adjust type size and spacing to see how they affect an Arabic interface.'}</p></div>
      <span className="reading-lab-end"><span className="reading-lab-live"><span />{ar ? 'تجربة مباشرة' : 'LIVE DEMO'}</span><span className="reading-lab-cta">{open ? (ar ? 'أغلق المختبر' : 'Close lab') : (ar ? 'افتح المختبر وجرّب' : 'Open the lab and try it')} <span className="reading-lab-chevron" aria-hidden="true">⌄</span></span></span>
    </div>
    </button>
    <div id="reading-lab-panel" className={'reading-lab-panel' + (open ? ' is-open' : '')} aria-hidden={!open} inert={open ? undefined : 'inert'}>
    <div className="reading-lab-panel-inner">
    <div className="reading-lab-controls">
      <label>{ar ? 'حجم الخط' : 'Type size'} <input type="range" min="20" max="38" value={size} onChange={e => setSize(Number(e.target.value))} aria-label={ar ? 'حجم الخط' : 'Type size'} /><strong>{size}px</strong></label>
      <label>{ar ? 'عرض السطر' : 'Line width'} <input type="range" min="24" max="48" value={width} onChange={e => setWidth(Number(e.target.value))} aria-label={ar ? 'عرض السطر' : 'Line width'} /><strong>{width}</strong></label>
      <div className="reading-lab-buttons" role="group" aria-label={ar ? 'تباعد السطور' : 'Line spacing'}>
        <button type="button" className={spacing === 'compact' ? 'is-active' : ''} onClick={() => setSpacing('compact')}>{ar ? 'متقارب' : 'Compact'}</button>
        <button type="button" className={spacing === 'comfortable' ? 'is-active' : ''} onClick={() => setSpacing('comfortable')}>{ar ? 'مريح' : 'Comfortable'}</button>
      </div>
      <button type="button" className={'reading-lab-focus' + (focus ? ' is-active' : '')} aria-pressed={focus} onClick={() => setFocus(!focus)}>{ar ? 'تركيز القراءة' : 'Reading focus'}</button>
      <button type="button" className="reading-lab-reset" onClick={() => { setSize(27); setWidth(32); setSpacing('comfortable'); setFocus(false); setSample(0); }}>{ar ? 'إعادة الضبط ↺' : 'Reset ↺'}</button>
    </div>
    <div className="reading-lab-samples" role="group" aria-label={ar ? 'نموذج النص' : 'Text sample'}>
      <span>{ar ? 'جرّب النص في:' : 'Try a:'}</span>
      {samples.map((item, i) => <button type="button" key={item.labelEn} className={sample === i ? 'is-active' : ''} aria-pressed={sample === i} onClick={() => setSample(i)}>{ar ? item.labelAr : item.labelEn}</button>)}
    </div>
    <div className={'reading-lab-preview' + (focus ? ' is-focused' : '')} dir="rtl" lang="ar" style={{ '--reading-size': `${size}px`, '--reading-leading': spacing === 'comfortable' ? 1.9 : 1.35, '--reading-width': `${width}ch` }}>
      <div key={sample} className="reading-lab-sample-content">
      <span className="reading-lab-kicker">{samples[sample].title}</span>
      <p>{samples[sample].text}</p>
      <small>جرّب الإعدادات لتجد ما يناسب قراءتك.</small>
      </div>
    </div>
    </div>
    </div>
  </div>;
}

export function ResearchSection() {
  const { education, patents, publications } = useContent();
  const { t } = useLang();
  const phd = education[0];
  const thesis = phd.details[0].replace(/^[^:]+:\s*/, '');
  return (
    <section id="research" className="section section-paper-2">
      <div className="research-glyphs" aria-hidden="true"><span>ع</span><span>َ</span><span>ـ</span></div>
      <div className="container">
        <SectionHead eyebrow={t('research.eyebrow')} title={t('research.title')} accent={t('research.accent')} />

        <figure className="thesis-callout reveal">
          <blockquote>{thesis}</blockquote>
          <figcaption className="mono">{phd.degree} · {phd.school} · {phd.start} – {phd.end} · {phd.details[1]}</figcaption>
        </figure>

        <ArabicReadingLab />

        <h3 className="sub-title">{t('research.education')}</h3>
        <div className="card-grid card-grid-2">
          {education.map((ed) => (
            <article key={ed.degree} className="paper-card reveal">
              <div className="mono muted">{ed.start} – {ed.end}</div>
              <h4 className="paper-card-title">{ed.degree}</h4>
              <div className="paper-card-sub">{ed.school} · {ed.location}</div>
              <ul className="dash-list">{ed.details.map((d) => <li key={d}>{d}</li>)}</ul>
            </article>
          ))}
        </div>

        <h3 className="sub-title">{t('research.patents')}</h3>
        <div className="card-grid card-grid-2">
          {patents.map((pt) => (
            <article key={pt.title} className="paper-card reveal">
              <span className={'status-pill ' + (pt.granted ? 'is-active' : 'is-progress')}>{pt.status}</span>
              <h4 className="paper-card-title">{pt.title}</h4>
              <div className="mono muted">{pt.number}</div>
              {pt.project && <Link className="text-link" to={'/projects/' + pt.project}>{t('research.related')}</Link>}
            </article>
          ))}
        </div>

        <h3 className="sub-title">{t('research.publications')} <span className="muted sub-note">{publications.note}</span></h3>
        <ol className="pub-list" dir="ltr" lang="en">
          {publications.items.map((pub) => (
            <li key={pub.title} className="reveal">
              <span className="pub-authors">{pub.authors} ({pub.year}).</span>{' '}
              <span className="pub-title">{pub.title}</span>{' '}
              <span className="pub-venue">{pub.venue}</span>
            </li>
          ))}
        </ol>
        <p className="mono">{t('research.fullList')} <a className="text-link ltr" href={publications.fullList.href} target="_blank" rel="noreferrer">{publications.fullList.label}</a></p>
      </div>
    </section>
  );
}

/* ── SPEAKING & MEDIA ───────────────────────────────────── */
export function SpeakingSection() {
  const { speaking } = useContent();
  const { t, lang } = useLang();
  const q = (text) => (lang === 'ar' ? `«${text}»` : `“${text}”`);
  return (
    <section id="speaking" className="section section-paper">
      <div className="container">
        <SectionHead eyebrow={t('speaking.eyebrow')} title={t('speaking.title')} accent={t('speaking.accent')} intro={speaking.note} />
        <ol className="talk-list">
          {speaking.talks.map((tk) => (
            <li key={tk.year + tk.event} className="talk reveal">
              <span className="talk-year mono">{tk.year}</span>
              <span className={'talk-type talk-type-' + tk.type.toLowerCase()}>{t('talk.' + tk.type)}</span>
              <span className="talk-title">{q(tk.title)}</span>
              <span className="talk-where mono">{tk.event} · {tk.city}</span>
            </li>
          ))}
        </ol>
        <h3 className="sub-title">{t('speaking.media')}</h3>
        <div className="card-grid card-grid-4">
          {speaking.media.map((m) => {
            const body = (
              <>
                <div className="eyebrow">{m.type}</div>
                <h4 className="paper-card-title">{m.kind === 'channel' ? m.title : q(m.title)}</h4>
                <div className="paper-card-sub">{m.outlet}</div>
                <div className="mono muted">{m.date}{m.extra ? ' · ' + m.extra : ''}</div>
              </>
            );
            return m.href
              ? <a key={m.href + m.date} className="paper-card paper-card-link reveal" href={m.href} target="_blank" rel="noreferrer">{body}<span className="mono text-link">{t('speaking.open')}</span></a>
              : <article key={m.outlet + m.date} className="paper-card reveal">{body}</article>;
          })}
        </div>
      </div>
    </section>
  );
}

/* ── LEADERSHIP, TEACHING & VOLUNTEERING ─────────────────── */
export function LeadershipSection() {
  const { leadership } = useContent();
  const { t } = useLang();
  return (
    <section id="leadership" className="section section-paper-2">
      <div className="container">
        <SectionHead eyebrow={t('lead.eyebrow')} title={t('lead.title')} accent={t('lead.accent')} intro={leadership.note} />
        <div className="card-grid card-grid-3">
          {leadership.items.map((l) => (
            <article key={l.period + l.role} className="paper-card reveal">
              <div className="mono muted">{l.period}</div>
              <h4 className="paper-card-title">{l.role}</h4>
              <div className="paper-card-sub">{l.org}</div>
              <p className="paper-card-copy">{l.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── RECOGNITION: awards + certifications ───────────────── */
const CERT_FILTERS = ['All', 'Active', 'Lifetime', 'Expired', 'In progress'];

export function statusClass(status) {
  if (status.startsWith('Active')) return 'is-active';
  if (status.startsWith('Lifetime')) return 'is-lifetime';
  if (status.startsWith('Expired')) return 'is-expired';
  return 'is-progress';
}

export function CertTable({ items }) {
  const { t, lang } = useLang();
  return (
    <div className="table-wrap">
      <table className="cert-table">
        <thead>
          <tr><th scope="col">{t('cert.name')}</th><th scope="col">{t('cert.issuer')}</th><th scope="col">{t('cert.year')}</th><th scope="col">{t('cert.status')}</th><th scope="col">{t('cert.id')}</th></tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.name}>
              <th scope="row" lang="en" dir="ltr">{c.name}</th>
              <td lang="en" dir="ltr">{c.issuer}</td>
              <td className="mono">{c.year || '—'}</td>
              <td>
                <span className={'status-pill ' + statusClass(c.status)}>{statusLabel(c.status, t)}</span>
                {c.statusNote && <span className="muted cert-note">{lang === 'ar' ? '، ' : ', '}{c.statusNote}</span>}
              </td>
              <td className="mono ltr">{c.id || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AwardList({ awards, compact }) {
  const { t } = useLang();
  return (
    <ol className={'award-list' + (compact ? ' is-compact' : '')}>
      {awards.map((a) => (
        <li key={a.year + a.title} className="award">
          <span className="award-year mono">{a.year}</span>
          <div>
            <div className="award-title">{a.title}</div>
            <div className="award-org">{a.org} · {a.for}</div>
          </div>
          {a.project && <Link className="text-link mono" to={'/projects/' + a.project}>{t('rec.project')}</Link>}
        </li>
      ))}
    </ol>
  );
}

export function RecognitionSection() {
  const { awards, certifications } = useContent();
  const { t } = useLang();
  const [certFilter, setCertFilter] = React.useState('All');
  const certs = certifications.items.filter((c) => certFilter === 'All' || c.status.startsWith(certFilter));
  return (
    <section id="recognition" className="section section-paper">
      <div className="container">
        <SectionHead eyebrow={t('rec.eyebrow')} title={t('rec.title')} intro={t('rec.intro', { count: awards.length })} />
        <div className="reveal"><AwardList awards={awards} /></div>

        <h3 className="sub-title">{t('rec.certs')} <span className="muted sub-note">{certifications.note}</span></h3>
        <div className="filter-row" role="group" aria-label={t('rec.filter')}>
          {CERT_FILTERS.map((f) => (
            <button key={f} type="button" className={'filter-btn' + (certFilter === f ? ' is-active' : '')} aria-pressed={certFilter === f} onClick={() => setCertFilter(f)}>{t('status.' + f)}</button>
          ))}
        </div>
        <CertTable items={certs} />
      </div>
    </section>
  );
}

/* ── SKILLS ─────────────────────────────────────────────── */
export function SkillsSection() {
  const { skills } = useContent();
  const { t } = useLang();
  const maxYears = Math.max(...skills.map((s) => s.years));
  return (
    <section id="skills" className="section section-paper-2">
      <div className="container">
        <SectionHead eyebrow={t('skills.eyebrow')} title={t('skills.title')} accent={t('skills.accent')} intro={t('skills.intro')} />
        <ul className="skill-list">
          {skills.map((s) => (
            <li key={s.years + s.area} className="skill reveal">
              <div className="skill-head">
                <h3 className="skill-area">{s.area}</h3>
                <span className={'level-pill level-' + s.level.toLowerCase()}>{t('level.' + s.level)}</span>
                <span className="mono muted">{t('skills.years', { n: s.years })}</span>
              </div>
              <div className="skill-bar" aria-hidden="true">
                <span style={{ width: (s.years / maxYears) * 100 + '%' }} />
              </div>
              <Chips items={s.tools} small />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── CONTACT ────────────────────────────────────────────── */
export function LanguagesList({ languages }) {
  return (
    <ul className="lang-list">
      {languages.map((l) => (
        <li key={l.name}><span>{l.name}</span><span className="muted">{l.level}{l.detail ? ' · ' + l.detail : ''}</span></li>
      ))}
    </ul>
  );
}

export function InterestsList({ interests }) {
  return (
    <ul className="lang-list">
      {interests.map((it) => (
        <li key={it.name}><span>{it.name}</span><span className="muted">{it.detail}</span></li>
      ))}
    </ul>
  );
}

export function ProfileLinks({ links }) {
  return (
    <ul className="link-grid">
      {links.map((l) => (
        <li key={l.id}>
          <a href={l.href} target="_blank" rel="noreferrer">
            <span className="link-label mono">{l.label}</span>
            <span className="link-handle ltr">{l.handle}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function ContactSection() {
  const { person, languages, interests } = useContent();
  const { t } = useLang();
  return (
    <section id="contact" className="section section-paper">
      <div className="container">
        <SectionHead eyebrow={t('contact.eyebrow')} title={t('contact.title')} accent={t('contact.accent')} />
        <div className="contact-grid">
          <div className="reveal">
            <a className="contact-email ltr" href={'mailto:' + person.email}>{person.email}</a>
            <p className="contact-line"><a className="text-link ltr" href={person.phoneHref}>{person.phone}</a> · {person.location}</p>
            <div className="about-actions">
              <a className="btn btn-ink" href={'mailto:' + person.email}>{t('contact.email')}</a>
              <a className="btn btn-ghost" href={cvHref(person)} download>{t('about.cv')}</a>
            </div>
            <ProfileLinks links={person.links} />
          </div>
          <div className="contact-side reveal">
            <h3 className="sub-title">{t('contact.languages')}</h3>
            <LanguagesList languages={languages} />
            <h3 className="sub-title">{t('contact.offclock')}</h3>
            <InterestsList interests={interests} />
          </div>
        </div>
      </div>
    </section>
  );
}
