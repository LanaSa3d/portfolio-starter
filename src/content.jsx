// Content layer: the site renders `cv` from src/data/cv.js.
// The admin page can keep an edited draft in this browser's localStorage, which
// previews live across tabs. Export turns the draft back into a cv.js file to commit.
import React from 'react'
import { cv as publishedCv } from './data/cv.js'
import { cvAr } from './data/cv.ar.js'
import { useLang, deepMerge, localizeDates } from './i18n.jsx'

export const DRAFT_KEY = 'yara_cv_draft';

const ContentContext = React.createContext(publishedCv);
const BaseContext = React.createContext(publishedCv);

const DATE_KEYS = new Set(['start', 'end', 'period', 'date']);

// Arabic content = English structure + Arabic strings, with month names localized.
function localizeTree(node, key) {
  if (Array.isArray(node)) return node.map((n) => localizeTree(n));
  if (node && typeof node === 'object') {
    return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, localizeTree(v, k)]));
  }
  return DATE_KEYS.has(key) ? localizeDates(node) : node;
}

export function toArabic(base) {
  return localizeTree(deepMerge(base, cvAr));
}

function readDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function ContentProvider({ children }) {
  const [draft, setDraft] = React.useState(readDraft);

  React.useEffect(() => {
    const onStorage = (e) => {
      if (e.key === DRAFT_KEY) setDraft(readDraft());
    };
    const onLocal = () => setDraft(readDraft());
    window.addEventListener('storage', onStorage);
    window.addEventListener('yara:draft', onLocal);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('yara:draft', onLocal);
    };
  }, []);

  const { lang } = useLang();
  const base = draft || publishedCv;
  const content = React.useMemo(() => (lang === 'ar' ? toArabic(base) : base), [lang, base]);

  return (
    <BaseContext.Provider value={base}>
      <ContentContext.Provider value={content}>
        {children}
      </ContentContext.Provider>
    </BaseContext.Provider>
  );
}

// Content in the visitor's language.
export function useContent() {
  return React.useContext(ContentContext);
}

// The English source (what the admin edits and exports).
export function useBaseContent() {
  return React.useContext(BaseContext);
}

export function hasDraft() {
  return readDraft() !== null;
}

export function saveDraft(next) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
  } catch (_) {}
  window.dispatchEvent(new Event('yara:draft'));
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (_) {}
  window.dispatchEvent(new Event('yara:draft'));
}

export function getPublishedCv() {
  return publishedCv;
}

// Produces a drop-in replacement for src/data/cv.js.
export function exportCvModule(data) {
  return [
    '// Single source of truth for every word of CV content on the site.',
    '// Source: "Yara_Al-Mansouri_CV.pdf" — Portfolio Summit 2026 (fictional CV, 8 pages).',
    '// Components read from this file; never hard-code CV text inside a component.',
    '',
    'export const cv = ' + JSON.stringify(data, null, 2) + ';',
    '',
  ].join('\n');
}
