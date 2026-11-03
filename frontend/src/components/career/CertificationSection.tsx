'use client';

import React from 'react';
import { CareerPath, CareerLevelDefinition } from '@/lib/careers/career-types';
import { Award, Info, Sparkles } from 'lucide-react';

export interface CertificationSectionProps {
  career: CareerPath;
  levelData?: CareerLevelDefinition;
}

export const CertificationSection: React.FC<CertificationSectionProps> = ({ career, levelData }) => {
  const isLevelSpecific = Boolean(levelData?.certifications && levelData.certifications.length > 0);
  const certifications = isLevelSpecific
    ? levelData!.certifications!
    : career.certifications;

  if (!certifications || certifications.length === 0) return null;

  return (
    <div id="certifications" className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-left space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold font-display text-slate-900">
            Optional Certifications
          </h2>
          {isLevelSpecific && levelData && (
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600" />
              Target: {levelData.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Certifications are optional portfolio signals, not strict eligibility barriers.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {certifications.map((cert) => (
          <div
            key={cert.id}
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs hover:border-slate-200 transition-colors"
          >
            <div>
              <p className="font-bold text-slate-900">{cert.name}</p>
              <p className="text-[10.5px] text-slate-500 mt-0.5">{cert.issuingOrganization}</p>
            </div>
            <span className="text-[9.5px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600 shrink-0">
              {cert.level}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
