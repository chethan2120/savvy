import {
  Course, Instructor, Testimonial, BlogPost, GalleryItem, SiteSettings, AnnouncementBanner,
  PlacementRecord, Recruiter, PreEnrollmentOffer,
} from './types';

export const defaultSettings: SiteSettings = {
  site_name: 'Savvy Training Institute',
  phone_primary: '+91 90000 12345',
  email_primary: 'contact@savvytraining.example',
  address: 'Savvy Training Institute, Training Centre, Bengaluru, Karnataka, India',
  whatsapp_number: '919000012345',
  facebook_url: '',
  youtube_url: '',
  twitter_url: '',
  instagram_url: '',
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
    short_description: 'Comprehensive ASNT Level II training covering Ultrasonic, Radiographic, Magnetic Particle, Liquid Penetrant, and Visual Testing.',
    description: 'Are you ready to take your technical career to the next level? At Savvy Training Institute in Bengaluru, India, we offer a comprehensive NDT Level 2 Course that prepares you for real-world industrial challenges. Whether you are just starting or upskilling, our training programs in NDT Level 2 are built to help you succeed in oil & gas, aerospace, construction, power, and heavy manufacturing.',
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
        question: 'Does completing this course guarantee employment?',
        answer: 'No employment outcome is guaranteed. Career outcomes depend on each learner’s qualifications, experience, and employer requirements.',
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
      { id: 'm24', course_id: 'c2', title: 'Pressure Vessels & Storage Tanks', description: 'ASME Section VIII Div 1 & API 650 inspection criteria, fabrication tolerances, and shell plate testing.', sort_order: 4 },
      { id: 'm25', course_id: 'c2', title: 'Protective Coatings & NDT Evaluation', description: 'Surface preparation (SSPC/NACE), DFT measurement, holiday detection, and final signoff documentation.', sort_order: 5 },
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
      { id: 'm33', course_id: 'c3', title: 'Occupational Health & Environmental Safety (OSHA)', description: 'Workplace toxicology, personal protective equipment (PPE), ergonomics, and noise pollution control.', sort_order: 3 },
      { id: 'm34', course_id: 'c3', title: 'Construction Safety & Scaffolding Standards', description: 'Working at heights, excavation safety, scaffolding tagging (OSHA/BS), and heavy lifting compliance.', sort_order: 4 },
      { id: 'm35', course_id: 'c3', title: 'Emergency Response & Industrial Disaster Management', description: 'Evacuation drills, chemical spill containment, HAZMAT protocols, and crisis command procedures.', sort_order: 5 },
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
      { id: 'm43', course_id: 'c4', title: 'Chilled Water Systems & Equipment Selection', description: 'Centrifugal chillers, cooling towers, primary/secondary pumps, and AHU/FCU sizing calculations.', sort_order: 3 },
      { id: 'm44', course_id: 'c4', title: 'VRF/VRV Design & Refrigerant Piping', description: 'Variable Refrigerant Flow architecture, indoor unit diversity factor, and copper pipe brazing standards.', sort_order: 4 },
      { id: 'm45', course_id: 'c4', title: 'Testing, Adjusting & Balancing (TAB) and BMS', description: 'Anemometer air flow measurements, water balancing valves, and Building Management System controls.', sort_order: 5 },
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
      { id: 'm53', course_id: 'c5', title: 'Electrical Systems & Conduit Modeling', description: 'Lighting fixtures, cable tray routing, panel schedules, switchboards, and power circuit modeling.', sort_order: 3 },
      { id: 'm54', course_id: 'c5', title: 'Fire Fighting & Sprinkler Distribution', description: 'Fire protection network modeling, sprinkler heads, zone control valves, and hydraulic pipe sizing.', sort_order: 4 },
      { id: 'm55', course_id: 'c5', title: 'Clash Resolution & Construction Documentation', description: 'Navisworks Manage clash matrix tests, MEP shop drawings, bill of quantities (BOQ), and sheet generation.', sort_order: 5 },
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
      { id: 'm63', course_id: 'c6', title: 'Weld Defect Morphology & Root Causes', description: 'Cracking mechanisms (hydrogen, solidification), lack of fusion, porosity, and lamellar tearing.', sort_order: 3 },
      { id: 'm64', course_id: 'c6', title: 'Destructive Testing & Metallurgy', description: 'Tensile, Charpy V-notch impact, bend, and hardness testing per BS EN ISO 9018/15614.', sort_order: 4 },
      { id: 'm65', course_id: 'c6', title: 'Radiographic Interpretation & Visual Inspection Exam', description: 'Real radiographic weld films interpretation and practical plate/pipe inspection under exam conditions.', sort_order: 5 },
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
  {
    id: 'c7',
    slug: 'ultrasonic-testing-level-2',
    title: 'Ultrasonic Testing (UT) Level II Specialist',
    short_description: 'Advanced hands-on training in ultrasonic flaw detection, calibration blocks, DAC curves, and weld inspection.',
    description: 'A focused, laboratory-intensive course dedicated entirely to Ultrasonic Testing (UT) Level II. Master straight beam thickness measurement, angle beam shear wave inspection for weld joints, discontinuity sizing, and calibration with international IIW reference standards.',
    duration: '30 Days',
    fee: '₹28,000',
    training_mode: 'Classroom & Laboratory',
    certification: 'ASNT Level II Ultrasonic Testing (UT) Specialist',
    eligibility: 'Engineering Diploma / B.Tech / B.Sc / 12th ITI',
    placement_support: true,
    rating: 5.0,
    featured_image: '/images/course/ndt-level-2-course.png',
    is_featured: false,
    sort_order: 7,
    modules: [
      { id: 'm71', course_id: 'c7', title: 'Acoustic Wave Physics & Probe Calibration', description: 'Longitudinal and transverse shear wave velocity calculations, probe indexing, and beam angle verification.', sort_order: 1 },
      { id: 'm72', course_id: 'c7', title: 'IIW V1 & V2 Calibration Block Operations', description: 'Time-base range calibration, zero offset adjustment, and index point determination.', sort_order: 2 },
      { id: 'm73', course_id: 'c7', title: 'DAC & TCG Curve Construction', description: 'Plotting Distance Amplitude Correction curves and Time Corrected Gain for flaw sizing per ASME Sec V.', sort_order: 3 },
      { id: 'm74', course_id: 'c7', title: 'Butt Weld Scanning & Flaw Sizing', description: 'Practical flaw sizing using 6dB and 20dB drop methods on welded coupon samples.', sort_order: 4 },
      { id: 'm75', course_id: 'c7', title: 'ASNT UT Level II Written Practice & Reporting', description: 'Preparing formal ultrasonic examination procedures, reporting test findings, and calibration records.', sort_order: 5 },
    ],
    faqs: [
      {
        id: 'f71',
        course_id: 'c7',
        question: 'What instruments will I practice with during the UT course?',
        answer: 'Students train directly on calibrated digital ultrasonic flaw detectors, dual-element straight beam probes, angle beam transducers (45°, 60°, 70°), and precision calibration blocks.',
        sort_order: 1,
      },
    ],
  },
  {
    id: 'c8',
    slug: 'radiographic-film-interpretation-rtfi',
    title: 'Radiographic Film Interpretation (RTFI)',
    short_description: 'Master industrial X-ray and Gamma-ray film reading, defect identification, and code compliance reporting.',
    description: 'Specialized training for engineers and technicians in interpreting radiographic films of welds and castings. Learn to accurately identify porosity, tungsten inclusions, lack of penetration, and micro-cracks against ASME Section VIII and API 1104 acceptance thresholds.',
    duration: '20 Days',
    fee: '₹25,000',
    training_mode: 'Classroom & Laboratory',
    certification: 'ASNT Level II Radiographic Film Interpreter (RTFI)',
    eligibility: 'Engineering / Science Graduate or NDT Level I',
    placement_support: true,
    rating: 5.0,
    featured_image: '/images/course/qa-and-qc-course.png',
    is_featured: false,
    sort_order: 8,
    modules: [
      { id: 'm81', course_id: 'c8', title: 'Sensitometry & Film Quality Assessment', description: 'Optical density verification using calibrated transmission densitometers, IQI sensitivity, and geometric unsharpness.', sort_order: 1 },
      { id: 'm82', course_id: 'c8', title: 'Weld Discontinuity Identification', description: 'Classifying planar vs volumetric flaws: slag lines, gas pores, hollow beads, root cracks, and undercut.', sort_order: 2 },
      { id: 'm83', course_id: 'c8', title: 'Code Acceptance & Reporting', description: 'Applying ASME Sec VIII Div 1 Appendix 4 and API 1104 Section 9 standards to prepare signed inspection dispositions.', sort_order: 3 },
      { id: 'm84', course_id: 'c8', title: 'Casting & Forging Radiography Evaluation', description: 'ASTM reference radiographs (E446, E186) for gas porosity, sand inclusions, shrinkages, and hot tears.', sort_order: 4 },
      { id: 'm85', course_id: 'c8', title: 'Digital Radiography (CR/DR) Principles', description: 'Computed radiography imaging plates, digital detector arrays (DDA), and digital viewer calibration.', sort_order: 5 },
    ],
    faqs: [
      {
        id: 'f81',
        course_id: 'c8',
        question: 'Why is RTFI certification in high demand?',
        answer: 'Third-party inspection agencies and EPC contractors require certified RTFI technicians to review radiograph packages before signing off on critical boilers, pressure vessels, and cross-country pipelines.',
        sort_order: 1,
      },
    ],
  },
  {
    id: 'c9',
    slug: 'piping-and-pipeline-inspection',
    title: 'Piping & Pipeline Inspection Engineering',
    short_description: 'Quality assurance, isometric drawing walkdown, pressure testing, and code compliance for process piping.',
    description: 'Develop expert competence in process piping and cross-country pipeline inspection. Covering ASME B31.3 process piping, ASME B31.4/B31.8 pipeline systems, Material Test Reports (MTR), flange management, and hydrostatic leak testing.',
    duration: '30 Days',
    fee: '₹32,000',
    training_mode: 'Classroom & Online Hybrid',
    certification: 'Certified Piping & Pipeline Quality Inspector',
    eligibility: 'B.Tech / Diploma in Mechanical or Chemical Engineering',
    placement_support: true,
    rating: 5.0,
    featured_image: '/images/course/cswip-3-1-course.png',
    is_featured: false,
    sort_order: 9,
    modules: [
      { id: 'm91', course_id: 'c9', title: 'Piping Design Codes & Material Verification', description: 'ASME B31.3 code rules, ASTM pipe and fitting metallurgy, heat number traceability, and review of Mill Test Certificates (MTC).', sort_order: 1 },
      { id: 'm92', course_id: 'c9', title: 'Isometric Walkdown & Spool Fabrication', description: 'Checking spool orientation, support placement, valve installation, and tolerance verification against piping isometrics.', sort_order: 2 },
      { id: 'm93', course_id: 'c9', title: 'Pressure Testing & Flange Management', description: 'Hydrostatic and pneumatic leak testing procedures, test manifold setup, torque tightening sequences, and punch list clearance.', sort_order: 3 },
      { id: 'm94', course_id: 'c9', title: 'Pipeline Cross-Country Construction & Trenching', description: 'API 1104 welding standards, stringing, ditching, lower-and-lay operations, and cathodic protection testing.', sort_order: 4 },
      { id: 'm95', course_id: 'c9', title: 'Final Dossier Preparation & As-Built Certification', description: 'Welding summary logs, hydrotest signoffs, NDT clearances, and compilation of turnover inspection dossiers.', sort_order: 5 },
    ],
    faqs: [
      {
        id: 'f91',
        course_id: 'c9',
        question: 'What career opportunities follow this piping inspection qualification?',
        answer: 'Graduates pursue positions as Piping QC Inspectors, Mechanical Quality Engineers, and Pipeline QA/QC Supervisors on oil refineries, gas processing plants, and offshore platforms.',
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
    quote: 'The hands-on flaw detection training gave me confidence in the technical material.',
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
    quote: 'The course structure was well-planned, covering industrial safety codes and practical hazard management.',
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
    featured_image: '/images/library/inspection.jpg',
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
    featured_image: '/images/library/piping.jpg',
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
    featured_image: '/images/library/inspection.jpg',
    category_name: 'Career Advice',
    author_name: 'Feroz Alam',
    published_at: '2025-05-02',
  },
  {
    id: 'b4',
    slug: 'qa-qc-welding-inspection-asme-section-ix-and-aws-d1-1',
    title: 'QA/QC Welding Inspection: Interpreting ASME Section IX & AWS D1.1',
    excerpt: 'A practical guide for mechanical and QA/QC inspectors on reviewing Welding Procedure Specifications (WPS), Procedure Qualification Records (PQR), and Welder Qualifications.',
    content: `Quality Assurance and Quality Control in welding fabrication hinges upon disciplined code interpretation. Whether working on pressure vessels under ASME Section IX or structural steel under AWS D1.1, the welding inspector must ensure that every weld bead conforms to qualified procedures.

Key responsibilities covered during Savvy’s QA/QC certification track include:
- **Welding Procedure Specifications (WPS)**: Reviewing essential variables (base metal P-numbers, filler metal F-numbers, preheat, and interpass temperatures).
- **Procedure Qualification Records (PQR)**: Validating mechanical test results including transverse tensile, guided bend, and Charpy V-notch impact tests.
- **Welder Performance Qualification (WPQ)**: Verifying that individual welders maintain current qualification tickets for specific positions (1G through 6G/6GR).
- **Weld Joint Visual & NDT Surveillance**: Identifying surface imperfections such as undercut, porosity, overlap, and excessive reinforcement before hydrostatic pressure testing.`,
    featured_image: '/images/library/inspection.jpg',
    category_name: 'QA & QC Inspection',
    author_name: 'Tabrej Alam',
    published_at: '2025-05-15',
  },
  {
    id: 'b5',
    slug: 'ultrasonic-testing-dac-curves-and-defect-characterization',
    title: 'Ultrasonic Testing: Constructing DAC Curves & Sizing Planar Discontinuities',
    excerpt: 'Step-by-step guidance on constructing Distance Amplitude Correction (DAC) curves on IIW calibration blocks to evaluate internal planar and volumetric flaws.',
    content: `In modern Ultrasonic Testing (UT), compensating for acoustic attenuation and beam spreading across varying material depths is essential for accurate flaw sizing. 

A Distance Amplitude Correction (DAC) curve links the peak echo amplitudes from identical reference reflectors (such as side-drilled holes) at different depths in a calibration block:
- **Calibrating Primary Reference Level**: Using standard V1 and V2 blocks to establish the reference curve across the expected sound path range.
- **Differentiating Discontinuity Shapes**: Distinguishing volumetric flaws (porosity, slag inclusions) that exhibit smooth acoustic reflection from planar flaws (cracks, incomplete fusion) that produce sharp, directive echo signals.
- **Application of 6dB & 20dB Drop Methods**: Accurately measuring defect length and vertical height to assess code compliance against ASME Section V Article 4 acceptance tables.`,
    featured_image: '/images/library/piping.jpg',
    category_name: 'NDT Techniques',
    author_name: 'Md Javed',
    published_at: '2025-06-02',
  },
  {
    id: 'b6',
    slug: 'industrial-safety-and-hazard-identification-in-refineries',
    title: 'Hazard Identification & Risk Assessment (HIRA) in Petrochemical Plants',
    excerpt: 'Comprehensive safety engineering protocols covering Job Safety Analysis (JSA), Permit to Work (PTW) workflows, and industrial plant hazard mitigation.',
    content: `In high-hazard environments like petroleum refineries, offshore platforms, and chemical manufacturing facilities, systematic hazard identification saves lives and prevents catastrophic plant downtime.

At Savvy Training Institute, our Industrial Safety and HSE curriculum instructs officers on:
- **Hazard Identification & Risk Assessment (HIRA)**: Evaluating likelihood and consequence across physical, chemical, and ergonomic hazards.
- **Permit to Work (PTW) Governance**: Executing rigorous permit controls for hot work, confined space entry, working at height, and electrical isolation (LOTO).
- **Radiation Safety in NDT**: Establishing restricted boundary cordons, calculating Inverse Square Law safe distances, and monitoring personnel dosimeters during active radiographic exposure drills.`,
    featured_image: '/images/library/safety-drill.jpg',
    category_name: 'Industrial Safety',
    author_name: 'Feroz Alam',
    published_at: '2025-06-20',
  },
  {
    id: 'b7',
    slug: 'revit-mep-3d-coordination-and-bim-clash-detection',
    title: 'BIM Coordination for MEP Engineers: Navisworks Clash Detection & Revit Modeling',
    excerpt: 'How modern 3D Building Information Modeling (BIM) workflows eliminate costly site rework between HVAC ductwork, electrical trays, and plumbing services.',
    content: `Building Information Modeling (BIM) has revolutionized MEP engineering by replacing flat 2D drawings with intelligent, data-rich 3D parametric models. 

Key competencies taught in Savvy’s Autodesk Revit MEP program include:
- **Parametric Service Routing**: Designing complex HVAC duct layouts, chilled water piping, sanitary drainage slopes, and electrical cable raceways.
- **Clash Detection in Navisworks**: Identifying hard clashes (duct intersecting structural beams) and soft clearance clashes (insufficient maintenance access) before fabrication.
- **Bill of Quantities (BOQ) Generation**: Extracting accurate schedules for pipe lengths, duct sheet metal weights, fittings, and diffusers directly from the coordinated Revit model.`,
    featured_image: '/images/library/workshop.jpg',
    category_name: 'MEP Engineering',
    author_name: 'Deepak Kumar',
    published_at: '2025-07-04',
  },
];

export const galleryData: GalleryItem[] = [
  { id: 'g1', title: 'Ultrasonic Flaw Detector Lab Session', image_url: '/images/library/inspection.jpg', category: 'Lab & Practical' },
  { id: 'g2', title: 'Piping & Weld Inspection Training', image_url: '/images/library/piping.jpg', category: 'Site Visit' },
  { id: 'g3', title: 'QA/QC Inspection Instruments Demo', image_url: '/images/library/inspection.jpg', category: 'Lab & Practical' },
  { id: 'g4', title: 'Classroom Theory & Standards Lecture', image_url: '/images/library/classroom.jpg', category: 'Classroom' },
  { id: 'g5', title: 'Student Graduation & Certification Event', image_url: '/images/library/graduation.jpg', category: 'Events' },
  { id: 'g6', title: 'HVAC Ducting & Refrigeration Lab', image_url: '/images/library/piping.jpg', category: 'Lab & Practical' },
  { id: 'g7', title: 'Fire & Industrial Safety Drill', image_url: '/images/library/safety-drill.jpg', category: 'Lab & Practical' },
  { id: 'g8', title: 'Revit MEP 3D Modeling Workshop', image_url: '/images/library/workshop.jpg', category: 'Classroom' },
];

// --- Placement (institute's primary focus) ---

export const placementsData: PlacementRecord[] = [
  { id: 'p1', student_name: 'Rahul Verma', course_title: 'NDT Level II Course', company: 'Bureau Veritas', job_role: 'NDT Technician Level II', location: 'Abu Dhabi, UAE', package_lpa: '₹9.6 LPA', placed_on: '2026-03-27', is_featured: true, sort_order: 1, photo_url: '/images/library/portrait-rahul.jpg' },
  { id: 'p2', student_name: 'Priya Singh', course_title: 'Fire & Safety Course', company: 'Adani Ports & SEZ', job_role: 'Safety Officer', location: 'Mundra, India', package_lpa: '₹6.2 LPA', placed_on: '2026-04-26', is_featured: true, sort_order: 2, photo_url: '/images/library/portrait-priya.jpg' },
  { id: 'p3', student_name: 'Amit Kumar', course_title: 'CSWIP 3.1 Welding Inspector Course', company: 'Petrofac', job_role: 'Welding Inspector', location: 'Doha, Qatar', package_lpa: '₹12.4 LPA', placed_on: '2026-05-26', is_featured: true, sort_order: 3, photo_url: '/images/library/portrait-amit.jpg' },
  { id: 'p4', student_name: 'Mohd Arshad', course_title: 'QA & QC Course', company: 'L&T Hydrocarbon Engineering', job_role: 'QA/QC Engineer', location: 'Hazira, India', package_lpa: '₹7.8 LPA', placed_on: '2026-06-10', is_featured: true, sort_order: 4, photo_url: '/images/library/portrait-arshad.jpg' },
  { id: 'p5', student_name: 'Sneha Rathore', course_title: 'HVAC Course', company: 'Voltas Ltd', job_role: 'HVAC Site Engineer', location: 'Noida, India', package_lpa: '₹5.4 LPA', placed_on: '2026-06-25', is_featured: false, sort_order: 5, photo_url: '/images/library/portrait-sneha.jpg' },
  { id: 'p6', student_name: 'Imran Sheikh', course_title: 'NDT Level II Course', company: 'SGS India', job_role: 'Radiographer Level II', location: 'Jamnagar, India', package_lpa: '₹8.1 LPA', placed_on: '2026-07-05', is_featured: false, sort_order: 6, photo_url: '/images/library/portrait-imran.jpg' },
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
  { id: 'o2', title: 'YouTube Subscriber Offer', description: 'Watching us on YouTube? Pre-enrol with this code for an extra fee waiver plus a free NDT fundamentals starter kit.', discount_label: '₹5,000 OFF', coupon_code: 'SAVVYYT', valid_till: '2026-09-08', seats_left: 25, is_active: true, sort_order: 2 },
];
