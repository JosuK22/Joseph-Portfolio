/**
 * Add new projects by appending to the arrays below — the UI adapts on its
 * own: the grid reflows at every breakpoint, and once a group grows past 6
 * entries the extras collapse behind a "$ ls --all" toggle (first 6 stay
 * visible, so put your strongest work at the top).
 */
export interface Project {
  file: string;
  name: string;
  desc: string;
  tags: string[];
  /** Replace with the real deployed URL, or set to null to hide the link. */
  live: string | null;
  /** Replace with the real repo URL, or set to null to hide the link. */
  repo: string | null;
}

export interface ProjectGroups {
  client: Project[];
  personal: Project[];
}

export const projects: ProjectGroups = {
  client: [
    {
      file: 'beyondz-corporate.tsx',
      name: 'BeyondZ Corporate Site',
      desc: 'Frontend for a Next.js corporate site, including a password-gated admin dashboard UI for blog posts and case studies with rich-text editing and image upload, integrated against a Supabase backend.',
      tags: ['Next.js', 'Supabase', 'shadcn/ui'],
      live: null,
      repo: null,
    },
    {
      file: 'wsf-globe.tsx',
      name: 'World Startup Federation',
      desc: 'Membership site for a global startup community, featuring a Three.js/react-three-fiber 3D globe hero, an interactive AI-persona chat feature, and a typed client consuming an in-house headless CMS API with retry/backoff.',
      tags: ['Astro', 'React Three Fiber', 'Three.js'],
      live: null,
      repo: null,
    },
    {
      file: 'venturefactory.astro',
      name: 'VentureFactory.AI',
      desc: "Flagship corporate site for a startup studio showcasing its portfolio companies, with animated neural-network hero graphics, scroll-driven carousels, and Playwright test coverage.",
      tags: ['Astro', 'React', 'Playwright'],
      live: null,
      repo: null,
    },
    {
      file: 'cms-frontend.jsx',
      name: 'BeyondZ CMS Admin Console',
      desc: "Admin console for BeyondZ's in-house headless CMS platform, built on Material Dashboard with charts, data tables, and a submissions-review view, integrated entirely against backend REST APIs.",
      tags: ['React', 'MUI', 'REST APIs'],
      live: null,
      repo: null,
    },
    {
      file: 'getai-foundation.astro',
      name: 'GETAI Foundation',
      desc: "SEO-focused rebuild of a nonprofit's site from a design-tool-generated prototype to Astro, with an MDX-driven blog and a contact form integrated against a Supabase edge function.",
      tags: ['Astro', 'MDX', 'Supabase'],
      live: null,
      repo: null,
    },
    {
      file: 'internal-auditors.astro',
      name: 'InternalAuditors.ai',
      desc: 'Marketing site for an AI-driven audit automation product, implemented pixel-accurate from Figma with a hand-written, viewport-scaled fluid typography system.',
      tags: ['Astro', 'Design Tokens', 'Figma'],
      live: null,
      repo: null,
    },
    {
      file: 'ai60-landing.astro',
      name: 'AI60',
      desc: 'Landing page for an AI-consulting discovery offer, with scroll-reveal animations, a Lottie clock animation, and Calendly booking integration.',
      tags: ['Astro', 'React', 'Lottie'],
      live: null,
      repo: null,
    },
    {
      file: 'rendery-portfolio.jsx',
      name: 'Rendery Studio Portfolio',
      desc: 'Vite/React SPA portfolio for a branding studio, with hand-rolled scroll interactions and dynamic per-project case-study routing, built without a UI kit.',
      tags: ['React', 'Vite', 'React Router'],
      live: null,
      repo: null,
    },
    {
      file: 'iot-dashboard.jsx',
      name: 'IoT Dashboard',
      desc: 'Real-time IoT dashboard UI built in React for a freelance client, focused on usability and live interactivity.',
      tags: ['React', 'Real-time', 'UI/UX'],
      live: null,
      repo: null,
    },
    {
      file: 'quizzie.jsx',
      name: 'Quizzie',
      desc: 'MERN-stack quiz builder with a responsive interface implemented from Figma designs, delivered during the Cuvette internship.',
      tags: ['MERN', 'Figma', 'Responsive'],
      live: null,
      repo: null,
    },
  ],
  personal: [
    {
      file: 'workflow-builder.tsx',
      name: 'Workflow Builder',
      desc: 'Dynamic flowchart app built with React Flow, Context API, and persistent local storage for saving workflows.',
      tags: ['React Flow', 'Context API', 'localStorage'],
      live: null,
      repo: null,
    },
    {
      file: 'versa-hub.jsx',
      name: 'Versa Hub',
      desc: 'Multi-feature web app combining notes, weather forecasts, movie recommendations, and news by integrating multiple public APIs.',
      tags: ['React', 'REST APIs', 'Vite'],
      live: null,
      repo: null,
    },
    {
      file: 'notes-app.jsx',
      name: 'React Notes App',
      desc: 'Lightweight React note-taking app (Notes App 2.0) using local storage, deployed on GitHub Pages.',
      tags: ['React', 'localStorage', 'GH Pages'],
      live: 'https://josuk22.github.io/Portfolio/',
      repo: 'https://github.com/josuk22',
    },
  ],
};
