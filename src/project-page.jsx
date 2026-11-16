// Case-study page for one project: /projects/:slug
import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { useContent } from './content.jsx'
import { usePageMeta, Footer } from './layout.jsx'
import { resolveGallery } from './images.js'
import { ProjectGalleryOverlayEnhanced } from './gallery.jsx'
import { Chips, useReveal } from './home-sections.jsx'
import { NotFound } from './not-found.jsx'
import { useLang } from './i18n.jsx'
import { ProjectMark } from './marks.jsx'

function GitHubIcon() { return <svg viewBox="0 0 24 24" width="27" height="27" aria-hidden="true"><path fill="currentColor" d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.08c-3.2.69-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.33.95.1-.74.4-1.24.73-1.52-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .96-.31 3.14 1.18A10.9 10.9 0 0 1 12 6.23c.97 0 1.94.13 2.85.38 2.18-1.49 3.14-1.18 3.14-1.18.62 1.59.23 2.77.11 3.06.73.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.41-5.25 5.7.41.36.77 1.06.77 2.14v3.17c0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" /></svg>; }

export function ProjectPage() {
  const { slug } = useParams();
  const cv = useContent();
  const { t, lang } = useLang();
  const index = cv.projects.findIndex((p) => p.slug === slug);
  const p = cv.projects[index];

  usePageMeta(
    p ? `${p.name} | ${cv.person.displayName}` : `Not found | ${cv.person.displayName}`,
    p ? `${p.name}: ${p.problem} ${p.result}` : undefined
  );
  useReveal(slug);
  React.useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  const [galleryIndex, setGalleryIndex] = React.useState(null);

  if (!p) return <NotFound />;

  const gallery = resolveGallery(p);
  const cover = gallery[0];
  const prev = cv.projects[(index - 1 + cv.projects.length) % cv.projects.length];
  const next = cv.projects[(index + 1) % cv.projects.length];
  const relatedAward = cv.awards.find((a) => a.project === p.slug);
  const relatedPatent = cv.patents.find((pt) => pt.project === p.slug);
  const githubProfile = cv.person.links?.find((link) => link.id === 'github');

  return (
    <>
      <main id="main" key={slug} className="case" style={{ '--project-accent': p.accent }}>
        <div className="case-entry-line" aria-hidden="true" />
        <div className="container">
          <nav className="breadcrumb mono" aria-label="Breadcrumb">
            <Link to="/">{t('case.home')}</Link> <span aria-hidden="true">/</span> <Link to="/#projects">{t('case.work')}</Link> <span aria-hidden="true">/</span> <span aria-current="page">{p.shortName || p.name}</span>
          </nav>

          <header className="case-head reveal">
            <div className="eyebrow">// {t('case.eyebrow', { org: p.org })}</div>
            <h1 className="case-title"><ProjectMark slug={p.slug} />{p.name}</h1>
            <p className="case-tagline">{p.tagline}</p>
            <dl className="case-meta">
              <div><dt>{t('case.role')}</dt><dd>{p.role}</dd></div>
              <div><dt>{t('case.team')}</dt><dd>{p.team}</dd></div>
              <div><dt>{t('case.when')}</dt><dd>{p.period}</dd></div>
              <div><dt>{t('case.where')}</dt><dd>{p.org}</dd></div>
            </dl>
            <div className="case-links mono">
              {p.link && <a className="case-source-link ltr" href={p.link.href} target="_blank" rel="noreferrer" aria-label={lang === 'ar' ? 'المشروع على GitHub' : 'View project on GitHub'}><GitHubIcon /><span>{lang === 'ar' ? 'المشروع على GitHub' : 'Project on GitHub'}</span><span aria-hidden="true">↗</span></a>}
              {githubProfile && !p.link && <a className="case-source-link ltr" href={githubProfile.href} target="_blank" rel="noreferrer" aria-label={lang === 'ar' ? 'ملف GitHub' : 'GitHub profile'}><GitHubIcon /><span>{lang === 'ar' ? 'ملف GitHub' : 'GitHub profile'}</span><span aria-hidden="true">↗</span></a>}
            </div>
          </header>

          {cover && (
            <button type="button" className="case-cover reveal" onClick={() => setGalleryIndex(0)} aria-label={t('projects.openGallery', { name: p.name })}>
              <img src={cover.url} alt={cover.alt} width="1600" height="1000" />
            </button>
          )}

          <section className="case-story" aria-label={t('case.story')}>
            <article className="case-step reveal">
              <div className="case-step-num mono">01</div>
              <h2>{t('label.problem')}</h2>
              <p>{p.problem}</p>
            </article>
            <article className="case-step reveal">
              <div className="case-step-num mono">02</div>
              <h2>{t('label.action')}</h2>
              <p>{p.action}</p>
            </article>
            <article className="case-step reveal">
              <div className="case-step-num mono">03</div>
              <h2>{t('label.result')}</h2>
              <p>{p.result}</p>
            </article>
          </section>

          {p.metrics?.length > 0 && (
            <ul className="case-metrics reveal" aria-label={t('case.numbers')}>
              {p.metrics.map((m) => (
                <li key={m.label}><span className="case-metric-value">{m.value}</span><span className="case-metric-label">{m.label}</span></li>
              ))}
            </ul>
          )}

          {(relatedAward || relatedPatent) && (
            <div className="case-recognition reveal">
              {relatedAward && <p>★ <strong>{relatedAward.title}</strong> · {relatedAward.org} · {relatedAward.year}</p>}
              {relatedPatent && <p>◆ <strong>{relatedPatent.title}</strong> · {relatedPatent.number} · {relatedPatent.status}</p>}
            </div>
          )}

          <section className="case-tech reveal" aria-label={t('case.tech')}>
            <h2 className="sub-title">{t('case.tech')}</h2>
            <Chips items={p.tech} />
          </section>

          {gallery.length > 1 && (
            <section aria-label={t('case.gallery')}>
              <h2 className="sub-title">{t('case.gallery')}</h2>
              <div className="case-gallery" dir="ltr">
                {gallery.map((g, i) => (
                  <figure key={g.url} className="case-shot reveal">
                    <button type="button" onClick={() => setGalleryIndex(i)} aria-label={t('case.openImage', { caption: g.caption })}>
                      <img src={g.url} alt={g.alt} loading="lazy" width="1600" height="1000" />
                    </button>
                    <figcaption>{g.caption}</figcaption>
                  </figure>
                ))}
              </div>
              <p className="muted mono case-disclaimer">{t('case.disclaimer')}</p>
            </section>
          )}

          <nav className="case-pager" aria-label={t('case.more')}>
            <Link to={'/projects/' + prev.slug} className="case-pager-link">
              <span className="mono muted">{t('case.prev')}</span>
              <span className="case-pager-project"><ProjectMark slug={prev.slug} />{prev.name}</span>
            </Link>
            <Link to={'/projects/' + next.slug} className="case-pager-link is-next">
              <span className="mono muted">{t('case.next')}</span>
              <span className="case-pager-project"><ProjectMark slug={next.slug} />{next.name}</span>
            </Link>
          </nav>
        </div>
      </main>
      <Footer />
      {galleryIndex !== null && (
        <div dir="ltr">
          <ProjectGalleryOverlayEnhanced
            projectName={p.name}
            items={gallery}
            activeIndex={galleryIndex}
            onChangeIndex={setGalleryIndex}
            onClose={() => setGalleryIndex(null)}
          />
        </div>
      )}
    </>
  );
}
