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
      file: 'cms-frontend.astro',
      name: 'Website-Management CMS',
      desc: 'Frontend of a website-management CMS for Beyondz, integrated entirely against backend REST APIs for content creation, editing, and management workflows.',
      tags: ['Astro', 'REST APIs', 'Design Tokens'],
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
