/**
 * Renders resume.html to a PDF using whatever Chromium-based browser is
 * already on this machine. No puppeteer, no 300 MB download — the portfolio
 * ships zero framework JS and the resume build stays as light.
 *
 *   node resume/build-resume.mjs             -> resume/generated-resume.pdf
 *   node resume/build-resume.mjs --publish   -> public/resume.pdf (goes live)
 *
 * IMPORTANT: the live download at public/resume.pdf is currently a
 * hand-authored CV (resume/Joseph-K-Anoj-Frontend-Developer-CV.pdf), NOT the
 * output of this script. So this no longer writes there by default — doing so
 * would silently replace the real CV with a stale generated one. Pass
 * --publish only when you actually intend this HTML to become the live file.
 *
 * Page size, margins and the "print backgrounds" behaviour all come from the
 * @page rule inside resume.html, so this script never has to know the layout.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, 'resume.html');

const publish = process.argv.includes('--publish');
const output = publish
  ? resolve(here, '..', 'public', 'resume.pdf')
  : resolve(here, 'generated-resume.pdf');

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

const browser = CANDIDATES.find((p) => existsSync(p));
if (!browser) {
  console.error(
    'No Chrome/Edge found. Install one, or point CHROME_PATH at the executable:\n' +
      '  CHROME_PATH="/path/to/chrome" node resume/build-resume.mjs'
  );
  process.exit(1);
}

if (!existsSync(source)) {
  console.error(`Missing source: ${source}`);
  process.exit(1);
}

mkdirSync(dirname(output), { recursive: true });

execFileSync(
  browser,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--no-pdf-header-footer',
    `--print-to-pdf=${output}`,
    pathToFileURL(source).href,
  ],
  { stdio: 'inherit' }
);

const { size } = statSync(output);

// The resume must stay one page — surface the count on every build so a
// content edit that silently spills onto page two is caught immediately.
const pdf = readFileSync(output).toString('latin1');
const pages = pdf.match(/\/Type\s*\/Pages[^>]*?\/Count\s+(\d+)/)?.[1] ?? '?';

console.log(`✓ ${output}  (${(size / 1024).toFixed(0)} KB, ${pages} page(s))  via ${browser}`);
if (pages !== '1') {
  console.warn(`  ! Expected 1 page, got ${pages}. Trim content or spacing in resume.html.`);
}
if (!publish) {
  console.log('  (preview only — the live download is unchanged. Use --publish to replace it.)');
}
