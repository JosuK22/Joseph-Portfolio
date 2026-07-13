# Joseph K Anoj — Portfolio

Retro phosphor-terminal portfolio. Static [Astro](https://astro.build) site, intended for **josephk.dev**.

## Run it

```bash
npm install
npm run dev      # local dev server at http://localhost:4321
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Before you go live — 3 quick edits

1. **Resume** — replace `public/resume.pdf` with your real PDF (a placeholder is there now).
2. **Project links** — open `src/data/projects.ts` and set the real `live` / `repo` URLs.
   Any left as `null` simply won't render that link. Also confirm which projects belong
   in the `client` vs `personal` group.
3. **Contact form** — get a free access key at <https://web3forms.com> and paste it into
   `WEB3FORMS_ACCESS_KEY` at the top of `src/components/Contact.astro`. Submissions email
   straight to josephkanoj@gmail.com; your address is never exposed in the page source.
   Until the key is set, the form shows a friendly "email me directly" message.

Also double-check the GitHub / LinkedIn URLs (currently `github.com/josephkanoj` and
`linkedin.com/in/josephkanoj`) across `Nav.astro`, `Hero.astro`, and `Contact.astro`.

## Structure

```
src/
  layouts/Base.astro      # <head>, fonts, global.css, scanline overlay, skip link
  pages/index.astro       # composes the sections
  components/             # Nav, Hero, About, Skills, Experience, Projects, Education, Contact, Footer
  data/                   # skills.ts, experience.ts, projects.ts  (content as data)
  styles/global.css       # design tokens + all styling + hover animations + responsive
public/
  favicon.svg             # phosphor terminal glyph
  resume.pdf              # placeholder — replace
```

## Theme tokens

All colors live as CSS custom properties at the top of `src/styles/global.css`
(`--bg`, `--panel`, `--border`, `--text`, `--muted`, `--accent`, `--link`, `--link-hover`).
Bright green `--accent` is reserved for the name and section headers; amber `--link` is the
only interactive color. Adjust there to retune the whole site.

## Notes

- Ships **zero framework JS**; the only scripts are a tiny nav toggle and the form handler.
- Hover micro-interactions (card lift, button glow, link/arrow nudges) all respect
  `prefers-reduced-motion`, which also disables the blinking cursor.
- Breakpoint is ~720px (desktop ↔ mobile); the hero name scales fluidly with `clamp()`.

## Deploy

Push to GitHub, then import the repo into Netlify / Vercel / Cloudflare Pages. They auto-detect
Astro (build `npm run build`, output `dist`). Point `josephk.dev` at the host and you're live.
