import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CheckCircle2,
  User,
  FileText,
  Send,
  Building2,
  AlertCircle,
  UploadCloud,
  Loader2,
  Check,
  Trash2,
  FileCheck,
  Clock,
  Sparkles,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/design-system/Button';
import { useAuth } from '@/lib/AuthContext';
import { JobsApiClient } from '@/services/jobsClient';
import { JobDetailDTO, ApplicationDTO } from '@backend/types/jobs';
import Link from 'next/link';

interface SavedResume {
  id: string;
  filename: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
  updatedAt?: string;
  isLatest?: boolean;
  applicationsCount?: number;
  lastUsedAt?: string | null;
  lastUsedJobTitle?: string | null;
  lastUsedCompany?: string | null;
}

interface Props {
  job: JobDetailDTO;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (application: any) => void;
}

export const ApplyModal: React.FC<Props> = ({
  job,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Profile, 2: Resume & Note, 3: Review, 4: Done
  const [coverNote, setCoverNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedApp, setSubmittedApp] = useState<ApplicationDTO | null>(null);

  // Resume selection state
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);
  const [selectedResume, setSelectedResume] = useState<SavedResume | null>(null);
  const [isNewUpload, setIsNewUpload] = useState(false);

  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load candidate's saved resumes when modal opens
  useEffect(() => {
    if (isOpen && user) {
      loadSavedResumes();
    }
  }, [isOpen, user]);

  const loadSavedResumes = async () => {
    try {
      setIsLoadingResumes(true);
      const res = await fetch('/api/resumes');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.resumes)) {
        setSavedResumes(data.resumes);
        // Auto-select latest resume if none selected yet
        if (!selectedResume && data.resumes.length > 0) {
          setSelectedResume(data.resumes[0]);
          setIsNewUpload(false);
        }
      }
    } catch (err) {
      console.warn('Failed to load saved resumes:', err);
    } finally {
      setIsLoadingResumes(false);
    }
  };

  if (!isOpen) return null;

  const formatFileSize = (bytes: number): string => {
    if (!bytes || isNaN(bytes)) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (isoString?: string | null): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    setErrorMessage(null);

    // 1. Client-side extension validation
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'doc') {
      setUploadError('Legacy .doc format is not supported. Please upload a PDF, DOCX, or TXT file.');
      return;
    }
    if (!ext || !['pdf', 'docx', 'txt'].includes(ext)) {
      setUploadError('Invalid file format. Please upload a PDF, DOCX, or TXT file.');
      return;
    }

    // 2. Client-side size validation (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds the 10MB limit. Please choose a smaller file.');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload resume file.');
      }

      const uploadedResume: SavedResume = data.resume;
      setSavedResumes((prev) => [uploadedResume, ...prev.filter((r) => r.id !== uploadedResume.id)]);
      setSelectedResume(uploadedResume);
      setIsNewUpload(true);
    } catch (err: any) {
      setUploadError(err.message || 'Network error while uploading resume. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleProceedToReview = () => {
    if (!selectedResume) {
      setErrorMessage('Please select or upload a resume before proceeding to submission.');
      return;
    }
    setErrorMessage(null);
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!selectedResume) {
      setErrorMessage('A resume must be selected before submitting your application.');
      setStep(2);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const app = await JobsApiClient.applyToJob(job.id, {
        coverNote: coverNote.trim() || undefined,
        resumeId: selectedResume.id,
        isNewUpload,
      });

      setSubmittedApp(app);
      setStep(4);
      onSuccess(app);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={step === 4 ? onClose : undefined}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-7 overflow-hidden z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 line-clamp-1">{job.title}</h3>
              <p className="text-xs text-slate-500">{job.company}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progression (Steps 1-3) */}
        {step < 4 && (
          <div className="py-4 shrink-0">
            <div className="grid grid-cols-3 gap-2 text-xs font-semibold mb-2.5">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`text-left transition-colors cursor-pointer ${
                  step === 1
                    ? 'text-blue-600 font-bold'
                    : step > 1
                    ? 'text-slate-700 hover:text-blue-600 font-medium'
                    : 'text-slate-400 font-normal'
                }`}
              >
                1. Candidate Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  if (step > 2 || (step === 1 && selectedResume)) {
                    setStep(2);
                  }
                }}
                disabled={step < 2}
                className={`text-center transition-colors ${
                  step === 2
                    ? 'text-blue-600 font-bold'
                    : step > 2
                    ? 'text-slate-700 hover:text-blue-600 cursor-pointer font-medium'
                    : 'text-slate-400 cursor-default font-normal'
                }`}
              >
                2. Resume & Cover Letter
              </button>
              <button
                type="button"
                disabled={step < 3}
                className={`text-right transition-colors ${
                  step === 3
                    ? 'text-blue-600 font-bold'
                    : 'text-slate-400 cursor-default font-normal'
                }`}
              >
                3. Review & Submit
              </button>
            </div>
            {/* Segmented step highlight bars */}
            <div className="grid grid-cols-3 gap-2">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step >= 1 ? 'bg-blue-600 shadow-xs' : 'bg-slate-200'
                }`}
              />
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step >= 2 ? 'bg-blue-600 shadow-xs' : 'bg-slate-200'
                }`}
              />
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step >= 3 ? 'bg-blue-600 shadow-xs' : 'bg-slate-200'
                }`}
              />
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="my-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="overflow-y-auto flex-1 pr-1.5 -mr-1.5 p-0.5">
          {/* STEP 1: Candidate Profile Review */}
          {step === 1 && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{user?.name}</h4>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-600 space-y-1.5 leading-relaxed">
                  <p>
                    Applying for <span className="font-semibold text-slate-800">{job.title}</span> at{' '}
                    <span className="font-semibold text-slate-800">{job.company}</span>.
                  </p>
                  <p className="text-amber-800 bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 mt-2 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <span>
                      A resume must be selected or uploaded before you can submit your application.
                      Your verified profile and chosen resume will be attached to this application.
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={() => setStep(2)}>
                  Continue to Resume & Cover Letter
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Resume Selection/Upload & Cover Letter */}
          {step === 2 && (
            <div className="space-y-4 py-2">
              {/* Selected Resume Banner if one is chosen */}
              {selectedResume ? (
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-900 truncate">{selectedResume.filename}</span>
                        {selectedResume.isLatest && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <Sparkles className="w-2.5 h-2.5" /> Latest
                          </span>
                        )}
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          Selected
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {formatFileSize(selectedResume.fileSize)} •{' '}
                        {selectedResume.lastUsedAt
                          ? `Last used ${formatDate(selectedResume.lastUsedAt)}${selectedResume.lastUsedCompany ? ` (${selectedResume.lastUsedCompany})` : ''}`
                          : `Uploaded ${formatDate(selectedResume.createdAt)}`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedResume(null);
                      setIsNewUpload(false);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="Change resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Existing Saved Resumes */}
                  {savedResumes.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-700">
                          Select an Existing Resume
                        </label>
                        <span className="text-[11px] text-slate-400">
                          Sorted by latest upload
                        </span>
                      </div>
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
                        {savedResumes.map((res, idx) => {
                          const isLatest = idx === 0 || res.isLatest;
                          return (
                            <div
                              key={res.id}
                              onClick={() => {
                                setSelectedResume(res);
                                setIsNewUpload(false);
                              }}
                              className="p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs border-slate-200 hover:border-blue-300 hover:bg-slate-50/80 bg-white"
                            >
                              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-blue-50 text-blue-600">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1 space-y-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-[240px]">
                                      {res.filename}
                                    </span>
                                    {isLatest && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                                        <Sparkles className="w-2.5 h-2.5" /> Latest
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                                    <span>{formatFileSize(res.fileSize)}</span>
                                    <span>•</span>
                                    {res.lastUsedAt ? (
                                      <span className="text-slate-600 flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                        Last used {formatDate(res.lastUsedAt)}
                                        {res.lastUsedCompany ? ` (${res.lastUsedCompany})` : ''}
                                      </span>
                                    ) : (
                                      <span className="text-slate-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                        Uploaded {formatDate(res.createdAt)}
                                      </span>
                                    )}
                                    {res.applicationsCount && res.applicationsCount > 0 ? (
                                      <>
                                        <span>•</span>
                                        <span className="text-blue-600 font-medium">
                                          {res.applicationsCount} app{res.applicationsCount > 1 ? 's' : ''}
                                        </span>
                                      </>
                                    ) : null}
                                  </div>
                                </div>
                              </div>

                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs px-2.5 shrink-0 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                              >
                                Select
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Upload Area for New Resume */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {savedResumes.length > 0 ? 'Or Upload a New Resume' : 'Upload Your Resume *'}
                    </label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => !isUploading && fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition ${
                        isDragging
                          ? 'border-blue-500 bg-blue-50/50'
                          : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,.txt"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isUploading}
                      />
                      {isUploading ? (
                        <div className="flex flex-col items-center justify-center py-2 text-xs text-blue-600 gap-2">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span className="font-semibold">Validating and uploading resume...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1.5 text-xs text-slate-600">
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-slate-800">
                            Click to upload or drag and drop
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Supported: PDF, DOCX, TXT (up to 10MB)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {uploadError && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Cover Letter */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Cover Letter <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  maxLength={2000}
                  placeholder="Highlight your relevant experience, key achievements, or note for the recruiter..."
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder:text-slate-400 resize-none transition-all"
                />
                <div className="text-[11px] text-slate-400 text-right mt-0.5">
                  {coverNote.length} / 2000 characters
                </div>
              </div>

              <div className="flex justify-between gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleProceedToReview}
                  disabled={!selectedResume || isUploading}
                >
                  Next: Review Application
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Confirm & Submit */}
          {step === 3 && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Review Application Summary</span>
                </div>

                <div className="text-xs text-slate-700 space-y-2">
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500">Position:</span>
                    <span className="col-span-2 font-semibold text-slate-900">{job.title}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500">Company:</span>
                    <span className="col-span-2 font-semibold text-slate-900">{job.company}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500">Candidate:</span>
                    <span className="col-span-2 font-semibold text-slate-900">
                      {user?.name} ({user?.email})
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500">Attached Resume:</span>
                    <span className="col-span-2 font-semibold text-blue-700 flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>{selectedResume?.filename}</span>
                      {selectedResume?.fileSize && (
                        <span className="text-[10px] text-slate-400">
                          ({formatFileSize(selectedResume.fileSize)})
                        </span>
                      )}
                    </span>
                  </div>
                  {coverNote.trim() && (
                    <div className="grid grid-cols-3 gap-1 pt-1 border-t border-blue-100/60">
                      <span className="text-slate-500">Cover Letter:</span>
                      <span className="col-span-2 text-slate-700 italic line-clamp-3">
                        &ldquo;{coverNote.trim()}&rdquo;
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-[11px] text-slate-500 leading-relaxed">
                By submitting, you confirm that your selected resume (
                <strong className="text-slate-700">{selectedResume?.filename}</strong>) and profile
                will be submitted directly to <strong className="text-slate-700">{job.company}&apos;s</strong>
                recruiting team for this position.
              </div>

              <div className="flex justify-between items-center gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    rightIcon={<Send className="w-4 h-4" />}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Submit Application
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Application Submitted ✓ */}
          {step === 4 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Application Submitted!</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                  Your application for <span className="font-semibold text-slate-800">{job.title}</span> at{' '}
                  <span className="font-semibold text-slate-800">{job.company}</span> has been received.
                </p>
              </div>

              {/* Application Details Summary */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Application ID:</span>
                  <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    {submittedApp?.id || 'Processing...'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                    {submittedApp?.status || 'Applied'}
                  </span>
                </div>
                {selectedResume?.filename && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Submitted Resume:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[200px]">
                      {selectedResume.filename}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirmation Email Delivery Status */}
              <div className="max-w-md mx-auto">
                {submittedApp?.emailNotification?.sent ? (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      A confirmation email has been sent to <strong>{user?.email}</strong>.
                    </span>
                  </div>
                ) : submittedApp?.emailNotification?.error ? (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>
                      Your application was submitted successfully, but we couldn&apos;t send the confirmation email right now. You can still track your application in Jobs &rarr; Applications.
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      A confirmation email has been dispatched to <strong>{user?.email}</strong>.
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/jobs?tab=applications" className="w-full sm:w-auto">
                  <Button variant="primary" size="md" className="w-full">
                    View My Applications
                  </Button>
                </Link>
                <Button variant="outline" size="md" onClick={onClose} className="w-full sm:w-auto">
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
