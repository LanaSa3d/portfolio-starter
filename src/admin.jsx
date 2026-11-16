// /admin — edit every CV field in the browser.
// GitHub Pages is static, so edits are saved as a draft in this browser (previewed live on
// the site in other tabs). "Export cv.js" downloads a file to commit as src/data/cv.js.
import React from 'react'
import { Link } from 'react-router-dom'
import { useBaseContent, saveDraft, clearDraft, hasDraft, exportCvModule } from './content.jsx'
import { usePageMeta } from './layout.jsx'

// SHA-256 of the admin passphrase. This only keeps casual visitors out: a static
// site cannot protect anything, and the draft never leaves this browser anyway.
const ADMIN_HASH = '888dd7e49716014165d5f51d550682800ea309e51c27c95d1a5ce597cdbbd619';
const SESSION_KEY = 'yara_admin';

async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

const SECTIONS = [
  ['person', 'Profile & links'], ['summary', 'Summary'], ['highlights', 'Career highlights'],
  ['projects', 'Projects'], ['experience', 'Experience'], ['education', 'Education'],
  ['skills', 'Skills'], ['awards', 'Awards'], ['patents', 'Patents'],
  ['certifications', 'Certifications'], ['publications', 'Publications'], ['speaking', 'Speaking & media'],
  ['leadership', 'Leadership & teaching'], ['languages', 'Languages'], ['interests', 'Interests'],
];

const humanize = (key) => String(key).replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

// Empty copy of a value with the same shape, used for "add item".
function blankLike(value) {
  if (Array.isArray(value)) return [];
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, blankLike(v)]));
  if (typeof value === 'number') return 0;
  if (typeof value === 'boolean') return false;
  return '';
}

function itemTitle(item, i) {
  if (typeof item !== 'object' || !item) return String(item);
  return item.name || item.title || item.role || item.degree || item.area || item.text || item.label || item.file || `Item ${i + 1}`;
}

/* ── generic field editor ───────────────────────────────── */
function Field({ label, value, onChange, depth = 0 }) {
  if (typeof value === 'string') {
    const long = value.length > 70;
    return (
      <label className="adm-field">
        <span className="adm-label">{label}</span>
        {long
          ? <textarea value={value} rows={Math.min(8, Math.ceil(value.length / 70) + 1)} onChange={(e) => onChange(e.target.value)} />
          : <input value={value} onChange={(e) => onChange(e.target.value)} />}
      </label>
    );
  }
  if (typeof value === 'number') {
    return (
      <label className="adm-field">
        <span className="adm-label">{label}</span>
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
      </label>
    );
  }
  if (typeof value === 'boolean') {
    return (
      <label className="adm-field adm-check">
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
        <span className="adm-label">{label}</span>
      </label>
    );
  }
  if (Array.isArray(value)) return <ListField label={label} value={value} onChange={onChange} depth={depth} />;
  if (value && typeof value === 'object') {
    return (
      <fieldset className="adm-group">
        {label && <legend>{label}</legend>}
        {Object.entries(value).map(([k, v]) => (
          <Field key={k} label={humanize(k)} value={v} depth={depth + 1} onChange={(nv) => onChange({ ...value, [k]: nv })} />
        ))}
      </fieldset>
    );
  }
  return null;
}

function ListField({ label, value, onChange, depth }) {
  const [open, setOpen] = React.useState(null);
  const update = (i, v) => onChange(value.map((x, j) => (j === i ? v : x)));
  const remove = (i) => { if (window.confirm('Remove this item?')) onChange(value.filter((_, j) => j !== i)); };
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = value.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () => {
    const template = value.length ? blankLike(value[0]) : '';
    onChange([...value, template]);
    setOpen(value.length);
  };
  const simple = value.every((v) => typeof v === 'string');

  return (
    <div className="adm-list">
      <div className="adm-list-head">
        <span className="adm-label">{label || 'Items'} <span className="muted">({value.length})</span></span>
        <button type="button" className="adm-btn" onClick={add}>+ Add</button>
      </div>
      {value.map((item, i) => (
        <div key={i} className="adm-item">
          <div className="adm-item-head">
            {simple
              ? <input className="adm-inline" value={item} onChange={(e) => update(i, e.target.value)} aria-label={`${label || 'Item'} ${i + 1}`} />
              : <button type="button" className="adm-item-toggle" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>{open === i ? '▾' : '▸'} {itemTitle(item, i)}</button>}
            <div className="adm-item-actions">
              <button type="button" className="adm-icon" onClick={() => move(i, -1)} aria-label="Move up" disabled={i === 0}>↑</button>
              <button type="button" className="adm-icon" onClick={() => move(i, 1)} aria-label="Move down" disabled={i === value.length - 1}>↓</button>
              <button type="button" className="adm-icon adm-danger" onClick={() => remove(i)} aria-label="Remove">✕</button>
            </div>
          </div>
          {!simple && open === i && (
            <div className="adm-item-body">
              <Field label="" value={item} depth={depth + 1} onChange={(v) => update(i, v)} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── login ──────────────────────────────────────────────── */
function Login({ onAuth }) {
  const [pw, setPw] = React.useState('');
  const [err, setErr] = React.useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if ((await sha256(pw)) === ADMIN_HASH) {
      try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (_) {}
      onAuth();
    } else {
      setErr(true);
      setPw('');
    }
  };
  return (
    <main id="main" className="adm-login">
      <form className="adm-login-box" onSubmit={submit}>
        <div className="eyebrow">// admin</div>
        <h1 className="modal-title">Enter the passphrase</h1>
        <label className="adm-field">
          <span className="adm-label">Passphrase</span>
          <input type="password" autoFocus value={pw} onChange={(e) => { setPw(e.target.value); setErr(false); }} aria-invalid={err} aria-describedby={err ? 'adm-err' : undefined} />
        </label>
        {err && <p id="adm-err" className="adm-error" role="alert">That passphrase is not right.</p>}
        <button type="submit" className="btn btn-ink">Unlock</button>
        <Link to="/" className="text-link mono">← back to the site</Link>
      </form>
    </main>
  );
}

/* ── editor ─────────────────────────────────────────────── */
function Editor({ onLogout }) {
  const content = useBaseContent();
  const [section, setSection] = React.useState('person');
  const [savedAt, setSavedAt] = React.useState(null);
  const draftActive = hasDraft();

  const update = (key, value) => {
    saveDraft({ ...content, [key]: value });
    setSavedAt(new Date());
  };

  const exportFile = () => {
    const blob = new Blob([exportCvModule(content)], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cv.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    if (window.confirm('Discard all edits in this browser and go back to the published content?')) {
      clearDraft();
      setSavedAt(null);
    }
  };

  const label = SECTIONS.find(([k]) => k === section)?.[1];

  return (
    <main id="main" className="adm">
      <header className="adm-bar">
        <div>
          <div className="eyebrow">// admin</div>
          <strong>{content.person.displayName}</strong>
          <span className="muted mono adm-status">
            {draftActive ? (savedAt ? ` · draft saved ${savedAt.toLocaleTimeString()}` : ' · editing a draft') : ' · showing published content'}
          </span>
        </div>
        <div className="adm-bar-actions">
          <a className="btn btn-ghost" href={import.meta.env.BASE_URL} target="_blank" rel="noreferrer">Preview site ↗</a>
          <button type="button" className="btn btn-ink" onClick={exportFile}>Export cv.js</button>
          <button type="button" className="btn btn-ghost" onClick={reset} disabled={!draftActive}>Reset</button>
          <button type="button" className="btn btn-ghost" onClick={onLogout}>Log out</button>
        </div>
      </header>
      <p className="adm-help">
        Edits apply to the English source (the Arabic version is translated in src/data/cv.ar.js). Changes save automatically as a draft in this browser and show up live in any open tab of the site.
        To publish them for everyone, click <strong>Export cv.js</strong>, replace <code>src/data/cv.js</code> with the downloaded file, then commit and push.
      </p>
      <div className="adm-layout">
        <nav className="adm-nav" aria-label="Sections">
          {SECTIONS.map(([key, name]) => (
            <button key={key} type="button" className={'adm-nav-btn' + (section === key ? ' is-active' : '')} aria-current={section === key ? 'true' : undefined} onClick={() => setSection(key)}>
              {name}
            </button>
          ))}
        </nav>
        <section className="adm-panel" aria-label={label}>
          <h1 className="adm-panel-title">{label}</h1>
          <Field label="" value={content[section]} onChange={(v) => update(section, v)} />
        </section>
      </div>
    </main>
  );
}

export function AdminPage() {
  usePageMeta('Admin', 'Edit portfolio content.');
  const [authed, setAuthed] = React.useState(() => {
    try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch (_) { return false; }
  });
  const logout = () => {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (_) {}
    setAuthed(false);
  };
  return authed ? <Editor onLogout={logout} /> : <Login onAuth={() => setAuthed(true)} />;
}
