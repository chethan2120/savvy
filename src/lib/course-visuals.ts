export type CourseVisual = {
  src: string;
  alt: string;
};

/** Original photographs made for this site. Each course has its own picture. */
export const courseVisuals: Record<string, CourseVisual> = {
  'award-in-education-and-training': {
    src: '/images/courses/award-in-education-and-training.jpg',
    alt: 'A trainer speaking with adult learners in a classroom',
  },
  'certificate-in-education-and-training': {
    src: '/images/courses/certificate-in-education-and-training.jpg',
    alt: 'A tutor observing an adult giving a short teaching presentation',
  },
  'diploma-in-education-and-training': {
    src: '/images/courses/diploma-in-education-and-training.jpg',
    alt: 'An adult lecturer with a small further-education class',
  },
  'certificate-in-assessing-vocational-achievement': {
    src: '/images/courses/certificate-in-assessing-vocational-achievement.jpg',
    alt: 'An assessor watching a trainee during a salon consultation',
  },
  'internal-quality-assurance': {
    src: '/images/courses/internal-quality-assurance.jpg',
    alt: 'An assessor reviewing training assessment folders at a desk',
  },
  'beauty-therapy-essentials': {
    src: '/images/courses/beauty-therapy-essentials.jpg',
    alt: 'A beauty therapist in consultation with a client',
  },
  'swedish-massage': {
    src: '/images/courses/swedish-massage.jpg',
    alt: 'A treatment room prepared for a Swedish massage lesson',
  },
  'hairdressing-foundations': {
    src: '/images/courses/hairdressing-foundations.jpg',
    alt: 'A hairdresser cutting and drying a client’s hair',
  },
  'lash-extensions': {
    src: '/images/courses/lash-extensions.jpg',
    alt: 'A lash technician applying eyelash extensions',
  },
  'nail-technology': {
    src: '/images/courses/nail-technology.jpg',
    alt: 'A nail technician applying polish at a manicure desk',
  },
  'hot-stone-massage': {
    src: '/images/courses/hot-stone-massage.jpg',
    alt: 'Heated massage stones warming in a treatment-room heater',
  },
};

export function courseVisual(slug: string): CourseVisual | null {
  return courseVisuals[slug] ?? null;
}

export function courseVisualBySrc(src?: string | null): CourseVisual | null {
  if (!src) return null;
  return Object.values(courseVisuals).find((item) => item.src === src) ?? null;
}

export function categoryVisual(categoryId: string, categoryName: string): CourseVisual | null {
  const name = categoryName.toLowerCase();
  if (categoryId === 'cat-teaching' || name.includes('teaching')) return courseVisual('award-in-education-and-training');
  if (categoryId === 'cat-online' || name.includes('online')) return courseVisual('beauty-therapy-essentials');
  return null;
}
