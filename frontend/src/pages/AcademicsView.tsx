import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Course } from '../types/academic';
import { Badge } from '../components/ui/Badge';
import { ResourceCard, ResourceItem } from '../components/resource/ResourceCard';
import {
  AcademicsService,
  DepartmentApiItem,
  ProgramApiItem,
  SemesterApiItem,
  CourseApiItem,
  ResourceApiItem
} from '../services/academicsService';
import {
  GraduationCap,
  BookOpen,
  Star,
  ArrowRight,
  Loader2,
  FileText,
  AlertCircle,
  ChevronRight,
  Search,
  Users,
  Download,
  Award,
  Layers,
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';

interface AcademicsViewProps {
  initialDeptSlug?: string;
  onSelectCourse: (course: Course) => void;
  onSelectResource?: (resource: ResourceItem) => void;
  bookmarkedIds?: string[];
  onBookmarkToggle?: (id: string) => void;
}

// Deterministic gradient pool per resource id
const GRADIENTS = [
  'bg-gradient-to-tr from-blue-700 to-indigo-700',
  'bg-gradient-to-tr from-violet-700 to-purple-700',
  'bg-gradient-to-tr from-emerald-700 to-teal-700',
  'bg-gradient-to-tr from-rose-700 to-pink-700',
  'bg-gradient-to-tr from-amber-700 to-orange-700',
  'bg-gradient-to-tr from-sky-700 to-cyan-700',
];

function gradientForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function toResourceItem(r: ResourceApiItem): ResourceItem {
  const cObj = (r as any).course || (r as any).courses;
  const dept =
    (r as any).departmentName ||
    cObj?.programs?.departments?.name ||
    (r as any).uploader?.universityName ||
    'Academic';
  const semObj = cObj?.semesters;
  const semNum = semObj?.semester_number || (r as any).semesterNumber;
  const sem = (r as any).semesterName || (semNum ? `Semester ${semNum}` : '');
  const crs = (r as any).courseTitle || cObj?.title || cObj?.code || '';
  const tagsList: string[] = (r as any).tags || [];

  return {
    id: r.id,
    title: r.title,
    description: r.description,
    department: dept,
    semester: sem,
    course: crs,
    uploaderName:
      r.uploader?.fullName || (r as any).uploaderName || 'Anonymous Contributor',
    uploaderAvatar: undefined,
    rating: r.averageRating ?? 0,
    reviewsCount: (r as any).ratingCount || 0,
    viewsCount: r.viewsCount || 0,
    downloadsCount: r.downloadsCount || 0,
    commentsCount: (r as any).commentsCount || 0,
    category: (r as any).categoryName || (r as any).category?.name || 'Resource',
    fileType: (r as any).fileType || 'PDF',
    fileSize: (r as any).fileSizeFormatted || '',
    pagesCount: 0,
    uploadedAt: new Date(r.createdAt || (r as any).created_at).toLocaleDateString(),
    gradientClass: gradientForId(r.id),
    tags: tagsList,
  };
}

export const AcademicsView: React.FC<AcademicsViewProps> = ({
  initialDeptSlug = 'computer-science',
  onSelectCourse,
  onSelectResource,
  bookmarkedIds = [],
  onBookmarkToggle,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Departments State ─────────────────────────────────────────────────────
  const [departments, setDepartments] = useState<DepartmentApiItem[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [isLoadingDepts, setIsLoadingDepts] = useState(true);

  // ── Programs State ────────────────────────────────────────────────────────
  const [programs, setPrograms] = useState<ProgramApiItem[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);

  // ── Semesters State ───────────────────────────────────────────────────────
  const [semesters, setSemesters] = useState<SemesterApiItem[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');
  const [selectedSemesterNumber, setSelectedSemesterNumber] = useState<number>(1);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);

  // ── Courses State ─────────────────────────────────────────────────────────
  const [courses, setCourses] = useState<CourseApiItem[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  // ── Resources State ───────────────────────────────────────────────────────
  const [semesterResources, setSemesterResources] = useState<ResourceItem[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);

  // ── Search & Filter Query State ───────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState<string>('');

  const resourceFetchRef = useRef(0);

  // ── 1. Fetch Departments (once on mount or when URL params update) ────────
  useEffect(() => {
    setIsLoadingDepts(true);
    AcademicsService.getDepartments()
      .then((deptList) => {
        setDepartments(deptList || []);
        if (deptList && deptList.length > 0) {
          const deptParam = searchParams.get('department') || initialDeptSlug;
          const match =
            deptList.find((d) => d.slug === deptParam || d.code === deptParam || d.id === deptParam) ||
            deptList[0];
          setSelectedDeptId(match.id);
        }
      })
      .catch(() => setDepartments([]))
      .finally(() => setIsLoadingDepts(false));
  }, [initialDeptSlug]);

  // Sync selectedDeptId if initialDeptSlug prop changes externally (e.g. from Sidebar)
  useEffect(() => {
    if (departments.length > 0 && initialDeptSlug) {
      const match = departments.find(
        (d) => d.slug === initialDeptSlug || d.code === initialDeptSlug || d.id === initialDeptSlug
      );
      if (match && match.id !== selectedDeptId) {
        setSelectedDeptId(match.id);
      }
    }
  }, [initialDeptSlug, departments]);

  // ── 2. Department Selection Change Handler ────────────────────────────────
  useEffect(() => {
    if (!selectedDeptId) return;

    const activeDept = departments.find((d) => d.id === selectedDeptId);

    // Cascade reset child states
    setPrograms([]);
    setSelectedProgramId('');
    setSemesters([]);
    setSelectedSemesterId('');
    setSelectedSemesterNumber(1);
    setCourses([]);
    setSemesterResources([]);

    // Update URL Search Params
    if (activeDept) {
      const params: Record<string, string> = { department: activeDept.slug };
      setSearchParams(params, { replace: true });
    }

    setIsLoadingPrograms(true);
    AcademicsService.getPrograms(selectedDeptId)
      .then((progList) => {
        setPrograms(progList || []);
        if (progList && progList.length > 0) {
          const progParam = searchParams.get('program');
          const pMatch =
            progList.find((p) => p.slug === progParam || p.code === progParam || p.id === progParam) ||
            progList[0];
          setSelectedProgramId(pMatch.id);
        }
      })
      .catch(() => setPrograms([]))
      .finally(() => setIsLoadingPrograms(false));
  }, [selectedDeptId, departments]);

  // ── 3. Program Selection Change Handler ──────────────────────────────────
  useEffect(() => {
    if (!selectedProgramId) return;

    const activeDept = departments.find((d) => d.id === selectedDeptId);
    const activeProg = programs.find((p) => p.id === selectedProgramId);

    // Cascade reset
    setSemesters([]);
    setSelectedSemesterId('');
    setSelectedSemesterNumber(1);
    setCourses([]);
    setSemesterResources([]);

    // Update URL params
    if (activeDept && activeProg) {
      setSearchParams(
        { department: activeDept.slug, program: activeProg.slug },
        { replace: true }
      );
    }

    setIsLoadingSemesters(true);
    AcademicsService.getSemesters(selectedProgramId)
      .then((semList) => {
        setSemesters(semList || []);
        if (semList && semList.length > 0) {
          const semParam = searchParams.get('semester');
          const sNum = semParam ? parseInt(semParam, 10) : 1;
          const sMatch =
            semList.find((s) => s.semesterNumber === sNum || s.id === semParam) || semList[0];
          setSelectedSemesterId(sMatch.id);
          setSelectedSemesterNumber(sMatch.semesterNumber);
        }
      })
      .catch(() => setSemesters([]))
      .finally(() => setIsLoadingSemesters(false));
  }, [selectedProgramId, programs, selectedDeptId, departments]);

  // ── 4. Semester Selection Change Handler ──────────────────────────────────
  useEffect(() => {
    if (!selectedProgramId || !selectedSemesterId) return;

    const activeDept = departments.find((d) => d.id === selectedDeptId);
    const activeProg = programs.find((p) => p.id === selectedProgramId);

    // Cascade reset
    setCourses([]);
    setSemesterResources([]);

    // Update URL params
    if (activeDept && activeProg) {
      setSearchParams(
        {
          department: activeDept.slug,
          program: activeProg.slug,
          semester: String(selectedSemesterNumber),
        },
        { replace: true }
      );
    }

    setIsLoadingCourses(true);
    AcademicsService.getCourses(selectedProgramId, selectedSemesterId)
      .then((courseList) => {
        setCourses(courseList || []);
      })
      .catch(() => setCourses([]))
      .finally(() => setIsLoadingCourses(false));
  }, [selectedProgramId, selectedSemesterId, selectedSemesterNumber, selectedDeptId, departments, programs]);

  // ── 5. Fetch Resources directly per course in selected semester ──────────
  useEffect(() => {
    if (courses.length === 0) {
      setSemesterResources([]);
      return;
    }

    const fetchId = ++resourceFetchRef.current;
    setIsLoadingResources(true);
    setSemesterResources([]);

    Promise.allSettled(
      courses.map((c) => AcademicsService.getCourseResources(c.id))
    ).then((results) => {
      if (fetchId !== resourceFetchRef.current) return;

      const allResources: ResourceApiItem[] = [];
      results.forEach((r) => {
        if (r.status === 'fulfilled') {
          allResources.push(...r.value);
        }
      });

      const seen = new Set<string>();
      const unique = allResources.filter((r) => {
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return r.status === 'APPROVED' || !r.status;
      });

      setSemesterResources(unique.map(toResourceItem));
      setIsLoadingResources(false);
    });
  }, [courses]);

  const activeDepartment = departments.find((d) => d.id === selectedDeptId);
  const activeProgram = programs.find((p) => p.id === selectedProgramId);
  const activeSemester = semesters.find((s) => s.id === selectedSemesterId);

  // Filtered Courses & Resources based on Search Query
  const filteredCourses = courses.filter(
    (c) =>
      !searchQuery.trim() ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredResources = semesterResources.filter(
    (r) =>
      !searchQuery.trim() ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-theme-app text-theme-primary p-6 rounded-3xl transition-colors space-y-6">
      
      {/* ── BREADCRUMB & SEARCH BAR HEADER ────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-theme pb-6">
        <div>
          {/* Interactive Breadcrumbs */}
          <div className="flex items-center flex-wrap gap-1.5 text-xs font-bold text-slate-500 dark:text-zinc-400 mb-2">
            <button
              onClick={() => {
                if (departments.length > 0) setSelectedDeptId(departments[0].id);
              }}
              className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Academic Explorer</span>
            </button>

            {activeDepartment && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <button
                  onClick={() => {
                    // Reset to program level
                  }}
                  className="hover:text-blue-600 dark:hover:text-blue-400 text-slate-700 dark:text-zinc-200 transition-colors"
                >
                  {activeDepartment.name}
                </button>
              </>
            )}

            {activeProgram && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-blue-600 dark:text-blue-400 font-extrabold">
                  {activeProgram.code}
                </span>
              </>
            )}

            {activeSemester && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-900 dark:text-white font-extrabold">
                  Semester {activeSemester.semesterNumber}
                </span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-heading tracking-tight flex items-center gap-2">
            <span>{activeDepartment ? activeDepartment.name : 'Academic Faculties'}</span>
            {activeProgram && (
              <Badge variant="blue" className="py-0.5 px-2.5 text-xs font-mono">
                {activeProgram.code}
              </Badge>
            )}
          </h1>
          <p className="text-theme-secondary text-xs sm:text-sm mt-1 max-w-2xl font-medium">
            Dynamic database explorer powered by Supabase PostgreSQL APIs.
          </p>
        </div>

        {/* Live Filter Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeProgram ? activeProgram.code : 'courses'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-theme-card border border-theme rounded-2xl pl-10 pr-9 py-2 text-xs font-semibold text-theme-primary placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── DEPARTMENT SELECTOR CARDS ───────────────────────────────────────── */}
      {isLoadingDepts ? (
        <div className="flex items-center justify-center gap-3 py-12 text-blue-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-xs font-bold">Fetching academic departments from Supabase...</span>
        </div>
      ) : departments.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-theme rounded-3xl space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs font-bold text-theme-secondary">No departments found in Supabase.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const isSelected = selectedDeptId === dept.id;
            return (
              <div
                key={dept.id}
                onClick={() => setSelectedDeptId(dept.id)}
                className={
                  isSelected
                    ? 'p-5 rounded-2xl cursor-pointer transition-all border-2 border-blue-600 dark:border-blue-500 bg-blue-50/90 dark:bg-blue-950/60 text-slate-900 dark:text-white shadow-md ring-2 ring-blue-500/20'
                    : 'p-5 rounded-2xl cursor-pointer transition-all border border-theme bg-theme-card text-theme-primary hover:border-blue-400 hover:shadow-xs'
                }
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-xs font-extrabold text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-500/30">
                    {dept.code}
                  </span>
                  {isSelected && <Badge variant="blue">Selected</Badge>}
                </div>
                <h3 className="font-extrabold text-base text-theme-heading mt-1">{dept.name}</h3>
                <p className="text-xs text-theme-secondary mt-1 line-clamp-2 leading-relaxed font-medium">
                  {dept.description}
                </p>

                {/* Dynamic Stats Row */}
                <div className="mt-3 pt-3 border-t border-theme/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-bold">
                  <span>{dept.programsCount ?? 0} Programs</span>
                  <span>{dept.resourcesCount ?? 0} Files</span>
                  <span>
                    {dept.averageRating !== null && dept.averageRating !== undefined
                      ? `${dept.averageRating.toFixed(1)} ★`
                      : 'New'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── DEPARTMENT DYNAMIC ANALYTICS SUMMARY BAR ────────────────────────── */}
      {activeDepartment && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 rounded-3xl bg-theme-card border border-theme shadow-xs">
          <div className="p-3 text-center rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-theme space-y-0.5">
            <div className="text-lg font-black text-blue-600 dark:text-blue-400">
              {activeDepartment.programsCount ?? 0}
            </div>
            <p className="text-[10px] font-bold text-theme-secondary">Degree Programs</p>
          </div>
          <div className="p-3 text-center rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-theme space-y-0.5">
            <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">
              {activeDepartment.coursesCount ?? 0}
            </div>
            <p className="text-[10px] font-bold text-theme-secondary">Total Courses</p>
          </div>
          <div className="p-3 text-center rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-theme space-y-0.5">
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {activeDepartment.resourcesCount ?? 0}
            </div>
            <p className="text-[10px] font-bold text-theme-secondary">Approved Files</p>
          </div>
          <div className="p-3 text-center rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-theme space-y-0.5">
            <div className="text-lg font-black text-purple-600 dark:text-purple-400">
              {activeDepartment.contributorsCount ?? 0}
            </div>
            <p className="text-[10px] font-bold text-theme-secondary">Contributors</p>
          </div>
          <div className="p-3 text-center rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-theme space-y-0.5">
            <div className="text-lg font-black text-cyan-600 dark:text-cyan-400">
              {activeDepartment.totalDownloads ?? 0}
            </div>
            <p className="text-[10px] font-bold text-theme-secondary">Total Downloads</p>
          </div>
          <div className="p-3 text-center rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-theme space-y-0.5">
            <div className="text-lg font-black text-amber-600 dark:text-amber-400 flex justify-center items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>
                {activeDepartment.averageRating !== null && activeDepartment.averageRating !== undefined
                  ? activeDepartment.averageRating.toFixed(1)
                  : 'N/A'}
              </span>
            </div>
            <p className="text-[10px] font-bold text-theme-secondary">Avg Rating</p>
          </div>
        </div>
      )}

      {/* ── SECTION 1: PROGRAM SELECTOR ─────────────────────────────────────── */}
      {(isLoadingPrograms || programs.length > 0) && (
        <div className="p-6 rounded-3xl bg-theme-card border border-theme shadow-xs space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-theme-secondary flex items-center justify-between">
            <span>1. Select Degree Program — {activeDepartment?.name}</span>
            {programs.length > 0 && <span className="font-mono text-blue-600">{programs.length} Available</span>}
          </h2>

          {isLoadingPrograms ? (
            <div className="flex items-center gap-2 text-blue-600 py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-bold">Loading programs for {activeDepartment?.name}...</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {programs.map((prog) => {
                const isProgSelected = selectedProgramId === prog.id;
                return (
                  <button
                    key={prog.id}
                    onClick={() => setSelectedProgramId(prog.id)}
                    className={
                      isProgSelected
                        ? 'px-4 py-2.5 text-xs font-extrabold rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 transition-all border border-blue-500'
                        : 'px-4 py-2.5 text-xs font-extrabold rounded-xl border border-theme bg-slate-100 dark:bg-zinc-800 text-theme-primary hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all'
                    }
                  >
                    {prog.name} ({prog.code})
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── SECTION 2: SEMESTER SELECTOR & COURSE HUBS ──────────────────────── */}
      {programs.length > 0 && !isLoadingPrograms && selectedProgramId && (
        <>
          {(isLoadingSemesters || semesters.length > 0) && (
            <div className="p-6 rounded-3xl bg-theme-card border border-theme shadow-xs space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-theme-secondary">
                2. Select Semester Level — {activeProgram?.name} ({semesters.length} Semesters)
              </h2>

              {isLoadingSemesters ? (
                <div className="flex items-center gap-2 text-blue-600 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-bold">Loading semesters for {activeProgram?.code}...</span>
                </div>
              ) : semesters.length === 0 ? (
                <p className="text-xs text-theme-secondary font-medium">
                  No semesters found for {activeProgram?.name}.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
                  {semesters.map((sem) => {
                    const isSemSelected = selectedSemesterId === sem.id;
                    return (
                      <button
                        key={sem.id}
                        onClick={() => {
                          setSelectedSemesterId(sem.id);
                          setSelectedSemesterNumber(sem.semesterNumber);
                        }}
                        className={
                          isSemSelected
                            ? 'p-3 text-center text-xs font-extrabold rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 transition-all border border-blue-500'
                            : 'p-3 text-center text-xs font-extrabold rounded-xl border border-theme bg-slate-100 dark:bg-zinc-800 text-theme-primary hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all'
                        }
                      >
                        Sem {sem.semesterNumber}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── COURSE HUBS GRID ──────────────────────────────────────────────── */}
          {selectedSemesterId && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-theme pb-3">
                <h2 className="text-lg sm:text-xl font-extrabold text-theme-heading flex items-center gap-2">
                  <span>
                    Course Hubs — {activeProgram?.code} • Semester {selectedSemesterNumber}
                  </span>
                  {!isLoadingCourses && (
                    <Badge variant="blue">
                      {filteredCourses.length} Course{filteredCourses.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </h2>
              </div>

              {isLoadingCourses ? (
                <div className="text-center py-16 bg-theme-card rounded-3xl border border-theme space-y-3">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                  <p className="text-xs text-theme-secondary font-bold">
                    Loading courses for {activeProgram?.code} Semester {selectedSemesterNumber}...
                  </p>
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-14 bg-theme-card rounded-3xl border border-dashed border-theme space-y-3">
                  <BookOpen className="w-10 h-10 text-theme-secondary mx-auto" />
                  <h3 className="text-base font-extrabold text-theme-heading">
                    {searchQuery
                      ? `No courses matching "${searchQuery}"`
                      : `No courses configured for ${activeProgram?.code} Semester ${selectedSemesterNumber}`}
                  </h3>
                  <p className="text-xs text-theme-secondary">
                    Try clearing your search query or select another semester level.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => onSelectCourse(course as any)}
                      className="p-6 rounded-3xl cursor-pointer bg-theme-card border border-theme space-y-4 shadow-xs hover:border-blue-500 hover:shadow-md transition-all group"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-extrabold text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30">
                              {course.code}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                              {activeDepartment?.name} • {activeProgram?.code}
                            </span>
                          </div>
                          <h3 className="text-lg font-extrabold text-theme-heading mt-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-xs text-theme-secondary font-bold mt-1">
                            Instructor: {course.instructorName}
                            {course.creditHours ? ` • ${course.creditHours} Cr Hrs` : ''}
                          </p>
                        </div>

                        {/* Rating Badge */}
                        <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-extrabold text-xs bg-amber-50 dark:bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-500/30 shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>
                            {course.averageRating !== null && course.averageRating !== undefined && course.averageRating > 0
                              ? course.averageRating.toFixed(1)
                              : 'New'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-theme-secondary line-clamp-2 leading-relaxed font-medium">
                        {course.description}
                      </p>

                      {/* Section Resource Counters */}
                      <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 text-center pt-2 border-t border-theme">
                        {[
                          { label: 'Notes', val: course.sectionsCount?.notes },
                          { label: 'Papers', val: course.sectionsCount?.pastPapers },
                          { label: 'Assign.', val: course.sectionsCount?.assignments },
                          { label: 'Projects', val: course.sectionsCount?.projects },
                          { label: 'Books', val: course.sectionsCount?.books },
                          { label: 'Videos', val: course.sectionsCount?.videos },
                          { label: 'Labs', val: course.sectionsCount?.labManuals },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="p-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-theme"
                          >
                            <div className="text-xs font-extrabold text-theme-heading">
                              {item.val ?? 0}
                            </div>
                            <div className="text-[9px] text-theme-secondary font-bold truncate">
                              {item.label}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-bold text-theme-secondary">
                          {course.totalResources ?? 0} files • {course.contributorsCount ?? 0} contributors
                        </span>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Open Course Hub <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── APPROVED RESOURCES GRID ─────────────────────────────────────── */}
          {selectedSemesterId && (courses.length > 0 || isLoadingResources) && (
            <div className="space-y-4 pt-6 border-t border-theme">
              <div className="flex items-center justify-between border-b border-theme pb-3">
                <h2 className="text-lg sm:text-xl font-extrabold text-theme-heading flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>
                    Approved Resources — {activeDepartment?.name} • Semester {selectedSemesterNumber}
                  </span>
                  {!isLoadingResources && (
                    <Badge variant="emerald">{filteredResources.length} Files Live</Badge>
                  )}
                </h2>
              </div>

              {isLoadingResources ? (
                <div className="text-center py-12 bg-theme-card rounded-3xl border border-theme space-y-2">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                  <p className="text-xs text-theme-secondary font-bold">
                    Loading approved files for Semester {selectedSemesterNumber}...
                  </p>
                </div>
              ) : filteredResources.length === 0 ? (
                <div className="p-10 text-center bg-theme-card rounded-3xl border border-dashed border-theme space-y-2">
                  <BookOpen className="w-8 h-8 text-theme-secondary mx-auto" />
                  <p className="text-sm font-extrabold text-theme-heading">
                    {searchQuery
                      ? `No resources matching "${searchQuery}"`
                      : `No approved files yet for ${activeProgram?.code} Semester ${selectedSemesterNumber}`}
                  </p>
                  <p className="text-xs text-theme-secondary">
                    Be the first contributor! Upload notes, past papers, or assignments for these courses.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map((res) => (
                    <ResourceCard
                      key={res.id}
                      resource={res}
                      onSelect={(r) => onSelectResource && onSelectResource(r)}
                      isBookmarked={bookmarkedIds.includes(res.id)}
                      onBookmarkToggle={onBookmarkToggle}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AcademicsView;
