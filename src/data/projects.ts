/**
 * Projects, as data. The UI (src/components/Projects.astro) is a progressive-
 * disclosure archive: the collapsed card shows only `name`, `tagline`, `type`,
 * `status`/`year` and `tags`, and everything else appears once a visitor asks
 * for it. So the split between fields is a split between "what is this?" and
 * "how was it built?" — put a sentence in the field that matches the question
 * it answers, not the one with the most room.
 *
 * Content rules, same as src/data/experience.ts:
 *   - `overview` is the project's own description, kept whole.
 *   - `built`, `features` and `architecture` only ever re-present information
 *     that already exists for that project. Nothing is inferred, and a field
 *     with no source is left out rather than filled in.
 *   - `status` states what is true now. A release that has not shipped says so.
 *   - links are only listed when they resolve; `null` hides the link.
 *
 * Add a project by appending to `personal` or `client` — the section reflows,
 * the category counts recalculate, and the index numbers renumber themselves.
 */

export interface Project {
  /** Window-chrome filename in the card's title bar — decorative. */
  file: string;
  name: string;
  /** 3–6 words. Answers "what is this?" and nothing more. */
  tagline: string;
  /** Kind of project: platform, developer tool, marketing site, ... */
  type: string;
  /** Collapsed-card status. Omit unless the state is actually known. */
  status?: string;
  /** Expanded-card detail about that state, where there is more to say. */
  statusNote?: string;
  /** Work in progress. Rendered as unreleased — never as a shipped feature. */
  nextRelease?: string;
  /** Only where a date is on record. */
  year?: string;
  /** 2–4 headline technologies for the collapsed card; a subset of `stack`. */
  tags: string[];
  /** Every technology this project actually uses. Defaults to `tags`. */
  stack?: string[];
  /** Expanded: the project's full description. */
  overview: string;
  /** Expanded: the part that was built, where that is on record separately. */
  built?: string;
  /** Expanded: discrete capabilities, drawn from `overview`/`built`. */
  features?: string[];
  /** Expanded: how it is put together. */
  architecture?: string;
  /** Expanded: where this sat — client engagement, internship, and so on. */
  context?: string;
  /** Expanded: a real command a visitor can run. */
  command?: string;
  /** One project at most. Slightly stronger card, nothing more. */
  featured?: boolean;
  live: string | null;
  repo: string | null;
  npm?: string | null;
  docs?: string | null;
}

export interface ProjectGroups {
  client: Project[];
  personal: Project[];
}

export const projects: ProjectGroups = {
  personal: [
    {
      file: 'create-clientkit.ts',
      name: 'create-clientkit',
      tagline: 'Frontend project scaffolding CLI',
      type: 'developer tool',
      // the card uppercases this, so no 'v' prefix — it would read 'V1.0.2'
      status: 'published · 1.0.2',
      statusNote: 'v1.0.2 is the current release on npm.',
      nextRelease:
        'An in-development release opens the stack up beyond the single Astro template: framework, styling, component-library, router and feature dimensions, resolved by a compatibility engine that refuses an unbuildable combination before writing anything and names the reason; named presets that compose with partial configuration; and a React + Vite adapter alongside Astro. Not published yet — 1.0.2 remains the current release.',
      year: '2026',
      featured: true,
      tags: ['TypeScript', 'Node.js', 'npm'],
      stack: [
        'TypeScript',
        'Node.js',
        'npm',
        'tsup',
        'Vitest',
        'ESLint',
        'Prettier',
        'GitHub Actions',
        'Astro',
        'Tailwind CSS',
        'axe-core',
        'Lighthouse',
      ],
      command: 'npm create clientkit@latest',
      overview:
        'A scaffolding CLI for developers who build client websites over and over — freelancers, agencies and frontend teams. It generates the foundation you rebuild every time: layout, a Coming Soon page, a custom 404, SEO metadata, robots.txt, a sitemap, structured data, a favicon, an accessibility baseline and build config — and then gets out of the way. It is not a website builder; you own the generated source from the moment it lands on disk.',
      built:
        'The published release generates a static Astro + Tailwind CSS site in TypeScript — responsive, light and dark themes, and no client-side JavaScript by default — starting in Coming Soon mode, Full mode, or URL-less when the domain is not decided yet. The CLI itself is one bundled file with zero runtime dependencies, MIT licensed and published from CI with provenance.',
      features: [
        'Generates a static Astro + Tailwind site in TypeScript: light and dark themes, zero client-side JavaScript by default',
        'Coming Soon, Full and URL-less starting modes',
        'SEO written into static HTML at build time — canonical, Open Graph, X metadata, robots.txt, sitemap and schema.org Organization data',
        'Nothing is fabricated: with no production URL configured, the canonical tag, og:url and the sitemap are omitted rather than pointed at a domain nobody owns',
        'Atomic generation — files stage into a sibling temp directory and only move into place once every write succeeds, so a failure leaves the target untouched',
        'Every prompt has a matching flag, plus --dry-run, --from <json> and --yes for scripted runs',
        'Templates are inert data: manifests are declarative and post-steps are a fixed allow-list, never shell strings',
        'Cross-platform CI — 304 tests at 1.0.0, axe-core and Lighthouse audits, and clean-room tarball validation on Linux, Windows and macOS across Node 20.19, 22 and 24',
      ],
      architecture:
        'A resolver boundary holds all input handling in one place: nothing below it reads flags, prompts, config files or the environment, which is what makes an interactive run and a flag-driven run the same code path. The resolved context is deep-frozen, plan() is pure and returns a list of file operations — so --dry-run is free and output is snapshottable — and apply() stages into a sibling temp directory before an atomic rename. Templates are declarative manifests that reject unknown keys.',
      live: null,
      repo: 'https://github.com/JosuK22/create-clientkit',
      npm: 'https://www.npmjs.com/package/create-clientkit',
    },
    {
      file: 'webniyam.tsx',
      name: 'WebNiyam',
      tagline: 'Multi-tenant CMS platform',
      type: 'platform',
      status: 'in development',
      statusNote: 'Frontend near complete; backend in development.',
      tags: ['React', 'TypeScript', 'PostgreSQL'],
      stack: ['React', 'TypeScript', 'REST APIs', 'PostgreSQL'],
      overview: 'Multi-tenant platform for managing several websites from one dashboard.',
      built:
        'Built the component-driven content management interface, media and forms handling, role-based permissions and versioned publishing UI.',
      features: [
        'Component-driven content management interface',
        'Media and forms handling',
        'Role-based permissions',
        'Versioned publishing UI',
      ],
      live: null,
      repo: null,
    },
    {
      file: 'douthya.jsx',
      name: 'Douthya',
      tagline: 'Collaborative task management',
      type: 'platform',
      status: 'in development',
      tags: ['React', 'Node.js', 'MongoDB'],
      stack: ['React', 'Node.js', 'Express', 'MongoDB', 'REST APIs'],
      overview:
        'Multi-workspace collaborative task-management platform supporting task assignment, custom roles and permission-based access control, with workspace-scoped workflows and centralised authorization.',
      features: [
        'Task assignment across multiple workspaces',
        'Custom roles and permission-based access control',
        'Workspace-scoped workflows',
        'Centralised authorization',
      ],
      live: null,
      repo: null,
    },
    {
      file: 'portfolio.astro',
      name: 'Portfolio',
      tagline: 'Interactive developer portfolio',
      type: 'website',
      status: 'live',
      year: '2026',
      tags: ['Astro', 'TypeScript', 'Canvas'],
      stack: ['Astro', 'TypeScript', 'Canvas'],
      overview:
        'Zero-framework-JS Astro build with a canvas particle-portrait hero, a working in-page shell, and full reduced-motion and keyboard-accessibility support. React-free.',
      features: [
        'Canvas particle-portrait hero',
        'A working in-page shell',
        'Full reduced-motion and keyboard-accessibility support',
        'React-free — no framework JavaScript ships',
      ],
      live: 'https://josephk.dev',
      repo: 'https://github.com/JosuK22/Joseph-Portfolio',
    },
    {
      file: 'workflow-builder.tsx',
      name: 'Workflow Builder',
      tagline: 'Dynamic flowchart builder',
      type: 'web app',
      tags: ['React Flow', 'Context API', 'localStorage'],
      stack: ['React Flow', 'Context API', 'localStorage'],
      overview:
        'Dynamic flowchart app built with React Flow, Context API, and persistent local storage for saving workflows.',
      live: "https://josuk22.github.io/Work_Flow-Builder/",
      repo: "https://github.com/JosuK22/Work_Flow-Builder",
    },
    {
      file: 'versa-hub.jsx',
      name: 'Versa Hub',
      tagline: 'Multi-API personal dashboard',
      type: 'web app',
      tags: ['React', 'REST APIs', 'Vite'],
      stack: ['React', 'REST APIs', 'Vite'],
      overview:
        'Multi-feature web app combining notes, weather forecasts, movie recommendations, and news by integrating multiple public APIs.',
      features: [
        'Notes',
        'Weather forecasts',
        'Movie recommendations',
        'News',
      ],
      live: "https://steady-sunflower-a82504.netlify.app/register",
      repo: "https://github.com/JosuK22/VersaHub",
    },
    {
      file: 'notes-app.jsx',
      name: 'React Notes App',
      tagline: 'Lightweight note taking',
      type: 'web app',
      status: 'live',
      tags: ['React', 'localStorage', 'GH Pages'],
      stack: ['React', 'localStorage', 'GitHub Pages'],
      overview:
        'Lightweight React note-taking app (Notes App 2.0) using local storage, deployed on GitHub Pages.',
      live: 'https://josuk22.github.io/Notes-App/',
      repo: 'https://github.com/JosuK22/Notes-App',
    },
  ],
  client: [
    {
      file: 'beyondz-corporate.tsx',
      name: 'BeyondZ Corporate Site',
      tagline: 'Corporate site with admin CMS',
      type: 'corporate site',
      tags: ['Next.js', 'Supabase', 'shadcn/ui'],
      stack: ['Next.js', 'Supabase', 'shadcn/ui'],
      overview:
        'Frontend for a Next.js corporate site, including a password-gated admin dashboard UI for blog posts and case studies with rich-text editing and image upload, integrated against a Supabase backend.',
      features: [
        'Password-gated admin dashboard UI',
        'Rich-text editing for blog posts and case studies',
        'Image upload',
        'Integrated against a Supabase backend',
      ],
      live: null,
      repo: null,
    },
    {
      file: 'wsf-globe.tsx',
      name: 'World Startup Federation',
      tagline: 'Membership site with 3D globe',
      type: 'membership site',
      tags: ['Astro', 'React Three Fiber', 'Three.js'],
      stack: ['Astro', 'React Three Fiber', 'Three.js', 'REST APIs'],
      overview:
        'Membership site for a global startup community, featuring a Three.js/react-three-fiber 3D globe hero, an interactive AI-persona chat feature, and a typed client consuming an in-house headless CMS API with retry/backoff.',
      features: [
        'Three.js / react-three-fiber 3D globe hero',
        'Interactive AI-persona chat feature',
        'Typed client consuming an in-house headless CMS API, with retry/backoff',
      ],
      live: null,
      repo: null,
    },
    {
      file: 'venturefactory.astro',
      name: 'VentureFactory.AI',
      tagline: 'Startup studio flagship site',
      type: 'corporate site',
      tags: ['Astro', 'React', 'Playwright'],
      stack: ['Astro', 'React', 'Playwright'],
      overview:
        'Flagship corporate site for a startup studio showcasing its portfolio companies, with animated neural-network hero graphics, scroll-driven carousels, and Playwright test coverage.',
      features: [
        'Animated neural-network hero graphics',
        'Scroll-driven carousels',
        'Playwright test coverage',
      ],
      live: null,
      repo: null,
    },
    {
      file: 'cms-frontend.jsx',
      name: 'BeyondZ CMS Admin Console',
      tagline: 'Headless CMS admin console',
      type: 'admin console',
      tags: ['React', 'MUI', 'REST APIs'],
      stack: ['React', 'MUI', 'REST APIs', 'Material Dashboard'],
      overview:
        "Admin console for BeyondZ's in-house headless CMS platform, built on Material Dashboard with charts, data tables, and a submissions-review view, integrated entirely against backend REST APIs.",
      features: [
        'Charts',
        'Data tables',
        'Submissions-review view',
        'Integrated entirely against backend REST APIs',
      ],
      live: null,
      repo: null,
    },
    {
      file: 'getai-foundation.astro',
      name: 'GETAI Foundation',
      tagline: 'Nonprofit site rebuilt in Astro',
      type: 'nonprofit site',
      tags: ['Astro', 'MDX', 'Supabase'],
      stack: ['Astro', 'MDX', 'Supabase'],
      overview:
        "SEO-focused rebuild of a nonprofit's site from a design-tool-generated prototype to Astro, with an MDX-driven blog and a contact form integrated against a Supabase edge function.",
      features: [
        'SEO-focused rebuild from a design-tool-generated prototype',
        'MDX-driven blog',
        'Contact form integrated against a Supabase edge function',
      ],
      live: null,
      repo: null,
    },
    {
      file: 'internal-auditors.astro',
      name: 'InternalAuditors.ai',
      tagline: 'Pixel-accurate Figma marketing site',
      type: 'marketing site',
      tags: ['Astro', 'Design Tokens', 'Figma'],
      stack: ['Astro', 'Design Tokens', 'Figma'],
      overview:
        'Marketing site for an AI-driven audit automation product, implemented pixel-accurate from Figma with a hand-written, viewport-scaled fluid typography system.',
      features: [
        'Implemented pixel-accurate from Figma',
        'Hand-written, viewport-scaled fluid typography system',
      ],
      live: null,
      repo: null,
    },
    {
      file: 'ai60-landing.astro',
      name: 'AI60',
      tagline: 'AI consulting landing page',
      type: 'landing page',
      tags: ['Astro', 'React', 'Lottie'],
      stack: ['Astro', 'React', 'Lottie', 'Calendly'],
      overview:
        'Landing page for an AI-consulting discovery offer, with scroll-reveal animations, a Lottie clock animation, and Calendly booking integration.',
      features: [
        'Scroll-reveal animations',
        'Lottie clock animation',
        'Calendly booking integration',
      ],
      live: null,
      repo: null,
    },
    {
      file: 'rendery-portfolio.jsx',
      name: 'Rendery Studio Portfolio',
      tagline: 'Branding studio portfolio SPA',
      type: 'portfolio site',
      tags: ['React', 'Vite', 'React Router'],
      stack: ['React', 'Vite', 'React Router'],
      overview:
        'Vite/React SPA portfolio for a branding studio, with hand-rolled scroll interactions and dynamic per-project case-study routing, built without a UI kit.',
      features: [
        'Hand-rolled scroll interactions',
        'Dynamic per-project case-study routing',
        'Built without a UI kit',
      ],
      live: null,
      repo: null,
    },
    {
      file: 'iot-dashboard.jsx',
      name: 'IoT Dashboard',
      tagline: 'Real-time IoT dashboard UI',
      type: 'dashboard',
      context: 'Freelance client engagement.',
      tags: ['React', 'Real-time', 'UI/UX'],
      stack: ['React', 'Real-time', 'UI/UX'],
      overview:
        'Real-time IoT dashboard UI built in React for a freelance client, focused on usability and live interactivity.',
      live: null,
      repo: null,
    },
    {
      file: 'quizzie.jsx',
      name: 'Quizzie',
      tagline: 'MERN quiz builder',
      type: 'web app',
      context: 'Delivered during the Cuvette internship.',
      tags: ['MERN', 'Figma', 'Responsive'],
      stack: ['MERN', 'Figma', 'Responsive'],
      overview:
        'MERN-stack quiz builder with a responsive interface implemented from Figma designs, delivered during the Cuvette internship.',
      live: null,
      repo: null,
    },
  ],
};
