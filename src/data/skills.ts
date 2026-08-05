export interface SkillGroup {
  label: string;
  items: string[];
}

export const skills: SkillGroup[] = [
  { label: 'languages', items: ['TypeScript', 'JavaScript', 'Java', 'Python', 'SQL'] },
  {
    label: 'frontend',
    items: [
      'React.js',
      'Next.js',
      'Astro',
      'Vite',
      'React Three Fiber',
      'HTML5',
      'CSS3',
      'Responsive Design',
    ],
  },
  {
    label: 'styling',
    items: [
      'Tailwind CSS',
      'Sass',
      'CSS Modules',
      'shadcn/ui',
      'Radix UI',
      'Material UI',
      'Design Systems',
      'Design Tokens',
    ],
  },
  {
    label: 'backend',
    items: [
      'Node.js',
      'Express.js',
      'RESTful APIs',
      'MongoDB',
      'PostgreSQL',
      'Supabase',
      'JWT Auth',
    ],
  },
  {
    label: 'testing',
    items: ['Playwright', 'Accessibility (a11y)', 'Cross-browser QA'],
  },
  {
    label: 'devops',
    items: ['Git', 'GitHub Actions', 'Azure Static Web Apps', 'Vercel', 'Netlify', 'CI/CD'],
  },
  {
    label: 'tools',
    items: ['Figma', 'Postman', 'VS Code', 'MDX', 'Framer Motion', 'GSAP', 'Agile / Scrum'],
  },
];
