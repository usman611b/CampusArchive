import React, { useEffect, useState } from 'react';
import { AcademicsService, DepartmentApiItem, ProgramApiItem, SemesterApiItem, CourseApiItem } from '../../services/academicsService';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  Upload,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  FileText,
  AlertCircle,
  GraduationCap,
  Sparkles,
  PenTool,
  PlusCircle,
  BookOpen,
  Loader2,
  Building
} from 'lucide-react';

const PAKISTANI_UNIVERSITIES = [
  'Lahore Garrison University (LGU)',
  'NUST - National University of Sciences & Technology',
  'FAST-NUCES (National University of Computer & Emerging Sciences)',
  'COMSATS University Islamabad',
  'LUMS - Lahore University of Management Sciences',
  'University of the Punjab (PU Lahore)',
  'UET Lahore - University of Engineering & Technology',
  'UHS - University of Health Sciences Lahore',
  'KMU - Khyber Medical University Peshawar',
  'JSMU - Jinnah Sindh Medical University Karachi',
  'Dow University of Health Sciences (DUHS Karachi)',
  'King Edward Medical University (KEMU Lahore)',
  'Aga Khan University (AKU Karachi)',
  'Quaid-i-Azam University (QAU Islamabad)',
  'GIKI - Ghulam Ishaq Khan Institute',
  'IBA Karachi - Institute of Business Administration',
  'University of Agriculture Faisalabad (UAF)',
  'International Islamic University Islamabad (IIUI)',
  'Air University Islamabad',
  'Bahria University Islamabad',
  'Riphah International University',
  'University of Karachi (UoK)',
  'Government College University (GCU Lahore)',
  'Other / Custom (Type Below)'
];

const CATEGORIES = [
  { id: 'PROF_PAST_PAPER', label: 'Prof Past Papers (Annual Exam)' },
  { id: 'SEND_UP_PAPER', label: 'Send-up Papers (College Mock)' },
  { id: 'OSPE_VIVA', label: 'OSPE / Viva Guide & Spotters' },
  { id: 'DISSECTION_LAB', label: 'Dissection / Lab Manuals' },
  { id: 'NOTES', label: 'Lecture Notes & Slides' },
  { id: 'BOOK', label: 'Textbook / Reference Book PDF' },
  { id: 'ASSIGNMENT', label: 'Assignment & Rubric' },
  { id: 'PROJECT', label: 'Student Project Source' }
];

const CATEGORY_MAP: Record<string, string> = {
  NOTES: 'f1111111-1111-1111-1111-111111111101',
  PROF_PAST_PAPER: 'f1111111-1111-1111-1111-111111111102',
  SEND_UP_PAPER: 'f1111111-1111-1111-1111-111111111102',
  OSPE_VIVA: 'f1111111-1111-1111-1111-111111111103',
  DISSECTION_LAB: 'f1111111-1111-1111-1111-111111111103',
  ASSIGNMENT: 'f1111111-1111-1111-1111-111111111104',
  PROJECT: 'f1111111-1111-1111-1111-111111111105',
  BOOK: 'f1111111-1111-1111-1111-111111111106'
};

interface UploadWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadWizardModal: React.FC<UploadWizardModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Departments (from API)
  const [departments, setDepartments] = useState<DepartmentApiItem[]>([]);
  const [selectedDept, setSelectedDept] = useState<DepartmentApiItem | null>(null);

  // Step 2: Programs (from API)
  const [programs, setPrograms] = useState<ProgramApiItem[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<ProgramApiItem | null>(null);

  // Step 3: Semesters (from API)
  const [semesters, setSemesters] = useState<SemesterApiItem[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<SemesterApiItem | null>(null);

  // Step 4: Courses (from API) + Custom course
  const [courses, setCourses] = useState<CourseApiItem[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseApiItem | null>(null);
  const [isCustomCourse, setIsCustomCourse] = useState(false);
  const [customCourseCode, setCustomCourseCode] = useState('');
  const [customCourseTitle, setCustomCourseTitle] = useState('');
  const [customInstructorName, setCustomInstructorName] = useState('');

  // Step 5: Category
  const [selectedCategory, setSelectedCategory] = useState<string>('NOTES');

  // Step 6: File
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  // Step 7: Metadata & University
  const [resourceTitle, setResourceTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [selectedUniversityOption, setSelectedUniversityOption] = useState(PAKISTANI_UNIVERSITIES[0]);
  const [customUniversityName, setCustomUniversityName] = useState('');

  const [isLoadingDepts, setIsLoadingDepts] = useState(false);

  // Fetch Departments on open
  useEffect(() => {
    if (!isOpen) return;
    setIsLoadingDepts(true);
    AcademicsService.getDepartments()
      .then((list) => {
        setDepartments(list);
        if (list.length > 0 && !selectedDept) {
          setSelectedDept(list[0]);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingDepts(false));
  }, [isOpen]);

  // Fetch Programs when dept changes (with dynamic fallback)
  useEffect(() => {
    if (!selectedDept) return;
    AcademicsService.getPrograms(selectedDept.id)
      .then((list) => {
        if (list && list.length > 0) {
          setPrograms(list);
          setSelectedProgram(list[0]);
        } else {
          // Dynamic fallback program if none seeded (valid UUID format)
          const fallbackUuid = selectedDept.id.replace(/^a/, 'b');
          const fallbackProg: ProgramApiItem = {
            id: fallbackUuid.includes('-') ? fallbackUuid : 'b7777777-7777-7777-7777-777777777777',
            departmentId: selectedDept.id,
            name: `BS ${selectedDept.name}`,
            code: selectedDept.code.split('/')[0].trim() || 'BS',
            slug: selectedDept.slug,
            totalSemesters: 8,
            description: `Degree program in ${selectedDept.name}`
          };
          setPrograms([fallbackProg]);
          setSelectedProgram(fallbackProg);
        }
      })
      .catch(() => {
        const fallbackUuid = selectedDept.id.replace(/^a/, 'b');
        const fallbackProg: ProgramApiItem = {
          id: fallbackUuid.includes('-') ? fallbackUuid : 'b7777777-7777-7777-7777-777777777777',
          departmentId: selectedDept.id,
          name: `BS ${selectedDept.name}`,
          code: selectedDept.code.split('/')[0].trim() || 'BS',
          slug: selectedDept.slug,
          totalSemesters: 8,
          description: `Degree program in ${selectedDept.name}`
        };
        setPrograms([fallbackProg]);
        setSelectedProgram(fallbackProg);
      });
  }, [selectedDept]);

  // Fetch Semesters when program changes (with dynamic fallback)
  useEffect(() => {
    if (!selectedProgram) return;
    AcademicsService.getSemesters(selectedProgram.id)
      .then((list) => {
        if (list && list.length > 0) {
          setSemesters(list);
          setSelectedSemester(list[0]);
        } else {
          // Dynamic fallback semesters 1..N (valid UUID format)
          const totalSems = selectedProgram.totalSemesters || 8;
          const fallbackSemesters: SemesterApiItem[] = Array.from({ length: totalSems }, (_, i) => {
            const semNumStr = (i + 1).toString().padStart(2, '0');
            const semUuid = selectedProgram.id.replace(/^b/, 'c').slice(0, -2) + semNumStr;
            return {
              id: semUuid.includes('-') ? semUuid : `c7777777-7777-7777-7777-7777777777${semNumStr}`,
              programId: selectedProgram.id,
              semesterNumber: i + 1,
              title: `Semester ${i + 1} - Core Studies`
            };
          });
          setSemesters(fallbackSemesters);
          setSelectedSemester(fallbackSemesters[0]);
        }
      })
      .catch(() => {
        const totalSems = selectedProgram.totalSemesters || 8;
        const fallbackSemesters: SemesterApiItem[] = Array.from({ length: totalSems }, (_, i) => {
          const semNumStr = (i + 1).toString().padStart(2, '0');
          const semUuid = selectedProgram.id.replace(/^b/, 'c').slice(0, -2) + semNumStr;
          return {
            id: semUuid.includes('-') ? semUuid : `c7777777-7777-7777-7777-7777777777${semNumStr}`,
            programId: selectedProgram.id,
            semesterNumber: i + 1,
            title: `Semester ${i + 1} - Core Studies`
          };
        });
        setSemesters(fallbackSemesters);
        setSelectedSemester(fallbackSemesters[0]);
      });
  }, [selectedProgram]);

  // Fetch Courses when semester changes (with dynamic custom course fallback)
  useEffect(() => {
    if (!selectedProgram || !selectedSemester) return;
    AcademicsService.getCourses(selectedProgram.id, selectedSemester.id)
      .then((list) => {
        if (list && list.length > 0) {
          setCourses(list);
          setSelectedCourse(list[0]);
          setIsCustomCourse(false);
        } else {
          setCourses([]);
          setSelectedCourse(null);
          setIsCustomCourse(true); // Automatically open custom course input if catalog empty
        }
      })
      .catch(() => {
        setCourses([]);
        setSelectedCourse(null);
        setIsCustomCourse(true);
      });
  }, [selectedProgram, selectedSemester]);

  const [dragOver, setDragOver] = useState(false);

  // Auto-populate resource title from file name
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachedFile(file);
      if (!resourceTitle) {
        setResourceTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setAttachedFile(file);
      if (!resourceTitle) {
        setResourceTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Resolve categoryId to valid DB UUID
      const WIZARD_CATEGORY_TO_SLUG: Record<string, string> = {
        NOTES: 'lecture-notes',
        PROF_PAST_PAPER: 'past-papers',
        SEND_UP_PAPER: 'past-papers',
        OSPE_VIVA: 'lab-manuals',
        DISSECTION_LAB: 'lab-manuals',
        ASSIGNMENT: 'assignments',
        PROJECT: 'projects',
        BOOK: 'textbooks'
      };

      const CATEGORY_FALLBACK_MAP: Record<string, string> = {
        NOTES: 'f1111111-1111-1111-1111-111111111101',
        PROF_PAST_PAPER: 'f1111111-1111-1111-1111-111111111102',
        SEND_UP_PAPER: 'f1111111-1111-1111-1111-111111111102',
        OSPE_VIVA: 'f1111111-1111-1111-1111-111111111103',
        DISSECTION_LAB: 'f1111111-1111-1111-1111-111111111103',
        ASSIGNMENT: 'f1111111-1111-1111-1111-111111111104',
        PROJECT: 'f1111111-1111-1111-1111-111111111105',
        BOOK: 'f1111111-1111-1111-1111-111111111106'
      };

      let categoryId = CATEGORY_FALLBACK_MAP[selectedCategory] || 'f1111111-1111-1111-1111-111111111101';
      try {
        const targetSlug = WIZARD_CATEGORY_TO_SLUG[selectedCategory] || 'lecture-notes';
        const catRes = await apiClient.get('/search/categories');
        const liveCats = catRes.data.data.categories || [];
        if (liveCats.length > 0) {
          const match = liveCats.find((c: any) => c.slug === targetSlug || c.slug.includes(targetSlug));
          if (match) {
            categoryId = match.id;
          } else {
            categoryId = liveCats[0].id;
          }
        }
      } catch {}

      // 2. Resolve courseId to valid DB UUID for the EXACT selected semester
      let courseId = selectedCourse?.id;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (!courseId || !uuidRegex.test(courseId)) {
        if (selectedProgram?.id && selectedSemester?.id && uuidRegex.test(selectedProgram.id) && uuidRegex.test(selectedSemester.id)) {
          try {
            const cRes = await apiClient.get(`/academics/programs/${selectedProgram.id}/semesters/${selectedSemester.id}/courses`);
            const crs = cRes.data.data.courses || [];
            if (crs.length > 0) {
              courseId = crs[0].id;
            }
          } catch {}
        }
      }

      if (!courseId || !uuidRegex.test(courseId)) {
        showError(
          'Course Required',
          `Please select a valid course for ${selectedProgram?.name || 'Program'} ${selectedSemester ? `Semester ${selectedSemester.semesterNumber}` : ''}.`
        );
        setIsSubmitting(false);
        return;
      }

      // 3. Require a file to be attached
      if (!attachedFile) {
        showError('No File Selected', 'Please attach a file before submitting.');
        setIsSubmitting(false);
        return;
      }

      // 4. Request a pre-signed upload URL + real storage path from the backend
      const uploadUrlRes = await apiClient.post('/resources/upload-url', {
        fileName: attachedFile.name,
        fileType: attachedFile.type || 'application/pdf',
        fileSizeBytes: attachedFile.size,
        courseId
      });
      const { signedUploadUrl, fileStoragePath } = uploadUrlRes.data.data;

      if (!signedUploadUrl || !fileStoragePath) {
        throw new Error('Failed to get a valid upload URL from the server.');
      }

      // 5. PUT the file directly to Supabase Storage using the signed URL
      const uploadResponse = await fetch(signedUploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': attachedFile.type || 'application/octet-stream' },
        body: attachedFile
      });

      if (!uploadResponse.ok) {
        const errText = await uploadResponse.text();
        throw new Error(`File upload to storage failed (${uploadResponse.status}): ${errText}`);
      }

      // 6. Create the resource record with the REAL storage path returned by Supabase
      const payload = {
        courseId,
        categoryId,
        title: resourceTitle.trim() || `${courseDisplayName} Document`,
        description: description.trim() || `Uploaded academic resource for ${courseDisplayName} at ${finalUniversityName}`,
        fileStoragePath, // ← the real path returned by generateUploadUrl / Supabase Storage
        mimeType: attachedFile.type || 'application/pdf',
        fileSizeBytes: attachedFile.size,
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : ['academic', 'resource'],
        version: '1.0'
      };

      await apiClient.post('/resources', payload);
      window.dispatchEvent(new Event('resource_uploaded'));
      showSuccess('Resource Uploaded!', 'Your document has been submitted and is queued in the Admin Operations Console for Moderation Approval.');
      onSuccess();
      onClose();
    } catch (err: any) {
      showError('Upload Failed', err?.response?.data?.message || err?.message || 'Server error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const finalUniversityName =
    selectedUniversityOption === 'Other / Custom (Type Below)'
      ? customUniversityName.trim()
      : selectedUniversityOption;

  const courseDisplayName = isCustomCourse
    ? `${customCourseCode} — ${customCourseTitle}`
    : selectedCourse
    ? `${selectedCourse.code} — ${selectedCourse.title}`
    : '(None selected)';

  const instructorDisplay = isCustomCourse
    ? customInstructorName || 'Custom Instructor'
    : selectedCourse?.instructorName || 'N/A';

  const categoryLabel = CATEGORIES.find((c) => c.id === selectedCategory)?.label || selectedCategory;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in zoom-in-95">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Wizard Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="blue">7-Step Upload Wizard</Badge>
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-300">
              Step {currentStep} of 7
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Publish Academic Resource
          </h2>
          <p className="text-xs text-slate-700 dark:text-zinc-300 font-medium">
            All uploads are mapped to database-driven Course Hubs and subject to administrative approval.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-zinc-900 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300"
            style={{ width: `${(currentStep / 7) * 100}%` }}
          />
        </div>

        {/* STEP 1: Department */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Step 1: Select Academic Department</h3>
            {isLoadingDepts ? (
              <div className="flex items-center justify-center gap-2 py-10 text-blue-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-xs font-bold">Loading departments from Supabase...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => setSelectedDept(dept)}
                    className={`p-4 rounded-2xl text-left border transition-all ${
                      selectedDept?.id === dept.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-600/15 text-slate-900 dark:text-white font-bold ring-2 ring-blue-500/20'
                        : 'border-slate-300 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 hover:border-slate-400'
                    }`}
                  >
                    <div className="text-xs font-mono font-extrabold text-blue-600 dark:text-blue-400">{dept.code}</div>
                    <div className="text-sm font-extrabold mt-1 text-slate-900 dark:text-white">{dept.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 line-clamp-1">{dept.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Program */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Step 2: Select Degree Program / System</h3>
              <Badge variant="blue">{selectedDept?.name}</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {programs.map((prog) => (
                <button
                  key={prog.id}
                  type="button"
                  onClick={() => setSelectedProgram(prog)}
                  className={`p-4 rounded-2xl text-left border transition-all ${
                    selectedProgram?.id === prog.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-600/15 text-slate-900 dark:text-white font-bold ring-2 ring-blue-500/20'
                      : 'border-slate-300 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 hover:border-slate-400'
                  }`}
                >
                  <div className="text-xs font-mono font-extrabold text-blue-600 dark:text-blue-400">{prog.code}</div>
                  <div className="text-sm font-extrabold mt-1 text-slate-900 dark:text-white">{prog.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">{prog.totalSemesters} Semesters</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Semester */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Step 3: Select Semester Level (1 to {selectedProgram?.totalSemesters || semesters.length})
              </h3>
              <Badge variant="blue">{selectedProgram?.code}</Badge>
            </div>
            <div className="grid grid-cols-5 gap-2.5">
              {semesters.map((sem) => (
                <button
                  key={sem.id}
                  type="button"
                  onClick={() => setSelectedSemester(sem)}
                  className={`p-3.5 rounded-2xl text-center border font-extrabold text-xs transition-all ${
                    selectedSemester?.id === sem.id
                      ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                      : 'border-slate-300 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-zinc-200 hover:bg-slate-200'
                  }`}
                >
                  Sem {sem.semesterNumber}
                </button>
              ))}
            </div>
            {selectedSemester && (
              <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">
                Selected: {selectedSemester.title}
              </p>
            )}
          </div>
        )}

        {/* STEP 4: Course */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Step 4: Select or Type Target Course
                </h3>
                <Badge variant="blue">{selectedSemester?.title}</Badge>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomCourse(!isCustomCourse)}
                className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                {isCustomCourse ? (
                  <><BookOpen className="w-3.5 h-3.5" /><span>Select from catalog</span></>
                ) : (
                  <><PlusCircle className="w-3.5 h-3.5" /><span>+ Write custom course</span></>
                )}
              </button>
            </div>

            {isCustomCourse ? (
              <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-zinc-900 border border-blue-200 dark:border-blue-500/20 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400">
                  <PenTool className="w-4 h-4" />
                  <span>Custom Course Entry — not in official catalog</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-extrabold text-slate-900 dark:text-white">Course Code</label>
                    <input
                      type="text"
                      placeholder="e.g. CS-401 or MED-201"
                      value={customCourseCode}
                      onChange={(e) => setCustomCourseCode(e.target.value)}
                      className="w-full mt-1 bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-900 dark:text-white">Instructor Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Prof. Dr. Tariq Aziz"
                      value={customInstructorName}
                      onChange={(e) => setCustomInstructorName(e.target.value)}
                      className="w-full mt-1 bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-900 dark:text-white">Course Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Anatomy & Histology (Locomotor Module)"
                    value={customCourseTitle}
                    onChange={(e) => setCustomCourseTitle(e.target.value)}
                    className="w-full mt-1 bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {courses.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 dark:bg-zinc-900 rounded-2xl text-xs text-slate-700 dark:text-zinc-300">
                    No courses found for this semester. Click <strong>"+ Write custom course"</strong> to enter your subject manually.
                  </div>
                ) : (
                  courses.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => setSelectedCourse(course)}
                      className={`w-full p-3.5 rounded-2xl text-left border flex items-center justify-between transition-all ${
                        selectedCourse?.id === course.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-600/15 text-slate-900 dark:text-white font-bold ring-2 ring-blue-500/20'
                          : 'border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 hover:border-slate-400'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-mono font-extrabold text-blue-600 dark:text-blue-400">{course.code}</span>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">{course.title}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{course.instructorName}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Sem {selectedSemester?.semesterNumber}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Category */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Step 5: Select Resource Category</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-3.5 rounded-2xl text-left border transition-all ${
                    selectedCategory === cat.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-600/15 text-slate-900 dark:text-white font-bold ring-2 ring-blue-500/20'
                      : 'border-slate-300 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 hover:border-slate-400'
                  }`}
                >
                  <span className="text-xs font-bold">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: Upload File */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Step 6: Attach Resource File</h3>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-8 text-center space-y-3 transition-all ${
                dragOver
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 scale-[1.01]'
                  : attachedFile
                  ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/5'
                  : 'border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:border-blue-400'
              }`}
            >
              <Upload className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Drag and drop file here, or click to browse</p>
                <p className="text-[10px] text-slate-700 dark:text-zinc-300 mt-1 font-medium">Supports PDF, PPTX, DOCX, ZIP (Max: 50MB)</p>
              </div>
              <input type="file" onChange={handleFileChange} className="hidden" id="file-upload-input" />
              <label htmlFor="file-upload-input" className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer shadow-md shadow-blue-500/20">
                Select File
              </label>

              {attachedFile && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Attached: {attachedFile.name} ({(attachedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 7: Metadata — FULLY DYNAMIC FROM PREVIOUS STEPS */}
        {currentStep === 7 && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Step 7: Review, Metadata & Submit</h3>

            {/* ── Summary Card: Dynamic from previous selections ── */}
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 space-y-2">
              <p className="text-[11px] font-extrabold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-2">📋 Upload Context Summary (from your previous selections)</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-zinc-400 font-bold">Department:</span>
                  <span className="ml-1 text-slate-900 dark:text-white font-extrabold">{selectedDept?.name || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-zinc-400 font-bold">Program:</span>
                  <span className="ml-1 text-slate-900 dark:text-white font-extrabold">{selectedProgram?.name || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-zinc-400 font-bold">Semester:</span>
                  <span className="ml-1 text-slate-900 dark:text-white font-extrabold">
                    {selectedSemester ? `Semester ${selectedSemester.semesterNumber} — ${selectedSemester.title}` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-zinc-400 font-bold">Course:</span>
                  <span className="ml-1 text-slate-900 dark:text-white font-extrabold">{courseDisplayName}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-zinc-400 font-bold">Instructor:</span>
                  <span className="ml-1 text-slate-900 dark:text-white font-extrabold">{instructorDisplay}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-zinc-400 font-bold">Category:</span>
                  <span className="ml-1 text-slate-900 dark:text-white font-extrabold">{categoryLabel}</span>
                </div>
                {attachedFile && (
                  <div className="col-span-2">
                    <span className="text-slate-500 dark:text-zinc-400 font-bold">File:</span>
                    <span className="ml-1 text-emerald-700 dark:text-emerald-400 font-extrabold">{attachedFile.name} ({(attachedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Resource Title */}
            <div>
              <label className="text-xs font-extrabold text-slate-900 dark:text-white">Resource Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={resourceTitle}
                onChange={(e) => setResourceTitle(e.target.value)}
                placeholder={`e.g. ${selectedProgram?.code || 'CS'} ${selectedSemester ? `Semester ${selectedSemester.semesterNumber}` : ''} ${categoryLabel} 2024`}
                className="w-full mt-1 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white font-bold"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-extrabold text-slate-900 dark:text-white">Description <span className="text-red-500">*</span></label>
              <textarea
                required
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={`Describe topics covered in this ${categoryLabel.toLowerCase()} for ${courseDisplayName}...`}
                className="w-full mt-1 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white font-medium"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-extrabold text-slate-900 dark:text-white">Tags (comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder={`e.g. ${selectedProgram?.code?.toLowerCase() || 'cs'}, semester-${selectedSemester?.semesterNumber || 1}, midterm, 2024`}
                className="w-full mt-1 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white font-medium"
              />
            </div>

            {/* University Selector */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Uploading University / Institution <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedUniversityOption}
                  onChange={(e) => setSelectedUniversityOption(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-white rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {PAKISTANI_UNIVERSITIES.map((uni) => (
                    <option key={uni} value={uni}>{uni}</option>
                  ))}
                </select>
              </div>
              {selectedUniversityOption === 'Other / Custom (Type Below)' && (
                <input
                  type="text"
                  required
                  value={customUniversityName}
                  onChange={(e) => setCustomUniversityName(e.target.value)}
                  placeholder="Type your full university or institution name..."
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white font-bold"
                />
              )}
              {finalUniversityName && (
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Resource will be tagged to: <strong>{finalUniversityName}</strong>
                </p>
              )}
            </div>

            {/* Admin Review Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
              <span>After submission, your upload will be queued for Admin Review before publishing to the <strong>{courseDisplayName}</strong> Course Hub.</span>
            </div>

            <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting} className="w-full font-bold shadow-lg shadow-blue-500/25">
              Submit Resource for Admin Approval
            </Button>
          </form>
        )}

        {/* Navigation Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-zinc-800">
          <Button
            disabled={currentStep === 1}
            variant="ghost"
            size="sm"
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Back
          </Button>

          {currentStep < 7 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCurrentStep((s) => Math.min(7, s + 1))}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Continue to Step {currentStep + 1}
            </Button>
          )}
        </div>

      </div>
    </div>
  );
};

export default UploadWizardModal;
