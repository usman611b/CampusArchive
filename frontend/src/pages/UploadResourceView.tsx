import React, { useState } from 'react';
import { apiClient } from '../services/apiClient';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';
import { MOCK_DEPARTMENTS, MOCK_PROGRAMS, MOCK_COURSES } from '../data/mockAcademics';

export const UploadResourceView: React.FC = () => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('dept-4');
  const [semester, setSemester] = useState('1');
  const [course, setCourse] = useState('MED-101');
  const [category, setCategory] = useState('PROF_PAST_PAPER');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['MBBS', 'ProfExam']);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 50 * 1024 * 1024) {
        alert('File size exceeds 50MB limit.');
        return;
      }
      setSelectedFile(file);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please attach a file first.');
      return;
    }
    setIsUploading(true);
    try {
      const uploadUrlRes = await apiClient.post('/resources/upload-url', {
        fileName: selectedFile.name,
        fileType: selectedFile.type || 'application/pdf',
        fileSizeBytes: selectedFile.size,
        courseId: 'd7777777-7777-7777-7777-777777777777'
      });

      const { signedUploadUrl, fileStoragePath } = uploadUrlRes.data.data;

      const putRes = await fetch(signedUploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': selectedFile.type || 'application/pdf' },
        body: selectedFile
      });

      if (!putRes.ok) {
        throw new Error(`Storage upload failed (${putRes.status})`);
      }

      await apiClient.post('/resources', {
        courseId: 'd7777777-7777-7777-7777-777777777777',
        categoryId: 'f1111111-1111-1111-1111-111111111101',
        title: title.trim() || selectedFile.name,
        description: description.trim() || 'Uploaded academic resource',
        fileStoragePath,
        mimeType: selectedFile.type || 'application/pdf',
        fileSizeBytes: selectedFile.size,
        tags
      });

      window.dispatchEvent(new Event('resource_uploaded'));
      setIsSuccess(true);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in pb-16">
      
      {/* Shared Page Header Component */}
      <PageHeader
        icon={<UploadCloud className="w-7 h-7 text-blue-600 dark:text-blue-500" />}
        title="Upload Academic Resource"
        subtitle="Preserve institutional knowledge by sharing past papers, notes, or lab manuals."
        badge={
          <Badge variant="blue" className="py-1 px-3 text-xs font-bold">
            Direct Storage Pipeline
          </Badge>
        }
      />

      <Card className="p-8 shadow-xs border-slate-300 dark:border-zinc-800">
        {isSuccess ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Resource Submitted Successfully!</h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed font-medium">
              Your document <strong className="text-slate-900 dark:text-white">{title}</strong> has been routed to the Moderator Pending Approval Queue. It will become searchable upon review.
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setIsSuccess(false);
                setSelectedFile(null);
                setTitle('');
                setDescription('');
              }}
              className="mt-4"
            >
              Upload Another Resource
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Drag & Drop File Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer relative overflow-hidden ${
                dragOver
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 scale-[1.01]'
                  : selectedFile
                  ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/5'
                  : 'border-slate-300 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-zinc-700 bg-slate-50/80 dark:bg-zinc-900'
              }`}
            >
              <input
                type="file"
                accept=".pdf,.docx,.pptx,.txt,.zip"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                    if (!title) setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />

              {selectedFile ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedFile.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Drag & drop your file here</h4>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">or <span className="text-blue-600 dark:text-blue-400 underline font-bold">click to browse</span></p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-500">PDF, PPT, DOCX, ZIP (Max 50MB)</p>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <Input
                label="Resource Title"
                placeholder="e.g. UHS Annual Prof Past Papers 2024 with Key"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <div className="text-left">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe what these notes or past papers cover..."
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 focus:border-blue-600 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              {/* Grid Taxonomy Selectors (Supports Semesters 1 to 10) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 rounded-xl p-2.5 text-xs font-medium focus:border-blue-600 focus:outline-none"
                  >
                    {MOCK_DEPARTMENTS.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Semester Level</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 rounded-xl p-2.5 text-xs font-medium focus:border-blue-600 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
                      <option key={sem} value={sem.toString()}>Semester {sem}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Course</label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 rounded-xl p-2.5 text-xs font-medium focus:border-blue-600 focus:outline-none"
                  >
                    {MOCK_COURSES.map((c) => (
                      <option key={c.id} value={c.code}>{c.code} - {c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Tags (Press Enter)</label>
                <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-xl p-2.5">
                  {tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center gap-1 border border-blue-200 dark:border-zinc-700">
                      #{tag}
                      <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}>
                        <X className="w-3 h-3 hover:text-slate-900 dark:hover:text-white" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Add tags (e.g. mbbs, ospe)..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="bg-transparent border-none text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none flex-1 min-w-[120px] font-medium"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-lg shadow-blue-500/25 font-bold"
              isLoading={isUploading}
            >
              Upload Resource
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};

export default UploadResourceView;
