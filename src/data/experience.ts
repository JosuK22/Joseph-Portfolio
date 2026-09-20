export interface ExperienceProject {
  /** A label for the module — a compression of `description`, never new
   *  information. */
  name: string;
  /** The original bullet, verbatim. */
  description: string;
  /** Only technologies named in `description`. */
  tech?: string[];
}

export interface Job {
  role: string;
  company: string;
  dates: string;
  /** Short descriptor for the collapsed card, taken from the role title —
   *  or, where the title is generic, from the bullets themselves. */
  category: string;
  /** Set only where the bullets enumerate discrete, countable projects.
   *  Omitted when a single bullet covers an open-ended number of them. */
  projectCount?: number;
  /** 3–5 headline technologies for the collapsed card; a subset of `stack`. */
  stackPreview: string[];
  /** Every technology named in this job's bullets — nothing assumed. */
  stack: string[];
  responsibilities: string[];
  projects: ExperienceProject[];
  /** Explicit, stated results only. Empty where the bullets state none. */
  outcomes: string[];
}

/* Every `description`, `responsibilities` and `outcomes` string below is an
   original bullet, word for word — the redesign only decides which section a
   bullet belongs in. `name`, `category`, `stack` and `projectCount` are drawn
   from those same sentences. */
export const jobs: Job[] = [
  {
    role: 'Frontend Developer (Remote)',
    company: 'Beyondz / Venture Way',
    dates: 'Jul 2025 – Present',
    category: 'frontend',
    // no count: one bullet covers "8+" sites, so any total would be a guess
    stackPreview: ['Astro', 'React', 'Next.js', 'Three.js'],
    stack: [
      'Astro',
      'React',
      'MUI',
      'Next.js',
      'Supabase',
      'Three.js',
      'react-three-fiber',
      'Playwright',
      'Azure Static Web Apps',
      'REST APIs',
      'CI/CD',
    ],
    responsibilities: [
      'Build complex, responsive layouts in Astro using design tokens, reusable layouts, and a scoped component architecture to keep a large UI consistent and maintainable.',
      'Implemented advanced interactive frontend features including a Three.js/react-three-fiber 3D globe hero and an AI-persona chat UI, with Playwright test coverage and Azure Static Web Apps CI/CD across dev/prod environments.',
    ],
    projects: [
      {
        name: 'Multi-brand studio websites',
        description:
          'Delivered 8+ production marketing and corporate websites (including VentureFactory.AI, BeyondZ, World Startup Federation, and GETAI Foundation) for a multi-brand startup studio, sharing a common component library and CI/CD pipeline across properties.',
        tech: ['CI/CD'],
      },
      {
        name: 'In-house headless CMS platform',
        description:
          "Built the frontend for an in-house headless CMS platform — a React/MUI admin console for content management and submissions review — and typed API clients (with retry/backoff) that consume the CMS's REST API from production client sites.",
        tech: ['React', 'MUI', 'REST APIs'],
      },
      {
        name: 'Next.js corporate site',
        description:
          'Built the frontend of a Next.js corporate site, including a password-gated admin dashboard UI for blog and case-study content with rich-text editing and image upload, integrated against a Supabase backend.',
        tech: ['Next.js', 'Supabase'],
      },
    ],
    outcomes: [],
  },
  {
    role: 'Freelance Developer (Remote)',
    company: 'Self-employed',
    dates: 'Oct 2024 – Jul 2025',
    category: 'full stack',
    projectCount: 3,
    stackPreview: ['React.js', 'Wix Studio', 'CSS'],
    stack: ['React.js', 'Wix Studio', 'CSS'],
    responsibilities: [
      'Delivered complete product UI/UX from scratch, following accessibility and design-system guidelines.',
    ],
    projects: [
      {
        name: 'Client management application',
        description:
          "Built a full-stack management application that increased a client's productivity by an estimated 15–25%.",
      },
      {
        name: 'IoT dashboard UI',
        description:
          'Designed and built an IoT dashboard UI in React.js focused on usability and real-time interactivity.',
        tech: ['React.js'],
      },
      {
        name: 'Startup marketing website',
        description: 'Developed a fully responsive startup marketing website using Wix Studio and custom CSS.',
        tech: ['Wix Studio', 'CSS'],
      },
    ],
    outcomes: [],
  },
  {
    role: 'Full Stack Developer Intern (Remote)',
    company: 'Cuvette Tech',
    dates: 'Jan 2024 – Jul 2024',
    category: 'full stack',
    projectCount: 2,
    stackPreview: ['MERN', 'JWT', 'REST APIs', 'Figma'],
    stack: ['MERN', 'JWT', 'REST APIs', 'Figma'],
    responsibilities: [],
    projects: [
      {
        name: 'Quizzie',
        description:
          'Built Quizzie, a MERN-stack quiz builder with a responsive interface implemented from Figma designs.',
        tech: ['MERN', 'Figma'],
      },
      {
        name: 'Task Manager',
        description:
          'Created Task Manager, a full app with JWT-based authentication, CRUD operations, and secure REST API endpoints.',
        tech: ['JWT', 'REST APIs'],
      },
    ],
    outcomes: [],
  },
  {
    role: 'Associate Developer L1',
    company: 'Publicis Sapient, Bangalore',
    dates: 'Feb 2022 – Dec 2022',
    category: 'frontend',
    projectCount: 2,
    stackPreview: ['Salesforce Commerce Cloud', 'Agile'],
    stack: ['Salesforce Commerce Cloud (SFCC)', 'Agile'],
    responsibilities: [
      'Collaborated in Agile teams, conducted code reviews, and upheld web-performance standards.',
    ],
    projects: [
      {
        name: 'eCommerce platform',
        description:
          'Developed front-end features for a high-traffic eCommerce platform on Salesforce Commerce Cloud (SFCC).',
        tech: ['Salesforce Commerce Cloud (SFCC)'],
      },
      {
        name: 'Hotel-management system',
        description:
          'Led front-end development for a hotel-management system covering booking, room availability, and backend authentication.',
      },
    ],
    outcomes: [],
  },
];
