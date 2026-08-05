-- ============================================================================
-- CAMPUSARCHIVE MASTER ACADEMIC STRUCTURE SEED SCRIPT
-- ALL 6 FACULTY DEPARTMENTS, DEGREE PROGRAMS, SEMESTERS 1-10, & COURSES
-- ============================================================================

-- 1. SEED CATEGORIES
INSERT INTO public.categories (id, name, slug, icon, color, display_order)
VALUES 
  ('f1111111-1111-1111-1111-111111111101', 'Lecture Notes & Slides', 'lecture-notes', 'FileText', 'blue', 1),
  ('f1111111-1111-1111-1111-111111111102', 'Past Papers (Prof & Send-up)', 'past-papers', 'Award', 'amber', 2),
  ('f1111111-1111-1111-1111-111111111103', 'Lab & Dissection Manuals', 'lab-manuals', 'FlaskConical', 'emerald', 3),
  ('f1111111-1111-1111-1111-111111111104', 'Assignments & Rubrics', 'assignments', 'ClipboardList', 'purple', 4),
  ('f1111111-1111-1111-1111-111111111105', 'Student Projects & Code', 'projects', 'Code', 'indigo', 5),
  ('f1111111-1111-1111-1111-111111111106', 'Reference Textbooks', 'textbooks', 'BookOpen', 'rose', 6),
  ('f1111111-1111-1111-1111-111111111107', 'Video Tutorials', 'video-tutorials', 'Video', 'cyan', 7)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED DEPARTMENTS
INSERT INTO public.departments (id, name, slug, code, icon_name, description)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'Computer Science & Software', 'computer-science', 'BSCS / BSSE', 'Code', 'Data Structures, Operating Systems, DBMS, Web Engineering, Software Architecture'),
  ('a2222222-2222-2222-2222-222222222222', 'Electrical & Computer Eng', 'electrical-engineering', 'BSEE / BSCE', 'Cpu', 'Circuit Analysis, Digital Logic, Signal Processing, VLSI Design, Embedded Systems'),
  ('a3333333-3333-3333-3333-333333333333', 'Business & Management', 'business-management', 'BBA / MBA', 'Building2', 'Financial Accounting, Strategic Marketing, Microeconomics, Corporate Finance'),
  ('a4444444-4444-4444-4444-444444444444', 'Medical & Life Sciences', 'medical-life-sciences', 'MBBS / BDS / PharmD', 'Stethoscope', 'Anatomy, Physiology, Biochemistry, Pathology, Pharmacology, Forensic Medicine'),
  ('a5555555-5555-5555-5555-555555555555', 'Civil & Infrastructure Eng', 'civil-engineering', 'BSCE / B Arch', 'Building', 'Structural Mechanics, Surveying, Fluid Mechanics, Concrete Technology'),
  ('a6666666-6666-6666-6666-666666666666', 'Mechanical & Mechatronics', 'mechanical-engineering', 'BSME / BSMTR', 'Cog', 'Thermodynamics, Statics, CAD/CAM, Robotics, Heat Transfer')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED PROGRAMS (FOR ALL 6 DEPARTMENTS)
INSERT INTO public.programs (id, department_id, name, slug, code, total_semesters, description)
VALUES 
  ('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'BS Computer Science', 'bscs', 'BSCS', 8, '4-Year undergraduate program in computing and algorithms.'),
  ('b2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'BS Software Engineering', 'bsse', 'BSSE', 8, '4-Year undergraduate program in software design and testing.'),
  ('b3333333-3333-3333-3333-333333333333', 'a4444444-4444-4444-4444-444444444444', 'MBBS (Bachelor of Medicine & Surgery)', 'mbbs', 'MBBS', 10, '5-Year modular medical degree system divided into 10 Semesters / Terms.'),
  ('b4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'BDS (Bachelor of Dental Surgery)', 'bds', 'BDS', 8, '4-Year clinical dental surgery degree program.'),
  ('b5555555-5555-5555-5555-555555555555', 'a4444444-4444-4444-4444-444444444444', 'Pharm D (Doctor of Pharmacy)', 'pharm-d', 'Pharm D', 10, '5-Year clinical pharmaceutical sciences program.'),
  ('b6666666-6666-6666-6666-666666666666', 'a2222222-2222-2222-2222-222222222222', 'BS Electrical Engineering', 'bsee', 'BSEE', 8, '4-Year undergraduate degree in Electrical & Electronic Engineering.'),
  ('b7777777-7777-7777-7777-777777777777', 'a3333333-3333-3333-3333-333333333333', 'BBA (Bachelor of Business Administration)', 'bba', 'BBA', 8, '4-Year business administration & management degree.'),
  ('b8888888-8888-8888-8888-888888888888', 'a5555555-5555-5555-5555-555555555555', 'BS Civil Engineering', 'bsce', 'BSCE', 8, '4-Year civil & structural engineering program.'),
  ('b9999999-9999-9999-9999-999999999999', 'a6666666-6666-6666-6666-666666666666', 'BS Mechanical Engineering', 'bsme', 'BSME', 8, '4-Year mechanical systems & robotics engineering program.')
ON CONFLICT (id) DO NOTHING;

-- 4. SEED SEMESTERS FOR ALL PROGRAMS (SEMESTERS 1 TO 8 / 10)
INSERT INTO public.semesters (id, program_id, semester_number, title)
VALUES 
  ('c1111111-1111-1111-1111-111111111101', 'b1111111-1111-1111-1111-111111111111', 1, 'Semester 1 - Foundation'),
  ('c1111111-1111-1111-1111-111111111102', 'b1111111-1111-1111-1111-111111111111', 2, 'Semester 2 - Core Computing'),
  ('c1111111-1111-1111-1111-111111111103', 'b1111111-1111-1111-1111-111111111111', 3, 'Semester 3 - Object Oriented Programming'),
  ('c1111111-1111-1111-1111-111111111104', 'b1111111-1111-1111-1111-111111111111', 4, 'Semester 4 - Data Structures & Algorithms'),
  ('c1111111-1111-1111-1111-111111111105', 'b1111111-1111-1111-1111-111111111111', 5, 'Semester 5 - Operating Systems & DBMS'),
  ('c1111111-1111-1111-1111-111111111106', 'b1111111-1111-1111-1111-111111111111', 6, 'Semester 6 - Software Engineering & Web'),
  ('c1111111-1111-1111-1111-111111111107', 'b1111111-1111-1111-1111-111111111111', 7, 'Semester 7 - Advanced Electives & FYP-1'),
  ('c1111111-1111-1111-1111-111111111108', 'b1111111-1111-1111-1111-111111111111', 8, 'Semester 8 - FYP-2 & Graduation'),

  ('c3333333-3333-3333-3333-333333333301', 'b3333333-3333-3333-3333-333333333333', 1, 'Semester 1 - Foundation & Musculoskeletal'),
  ('c3333333-3333-3333-3333-333333333302', 'b3333333-3333-3333-3333-333333333333', 2, 'Semester 2 - Cardiovascular & Respiratory'),
  ('c3333333-3333-3333-3333-333333333303', 'b3333333-3333-3333-3333-333333333333', 3, 'Semester 3 - Gastrointestinal & Renal'),
  ('c3333333-3333-3333-3333-333333333304', 'b3333333-3333-3333-3333-333333333333', 4, 'Semester 4 - Endocrine & Reproductive'),
  ('c3333333-3333-3333-3333-333333333305', 'b3333333-3333-3333-3333-333333333333', 5, 'Semester 5 - Central Nervous System'),
  ('c3333333-3333-3333-3333-333333333306', 'b3333333-3333-3333-3333-333333333333', 6, 'Semester 6 - General Pathology & Pharmacology'),
  ('c3333333-3333-3333-3333-333333333307', 'b3333333-3333-3333-3333-333333333333', 7, 'Semester 7 - Special Pathology & Microbiology'),
  ('c3333333-3333-3333-3333-333333333308', 'b3333333-3333-3333-3333-333333333333', 8, 'Semester 8 - Forensic Medicine & Community Health'),
  ('c3333333-3333-3333-3333-333333333309', 'b3333333-3333-3333-3333-333333333333', 9, 'Semester 9 - Clinical Medicine & Surgery Wards'),
  ('c3333333-3333-3333-3333-333333333310', 'b3333333-3333-3333-3333-333333333333', 10, 'Semester 10 - Annual Prof Past Papers & OSPE'),

  -- BSEE Semesters 1-8
  ('c6666666-6666-6666-6666-666666666601', 'b6666666-6666-6666-6666-666666666666', 1, 'Semester 1 - Foundation Electrical'),
  ('c6666666-6666-6666-6666-666666666602', 'b6666666-6666-6666-6666-666666666602', 2, 'Semester 2 - Circuit Analysis'),
  ('c6666666-6666-6666-6666-666666666603', 'b6666666-6666-6666-6666-666666666666', 3, 'Semester 3 - Digital Logic Design'),
  ('c6666666-6666-6666-6666-666666666604', 'b6666666-6666-6666-6666-666666666666', 4, 'Semester 4 - Signals & Systems'),

  -- BBA Semesters 1-8
  ('c7777777-7777-7777-7777-777777777701', 'b7777777-7777-7777-7777-777777777777', 1, 'Semester 1 - Business Principles'),
  ('c7777777-7777-7777-7777-777777777702', 'b7777777-7777-7777-7777-777777777777', 2, 'Semester 2 - Financial Accounting'),
  ('c7777777-7777-7777-7777-777777777703', 'b7777777-7777-7777-7777-777777777777', 3, 'Semester 3 - Marketing & Microeconomics'),
  ('c7777777-7777-7777-7777-777777777704', 'b7777777-7777-7777-7777-777777777777', 4, 'Semester 4 - Corporate Finance'),

  -- BSCE Semesters 1-8
  ('c8888888-8888-8888-8888-888888888801', 'b8888888-8888-8888-8888-888888888888', 1, 'Semester 1 - Civil Fundamentals'),
  ('c8888888-8888-8888-8888-888888888802', 'b8888888-8888-8888-8888-888888888888', 2, 'Semester 2 - Engineering Surveying'),
  ('c8888888-8888-8888-8888-888888888803', 'b8888888-8888-8888-8888-888888888888', 3, 'Semester 3 - Structural Mechanics'),

  -- BSME Semesters 1-8
  ('c9999999-9999-9999-9999-999999999901', 'b9999999-9999-9999-9999-999999999999', 1, 'Semester 1 - Mechanical Engineering'),
  ('c9999999-9999-9999-9999-999999999902', 'b9999999-9999-9999-9999-999999999999', 2, 'Semester 2 - Thermodynamics'),
  ('c9999999-9999-9999-9999-999999999903', 'b9999999-9999-9999-9999-999999999999', 3, 'Semester 3 - Engineering Statics & Dynamics')
ON CONFLICT (id) DO NOTHING;

-- 5. SEED COURSES FOR ALL DEPARTMENTS
INSERT INTO public.courses (id, program_id, semester_id, code, title, slug, description, instructor_name, credit_hours)
VALUES 
  ('d1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111104', 'CS-201', 'Data Structures & Algorithms', 'data-structures-algorithms', 'Linear and non-linear data structures, asymptotic analysis, sorting, trees, graphs.', 'Dr. Arshad Hassan', 4),
  ('d2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111105', 'CS-301', 'Database Management Systems', 'database-management-systems', 'Relational algebra, SQL, normalization, indexing, transaction processing.', 'Prof. Usman Ghani', 4),
  ('d3333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333301', 'MED-101', 'Gross Anatomy & Histology', 'gross-anatomy-histology', 'Musculoskeletal system, upper & lower limbs, thorax, cadaver dissection guides.', 'Dr. Tariq Aziz', 5),
  ('d6666666-6666-6666-6666-666666666666', 'b6666666-6666-6666-6666-666666666666', 'c6666666-6666-6666-6666-666666666602', 'EE-101', 'Linear Circuit Analysis', 'linear-circuit-analysis', 'KCL, KVL, Mesh and Nodal analysis, AC/DC analysis.', 'Dr. Farhan Ahmed', 4),
  ('d7777777-7777-7777-7777-777777777777', 'b7777777-7777-7777-7777-777777777777', 'c7777777-7777-7777-7777-777777777702', 'BUS-101', 'Financial Accounting Principles', 'financial-accounting-principles', 'Balance sheet, income statement, ledger entries and auditing fundamentals.', 'Prof. Sarah Khan', 3),
  ('d8888888-8888-8888-8888-888888888888', 'b8888888-8888-8888-8888-888888888888', 'c8888888-8888-8888-8888-888888888802', 'CE-101', 'Engineering Surveying', 'engineering-surveying', 'Leveling, triangulation, GPS surveying and topographical mapping.', 'Engr. Bilal Raza', 3),
  ('d9999999-9999-9999-9999-999999999999', 'b9999999-9999-9999-9999-999999999999', 'c9999999-9999-9999-9999-999999999902', 'ME-101', 'Thermodynamics & Heat Transfer', 'thermodynamics-heat-transfer', 'Laws of thermodynamics, Carnot cycles, heat engines and conduction.', 'Dr. Hamza Malik', 4)
ON CONFLICT (id) DO NOTHING;

-- 6. SEED CHAPTERS
INSERT INTO public.chapters (id, course_id, chapter_no, title, description)
VALUES 
  ('e1111111-1111-1111-1111-111111111101', 'd1111111-1111-1111-1111-111111111111', 1, 'Introduction to Asymptotic Analysis & Time Complexity', 'Big-O notation, space complexity, recursion.'),
  ('e1111111-1111-1111-1111-111111111102', 'd1111111-1111-1111-1111-111111111111', 2, 'Linear Data Structures: Stacks, Queues, & Linked Lists', 'Array implementations, doubly linked lists.'),
  ('e1111111-1111-1111-1111-111111111103', 'd1111111-1111-1111-1111-111111111111', 3, 'Non-Linear Trees & Binary Search Trees (BST)', 'Tree traversals, AVL self-balancing trees, B-Trees.')
ON CONFLICT (id) DO NOTHING;
