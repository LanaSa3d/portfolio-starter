import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './app.jsx';
import { ContentProvider, DRAFT_KEY } from './content.jsx';
import { cv } from './data/cv.js';
import { LangProvider } from './i18n.jsx';

function installMatchMedia(coarsePointer = false) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: coarsePointer ? query.includes('pointer: coarse') || query.includes('max-width') : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }));
}

function renderAt(path, lang = 'en') {
  return render(
    <LangProvider initial={lang}>
      <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ContentProvider>
          <App />
        </ContentProvider>
      </MemoryRouter>
    </LangProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  window.__tweaks = { palette: 'mizan', laptop: 'code', phone: 'apps' };
  window.scrollTo = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
  installMatchMedia(false);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

test('home renders her name, titles and every CV section', () => {
  renderAt('/');
  expect(screen.getByRole('heading', { level: 1, name: cv.person.name.replace(/,?\s*PhD$/i, '') })).toBeInTheDocument();
  ['about', 'projects', 'experience', 'research', 'speaking', 'leadership', 'recognition', 'skills', 'contact'].forEach((id) => {
    expect(document.getElementById(id), id).toBeInTheDocument();
  });
  cv.projects.forEach((p) => expect(screen.getAllByText(p.name).length).toBeGreaterThan(0));
  cv.experience.forEach((e) => expect(screen.getAllByText(e.role).length).toBeGreaterThan(0));
});

test('Arabic mode sets RTL and renders the Arabic name', () => {
  renderAt('/', 'ar');
  expect(document.documentElement.dir).toBe('rtl');
  expect(screen.getByRole('heading', { level: 1, name: 'د. يارا سعود المنصوري' })).toBeInTheDocument();
});

test('no trace of the reference portfolio owner', () => {
  const { container } = renderAt('/');
  // Names from the reference portfolio this site was adapted from (base64 so the repo stays clean).
  const reference = new RegExp(atob('YWJkdWxyYWhtYW58YWxhYXNpfHlhbWFtZXI='), 'i');
  expect(container.textContent).not.toMatch(reference);
});

test('clicking the mug spawns one companion and dismissing it restores the mug', async () => {
  renderAt('/');
  const mug = await screen.findByLabelText(/spawn a companion/i);
  fireEvent.click(mug);
  fireEvent.click(mug);
  expect(await screen.findAllByLabelText(/^desk companion$/i)).toHaveLength(1);
  fireEvent.click(screen.getByLabelText(/^desk companion$/i));
  expect(await screen.findByLabelText(/spawn a companion/i)).toBeInTheDocument();
});

test('desk cards are keyboard accessible and open the certifications dialog', async () => {
  renderAt('/');
  const certs = screen.getByRole('button', { name: 'Certifications' });
  fireEvent.keyDown(certs, { key: 'Enter' });
  const dialog = await screen.findByRole('dialog', { name: /20 certifications/i });
  expect(within(dialog).getAllByRole('row')).toHaveLength(21);
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(screen.queryByRole('dialog', { name: /20 certifications/i })).not.toBeInTheDocument();
});

test('the camera opens interests and languages', async () => {
  renderAt('/');
  fireEvent.keyDown(screen.getByLabelText(/film camera/i), { key: 'Enter' });
  const dialog = await screen.findByRole('dialog', { name: /interests and languages/i });
  cv.interests.forEach((i) => expect(within(dialog).getByText(i.name)).toBeInTheDocument());
});

test('certification filter shows only expired ones', () => {
  renderAt('/');
  const section = document.getElementById('recognition');
  fireEvent.click(within(section).getByRole('button', { name: 'Expired' }));
  const rows = within(section).getAllByRole('row').slice(1);
  expect(rows).toHaveLength(cv.certifications.items.filter((c) => c.status.startsWith('Expired')).length);
});

test('each project has a case-study page with problem, action and result', () => {
  cv.projects.forEach((p) => {
    renderAt('/projects/' + p.slug);
    expect(screen.getByRole('heading', { level: 1, name: p.name })).toBeInTheDocument();
    expect(screen.getByText(p.problem)).toBeInTheDocument();
    expect(screen.getByText(p.action)).toBeInTheDocument();
    expect(screen.getByText(p.result)).toBeInTheDocument();
    cleanup();
  });
});

test('unknown routes show the 404 page', () => {
  renderAt('/projects/does-not-exist');
  expect(screen.getByRole('heading', { name: /wrong turn/i })).toBeInTheDocument();
});

test('mobile menu opens and closes', () => {
  renderAt('/');
  fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
  expect(document.getElementById('mobile-menu')).toBeInTheDocument();
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(document.getElementById('mobile-menu')).not.toBeInTheDocument();
});

test('admin rejects a wrong passphrase', async () => {
  renderAt('/admin');
  fireEvent.change(screen.getByLabelText(/passphrase/i), { target: { value: 'wrong' } });
  fireEvent.click(screen.getByRole('button', { name: /unlock/i }));
  expect(await screen.findByRole('alert')).toHaveTextContent(/not right/i);
});

test('an admin draft previews live on the site', () => {
  localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...cv, summary: 'Draft summary for preview.' }));
  renderAt('/');
  expect(screen.getByText('Draft summary for preview.')).toBeInTheDocument();
});

test('admin editor saves edits as a draft', () => {
  sessionStorage.setItem('yara_admin', '1');
  renderAt('/admin');
  fireEvent.click(screen.getByRole('button', { name: 'Summary' }));
  const box = screen.getByDisplayValue(cv.summary);
  fireEvent.change(box, { target: { value: 'Edited summary.' } });
  expect(JSON.parse(localStorage.getItem(DRAFT_KEY)).summary).toBe('Edited summary.');
});
