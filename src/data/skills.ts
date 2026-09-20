import {
  siExpress,
  siGit,
  siGithubactions,
  siJavascript,
  siMongodb,
  siMui,
  siNextdotjs,
  siNodedotjs,
  siReact,
  siTailwindcss,
  siTypescript,
} from 'simple-icons';

/** A 24×24 monochrome mark. `fill` = a simple-icons path (brand colour is
 *  dropped — the stylesheet paints everything green); `stroke` = a small
 *  hand-drawn glyph for things with no usable logo. */
export interface SkillIcon {
  path: string;
  mode: 'fill' | 'stroke';
}

export interface CoreSkill {
  name: string;
  icon: SkillIcon;
}

export interface CoreRow {
  label: string;
  items: CoreSkill[];
}

export interface SkillCategory {
  id: string;
  label: string;
  items: string[];
}

const mark = (s: { path: string }): SkillIcon => ({ path: s.path, mode: 'fill' });

// simple-icons has no Playwright mark (Microsoft asks for removal) and REST
// has no logo at all — both get a plain line glyph at the same visual weight.
const restGlyph: SkillIcon = { path: 'M4 8h15m-4-4 4 4-4 4M20 16H5m4-4-4 4 4 4', mode: 'stroke' };
const testGlyph: SkillIcon = { path: 'M3.5 3.5h17v17h-17zM7.5 12.5l3 3 6-7', mode: 'stroke' };

/** The stack actually used day to day — shown up front, in this order. */
export const coreStack: CoreRow[] = [
  {
    label: 'frontend · full stack',
    items: [
      { name: 'React', icon: mark(siReact) },
      { name: 'TypeScript', icon: mark(siTypescript) },
      { name: 'JavaScript', icon: mark(siJavascript) },
      { name: 'Next.js', icon: mark(siNextdotjs) },
      { name: 'Node.js', icon: mark(siNodedotjs) },
      { name: 'Express', icon: mark(siExpress) },
      { name: 'MongoDB', icon: mark(siMongodb) },
      { name: 'REST APIs', icon: restGlyph },
    ],
  },
  {
    label: 'ui · engineering',
    items: [
      { name: 'Tailwind CSS', icon: mark(siTailwindcss) },
      { name: 'Material UI', icon: mark(siMui) },
      { name: 'Git', icon: mark(siGit) },
      { name: 'GitHub Actions', icon: mark(siGithubactions) },
      { name: 'Playwright', icon: testGlyph },
    ],
  },
];

/** Everything else — collapsed behind "$ explore --all-skills". */
export const additionalSkills: SkillCategory[] = [
  {
    id: 'frontend-ui',
    label: 'Frontend & UI',
    items: [
      'Astro',
      'Vite',
      'React Three Fiber',
      'HTML5',
      'CSS3',
      'CSS Modules',
      'Sass',
      'shadcn/ui',
      'Radix UI',
      'Design Systems',
      'Design Tokens',
    ],
  },
  { id: 'backend-data', label: 'Backend & Data', items: ['PostgreSQL', 'Supabase', 'JWT Authentication', 'SQL'] },
  {
    id: 'testing-eng',
    label: 'Testing & Engineering',
    items: ['Accessibility (a11y)', 'Cross-browser Testing', 'CI/CD'],
  },
  { id: 'deployment', label: 'Deployment', items: ['Vercel', 'Netlify', 'Azure Static Web Apps'] },
  {
    id: 'design-motion',
    label: 'Design & Motion',
    items: ['Figma', 'Postman', 'Framer Motion', 'GSAP', 'MDX'],
  },
];

/** Past experience worth a mention, not a headline. */
export const otherExperience: string[] = ['Java', 'Python'];
