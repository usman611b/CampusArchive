import { Department, Program, Course } from '../types/academic';

export const MOCK_DEPARTMENTS: Department[] = [
  {
    id: 'dept-1',
    name: 'Computer Science & Software',
    slug: 'computer-science',
    code: 'BSCS / BSSE',
    iconName: 'Code2',
    description: 'Top: Data Structures, OS, DBMS, Web Eng',
    resourcesCount: 2450,
    programsCount: 2
  },
  {
    id: 'dept-2',
    name: 'Electrical & Computer Eng',
    slug: 'electrical-engineering',
    code: 'BSEE / BSCE',
    iconName: 'Cpu',
    description: 'Top: Circuit Analysis, Signal Proc, VLSI',
    resourcesCount: 1280,
    programsCount: 2
  },
  {
    id: 'dept-3',
    name: 'Business & Management',
    slug: 'business-admin',
    code: 'BBA / MBA',
    iconName: 'Briefcase',
    description: 'Top: Financial Acct, Marketing, MicroEcon',
    resourcesCount: 890,
    programsCount: 2
  },
  {
    id: 'dept-4',
    name: 'Medical & Life Sciences',
    slug: 'medical-sciences',
    code: 'MBBS / BDS / PharmD',
    iconName: 'Activity',
    description: 'Top: Anatomy, Physiology, Pathology, Dental Surgery, Pharmaceutics',
    resourcesCount: 1440,
    programsCount: 3
  },
  {
    id: 'dept-5',
    name: 'Civil & Infrastructure Eng',
    slug: 'civil-engineering',
    code: 'BSCE / B Arch',
    iconName: 'Building',
    description: 'Top: Structural Mech, Surveying, Fluid Mech',
    resourcesCount: 520,
    programsCount: 2
  },
  {
    id: 'dept-6',
    name: 'Mechanical & Mechatronics',
    slug: 'mechanical-engineering',
    code: 'BSME / BSMTR',
    iconName: 'Settings',
    description: 'Top: Thermodynamics, Statics, CAD/CAM',
    resourcesCount: 610,
    programsCount: 2
  }
];

export const MOCK_PROGRAMS: Program[] = [
  // Computer Science & Software
  {
    id: 'prog-bscs',
    departmentId: 'dept-1',
    name: 'BS Computer Science',
    slug: 'bscs',
    code: 'BSCS',
    totalSemesters: 8,
    description: '4-Year Undergraduate Degree in Computer Science.'
  },
  {
    id: 'prog-bsse',
    departmentId: 'dept-1',
    name: 'BS Software Engineering',
    slug: 'bsse',
    code: 'BSSE',
    totalSemesters: 8,
    description: '4-Year Undergraduate Degree in Software Engineering.'
  },

  // Electrical & Computer Eng
  {
    id: 'prog-bsee',
    departmentId: 'dept-2',
    name: 'BS Electrical Engineering',
    slug: 'bsee',
    code: 'BSEE',
    totalSemesters: 8,
    description: '4-Year Degree in Electrical Engineering.'
  },

  // Business & Management
  {
    id: 'prog-bba',
    departmentId: 'dept-3',
    name: 'Bachelor of Business Administration',
    slug: 'bba',
    code: 'BBA',
    totalSemesters: 8,
    description: '4-Year Degree in Business Administration.'
  },

  // Medical & Life Sciences (3 Distinct Medical Programs: MBBS, BDS, Pharm D)
  {
    id: 'prog-mbbs',
    departmentId: 'dept-4',
    name: 'Bachelor of Medicine, Bachelor of Surgery (MBBS)',
    slug: 'mbbs',
    code: 'MBBS',
    totalSemesters: 10,
    description: '5-Year Professional Medical Degree (10 Semesters / UHS & KMU Integrated System).'
  },
  {
    id: 'prog-bds',
    departmentId: 'dept-4',
    name: 'Bachelor of Dental Surgery (BDS)',
    slug: 'bds',
    code: 'BDS',
    totalSemesters: 8,
    description: '4-Year Professional Dental Surgery Degree (8 Semesters).'
  },
  {
    id: 'prog-pharmd',
    departmentId: 'dept-4',
    name: 'Doctor of Pharmacy (Pharm D)',
    slug: 'pharmd',
    code: 'PharmD',
    totalSemesters: 10,
    description: '5-Year Professional Pharmacy Degree (10 Semesters).'
  },

  // Civil & Infrastructure Eng
  {
    id: 'prog-bsce',
    departmentId: 'dept-5',
    name: 'BS Civil Engineering',
    slug: 'bsce',
    code: 'BSCE',
    totalSemesters: 8,
    description: '4-Year Degree in Civil Engineering.'
  },

  // Mechanical & Mechatronics
  {
    id: 'prog-bsme',
    departmentId: 'dept-6',
    name: 'BS Mechanical Engineering',
    slug: 'bsme',
    code: 'BSME',
    totalSemesters: 8,
    description: '4-Year Degree in Mechanical Engineering.'
  }
];

export const MOCK_COURSES: Course[] = [
  // ================= COMPUTER SCIENCE & SOFTWARE (BSCS) =================
  {
    id: 'course-cs-101',
    programId: 'prog-bscs',
    semesterNumber: 1,
    code: 'CS-101',
    title: 'Programming Fundamentals',
    slug: 'programming-fundamentals',
    description: 'Introduction to problem solving, flowcharts, variables, conditionals, loops, functions, and arrays in C++.',
    instructorName: 'Prof. Kamran Akram',
    creditHours: 4,
    rating: 4.8,
    reviewsCount: 110,
    resourcesCount: 45,
    enrolledStudentsCount: 350,
    sectionsCount: { notes: 15, pastPapers: 18, assignments: 8, projects: 4, books: 2, labManuals: 4, videos: 6, discussion: 10 }
  },
  {
    id: 'course-cs-201',
    programId: 'prog-bscs',
    semesterNumber: 4,
    code: 'CS-201',
    title: 'Data Structures & Algorithms',
    slug: 'data-structures-algorithms',
    description: 'Linear and non-linear data structures, asymptotic analysis, sorting, search trees, heaps, graphs, and dynamic programming.',
    instructorName: 'Dr. Arshad Hassan',
    creditHours: 4,
    rating: 4.9,
    reviewsCount: 142,
    resourcesCount: 85,
    enrolledStudentsCount: 320,
    sectionsCount: { notes: 25, pastPapers: 30, assignments: 12, projects: 8, books: 4, labManuals: 6, videos: 10, discussion: 18 }
  },

  // ================= MEDICAL & LIFE SCIENCES: 1. MBBS (10 Semesters) =================
  {
    id: 'course-mbbs-s1',
    programId: 'prog-mbbs',
    semesterNumber: 1,
    code: 'MED-101',
    title: 'Anatomy, Physiology & Biochemistry (Foundation Module)',
    slug: 'foundation-module',
    description: 'Semester 1: Cell biology, gross anatomy, muscle histology, cell membrane physiology, and biomolecules.',
    instructorName: 'Prof. Dr. Tariq Aziz (UHS)',
    creditHours: 6,
    rating: 4.9,
    reviewsCount: 160,
    resourcesCount: 95,
    enrolledStudentsCount: 420,
    sectionsCount: { notes: 32, pastPapers: 38, assignments: 10, projects: 0, books: 6, labManuals: 12, videos: 14, discussion: 22 }
  },
  {
    id: 'course-mbbs-s2',
    programId: 'prog-mbbs',
    semesterNumber: 2,
    code: 'MED-102',
    title: 'Anatomy, Physiology & Biochemistry (Locomotor & CVS Module)',
    slug: 'locomotor-cvs-module',
    description: 'Semester 2: Upper/lower limb anatomy, bone osteology, cardiac cycle, ECG, and lipid metabolism.',
    instructorName: 'Dr. Samina Khan',
    creditHours: 6,
    rating: 4.8,
    reviewsCount: 140,
    resourcesCount: 88,
    enrolledStudentsCount: 410,
    sectionsCount: { notes: 28, pastPapers: 34, assignments: 8, projects: 0, books: 5, labManuals: 10, videos: 12, discussion: 18 }
  },
  {
    id: 'course-mbbs-s5',
    programId: 'prog-mbbs',
    semesterNumber: 5,
    code: 'MED-301',
    title: 'General Pathology, Microbiology & General Pharmacology',
    slug: 'pathology-pharmacology-gen',
    description: 'Semester 5: Cell injury, inflammation, neoplasia, bacteriology, and pharmacokinetics/pharmacodynamics.',
    instructorName: 'Dr. Jamshed Iqbal',
    creditHours: 6,
    rating: 4.9,
    reviewsCount: 175,
    resourcesCount: 105,
    enrolledStudentsCount: 370,
    sectionsCount: { notes: 35, pastPapers: 42, assignments: 12, projects: 0, books: 6, labManuals: 14, videos: 16, discussion: 24 }
  },
  {
    id: 'course-mbbs-s10',
    programId: 'prog-mbbs',
    semesterNumber: 10,
    code: 'MED-502',
    title: 'Medicine, Surgery, Pediatrics & Gynecology (Past Papers & OSPE/Viva)',
    slug: 'final-prof-ospe-viva',
    description: 'Semester 10: Annual Prof Exam past papers, OSPE spotters, Viva exam checklists, and clinical long/short cases.',
    instructorName: 'Prof. Dr. Ayesha Siddiqua',
    creditHours: 8,
    rating: 5.0,
    reviewsCount: 230,
    resourcesCount: 160,
    enrolledStudentsCount: 330,
    sectionsCount: { notes: 50, pastPapers: 60, assignments: 18, projects: 0, books: 10, labManuals: 20, videos: 25, discussion: 35 }
  },

  // ================= MEDICAL & LIFE SCIENCES: 2. BDS (8 Semesters) =================
  {
    id: 'course-bds-s1',
    programId: 'prog-bds',
    semesterNumber: 1,
    code: 'BDS-101',
    title: 'Tooth Morphology & Dental Anatomy',
    slug: 'dental-anatomy-morphology',
    description: 'Semester 1: Permanent and primary teeth occlusion, enamel histology, pulp anatomy, and carving manuals.',
    instructorName: 'Prof. Dr. Faisal Rehan',
    creditHours: 4,
    rating: 4.8,
    reviewsCount: 95,
    resourcesCount: 54,
    enrolledStudentsCount: 210,
    sectionsCount: { notes: 20, pastPapers: 22, assignments: 6, projects: 0, books: 4, labManuals: 8, videos: 8, discussion: 12 }
  },
  {
    id: 'course-bds-s5',
    programId: 'prog-bds',
    semesterNumber: 5,
    code: 'BDS-301',
    title: 'Oral Pathology & Dental Materials',
    slug: 'oral-pathology-materials',
    description: 'Semester 5: Cysts, odontogenic tumors, dental amalgams, composite resins, and impression materials.',
    instructorName: 'Dr. Hina Mukhtar',
    creditHours: 4,
    rating: 4.9,
    reviewsCount: 110,
    resourcesCount: 68,
    enrolledStudentsCount: 195,
    sectionsCount: { notes: 24, pastPapers: 28, assignments: 8, projects: 0, books: 4, labManuals: 6, videos: 10, discussion: 15 }
  },

  // ================= MEDICAL & LIFE SCIENCES: 3. Pharm D (10 Semesters) =================
  {
    id: 'course-pharm-s1',
    programId: 'prog-pharmd',
    semesterNumber: 1,
    code: 'PHARM-101',
    title: 'Pharmaceutics-I (Physical Pharmacy)',
    slug: 'physical-pharmacy',
    description: 'Semester 1: Solutions, suspensions, emulsions, solubility kinetics, and pharmaceutical calculations.',
    instructorName: 'Dr. Imran Sajid',
    creditHours: 4,
    rating: 4.7,
    reviewsCount: 88,
    resourcesCount: 48,
    enrolledStudentsCount: 240,
    sectionsCount: { notes: 18, pastPapers: 20, assignments: 7, projects: 0, books: 3, labManuals: 5, videos: 6, discussion: 10 }
  },
  {
    id: 'course-pharm-s7',
    programId: 'prog-pharmd',
    semesterNumber: 7,
    code: 'PHARM-401',
    title: 'Clinical Pharmacy & Therapeutics',
    slug: 'clinical-pharmacy-therapeutics',
    description: 'Semester 7: Hospital pharmacy practice, drug interactions, posology, therapeutic drug monitoring, and patient counseling.',
    instructorName: 'Prof. Dr. Saima Rauf',
    creditHours: 4,
    rating: 4.9,
    reviewsCount: 125,
    resourcesCount: 76,
    enrolledStudentsCount: 220,
    sectionsCount: { notes: 28, pastPapers: 32, assignments: 9, projects: 0, books: 5, labManuals: 8, videos: 12, discussion: 18 }
  }
];
