'use client';

import React, { useState, useRef } from 'react';
import { FileUp, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { ParsedResumeData } from '@backend/services/resumeParserService';

interface ResumeUploadBannerProps {
  onResumeExtracted: (data: ParsedResumeData, filename: string) => void;
  onContinueManually: () => void;
}

export const ResumeUploadBanner: React.FC<ResumeUploadBannerProps> = ({
  onResumeExtracted,
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
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full rounded-2xl bg-[#0B0F19] border border-[#6366F1]/30 p-3.5 sm:p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
      />

      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[#6366F1]/15 text-[#6366F1] flex items-center justify-center shrink-0 border border-[#6366F1]/30">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-white flex items-center gap-2">
            <span>Already have a resume?</span>
            <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-[#6366F1]/20 text-[#6366F1] uppercase">
              Auto-Fill
            </span>
          </div>
          <p className="text-[11px] text-[#94A3B8] truncate">
            Upload PDF/DOCX to extract education, experience & skills for your review.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
        {error && <span className="text-[11px] text-rose-400 font-medium">{error}</span>}

        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:opacity-95 transition-all disabled:opacity-60"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Parsing…</span>
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
