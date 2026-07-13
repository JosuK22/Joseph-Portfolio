export interface SkillGroup {
  label: string;
  items: string[];
}

export const skills: SkillGroup[] = [
  { label: 'languages', items: ['JavaScript', 'TypeScript', 'Java', 'Python'] },
  {
    label: 'frontend',
    items: [
      'React.js',
      'Astro',
      'HTML5',
      'CSS3',
      'Responsive Design',
      'Design Systems',
      'Component Architecture',
    ],
  },
  { label: 'backend', items: ['Node.js', 'Express.js', 'RESTful APIs', 'MongoDB', 'PostgreSQL'] },
  {
    label: 'tools',
    items: ['Git', 'GitHub', 'Figma', 'Postman', 'VS Code', 'Vercel', 'Render', 'Wix Studio'],
  },
  {
    label: 'other',
    items: ['JWT Authentication', 'API Integration', 'Accessibility (a11y)', 'Agile / Scrum'],
  },
];
