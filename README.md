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
  resume.pdf              # generated — see below
  images/                 # joseph-retro-clean.png (particle source)
  sounds/                 # UI click + form-success blips
resume/
  resume.html             # the resume source — edit this, not the PDF
  build-resume.mjs        # renders resume.html -> public/resume.pdf via headless Chrome
```

## Editing content

Nearly all copy lives as data, not markup:

- **Skills** — `src/data/skills.ts`. Groups render in order; add items freely.
  Keep `stack.txt` in `src/scripts/terminal.ts` roughly in sync (the shell prints it).
- **Experience** — `src/data/experience.ts`.
- **Projects** — `src/data/projects.ts`. The grid reflows on its own, and once a
  group passes 6 entries the extras collapse behind a `$ ls --all` toggle, so put
  the strongest work at the top. `live` / `repo` set to `null` simply hide that link.

## Resume

`public/resume.pdf` is generated, not hand-maintained. Edit `resume/resume.html`, then:

```bash
node resume/build-resume.mjs
```

It renders the HTML to `public/resume.pdf` with headless Chrome (auto-detects a local
Chrome or Edge install). The hero's "Download resume" button and the terminal's `resume`
command both serve that file.

**It is deliberately ATS-hardened, and the stylesheet says so at the top.** Verified with
pdf.js that the extracted text is clean and complete. Do not reintroduce any of these when
editing, or a parser will start mangling it:

| Never | Because |
|---|---|
| `letter-spacing` on headings | extracts as `S U M M A R Y` |
| `::before` / `::after` separators | renders, but lands unpredictably in the content stream |
| `text-align: justify` | variable word spacing makes extractors add/drop spaces |
| grid or multi-column content | scrambles reading order; skills are plain `Label: value` text |
| tables, images, text boxes | the classic ATS parse failures |

It targets Europe/UK — A4, British spelling, no photo, no date of birth, no marital status.
Keep it to one page; `resume/build-resume.mjs` prints the page count on every build.

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
