import {
  Course, Instructor, Testimonial, BlogPost, GalleryItem, SiteSettings, AnnouncementBanner,
  PlacementRecord, Recruiter, PreEnrollmentOffer,
} from './types';

export const defaultSettings: SiteSettings = {
  site_name: 'Savvy Training Institute',
  phone_primary: '+91 7290095961',
  phone_secondary: '+91 7290095962',
  email_primary: 'info@ndtis.in',
  email_secondary: 'worldwidendtis@gmail.com',
  address: 'Office No:1101 Assotech Business Cresstera Tower 1 Sector 135 Noida, (UP) India',
  whatsapp_number: '916361992599',
  facebook_url: 'https://www.facebook.com/worldwidendtinstitutenoida',
  youtube_url: 'https://www.youtube.com/@wwndtis',
  twitter_url: 'https://twitter.com/wwndtis',
  instagram_url: 'https://www.instagram.com/wwndtis',
};

export const defaultBanner: AnnouncementBanner = {
  id: 'b1',
  message: '⚡ Next Batch Starts This Monday! Admissions Open for NDT Level II & QA/QC Certification',
  link_text: 'Apply Now',
  link_url: '/admission',
  is_active: true,
};

export const coursesData: Course[] = [
  {
    id: 'c1',
    slug: 'ndt-level-2-course',
    title: 'NDT Level II Course',
    short_description: 'Comprehensive ASNT Level 2 training covering Ultrasonic, Radiographic, Magnetic Particle, Liquid Penetrant, and Visual Testing with 100% placement support.',
    description: 'Are you ready to take your technical career to the next level? At Savvy Training Institute in Noida, India, we offer a comprehensive NDT Level 2 Course that prepares you for real-world industrial challenges. Whether you are just starting or upskilling, our training programs in NDT Level 2 are built to help you succeed in oil & gas, aerospace, construction, power, and heavy manufacturing.',
    duration: '45 Days',
    fee: '₹35,000',
    training_mode: 'Classroom & Online',
    certification: 'ASNT Level II Certificate (VT, LPT, MPT, UT, RT, RTFI)',
    eligibility: 'B.Tech / Engineering Diploma / B.Sc / 12th Pass',
    placement_support: true,
    rating: 5.0,
    featured_image: '/images/course/ndt-level-2-course.png',
    is_featured: true,
    sort_order: 1,
    modules: [
      { id: 'm1', course_id: 'c1', title: 'Visual Testing (VT)', description: 'Surface flaw identification, optical tools, weld profile inspection, and alignment verification.', sort_order: 1 },
      { id: 'm2', course_id: 'c1', title: 'Liquid Penetrant Testing (LPT)', description: 'Dye penetrant principles, fluorescent penetrants, dwell time, developer application, and discontinuity evaluation.', sort_order: 2 },
      { id: 'm3', course_id: 'c1', title: 'Magnetic Particle Testing (MPT)', description: 'Ferromagnetic inspection, longitudinal/circular magnetization, Yoke method, and magnetic field calibration.', sort_order: 3 },
      { id: 'm4', course_id: 'c1', title: 'Ultrasonic Testing (UT)', description: 'Pulse-echo flaw detectors, straight/angle beam calibration, thickness measurement, and DAC curve creation.', sort_order: 4 },
      { id: 'm5', course_id: 'c1', title: 'Radiographic Testing (RT) & RTFI', description: 'Radiation safety, X-ray/Gamma-ray exposures, film processing, and Radiographic Film Interpretation (RTFI) for welds.', sort_order: 5 },
    ],
    faqs: [
      {
        id: 'f1',
        course_id: 'c1',
        question: 'What is NDT Level II Certification?',
        answer: 'NDT Level II certification qualifies technicians to set up and calibrate inspection equipment, conduct non-destructive tests according to international codes (ASNT SNT-TC-1A / ISO 9712), interpret test results, and supervise Level I personnel.',
        sort_order: 1,
      },
      {
        id: 'f2',
        course_id: 'c1',
        question: 'Does Savvy Training Institute provide 100% placement support?',
        answer: 'Yes! We provide 100% job placement assistance for all qualified NDT Level II students in top companies across India and abroad (Gulf / Middle East).',
        sort_order: 2,
      },
      {
        id: 'f3',
        course_id: 'c1',
        question: 'What is the eligibility for joining the NDT Level 2 Course?',
        answer: 'Candidates with B.Tech, Mechanical/Civil/Electrical Engineering Diplomas, B.Sc, ITI, or 12th pass background are eligible to join.',
        sort_order: 3,
      },
    ],
  },
  {
    id: 'c2',
    slug: 'qa-and-qc-course',
    title: 'QA & QC Course',
    short_description: 'Master Quality Assurance & Quality Control standards, piping inspection, welding codes, and international ISO quality management.',
    description: 'Looking to advance your career in Quality Assurance and Quality Control? Our QA/QC course is carefully designed to equip you with essential skills in mechanical, piping, welding, and structural quality control inspection, ensuring compliance with global ASME, API, and ISO standards.',
    duration: '30 Days',
    fee: '₹35,000',
    training_mode: 'Classroom & Online',
    certification: 'Certified Quality Assurance & Control Inspector (QA/QC)',
    eligibility: 'Engineering Graduate / Diploma / Technical Background',
    placement_support: true,
    rating: 5.0,
    featured_image: '/images/course/qa-and-qc-course.png',
    is_featured: true,
    sort_order: 2,
    modules: [
      { id: 'm21', course_id: 'c2', title: 'Quality System Management (ISO 9001)', description: 'Quality planning, audits, Non-Conformance Reports (NCR), and corrective actions.', sort_order: 1 },
      { id: 'm22', course_id: 'c2', title: 'Welding Inspection & Metallurgy', description: 'Welding processes (SMAW, GTAW, GMAW, SAW), WPS/PQR interpretation, and weld defect diagnosis.', sort_order: 2 },
      { id: 'm23', course_id: 'c2', title: 'Piping & Structural Inspection', description: 'ASME B31.3 / B31.1 code reading, pipe dimensions, flanges, hydro testing, and line walkdown procedures.', sort_order: 3 },
    ],
    faqs: [
      {
        id: 'f21',
        course_id: 'c2',
        question: 'What is the role of a QA/QC Engineer?',
        answer: 'A QA/QC Engineer oversees quality control procedures during fabrication and construction, verifies compliance with codes, reviews material test certificates, and approves final inspection reports.',
        sort_order: 1,
      },
    ],
  },
  {
    id: 'c3',
    slug: 'fire-safety-course',
    title: 'Fire & Safety Course',
    short_description: 'Professional 1-year diploma training in industrial fire protection, hazard management, safety audits, and OSHA compliance.',
    description: 'Prepare for high-demand roles as Fire & Safety Inspector, Health Safety Environment (HSE) Officer, and Industrial Safety Supervisor in oil refineries, construction projects, chemical plants, and commercial complexes.',
    duration: '1 Year / 3 Months',
    fee: '₹45,000',
    training_mode: 'Classroom & Online',
    certification: 'Diploma in Fire & Industrial Safety Engineering',
    eligibility: '10th / 12th / ITI / Graduation',
    placement_support: true,
    rating: 5.0,
    featured_image: '/images/course/fire-safety-course.png',
    is_featured: true,
    sort_order: 3,
    modules: [
      { id: 'm31', course_id: 'c3', title: 'Industrial Fire Protection', description: 'Fire chemistry, hydraulics, automatic sprinkler systems, fire pumps, and suppression equipment.', sort_order: 1 },
      { id: 'm32', course_id: 'c3', title: 'Hazard Identification & Risk Assessment (HIRA)', description: 'Job Safety Analysis (JSA), Permit To Work (PTW) systems, and hazard mitigation.', sort_order: 2 },
    ],
    faqs: [
      {
        id: 'f31',
        course_id: 'c3',
        question: 'Is Fire & Safety training in high demand abroad?',
        answer: 'Yes! Construction and energy sectors in the Middle East and globally actively recruit certified Safety Officers with competitive salary packages.',
        sort_order: 1,
      },
    ],
  },
  {
    id: 'c4',
    slug: 'hvac-course',
    title: 'HVAC Course',
    short_description: 'Practical training in Heating, Ventilation, Air Conditioning design, load calculation, duct sizing, and system troubleshooting.',
    description: 'Master HVAC design, VRF/VRV systems, chilled water plant layout, psychrometric calculations, air duct design, and HVAC installation engineering with real hands-on lab projects.',
    duration: '30 Days',
    fee: '₹25,000',
    training_mode: 'Classroom & Online',
    certification: 'Certified HVAC Design & Installation Engineer',
    eligibility: 'Diploma / B.Tech Mechanical or Electrical / 12th ITI',
    placement_support: true,
    rating: 5.0,
    featured_image: '/images/course/hvac-course.png',
    is_featured: true,
    sort_order: 4,
    modules: [
      { id: 'm41', course_id: 'c4', title: 'Heat Load Calculation & Psychrometrics', description: 'ASHRAE standards, E-20 cooling load calculation, software tools, and humidity control.', sort_order: 1 },
      { id: 'm42', course_id: 'c4', title: 'Duct Design & Air Distribution', description: 'Equal friction method, diffuser selection, fan static pressure calculation, and damper installation.', sort_order: 2 },
    ],
    faqs: [
      {
        id: 'f41',
        course_id: 'c4',
        question: 'Who should take the HVAC course?',
        answer: 'Mechanical & electrical engineers, MEP technicians, and fresh graduates aiming for building services engineering careers.',
        sort_order: 1,
      },
    ],
  },
  {
    id: 'c5',
    slug: 'revit-mep-training-course-fees',
    title: 'Revit MEP Training Course',
    short_description: 'Advanced Building Information Modeling (BIM) training for Mechanical, Electrical, and Plumbing design using Autodesk Revit.',
    description: 'Learn modern 3D BIM modeling, MEP coordination, clash detection, HVAC modeling, piping layouts, electrical conduit routing, and construction documentation in Autodesk Revit.',
    duration: '30 Days',
    fee: '₹25,000',
    training_mode: 'Classroom & Online',
    certification: 'Autodesk Revit MEP Certification',
    eligibility: 'Diploma / B.Tech Civil, Mechanical, Electrical / CAD Designers',
    placement_support: true,
    rating: 5.0,
    featured_image: '/images/course/revit-mep-training-course-fees.png',
    is_featured: false,
    sort_order: 5,
    modules: [
      { id: 'm51', course_id: 'c5', title: 'BIM Fundamentals & Revit Setup', description: 'Building Information Modeling workflows, linking architectural models, grid levels.', sort_order: 1 },
      { id: 'm52', course_id: 'c5', title: '3D Mechanical & Plumbing Modeling', description: 'Ductwork systems, piping runs, sanitary drainage, water supply, and clash detection with Navisworks.', sort_order: 2 },
    ],
    faqs: [
      {
        id: 'f51',
        course_id: 'c5',
        question: 'Are BIM & Revit MEP skills in high demand?',
        answer: 'Yes, modern construction projects globally require BIM Revit MEP modelers for smart infrastructure, high-rise buildings, and industrial facilities.',
        sort_order: 1,
      },
    ],
  },
  {
    id: 'c6',
    slug: 'cswip-3-1-course',
    title: 'CSWIP 3.1 Welding Inspector Course',
    short_description: 'Pre-exam preparation and advanced training for TWI CSWIP 3.1 Welding Inspector global certification.',
    description: 'Gain comprehensive expertise in weld flaws, destructive testing, heat treatment, welding procedures (WPS/PQR), symbol interpretation, and international inspection codes (AWS D1.1, ASME IX).',
    duration: '30 Days',
    fee: '₹1,80,000',
    training_mode: 'Classroom & Online',
    certification: 'TWI CSWIP 3.1 Welding Inspector Prep Certificate',
    eligibility: 'Min 3 years inspection experience or Engineering Degree + 1 yr exp',
    placement_support: true,
    rating: 5.0,
    featured_image: '/images/course/cswip-3-1-course.png',
    is_featured: false,
    sort_order: 6,
    modules: [
      { id: 'm61', course_id: 'c6', title: 'Welding Inspection Duties & Terminology', description: 'Before, during, and after welding duties, joint geometry, and weld symbol specifications.', sort_order: 1 },
      { id: 'm62', course_id: 'c6', title: 'Codes, Standards & WPS/PQR', description: 'ASME IX, AWS D1.1, BS EN ISO standards, qualifying procedures, and welder certification.', sort_order: 2 },
    ],
    faqs: [
      {
        id: 'f61',
        course_id: 'c6',
        question: 'What is CSWIP 3.1 certification?',
        answer: 'CSWIP 3.1 is an internationally recognized welding inspection credential issued by TWI (The Welding Institute, UK), leading to premier inspection jobs globally.',
        sort_order: 1,
      },
    ],
  },
];

export const instructorsData: Instructor[] = [
  {
    id: 'i1',
    name: 'Feroz Alam',
    role: 'Director',
    bio: 'A dynamic and results-driven director with over ten years of expertise in Non-Destructive Testing (NDT) training, renowned for building innovative, industry-aligned programs that empower students and instructors.',
    photo_url: '/instructors/feroz-alam.jpg',
    sort_order: 1,
  },
  {
    id: 'i2',
    name: 'Tabrej Alam',
    role: 'Director',
    bio: 'A visionary leader with a decade of teaching experience in engineering inspection, combining deep technical knowledge with student-first career guidance.',
    photo_url: '/instructors/tabrej-alam.jpg',
    sort_order: 2,
  },
  {
    id: 'i3',
    name: 'Md Javed',
    role: 'Senior NDT Instructor',
    bio: 'A seasoned educator with ten years of specialized experience in NDT Training, delivering practical ultrasonic, radiographic film reading, and magnetic particle testing sessions.',
    photo_url: '/instructors/md-javed.jpg',
    sort_order: 3,
  },
  {
    id: 'i4',
    name: 'Deepak Kumar',
    role: 'Digital & Systems Lead',
    bio: 'Oversees technical infrastructure, digital student platforms, and communications for Savvy Training Institute.',
    photo_url: '/instructors/deepak-kumar.jpg',
    sort_order: 4,
  },
];

export const testimonialsData: Testimonial[] = [
  {
    id: 't1',
    student_name: 'Shadab',
    course_taken: 'NDT Level II Course',
    rating: 5,
    quote: 'Outstanding job placement assistance! I secured a quality inspector position in the Gulf region soon after completing my NDT Level II Course at Savvy Training Institute. The hands-on flaw detection training gave me immense confidence.',
    is_featured: true,
  },
  {
    id: 't2',
    student_name: 'Vikash',
    course_taken: 'NDT Level II & QA/QC',
    rating: 5,
    quote: 'Great facilities and hands-on experience! The practical sessions provided real-world exposure to ultrasonic flaw detectors, radiographic film reading, and magnetic particle yokes.',
    is_featured: true,
  },
  {
    id: 't3',
    student_name: 'Rohit',
    course_taken: 'QA/QC Inspection Course',
    rating: 5,
    quote: 'Excellent training and supportive instructors! They ensure you grasp every technical aspect. The detailed preparation helped me pass my certification exam with flying colors.',
    is_featured: true,
  },
  {
    id: 't4',
    student_name: 'Sanjay',
    course_taken: 'Fire & Safety Course',
    rating: 5,
    quote: 'Top-notch certification program! The course structure was well-planned, covering industrial safety codes and practical hazard management. Grateful for the placement support!',
    is_featured: true,
  },
];

export const blogPostsData: BlogPost[] = [
  {
    id: 'b1',
    slug: 'exploring-the-top-non-destructive-testing-ndtmethods',
    title: 'Exploring the Top Non-Destructive Testing (NDT) Methods',
    excerpt: 'Non-destructive testing (NDT) methods play a crucial role in ensuring structural integrity without damaging components. Learn about UT, RT, MT, PT, and VT.',
    content: `Non-Destructive Testing (NDT) comprises a set of analysis techniques used in science and industry to evaluate the properties of a material, component, or system without causing damage. 

At Savvy Training Institute, our ASNT Level 2 program trains students in the five primary methods:
- **Visual Testing (VT)**: Surface flaw analysis, alignment, and weld profile checks.
- **Liquid Penetrant Testing (LPT)**: Detecting surface-breaking cracks using dye penetrants.
- **Magnetic Particle Testing (MPT)**: Surface and near-surface discontinuity inspection in ferromagnetic metals.
- **Ultrasonic Testing (UT)**: Using high-frequency sound waves to measure wall thickness and locate internal voids.
- **Radiographic Testing (RT)**: Internal structure analysis using X-rays and Gamma radiation.`,
    featured_image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop',
    category_name: 'NDT Techniques',
    author_name: 'Feroz Alam',
    published_at: '2025-04-10',
  },
  {
    id: 'b2',
    slug: 'radiographic-testing-rt-a-comprehensive-overview',
    title: 'Radiographic Testing (RT): A Comprehensive Industrial Guide',
    excerpt: 'Discover how Radiographic Testing utilizes X-rays and Gamma rays to inspect internal material structures and weld integrity.',
    content: `Radiographic Testing (RT) is one of the most critical NDT inspection techniques used in pipeline construction, pressure vessel fabrication, and aerospace engineering. 

By passing radiation through an object onto industrial film or digital sensors, inspectors can detect internal voids, porosity, incomplete penetration, and micro-cracks. Understanding film density, sensitivity, and radiation safety protocols is central to becoming a certified RTFI technician.`,
    featured_image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop',
    category_name: 'NDT Techniques',
    author_name: 'Md Javed',
    published_at: '2025-04-18',
  },
  {
    id: 'b3',
    slug: 'complete-guide-to-ndt-level-ii-certification-requirements-training-and-career-opportunities',
    title: 'Complete Guide to NDT Level II Certification: Requirements & Career Growth',
    excerpt: 'Everything you need to know about eligibility, course duration, syllabus, and global career opportunities in NDT Level 2.',
    content: `NDT Level II certification qualifies technicians to set up and calibrate inspection equipment, perform tests according to written procedures, evaluate and record test results, and supervise Level I technicians. 

Demand for certified ASNT Level II inspectors is surging across oil & gas refineries, aerospace manufacturing, shipyards, and major infrastructure projects both in India and abroad.`,
    featured_image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop',
    category_name: 'Career Advice',
    author_name: 'Feroz Alam',
    published_at: '2025-05-02',
  },
];

export const galleryData: GalleryItem[] = [
  { id: 'g1', title: 'Ultrasonic Flaw Detector Lab Session', image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1000&auto=format&fit=crop', category: 'Lab & Practical' },
  { id: 'g2', title: 'Piping & Weld Inspection Training', image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000&auto=format&fit=crop', category: 'Site Visit' },
  { id: 'g3', title: 'QA/QC Inspection Instruments Demo', image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1000&auto=format&fit=crop', category: 'Lab & Practical' },
  { id: 'g4', title: 'Classroom Theory & Standards Lecture', image_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1000&auto=format&fit=crop', category: 'Classroom' },
  { id: 'g5', title: 'Student Graduation & Certification Event', image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop', category: 'Events' },
  { id: 'g6', title: 'HVAC Ducting & Refrigeration Lab', image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000&auto=format&fit=crop', category: 'Lab & Practical' },
  { id: 'g7', title: 'Fire & Industrial Safety Drill', image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1000&auto=format&fit=crop', category: 'Lab & Practical' },
  { id: 'g8', title: 'Revit MEP 3D Modeling Workshop', image_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1000&auto=format&fit=crop', category: 'Classroom' },
];

// --- Placement (institute's primary focus) ---

export const placementsData: PlacementRecord[] = [
  { id: 'p1', student_name: 'Rahul Verma', course_title: 'NDT Level II Course', company: 'Bureau Veritas', job_role: 'NDT Technician Level II', location: 'Abu Dhabi, UAE', package_lpa: '₹9.6 LPA', placed_on: '2026-03-27', is_featured: true, sort_order: 1, photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop' },
  { id: 'p2', student_name: 'Priya Singh', course_title: 'Fire & Safety Course', company: 'Adani Ports & SEZ', job_role: 'Safety Officer', location: 'Mundra, India', package_lpa: '₹6.2 LPA', placed_on: '2026-04-26', is_featured: true, sort_order: 2, photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop' },
  { id: 'p3', student_name: 'Amit Kumar', course_title: 'CSWIP 3.1 Welding Inspector Course', company: 'Petrofac', job_role: 'Welding Inspector', location: 'Doha, Qatar', package_lpa: '₹12.4 LPA', placed_on: '2026-05-26', is_featured: true, sort_order: 3, photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop' },
  { id: 'p4', student_name: 'Mohd Arshad', course_title: 'QA & QC Course', company: 'L&T Hydrocarbon Engineering', job_role: 'QA/QC Engineer', location: 'Hazira, India', package_lpa: '₹7.8 LPA', placed_on: '2026-06-10', is_featured: true, sort_order: 4, photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop' },
  { id: 'p5', student_name: 'Sneha Rathore', course_title: 'HVAC Course', company: 'Voltas Ltd', job_role: 'HVAC Site Engineer', location: 'Noida, India', package_lpa: '₹5.4 LPA', placed_on: '2026-06-25', is_featured: false, sort_order: 5, photo_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=400&auto=format&fit=crop' },
  { id: 'p6', student_name: 'Imran Sheikh', course_title: 'NDT Level II Course', company: 'SGS India', job_role: 'Radiographer Level II', location: 'Jamnagar, India', package_lpa: '₹8.1 LPA', placed_on: '2026-07-05', is_featured: false, sort_order: 6, photo_url: 'https://images.unsplash.com/photo-1508341591423-4347099e1f19?q=80&w=400&auto=format&fit=crop' },
];

export const recruitersData: Recruiter[] = [
  { id: 'r1', name: 'Bureau Veritas', industry: 'Third-party inspection', sort_order: 1 },
  { id: 'r2', name: 'TUV India', industry: 'Certification & inspection', sort_order: 2 },
  { id: 'r3', name: 'SGS India', industry: 'Testing & verification', sort_order: 3 },
  { id: 'r4', name: 'L&T Hydrocarbon', industry: 'Oil & gas EPC', sort_order: 4 },
  { id: 'r5', name: 'Reliance Industries', industry: 'Refining & petrochemicals', sort_order: 5 },
  { id: 'r6', name: 'Adani Ports & SEZ', industry: 'Infrastructure', sort_order: 6 },
  { id: 'r7', name: 'Saipem', industry: 'Offshore EPC', sort_order: 7 },
  { id: 'r8', name: 'Petrofac', industry: 'Energy services', sort_order: 8 },
  { id: 'r9', name: 'Gulf Technical Inspection', industry: 'Middle East inspection', sort_order: 9 },
  { id: 'r10', name: 'Intertek', industry: 'Quality assurance', sort_order: 10 },
  { id: 'r11', name: 'Voltas Ltd', industry: 'HVAC & cooling', sort_order: 11 },
  { id: 'r12', name: 'Tata Projects', industry: 'Engineering & construction', sort_order: 12 },
];

/** Headline placement numbers used across the site. */
export const placementStats = {
  students_placed: '10,000+',
  placement_support: '100%',
  highest_package: '₹18 LPA',
  hiring_partners: '250+',
  countries: '12+',
};

// --- Pre-enrolment offers ---

export const preEnrollmentOffersData: PreEnrollmentOffer[] = [
  { id: 'o1', title: 'Early-Bird Pre-Enrolment', description: 'Book your seat before the batch starts and lock in the current fee with a flat discount on any certification course.', discount_label: '25% OFF', coupon_code: 'EARLY25', valid_till: '2026-08-24', seats_left: 12, is_active: true, sort_order: 1 },
  { id: 'o2', title: 'YouTube Subscriber Offer', description: 'Watching us on YouTube? Pre-enrol with this code for an extra fee waiver plus a free NDT fundamentals starter kit.', discount_label: '₹5,000 OFF', coupon_code: 'WWNDTYT', valid_till: '2026-09-08', seats_left: 25, is_active: true, sort_order: 2 },
  { id: 'o3', title: 'Placement Fast-Track Bundle', description: 'Pre-enrol in any two courses and get free placement fast-track: CV workshop, mock interviews and priority recruiter referrals.', discount_label: 'BUNDLE', coupon_code: 'PLACE2X', valid_till: '2026-09-23', seats_left: 8, is_active: true, sort_order: 3 },
];
