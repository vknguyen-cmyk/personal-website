/**
 * Personal site content for V.K. Nguyen.
 * Sourced from resume fields only. Do not invent jobs, papers, or awards.
 * Keep the site college-facing: skip club contests, AP awards, and grade-school lines.
 */

export const person = {
  name: 'V.K. Nguyen',
  fullName: 'V.K. Nguyen',
  title: 'Physics & Philosophy · Reed College',
  tagline:
    'A physics and philosophy student who loves technology, and builds interactive things you can try.',
  phone: '+1 (857) 399-3586',
  email: 'vnguyen@reed.edu',
  links: {
    site: 'https://vknguyen.com',
    github: 'https://github.com/vknguyen-cmyk',
    linkedin: 'https://linkedin.com/in/vk-nguyen',
  },
} as const;

/** Interests / how he works — narrative, not résumé claims. */
export const lenses = [
  'Physics',
  'Philosophy',
  'Building in public',
  'Interactive demos',
  'Sustainability',
  'Systems thinking',
] as const;

export const skills = [
  'Python',
  'HTML & CSS',
  'Data analysis (R)',
  'Web design',
  'Branding',
] as const;

/** Homepage hero motions from this repo's policy bundle. */
export const heroMotions = [
  { id: 'idle_02', label: 'Idle' },
  { id: 'walk_01', label: 'Walk' },
  { id: 'run_01', label: 'Run' },
  { id: 'dance_01', label: 'Dance' },
] as const;

export const education = [
  {
    degree: 'B.A. Physics & Philosophy',
    place: 'Reed College, Portland, OR',
    years: 'Aug 2026 - May 2030',
  },
  {
    degree: 'Diploma',
    place: 'Wilbraham & Monson Academy, Wilbraham, MA',
    years: '2023 - 2026',
  },
] as const;

/** Selected ventures from the résumé (college-facing). */
export const ventures = [
  {
    role: 'Founder',
    org: 'To Mo Toys',
    years: 'Jun 2024 - Present',
    blurb:
      'Sustainable handmade toy startup. Upcycled 150kg of surplus wood into 120 toy sets, raised over 40M VND, and funded flood-resistant housing in Quang Tri.',
  },
  {
    role: 'Founder',
    org: 'Anti-flood Community Initiative',
    years: 'Mar 2025 - Present',
    blurb:
      'Built resilient housing and local education in Quang Tri: 30M VND for two flood-resistant homes, coffee reforestation, and disaster-alert outreach.',
  },
] as const;

export const experience = [
  {
    role: 'Interim Chief Operating Officer',
    org: 'Unite Design Saigon',
    years: 'May - Aug 2025',
    blurb:
      'Ran daily operations, inventory, production, and QC. Cut material waste by 15%, lifted retention by 20%, and shipped three new design collections on time.',
  },
  {
    role: 'Intern',
    org: 'Tam Trinh Coffee Import-Export',
    years: 'Jun 2024',
    blurb:
      'Worked through Vietnamese coffee production end to end and produced a brand promo that reached thousands of viewers.',
  },
] as const;

export const research = [
  {
    year: '2025',
    title:
      'Sustainable packaging trends in the beverage industry: A study on production, supply chain, and consumer behavior',
    venue: 'International Journal of Sustainable Development and Planning · Co-author',
    href: 'https://doi.org/10.18280/ijsdp.200706',
  },
  {
    year: '2024',
    title:
      'Factors influencing the acceptance behavior of mobile money usage among Vietnamese consumers',
    venue: 'ICAN 2024 · First Place / Gold Medal',
    href: null,
  },
] as const;
