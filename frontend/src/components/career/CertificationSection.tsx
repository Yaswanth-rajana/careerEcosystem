'use client';

import React from 'react';
import { CareerPath } from '@/lib/careers/career-types';
import { Award, Info } from 'lucide-react';

export interface CertificationSectionProps {
  career: CareerPath;
}

export const CertificationSection: React.FC<CertificationSectionProps> = ({ career }) => {
  if (!career.certifications || career.certifications.length === 0) return null;

  return (
    <div id="certifications" className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm text-left space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#6366F1]" />
          <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
            Optional Certifications
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Info className="w-3.5 h-3.5 text-[#6366F1]" />
          <span>Certifications can strengthen your profile, but are not required for every career path.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {career.certifications.map((cert) => (
          <div
            key={cert.id}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs"
          >
            <div>
              <p className="font-bold text-slate-900 dark:text-white">{cert.name}</p>
              <p className="text-[10.5px] text-slate-500 mt-0.5">{cert.issuingOrganization}</p>
            </div>
            <span className="text-[9.5px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-[#6366F1] shrink-0">
              {cert.level}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
