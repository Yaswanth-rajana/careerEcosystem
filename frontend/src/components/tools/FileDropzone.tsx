'use client';

import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, HardDrive } from 'lucide-react';
import { Button } from '@/components/design-system/Button';

export interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  acceptedExtensions?: string[];
  maxSizeMb?: number;
  disabled?: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelect,
  acceptedExtensions = ['DOC', 'DOCX', 'XLS', 'XLSX', 'PPT', 'PPTX', 'ODT', 'ODS', 'ODP', 'TXT'],
  maxSizeMb = 25,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const processFile = (file: File) => {
    setErrorMessage(null);
    const maxBytes = maxSizeMb * 1024 * 1024;

    if (file.size > maxBytes) {
      setErrorMessage(`This file exceeds the maximum size limit of ${maxSizeMb} MB.`);
      return;
    }

    const ext = file.name.split('.').pop()?.toUpperCase() || '';
    if (!acceptedExtensions.includes(ext)) {
      setErrorMessage(`.${ext} files are not supported. Supported: ${acceptedExtensions.join(', ')}`);
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full space-y-3">
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label="Upload document drag and drop area"
        className={`relative group rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-offset-2 ${
          isDragging
            ? 'border-[#6366F1] bg-indigo-50/50 scale-[1.01]'
            : 'border-slate-300 bg-white hover:border-[#6366F1]/60 hover:bg-slate-50/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept={acceptedExtensions.map((ext) => `.${ext.toLowerCase()}`).join(',')}
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-50 text-[#6366F1] flex items-center justify-center border border-indigo-200/60 shadow-sm group-hover:scale-105 transition-transform">
            <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <div className="space-y-1 max-w-sm">
            <p className="text-base sm:text-lg font-bold font-display text-slate-900">
              Drop your file here <span className="text-slate-400 font-normal">or</span>
            </p>
            <div className="pt-1">
              <button
                type="button"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
                className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-blue-600 hover:bg-black shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all"
              >
                Choose File
              </button>
            </div>
          </div>

          {/* Formats & Limits Info */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500">
            {acceptedExtensions.map((ext) => (
              <span
                key={ext}
                className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/70 font-mono font-medium text-[11px]"
              >
                {ext}
              </span>
            ))}
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <HardDrive className="w-3.5 h-3.5 text-[#6366F1]" />
            <span>Maximum file size: {maxSizeMb} MB</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm animate-fadeIn"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
