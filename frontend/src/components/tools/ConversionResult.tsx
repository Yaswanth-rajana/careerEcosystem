'use client';

import React from 'react';
import { CheckCircle2, Download, RefreshCw, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/design-system/Button';

export interface ConversionResultProps {
  jobId: string;
  guestToken?: string;
  outputFilename: string;
  outputSizeBytes?: number;
  onReset: () => void;
}

export const ConversionResult: React.FC<ConversionResultProps> = ({
  jobId,
  guestToken,
  outputFilename,
  outputSizeBytes,
  onReset,
}) => {
  const downloadUrl = `/api/tools/conversions/${jobId}/download${
    guestToken ? `?guestToken=${encodeURIComponent(guestToken)}` : ''
  }`;

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'Ready';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xl space-y-8 animate-fadeIn text-center sm:text-left">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-500 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center shrink-0 shadow-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-1.5 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100/70 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold font-mono">
            ✓ CONVERSION COMPLETE
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold font-display text-slate-900 dark:text-white truncate max-w-md">
            {outputFilename}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            PDF Document • {formatBytes(outputSizeBytes)}
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-2 font-medium">
          <FileText className="w-4 h-4 text-[#6366F1]" />
          Processed securely & stored temporarily
        </span>
        <span className="font-mono text-[11px] text-slate-400">Auto-expires in 60m</span>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href={downloadUrl}
          download={outputFilename}
          className="w-full sm:w-auto min-w-[200px] inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full font-bold text-white bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:opacity-95 shadow-lg shadow-indigo-500/25 transition-all text-sm group"
        >
          <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform shrink-0" />
          <span>Download PDF</span>
        </a>

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-6 py-3.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4 shrink-0" />
          <span>Convert Another File</span>
        </button>
      </div>
    </div>
  );
};
