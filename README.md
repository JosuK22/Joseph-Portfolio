# Joseph K Anoj — Portfolio

Retro phosphor-terminal portfolio. Static [Astro](https://astro.build) site, served at **josephk.dev**.

## Run it

```bash
npm install
npm run dev      # local dev server at http://localhost:4321
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Structure

```
src/
  layouts/Base.astro      # <head>, fonts, global.css, scanline overlay, skip link, boot flag
  pages/index.astro       # composes the sections
  components/             # Nav, Hero, About, Skills, Experience, Projects, Education, Contact, Footer
  data/                   # skills.ts, experience.ts, projects.ts  (content as data)
  scripts/
    hero-particles.ts     # the portrait-as-particles canvas in the hero
    secrets.ts            # easter-egg triggers (loads arcade.ts on demand)
    arcade.ts             # snake / breakout / invaders
    terminal.ts           # the ctrl+K command palette
  styles/global.css       # design tokens + all styling + responsive
public/
  favicon.svg             # phosphor terminal glyph
  og.png                  # social link-preview card (1200x630)
  resume.pdf              # the live CV download — see below
  images/                 # joseph-retro-clean.png (particle source)
  sounds/                 # UI click + form-success blips
resume/
  Joseph-K-Anoj-Frontend-Engineer-CV.pdf   # the live CV; copied to public/resume.pdf
  resume.html             # HTML resume generator source (superseded — see below)
  build-resume.mjs        # renders resume.html -> a PDF via headless Chrome
emailjs/
  notification-template.html   # EmailJS template source (git-ignored, local only)
```

## Editing content

Nearly all copy lives as data, not markup:

- **Skills** — `src/data/skills.ts`. Groups render in order; add items freely.
  Keep `stack.txt` in `src/scripts/terminal.ts` roughly in sync (the shell prints it).
- **Experience** — `src/data/experience.ts`.
- **Projects** — `src/data/projects.ts`. The section is a progressive-disclosure
  archive: `[ personal ]` / `[ client ]` tabs, and a collapsed card showing only
  `name`, `tagline`, `type`, `status`/`year` and `tags` (2–4 technologies). Every
  other field renders after a click, and only when it has a value — so add
  `built`, `features`, `architecture`, `context` or `nextRelease` where a project
  has one, and leave them out where it does not. Counts and index numbers come
  from the arrays, `featured: true` gives one project a slightly stronger card,
  and `live` / `repo` / `npm` / `docs` set to `null` or omitted hide that link.

## Resume

The live download is a **hand-authored CV**, not generated:

```
resume/Joseph-K-Anoj-Frontend-Engineer-CV.pdf   <- the real source of truth
public/resume.pdf                               <- a copy of it; this is what ships
```

To update it: edit the CV in whatever tool authored it, export a fresh PDF over
`resume/Joseph-K-Anoj-Frontend-Engineer-CV.pdf`, then copy it into place:

```bash
cp resume/Joseph-K-Anoj-Frontend-Engineer-CV.pdf public/resume.pdf
```

`resume/Joseph-K-Anoj-Frontend-Developer-CV.pdf` is the previous CV — superseded,
and no longer shipped.

It stays served at `/resume.pdf` so existing links and bookmarks keep working, but the
hero button and the terminal's `resume` command both set `download=` so it saves under the
real CV filename. Both paths read the same file — there is only one place to update.

### The HTML resume generator (superseded, kept for reference)

`resume/resume.html` + `build-resume.mjs` render an alternative ATS-hardened one-pager with
headless Chrome. It is **no longer what ships**, so it now writes to
`resume/generated-resume.pdf` by default and needs an explicit flag to go live:

```bash
node resume/build-resume.mjs             # preview only, touches nothing live
node resume/build-resume.mjs --publish   # overwrites public/resume.pdf
```

That guard exists because the script used to write straight to `public/resume.pdf` and
would have silently replaced the real CV. If you settle on the hand-authored CV for good,
deleting `resume/resume.html` and `resume/build-resume.mjs` is safe.

If you ever go back to the generated one, these constraints are what keep it ATS-parseable
(verified with pdf.js) and are documented in the stylesheet header too:

| Never | Because |
|---|---|
| `letter-spacing` on headings | extracts as `S U M M A R Y` |
| `::before` / `::after` separators | renders, but lands unpredictably in the content stream |
| `text-align: justify` | variable word spacing makes extractors add/drop spaces |
| grid or multi-column content | scrambles reading order; skills are plain `Label: value` text |
| tables, images, text boxes | the classic ATS parse failures |

## Contact form

Submissions go through [EmailJS](https://www.emailjs.com) — no backend needed for a static
site. The service / template / public-key IDs sit at the top of `src/components/Contact.astro`
and are passed to the form as data attributes. EmailJS public keys are meant to be
client-visible; restrict allowed origins in the EmailJS dashboard rather than trying to hide
the key. Mail lands at josephkanoj@gmail.com without the address appearing in the page
source. A honeypot field catches naive bots, and if the IDs are ever blanked the form
degrades to a friendly "email me directly" message.

## Theme tokens

All colors live as CSS custom properties at the top of `src/styles/global.css`
(`--bg`, `--panel`, `--border`, `--text`, `--muted`, `--accent`, `--link`, `--link-hover`).
Bright green `--accent` is reserved for the name and section headers; amber `--link` is the
only interactive color. Adjust there to retune the whole site.

## Easter eggs

Three games hide on the page, each behind its own trigger (see `src/scripts/secrets.ts`).
`ctrl` + `K` opens a real shell — `help` lists the ordinary commands and admits the games
exist without naming them. The arcade bundle is dynamically imported, so it costs nothing
until something is found.

## Notes

- Ships **zero framework JS** — the runtime is a nav toggle, the form handler, the particle
  canvas, and the easter eggs.
- Everything animated respects `prefers-reduced-motion`, including the boot sequence, the
  scroll reveals, and the blinking cursor.
- Nav collapses to a hamburger at 880px; the main layout breakpoint is ~720px.

## Deploy

Push to GitHub, then import the repo into Netlify / Vercel / Cloudflare Pages. They auto-detect
Astro (build `npm run build`, output `dist`). Point `josephk.dev` at the host and you're live.
