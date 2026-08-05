export interface Job {
  role: string;
  company: string;
  dates: string;
  bullets: string[];
}

export const jobs: Job[] = [
  {
    role: 'Frontend Developer (Remote)',
    company: 'Beyondz / Venture Way',
    dates: 'Jul 2025 – Present',
    bullets: [
      'Build complex, responsive layouts in Astro using design tokens, reusable layouts, and a scoped component architecture to keep a large UI consistent and maintainable.',
      'Delivered 8+ production marketing and corporate websites (including VentureFactory.AI, BeyondZ, World Startup Federation, and GETAI Foundation) for a multi-brand startup studio, sharing a common component library and CI/CD pipeline across properties.',
      "Built the frontend for an in-house headless CMS platform — a React/MUI admin console for content management and submissions review — and typed API clients (with retry/backoff) that consume the CMS's REST API from production client sites.",
      'Built the frontend of a Next.js corporate site, including a password-gated admin dashboard UI for blog and case-study content with rich-text editing and image upload, integrated against a Supabase backend.',
      'Implemented advanced interactive frontend features including a Three.js/react-three-fiber 3D globe hero and an AI-persona chat UI, with Playwright test coverage and Azure Static Web Apps CI/CD across dev/prod environments.',
    ],
  },
  {
    role: 'Freelance Developer (Remote)',
    company: 'Self-employed',
    dates: 'Oct 2024 – Jul 2025',
    bullets: [
      "Built a full-stack management application that increased a client's productivity by an estimated 15–25%.",
      'Designed and built an IoT dashboard UI in React.js focused on usability and real-time interactivity.',
      'Delivered complete product UI/UX from scratch, following accessibility and design-system guidelines.',
      'Developed a fully responsive startup marketing website using Wix Studio and custom CSS.',
    ],
  },
  {
    role: 'Full Stack Developer Intern (Remote)',
    company: 'Cuvette Tech',
    dates: 'Jan 2024 – Jul 2024',
    bullets: [
      'Built Quizzie, a MERN-stack quiz builder with a responsive interface implemented from Figma designs.',
      'Created Task Manager, a full app with JWT-based authentication, CRUD operations, and secure REST API endpoints.',
    ],
  },
  {
    role: 'Associate Developer L1',
    company: 'Publicis Sapient, Bangalore',
    dates: 'Feb 2022 – Dec 2022',
    bullets: [
      'Developed front-end features for a high-traffic eCommerce platform on Salesforce Commerce Cloud (SFCC).',
      'Led front-end development for a hotel-management system covering booking, room availability, and backend authentication.',
      'Collaborated in Agile teams, conducted code reviews, and upheld web-performance standards.',
    ],
  },
];
