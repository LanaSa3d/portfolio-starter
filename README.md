# Yara Al-Mansouri · Portfolio

**Live site:** `https://LanaSa3d.github.io/portfolio-starter/`

Portfolio Summit 2026 submission (GDG on Campus × KABi, Al Yamamah University).
Team: **Team 13** · Members: Lana Saad, Aseel Nofal, Elia Alsaqqa, Layan Alzahrani.

The site turns the fictional CV provided by the organizers (Yara Saud Al-Mansouri, PhD) into an interactive portfolio: an illustrated top-down desk you can click around, followed by her career told as a story.

## Features

- **Interactive desk hero.** Pinned notes, a laptop, a phone, a film camera, an ink pot and reed pen, a chess knight, a half-marathon medal and a coffee mug. Each one opens part of her story, and every one works with the keyboard.
- **Every section of the CV:** summary, career highlights, 8 projects, 12 roles, education, thesis, patents, publications, talks and media, teaching and leadership, 10 awards, 20 certifications, skills, languages and interests.
- **A case-study page for each project** at `/projects/<slug>`, telling problem → action → result with key numbers, technologies and a gallery.
- **Illustrative project screens** recreated for this portfolio, since the CV came without images.
- **Themes:** light (Mizan green), dark and sand, saved per visitor. Desk tweaks change the laptop and phone screens.
- **Accessibility:** skip link, keyboard navigation for the desk and dialogs, focus trapping in dialogs, `prefers-reduced-motion` support, WCAG AA colour contrast.
- **Admin page at `/admin`:** edits every CV field in the browser with a live preview. **Export cv.js** downloads the updated content file to commit.
- **Downloadable CV** (the original PDF).

## Tech stack

React 18 · Vite 5 · React Router 6 · plain CSS with custom properties · Vitest + Testing Library · GitHub Pages (GitHub Actions).

## Project structure

| Path | What it holds |
| --- | --- |
| `src/data/cv.js` | **All CV content.** Components never hard-code CV text. |
| `src/home.jsx`, `src/home-sections.jsx` | Home page: desk hero and sections |
| `src/scene.jsx` | The illustrated desk (SVG) |
| `src/project-page.jsx` | Case-study page for each project |
| `src/admin.jsx`, `src/content.jsx` | Admin editor and the draft/preview content layer |
| `src/assets/projects/<slug>/` | Project gallery images |
| `src/cv.test.js` | Checks the content against the CV (counts for every section) |

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm test
npm run build
```

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`: install, test, build with the repo base path, then publish to GitHub Pages. One-time setup in the fork: enable workflows in the **Actions** tab, then set **Settings → Pages → Source** to **GitHub Actions**.

## Editing content

Open `/admin` and edit any section. The changes show up live on the site in the same browser. Click **Export cv.js**, replace `src/data/cv.js` with the downloaded file, then commit and push.

---

The CV, its people, companies, links and credential IDs are fictional and were provided by the Portfolio Summit organizers.
