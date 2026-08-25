/**
 * The command palette — a real shell, in a window, over the whole site.
 *
 * Opened with ctrl/cmd + K from anywhere, or by tapping the prompt in the
 * footer. That second door matters: ctrl+K doesn't exist on a phone, and the
 * shell is the only way a touch device can reach two of the three arcade
 * secrets (see secrets.ts — both are keyboard-only out on the page).
 *
 * It does three jobs:
 *   1. Navigation — `cd projects`, `ls`, `cat about.txt` for people who'd
 *      rather type than scroll. Navigating closes the window so you actually
 *      see where you landed.
 *   2. A keyboard on touch devices, per above: `snake` and `uuddlrlrba` are
 *      typeable paths to games that scrolling alone can't offer.
 *   3. A breadcrumb. `help` never names the games — it only admits they're
 *      there. The riddles stay in arcade.ts where the locked tabs show them.
 *
 * arcade.ts is dynamically imported on first launch, so the games stay out of
 * this bundle exactly as they do for secrets.ts.
 */

import type { GameId } from './arcade';

/** Mirrors FOUND_KEY in arcade.ts — duplicated on purpose so reading
 *  discovery state doesn't pull the whole arcade module into this bundle. */
const FOUND_KEY = 'jk-arcade-found';

const SECTIONS = ['about', 'skills', 'experience', 'projects', 'education', 'contact'] as const;

const FILES: Record<string, string[]> = {
  'about.txt': [
    'Joseph K Anoj — full stack developer, frontend specialist.',
    'Builds fast, accessible, responsive interfaces in React and Astro.',
    'Based in India · open to remote & relocation.',
  ],
  'contact.txt': [
    'email     josephkanoj@gmail.com',
    'whatsapp  +91 97447 88125',
    'github    github.com/JosuK22',
    'linkedin  linkedin.com/in/joseph-k-anoj',
  ],
  'stack.txt': [
    'languages  TypeScript · JavaScript · Java · Python · SQL',
    'frontend   React · Next.js · Astro · Vite · react-three-fiber',
    'styling    Tailwind · Sass · shadcn/ui · MUI · design systems',
    'backend    Node.js · Express · REST · MongoDB · PostgreSQL · Supabase',
    'devops     GitHub Actions · Azure SWA · Vercel · Playwright',
  ],
};

type Line = { text: string; cls?: 'out' | 'muted' | 'err' | 'accent' };

interface Ctx {
  print(lines: Line[] | string[]): void;
  clear(): void;
  history: string[];
  /** Section id a command wants to travel to. The shell performs the scroll
   *  itself, after closing — the open window holds a scroll lock on <body>,
   *  so scrolling from inside a command would fight it. */
  navigateTo: string | null;
}

const out = (text: string): Line => ({ text, cls: 'out' });
const muted = (text: string): Line => ({ text, cls: 'muted' });
const err = (text: string): Line => ({ text, cls: 'err' });
const accent = (text: string): Line => ({ text, cls: 'accent' });

let opening = false;

/** Set by the shell so a launching game can take the screen from it. */
let dismiss: () => void = () => {};

async function launch(id: GameId): Promise<void> {
  if (opening || document.body.classList.contains('arcade-open')) return;
  opening = true;
  try {
    const { openArcade } = await import('./arcade');
    // Two stacked modals would mean two Escape handlers and two focus
    // traps — the arcade gets the screen to itself.
    dismiss();
    openArcade(id);
  } finally {
    opening = false;
  }
}

function found(): GameId[] {
  try {
    const raw = JSON.parse(localStorage.getItem(FOUND_KEY) ?? '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function go(id: string, ctx: Ctx): void {
  const el = document.getElementById(id);
  if (!el) {
    ctx.print([err(`no such section: ${id}`)]);
    return;
  }
  ctx.print([muted(`→ ${id}`)]);
  ctx.navigateTo = id;
}

/** Shared by `ls /usr/games` and the bare `games` command. */
function listGames(ctx: Ctx): void {
  const f = new Set(found());
  const all: GameId[] = ['snake', 'breakout', 'invaders'];
  ctx.print([
    muted('/usr/games:'),
    ...all.map((id) => (f.has(id) ? accent(`  ${id}.exe`) : out('  ???'))),
    muted(''),
    muted(
      f.size === all.length
        ? '  all three found. type a name to play.'
        : '  the ones you have found run by name. the rest are still hiding.'
    ),
  ]);
}

function openUrl(url: string, ctx: Ctx, label: string): void {
  window.open(url, '_blank', 'noopener');
  ctx.print([muted(`opening ${label}...`)]);
}

interface Command {
  /** Marks the command public: listed by `help` and offered by tab
   *  completion. Omit to leave it undiscoverable except by typing it. */
  help?: string;
  run(args: string[], ctx: Ctx): void | Promise<void>;
}

const COMMANDS: Record<string, Command> = {
  help: {
    help: 'you are here',
    run: (_a, ctx) => {
      const width = 10;
      const rows: [string, string][] = [
        ['ls', 'list the sections of this site'],
        ['cd <name>', 'jump to a section (or `cd ~` for the top)'],
        ['cat <file>', 'print a file — try `ls` first'],
        ['whoami', 'the short version'],
        ['resume', 'download the pdf'],
        ['email', 'start a message'],
        ['github', 'open github'],
        ['linkedin', 'open linkedin'],
        ['history', 'what you have typed'],
        ['clear', 'wipe the screen'],
        ['exit', 'close the session'],
      ];
      ctx.print([
        muted('available commands:'),
        ...rows.map(([name, desc]) => out(`  ${name.padEnd(width + 2)}${desc}`)),
        muted(''),
        muted('  section names work on their own too — `projects`, `contact`, ...'),
        muted(''),
        accent('  // 3 unlisted binaries are installed on this system.'),
        accent('  // this prompt can reach them. help will not.'),
      ]);
    },
  },

  ls: {
    help: 'list the sections of this site',
    run: (args, ctx) => {
      const dir = args[0]?.replace(/\/$/, '');
      if (dir === '/usr/games') {
        listGames(ctx);
        return;
      }
      if (dir && dir !== '.' && dir !== '~' && dir !== '/') {
        ctx.print([err(`ls: ${dir}: no such directory`)]);
        return;
      }
      ctx.print([
        out(SECTIONS.map((s) => s + '/').join('  ')),
        out(Object.keys(FILES).join('  ') + '  resume.pdf'),
      ]);
    },
  },

  cd: {
    help: 'jump to a section',
    run: (args, ctx) => {
      const target = (args[0] ?? '~').replace(/\/$/, '');
      if (target === '~' || target === '/' || target === 'top' || target === '') {
        ctx.print([muted('→ ~')]);
        ctx.navigateTo = 'top';
        return;
      }
      if ((SECTIONS as readonly string[]).includes(target)) {
        go(target, ctx);
        return;
      }
      // Not a section, and deliberately not advertised: `cd games` is a third
      // way into the arcade listing, for anyone who tries walking there.
      if (target === 'games' || target === '/usr/games' || target === 'usr/games') {
        listGames(ctx);
        return;
      }
      ctx.print([err(`cd: ${target}: no such section`), muted('try `ls`')]);
    },
  },

  cat: {
    help: 'print a file',
    run: (args, ctx) => {
      const name = args[0];
      if (!name) {
        ctx.print([err('cat: missing file'), muted('try `ls`')]);
        return;
      }
      if (name === 'resume.pdf') {
        ctx.print([
          muted('cat: resume.pdf: binary file'),
          muted('try `resume` to download it instead.'),
        ]);
        return;
      }
      const file = FILES[name] ?? FILES[name + '.txt'];
      if (!file) {
        ctx.print([err(`cat: ${name}: no such file`), muted('try `ls`')]);
        return;
      }
      ctx.print(file.map(out));
    },
  },

  whoami: {
    help: 'the short version',
    run: (_a, ctx) =>
      ctx.print([
        accent('joseph k anoj'),
        out('full stack developer · frontend specialist'),
        muted('react · astro · typescript · node — india, open to remote'),
      ]),
  },

  resume: {
    help: 'download the pdf',
    run: (_a, ctx) => {
      const a = document.createElement('a');
      a.href = '/resume.pdf';
      // Served at /resume.pdf so old links keep working, but saved under the
      // real CV name — same-origin, so the browser honours this.
      a.download = 'Joseph-K-Anoj-Frontend-Developer-CV.pdf';
      a.click();
      ctx.print([muted('downloading resume.pdf...')]);
    },
  },

  email: {
    help: 'start a message',
    run: (_a, ctx) => {
      window.location.href = 'mailto:josephkanoj@gmail.com';
      ctx.print([muted('opening your mail client...')]);
    },
  },

  github: {
    help: 'open github',
    run: (_a, ctx) => openUrl('https://github.com/JosuK22', ctx, 'github'),
  },

  linkedin: {
    help: 'open linkedin',
    run: (_a, ctx) => openUrl('https://linkedin.com/in/joseph-k-anoj', ctx, 'linkedin'),
  },

  whatsapp: {
    run: (_a, ctx) => openUrl('https://wa.me/919744788125', ctx, 'whatsapp'),
  },

  history: {
    help: 'what you have typed',
    run: (_a, ctx) => {
      if (!ctx.history.length) {
        ctx.print([muted('nothing yet.')]);
        return;
      }
      ctx.print(ctx.history.map((h, i) => out(`  ${String(i + 1).padStart(3)}  ${h}`)));
    },
  },

  clear: {
    help: 'wipe the screen',
    run: (_a, ctx) => ctx.clear(),
  },

  exit: {
    help: 'close the session',
    run: (_a, ctx) =>
      ctx.print([
        muted('logout'),
        muted('connection to josephk.dev closed.'),
        muted('(the prompt is still here, though.)'),
      ]),
  },

  echo: {
    run: (args, ctx) => ctx.print([out(args.join(' '))]),
  },

  date: {
    run: (_a, ctx) => ctx.print([out(new Date().toString())]),
  },

  sudo: {
    run: (args, ctx) =>
      ctx.print([
        args.length
          ? err(`joseph is not in the sudoers file. this incident has been reported.`)
          : err('usage: sudo <command>'),
      ]),
  },

  // --- the unlisted three ------------------------------------------------
  // `snake` is the game's documented trigger, so it always runs. The other
  // two only run once discovered out on the page — typing a name you haven't
  // earned gets a nudge, not a shortcut. The exception is the konami code
  // spelled out, which is the trigger, just typed instead of arrowed.
  snake: {
    run: () => void launch('snake'),
  },

  breakout: {
    run: (_a, ctx) => {
      if (found().includes('breakout')) return void launch('breakout');
      ctx.print([
        err('breakout: permission denied'),
        muted('something on this page rehearses the unlock order on a loop.'),
      ]);
    },
  },

  invaders: {
    run: (_a, ctx) => {
      if (found().includes('invaders')) return void launch('invaders');
      ctx.print([
        err('invaders: permission denied'),
        muted('1986 wants its cheat code back. spell it out here if you know it.'),
      ]);
    },
  },

  uuddlrlrba: {
    run: () => void launch('invaders'),
  },

  // Unlisted, but the obvious thing to try after help's teaser.
  games: {
    run: (_a, ctx) => listGames(ctx),
  },
};

const ALIASES: Record<string, string> = {
  '?': 'help',
  man: 'help',
  commands: 'help',
  dir: 'ls',
  home: 'cd',
  cv: 'resume',
  mail: 'email',
  contactme: 'contact',
  quit: 'exit',
  logout: 'exit',
  cls: 'clear',
};


// ---------------------------------------------------------------------
// The window
// ---------------------------------------------------------------------

const BOOT: Line[] = [
  accent('joseph@portfolio — bash'),
  muted('type `help` for commands · esc to close'),
  muted(''),
];

class Shell {
  private root!: HTMLDivElement;
  private win!: HTMLDivElement;
  private log!: HTMLDivElement;
  private input!: HTMLInputElement;
  private closeBtn!: HTMLButtonElement;

  private readonly history: string[] = [];
  private cursor = -1;
  private draft = '';
  private booted = false;
  private lastFocus: HTMLElement | null = null;

  private readonly ctx: Ctx = {
    history: this.history,
    navigateTo: null,
    print: (lines) => {
      for (const line of lines) {
        const l: Line = typeof line === 'string' ? out(line) : line;
        const p = document.createElement('p');
        p.className = 'tw__out' + (l.cls && l.cls !== 'out' ? ` tw__out--${l.cls}` : '');
        p.textContent = l.text || ' '; // blank lines still occupy a row
        this.log.appendChild(p);
      }
      this.log.scrollTop = this.log.scrollHeight;
    },
    clear: () => {
      this.log.textContent = '';
    },
  };

  private build(): void {
    this.root = document.createElement('div');
    this.root.className = 'tw';
    this.root.hidden = true;
    this.root.innerHTML = `
      <div class="tw__win" role="dialog" aria-modal="true" aria-label="Terminal">
        <div class="tw__bar">
          <span class="dot dot--r" aria-hidden="true"></span>
          <span class="dot dot--y" aria-hidden="true"></span>
          <span class="dot dot--g" aria-hidden="true"></span>
          <span class="tw__title">joseph@portfolio: ~ — bash</span>
          <button class="tw__close" type="button" aria-label="Close terminal">✕</button>
        </div>
        <div class="tw__body">
          <div class="tw__log" role="log" aria-live="polite"></div>
          <div class="tw__line">
            <span class="tw__ps1" aria-hidden="true">~/joseph $</span>
            <input
              class="tw__input"
              type="text"
              autocomplete="off"
              autocapitalize="none"
              autocorrect="off"
              spellcheck="false"
              enterkeyhint="go"
              aria-label="Type a command, or help to list them"
            />
          </div>
        </div>
      </div>`;

    this.win = this.root.querySelector('.tw__win')!;
    this.log = this.root.querySelector('.tw__log')!;
    this.input = this.root.querySelector('.tw__input')!;
    this.closeBtn = this.root.querySelector('.tw__close')!;

    this.closeBtn.addEventListener('click', () => this.close());
    // mousedown, not click: a drag that starts inside the window and ends on
    // the backdrop (selecting text) must not count as a dismiss.
    this.root.addEventListener('mousedown', (e) => {
      if (e.target === this.root) this.close();
    });
    // Clicking dead space in the window puts the caret back where it belongs.
    this.win.addEventListener('click', (e) => {
      if (e.target instanceof Element && e.target.closest('button')) return;
      if (window.getSelection()?.toString()) return;
      this.input.focus();
    });
    this.input.addEventListener('keydown', this.onKey);

    document.body.appendChild(this.root);
  }

  private onKey = (e: KeyboardEvent): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = this.input.value;
      this.input.value = '';
      this.run(value);
      return;
    }

    // Shell history on the arrow keys.
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      if (!this.history.length) return;
      e.preventDefault();
      if (this.cursor === -1) this.draft = this.input.value;
      if (e.key === 'ArrowUp') {
        this.cursor = this.cursor === -1 ? this.history.length - 1 : Math.max(0, this.cursor - 1);
        this.input.value = this.history[this.cursor];
      } else if (this.cursor !== -1) {
        this.cursor += 1;
        if (this.cursor >= this.history.length) {
          this.cursor = -1;
          this.input.value = this.draft;
        } else {
          this.input.value = this.history[this.cursor];
        }
      }
      this.input.setSelectionRange(this.input.value.length, this.input.value.length);
      return;
    }

    if (e.key === 'Tab') {
      const partial = this.input.value.trim().toLowerCase();
      e.preventDefault();
      // Nothing to complete — Tab becomes the focus trap's hop to the close
      // button, so the dialog never leaks focus to the page behind it.
      if (!partial || /\s/.test(partial)) {
        this.closeBtn.focus();
        return;
      }
      // The unlisted commands stay uncompletable — finding them is the point.
      const pool = [
        ...Object.entries(COMMANDS)
          .filter(([, c]) => c.help)
          .map(([n]) => n),
        ...SECTIONS,
      ];
      const hits = pool.filter((n) => n.startsWith(partial));
      if (hits.length === 1) {
        this.input.value = hits[0] + ' ';
      } else if (hits.length > 1) {
        this.ctx.print([muted(hits.join('  '))]);
      }
    }
  };

  private echo(raw: string): void {
    const p = document.createElement('p');
    p.className = 'tw__out tw__out--echo';
    const ps1 = document.createElement('span');
    ps1.className = 'tw__ps1';
    ps1.textContent = '~/joseph $ ';
    p.append(ps1, document.createTextNode(raw));
    this.log.appendChild(p);
  }

  private run(raw: string): void {
    const line = raw.trim();
    this.ctx.navigateTo = null;
    this.echo(line);
    if (!line) {
      this.log.scrollTop = this.log.scrollHeight;
      return;
    }

    this.history.push(line);
    this.cursor = -1;
    this.draft = '';

    const [head, ...args] = line.split(/\s+/);
    const name = ALIASES[head.toLowerCase()] ?? head.toLowerCase();

    // Bare section names are commands of their own — `projects` beats
    // `cd projects` for anyone who just wants to get there.
    if ((SECTIONS as readonly string[]).includes(name)) {
      go(name, this.ctx);
    } else {
      const cmd = COMMANDS[name];
      if (cmd) {
        void cmd.run(args, this.ctx);
      } else {
        this.ctx.print([err(`command not found: ${head}`), muted('type `help` for what works.')]);
      }
    }

    // A navigating command has nothing more to say — get out of the way so
    // the reader sees where they landed. Close first (which releases the
    // scroll lock), then travel. The delay is long enough to read the echo.
    const dest = this.ctx.navigateTo;
    if (dest) {
      window.setTimeout(() => {
        this.close();
        document.getElementById(dest)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 320);
    }
  }

  get isOpen(): boolean {
    return !!this.root && !this.root.hidden;
  }

  open(): void {
    if (!this.root) this.build();
    if (this.isOpen) return;
    this.lastFocus = document.activeElement as HTMLElement | null;
    this.root.hidden = false;
    document.body.classList.add('shell-open');
    if (!this.booted) {
      this.booted = true;
      this.ctx.print(BOOT);
    }
    this.input.focus();
    this.log.scrollTop = this.log.scrollHeight;
  }

  close(): void {
    if (!this.isOpen) return;
    this.root.hidden = true;
    document.body.classList.remove('shell-open');
    this.input.value = '';
    this.cursor = -1;
    // preventScroll matters: focus() scrolls its target into view by
    // default, which would drag the page back to the footer trigger and
    // undo a `cd` we are about to perform.
    this.lastFocus?.focus?.({ preventScroll: true });
  }

  toggle(): void {
    if (this.isOpen) this.close();
    else this.open();
  }
}

export function initTerminal(): void {
  const shell = new Shell();
  dismiss = () => shell.close();

  window.addEventListener('keydown', (e) => {
    // ctrl/cmd + K — the command-palette convention. Browsers bind it to
    // their own search bar, so this has to claim it explicitly.
    if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'k') {
      if (document.body.classList.contains('arcade-open')) return;
      e.preventDefault();
      shell.toggle();
      return;
    }
    // Escape lives here rather than on the input so it still works once
    // focus has hopped to the close button.
    if (e.key === 'Escape' && shell.isOpen) {
      e.preventDefault();
      shell.close();
    }
  });

  // The footer prompt is the other door in — and the only one a phone has.
  document.getElementById('termOpen')?.addEventListener('click', () => shell.open());
}
