import React from 'react'
import { Link } from 'react-router-dom'
import { usePageMeta } from './layout.jsx'
import { useLang } from './i18n.jsx'

export function NotFound() {
  const { t } = useLang();
  usePageMeta(t('nf.accent'), t('nf.intro'));
  return (
    <main id="main" className="not-found">
      <div className="container">
        <div className="eyebrow">// 404</div>
        <h1 className="section-title">{t('nf.title')} <em>{t('nf.accent')}</em></h1>
        <p className="section-intro">{t('nf.intro')}</p>
        <div className="about-actions">
          <Link to="/" className="btn btn-ink">{t('nf.home')}</Link>
          <Link to="/#projects" className="btn btn-ghost">{t('nf.work')}</Link>
        </div>
      </div>
    </main>
  );
}
