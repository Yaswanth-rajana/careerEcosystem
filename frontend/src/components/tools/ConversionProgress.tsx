'use client';

import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

export type ConversionStepState =
  | 'IDLE'
  | 'FILE_SELECTED'
  | 'UPLOADING'
  | 'VALIDATING'
  | 'QUEUED'
  | 'PROCESSING'
  | 'FINALIZING'
  | 'COMPLETED'
  | 'FAILED'
  | 'EXPIRED';

export interface ConversionProgressProps {
  state: ConversionStepState;
  filename: string;
  errorMessage?: string;
}

export const ConversionProgress: React.FC<ConversionProgressProps> = ({
  state,
  filename,
  errorMessage,
}) => {
  const getStepText = () => {
    switch (state) {
      case 'UPLOADING':
        return 'Uploading your document securely...';
      case 'VALIDATING':
        return 'Validating document structure & format...';
      case 'QUEUED':
        return 'Job queued for conversion...';
      case 'PROCESSING':
        return 'Converting document to PDF...';
      case 'FINALIZING':
        return 'Validating PDF output & finalizing...';
      case 'COMPLETED':
        return 'Conversion complete!';
      case 'FAILED':
        return 'Conversion failed.';
      default:
        return 'Preparing...';
    }
  };

  const isSpinnerState = ['UPLOADING', 'VALIDATING', 'QUEUED', 'PROCESSING', 'FINALIZING'].includes(state);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="w-full p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-lg space-y-6"
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-[#6366F1] flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
              {filename}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Target output: PDF</p>
          </div>
        </div>

        {isSpinnerState && (
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#6366F1] bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Processing
          </span>
        )}
      </div>

      {/* Progress Steps Status Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span>{getStepText()}</span>
          <span className="font-mono text-slate-400">PATHWAY ENGINE</span>
        </div>

        {/* Animated Progress Track */}
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
          {isSpinnerState && (
            <div className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full animate-pulse w-3/4 transition-all duration-500" />
          )}
          {state === 'COMPLETED' && (
            <div className="h-full bg-emerald-500 rounded-full w-full transition-all duration-300" />
          )}
          {state === 'FAILED' && (
            <div className="h-full bg-red-500 rounded-full w-full transition-all duration-300" />
          )}
        </div>
      </div>

      {state === 'FAILED' && errorMessage && (
        <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
