// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from "@astrojs/cloudflare";

// Static site (Astro's default output). Hosted at the apex domain josephk.dev,
// so `site` is set for correct canonical URLs / sitemap — and no `base` is
// needed because the site lives at the domain root (not a /repo subpath).
export default defineConfig({
  site: 'https://josephk.dev',
  adapter: cloudflare()
});