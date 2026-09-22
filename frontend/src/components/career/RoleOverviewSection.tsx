'use client';

import React from 'react';
import { CareerPath } from '@/lib/careers/career-types';
import { HelpCircle, Briefcase, Code, Building2, CheckCircle2 } from 'lucide-react';

export interface RoleOverviewSectionProps {
  career: CareerPath;
}

export const RoleOverviewSection: React.FC<RoleOverviewSectionProps> = ({ career }) => {
  const rawWhatYouDo = career.roleOverview?.whatYouDo;
  const whatYouDoItems: string[] = Array.isArray(rawWhatYouDo)
    ? rawWhatYouDo
    : typeof rawWhatYouDo === 'string'
    ? [rawWhatYouDo]
    : career.responsibilities.slice(0, 4);
  const youWillWorkOnItems = career.roleOverview?.youWillWorkOn || [
    'Production software systems & applications',
    'Real-world data pipelines and architectures',
    'Collaborative cross-functional projects',
  ];
  const whereCanYouWorkItems = career.roleOverview?.whereCanYouWork || career.commonIndustries;

  return (
    <div id="role-overview" className="space-y-6 text-left">
      <div className="flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
          Understand the Role
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Block 1: WHAT YOU DO */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              WHAT YOU DO
            </h3>
          </div>
          <ul className="space-y-2.5 text-xs">
            {whatYouDoItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Block 2: YOU WILL WORK ON */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Code className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              YOU WILL WORK ON
            </h3>
          </div>
          <ul className="space-y-2.5 text-xs">
            {youWillWorkOnItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Block 3: WHERE CAN YOU WORK? */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              WHERE CAN YOU WORK?
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {whereCanYouWorkItems.map((item, idx) => (
              <span
                key={idx}
                className="text-xs px-3 py-1 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200/70 font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
