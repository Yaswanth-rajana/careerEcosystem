'use client';

import React, { useState, useRef } from 'react';
import {
  FileUp,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
  X,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { ParsedResumeData } from '@backend/services/resumeParserService';
import { AutofillSummary } from './resume-review/autofillResumeToPayload';

interface ResumeUploadBannerProps {
  onResumeExtracted: (data: ParsedResumeData, filename: string) => void;
  onContinueManually?: () => void;
  autofillSummary?: AutofillSummary | null;
  onClearAutofillSummary?: () => void;
}

export const ResumeUploadBanner: React.FC<ResumeUploadBannerProps> = ({
  onResumeExtracted,
  autofillSummary,
  onClearAutofillSummary,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    if (file.size > 10 * 1024 * 1024) {
      setError('Resume size exceeds 10MB.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await fetch('/api/onboarding/resume', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to parse resume.');
      }

      onResumeExtracted(result.parsedSuggestions, file.name);
    } catch (err: any) {
      console.error('[ResumeUpload] failed:', err?.message || err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 1. Success Autofill State Banner
  if (autofillSummary) {
    const { filename, counts, attentionItems, populatedSections } = autofillSummary;

    return (
      <div className="w-full rounded-2xl bg-gradient-to-r from-emerald-50/90 via-indigo-50/70 to-white border border-emerald-200/90 p-4 sm:p-5 shadow-sm text-left space-y-3.5 transition-all">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.docx,.txt"
          className="hidden"
        />

        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-900">
                  Resume processed & autofilled
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                  Ready for review
                </span>
              </div>
              <p className="text-[11px] text-slate-600 truncate mt-0.5">
                Source document: <span className="font-mono font-medium text-slate-800">{filename}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-60"
              title="Upload a different resume"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Replace Resume</span>
            </button>

            {onClearAutofillSummary && (
              <button
                type="button"
                onClick={onClearAutofillSummary}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Informational Message */}
        <p className="text-xs text-slate-700 leading-relaxed">
          Your resume has been processed. We&apos;ve filled in the information we could find. Please review it before continuing.
        </p>

        {/* Section / Record Count Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {counts.education > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-[11px] font-medium shadow-2xs">
              🎓 {counts.education} {counts.education === 1 ? 'Education' : 'Education records'}
            </span>
          )}
          {counts.experience > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-[11px] font-medium shadow-2xs">
              💼 {counts.experience} {counts.experience === 1 ? 'Experience' : 'Experiences'}
            </span>
          )}
          {counts.skills > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-[11px] font-medium shadow-2xs">
              ⚡ {counts.skills} Skills
            </span>
          )}
          {counts.projects > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-[11px] font-medium shadow-2xs">
              🚀 {counts.projects} {counts.projects === 1 ? 'Project' : 'Projects'}
            </span>
          )}
          {counts.certifications > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-[11px] font-medium shadow-2xs">
              📜 {counts.certifications} {counts.certifications === 1 ? 'Certification' : 'Certifications'}
            </span>
          )}
          {counts.links > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-[11px] font-medium shadow-2xs">
              🔗 {counts.links} {counts.links === 1 ? 'Link' : 'Links'}
            </span>
          )}
        </div>

        {/* Attention Items Box (if any field needs user review) */}
        {attentionItems && attentionItems.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Please verify the following details in the form below:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800 pl-1">
              {attentionItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // 2. Default Initial Upload State Banner
  return (
    <div className="w-full rounded-2xl bg-white border border-indigo-200/80 p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.docx,.txt"
        className="hidden"
      />

      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center shrink-0 border border-[#6366F1]/20">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <span>Already have a resume?</span>
            <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-[#6366F1]/10 text-[#6366F1] uppercase">
              Auto-Fill
            </span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            Upload PDF or DOCX to automatically fill your education, experience & skills.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
        {error && <span className="text-[11px] text-rose-600 font-medium">{error}</span>}

        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all disabled:opacity-60"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Parsing resume…</span>
            </>
          ) : (
            <>
              <FileUp className="w-3.5 h-3.5" />
              <span>Upload Resume</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
