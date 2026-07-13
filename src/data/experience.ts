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
      'Developed the frontend of a website-management CMS, integrating entirely against backend REST APIs for content creation, editing, and management workflows.',
      'Delivered multiple production websites end to end, from layout and component design through responsive behaviour and deployment.',
      'Implemented build-time static generation (including procedurally generated SVG visuals) to minimise runtime JavaScript and improve page-load performance.',
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
