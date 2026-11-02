/**
 * Wording taken from https://savvytrainingacademy.co.uk/ (captured 2 Nov 2026).
 * Prices, downloadable files, reviews and forum threads are not published there.
 */

export const academyIntro = {
  eyebrow: 'Courses by Lisa Zaman',
  heading: 'Learn it. Teach it. Certify it.',
  lead:
    'Savvy Training Academy helps professionals and businesses get their skills recognised. Earn regulated teaching qualifications, take online courses in beauty, massage and hairdressing, and get accredited to certify learners in your own right.',
  founderName: 'Lisa Zaman',
  founderRole: 'Founder, tutor and assessor',
  founderInitials: 'LZ',
  founderIntro:
    'Lisa Zaman founded Savvy Training Academy. She teaches the online courses, tutors the regulated teaching qualifications, and reviews accreditation applications against content, assessment and learner-safety standards. Approved providers receive written feedback, then an accreditation certificate and logo from their account.',
};

export const accreditationSectors = [
  'Beauty & aesthetics',
  'Hair',
  'Holistic & massage',
  'Fitness',
  'Health & social care',
  'Hospitality',
  'Business skills',
  'Education',
] as const;

export const accreditationSteps = [
  {
    title: 'Apply online',
    body: 'Tell us about your business, the course you deliver and who it is for.',
  },
  {
    title: 'Upload your documents',
    body: 'Course manual, lesson plans, assessment materials, insurance and your own qualifications. Everything is stored securely in your account.',
  },
  {
    title: 'Review by Lisa',
    body: 'Your course is checked against content, assessment and learner-safety standards. You get written feedback on anything that needs changing.',
  },
  {
    title: 'Download your certificate',
    body: 'Once approved, your accreditation certificate and logo are ready for instant download from your account.',
  },
] as const;

export const teachingQualifications = [
  {
    slug: 'award-in-education-and-training',
    title: 'Award in Education and Training',
    summary: 'The starting point for anyone new to teaching',
    introduction: 'If you have not taught before, this is the first qualification to look at. It is the starting point for new trainers.',
    gain: 'A starting qualification for anyone new to teaching.',
    level: 'Level 3',
    audience: 'New trainers in any sector',
    study: 'Online + Zoom',
  },
  {
    slug: 'certificate-in-education-and-training',
    title: 'Certificate in Education and Training',
    summary: 'Build on the Award with teaching practice',
    introduction: 'This follows the Award. It is for people who already train or tutor and want to add teaching practice.',
    gain: 'Teaching practice that builds on the Award.',
    level: 'Level 4',
    audience: 'Working trainers and tutors',
    study: 'Online + Zoom',
  },
  {
    slug: 'diploma-in-education-and-training',
    title: 'Diploma in Education and Training',
    summary: 'Full teaching qualification for further education',
    introduction: 'This is the full teaching qualification for further education. It is aimed at people who want teaching to be their career.',
    gain: 'The full teaching qualification for further education and training.',
    level: 'Level 5',
    audience: 'Career teachers in FE and training',
    study: 'Online + Zoom',
  },
  {
    slug: 'certificate-in-assessing-vocational-achievement',
    title: 'Certificate in Assessing Vocational Achievement',
    summary: 'Assess learners in the workplace and classroom',
    introduction: 'This qualification is about assessing learners, both at work and in the classroom. It is for assessors and practical trainers.',
    gain: 'The qualification for assessing learners in the workplace and the classroom.',
    level: 'Level 3',
    audience: 'Assessors and practical trainers',
    study: 'Online + Zoom',
  },
  {
    slug: 'internal-quality-assurance',
    title: 'Internal Quality Assurance',
    summary: 'Quality-check assessment across a centre',
    introduction: 'This qualification is for experienced assessors who check that assessment is consistent across a training centre.',
    gain: 'The qualification for quality-checking assessment across a centre.',
    level: 'Level 4',
    audience: 'Experienced assessors',
    study: 'Online + Zoom',
  },
] as const;

export const STRATEGY_CALL_LABEL = 'Free Technical Career Strategy Call';

export const homepageFaqSeed = [
  {
    id: 'faq-start',
    question: 'Which teaching qualification should I start with?',
    answer:
      'If you have not taught before, start with the Level 3 Award in Education and Training. It is the starting point for new trainers in any sector. The Level 4 Certificate is for working trainers and tutors and adds teaching practice to the Award. The Level 5 Diploma is the full teaching qualification for further education.',
  },
  {
    id: 'faq-online',
    question: 'Can I study online?',
    answer:
      'Yes. The teaching qualifications are completed online, with live Zoom sessions. The beauty, massage and hairdressing courses are online and self-paced.',
  },
  {
    id: 'faq-zoom',
    question: 'Are Zoom sessions available?',
    answer:
      'Teaching qualifications include scheduled Zoom classes and one-to-one tutorials. Learners join them from the student portal.',
  },
  {
    id: 'faq-assignments',
    question: 'How do I submit my assignments?',
    answer:
      'On a teaching qualification, you upload your work as files. Briefs and resources can be downloaded from the portal.',
  },
  {
    id: 'faq-feedback',
    question: 'Will I receive feedback on my work?',
    answer:
      'Yes. Your tutor marks each piece of teaching work and leaves written feedback. Accreditation applications also receive written feedback from Lisa before a decision.',
  },
  {
    id: 'faq-certificate',
    question: 'How do I receive my certificate?',
    answer:
      'Online courses include a certificate on completion. Once an accreditation application is approved, the certificate and logo are ready to download from the account. The website does not publish a separate delivery method for teaching qualification certificates.',
  },
  {
    id: 'faq-accreditation',
    question: 'How can I apply for course accreditation?',
    answer:
      'Apply online and describe your business, the course you deliver and who it is for. You then upload the course manual, lesson plans, assessment materials, insurance and your own qualifications. Lisa reviews the course against content, assessment and learner-safety standards.',
  },
  {
    id: 'faq-mentorship',
    question: 'How can I contact Savvy for mentorship?',
    answer:
      'Use the mentorship page to ask about business start-ups, regular mentorship, venue set-up or awarding body registration. You can also send a message through the contact form. A postal address, phone number and email address are not published.',
  },
  {
    id: 'faq-portal',
    question: 'How do I access the student portal?',
    answer:
      'Use the Login button. Tutors and students have separate secure logins and their own dashboards. Teaching learners use the portal to join Zoom sessions and upload assignments.',
  },
] as const;

export const teachingFeatures = [
  {
    title: 'Live Zoom sessions',
    body: 'Scheduled classes and one-to-one tutorials, joined straight from your portal.',
  },
  {
    title: 'Upload assignments',
    body: 'Submit your work as files. Download briefs and resources whenever you need them.',
  },
  {
    title: 'Marking with feedback',
    body: 'Your tutor marks each piece and leaves written feedback you can act on.',
  },
  {
    title: 'Tutor and student logins',
    body: 'Separate secure areas for learners and tutors, each with their own dashboard.',
  },
] as const;

export const onlineCourses = [
  {
    slug: 'beauty-therapy-essentials',
    title: 'Beauty Therapy Essentials',
    summary: 'Facials, waxing, brow shaping and client consultation.',
    modules: '8 modules',
  },
  {
    slug: 'swedish-massage',
    title: 'Swedish Massage',
    summary: 'Full-body massage routine, anatomy and contraindications.',
    modules: '6 modules',
  },
  {
    slug: 'hairdressing-foundations',
    title: 'Hairdressing Foundations',
    summary: 'Cutting, colour theory, blow-drying and styling.',
    modules: '10 modules',
  },
  {
    slug: 'lash-extensions',
    title: 'Lash Extensions',
    summary: 'Classic and volume techniques, isolation and aftercare.',
    modules: '5 modules',
  },
  {
    slug: 'nail-technology',
    title: 'Nail Technology',
    summary: 'Gel polish, extensions, nail art and hygiene.',
    modules: '7 modules',
  },
  {
    slug: 'hot-stone-massage',
    title: 'Hot Stone Massage',
    summary: 'Stone heating, placement and combined techniques.',
    modules: '4 modules',
  },
] as const;

export const shopProducts = [
  {
    slug: 'course-manual-pack',
    title: 'Course Manual Pack',
    format: 'PDF download',
    includes: ['Beauty, massage or hair manual', 'Editable for your branding', 'Learner workbook included'],
  },
  {
    slug: 'business-starter-kit',
    title: 'Business Starter Kit',
    format: 'PDF + templates',
    includes: ['Business plan template', 'Pricing calculator', 'Launch checklist'],
  },
  {
    slug: 'consultation-and-consent-forms',
    title: 'Consultation & Consent Forms',
    format: 'Editable Word files',
    includes: ['Client record cards', 'Consent and aftercare forms', 'Contraindication checklists'],
  },
  {
    slug: 'trainer-resource-bundle',
    title: 'Trainer Resource Bundle',
    format: 'PDF + slides',
    includes: ['Lesson plans and schemes of work', 'Assessment paperwork', 'Certificate templates'],
  },
] as const;

export const mentorshipServices = [
  {
    title: 'Business start-ups',
    body: 'Plan your services, pricing, insurance and launch.',
    option: 'Starting a business',
  },
  {
    title: 'Mentorship',
    body: 'Regular sessions to keep you on track as you grow.',
    option: 'Ongoing mentorship',
  },
  {
    title: 'Venue set-ups',
    body: 'Layout, equipment and compliance for your salon or training room.',
    option: 'Setting up a venue',
  },
  {
    title: 'Awarding body registration',
    body: 'Help preparing and submitting your centre approval.',
    option: 'Registering with an awarding body',
  },
] as const;

export const careerSpecialisms = [
  'Beauty therapist',
  'Massage therapist',
  'Hairdresser',
  'Nail technician',
  'Lash & brow technician',
  'Trainer / assessor',
] as const;

export const careerAvailability = ['Full time', 'Part time', 'Freelance'] as const;

export const careerSteps = [
  { title: 'Upload your CV', body: 'Add your specialism, location and availability.' },
  { title: 'Get matched', body: 'We share your profile with employers who need your skills.' },
  { title: 'Hear from employers', body: 'Interested employers contact you directly.' },
] as const;

export const missingFromSource = [
  'No course prices are published.',
  'No shop prices or downloadable files are published. The basket on the reference site does not complete a payment.',
  'No postal address, phone number or email address is published in the footer.',
  'No founder photograph or longer biography is published.',
  'Student forum entries on the reference site are labelled as example threads, so they are not imported.',
  'No approved student reviews are published.',
  'The certificate shown on the reference homepage is labelled as an example, including the sample number STA-ACC-2026-0418.',
] as const;
