'use client';

import React, { useState } from 'react';
import { CareerPath, CareerLevelDefinition, CareerPracticeArea } from '@/lib/careers/career-types';
import {
  Dumbbell,
  ArrowRight,
  Code2,
  FolderGit2,
  CheckSquare,
  MessageSquare,
  Sparkles,
  X,
  PlayCircle,
} from 'lucide-react';

export interface PracticeSectionProps {
  career: CareerPath;
  levelData?: CareerLevelDefinition;
}

export const PracticeSection: React.FC<PracticeSectionProps> = ({ career, levelData }) => {
  const [activeDrill, setActiveDrill] = useState<CareerPracticeArea | null>(null);

  const getPracticeIcon = (cat: string) => {
    switch (cat) {
      case 'Technical Challenges':
        return Code2;
      case 'Portfolio Challenges':
        return FolderGit2;
      case 'Scenario Questions':
        return CheckSquare;
      default:
        return MessageSquare;
    }
  };

  const areas: CareerPracticeArea[] = levelData?.practiceAreas || career.practiceAreas;

  return (
    <div id="practice" className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
              Practice Your Skills
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Build muscle memory through technical drills and scenario assessments tailored for{' '}
            <strong className="text-blue-600">{levelData?.label || 'this level'}</strong>.
          </p>
        </div>
        {levelData && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
            Target Level: {levelData.label}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {areas.map((item) => {
          const IconComp = getPracticeIcon(item.category);
          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-500/50 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {item.category}
                  </span>
                  <span className="text-[10.5px] font-mono text-slate-500 font-semibold">
                    {item.questionCount} Drills
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <IconComp className="w-4 h-4 text-blue-600 shrink-0" />
                  <h3 className="text-sm sm:text-base font-bold font-display text-slate-900 line-clamp-1">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveDrill(item)}
                  className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-2 rounded-xl shadow-xs transition-colors"
                >
                  <span>Start Practice Drill</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drill Detail Modal */}
      {activeDrill && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl text-left">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {activeDrill.category} • {activeDrill.questionCount} Questions
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  {activeDrill.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveDrill(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {activeDrill.description}
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs text-slate-600">
              <span className="font-bold text-slate-800 text-[11px] block">Session Format:</span>
              <p>Timed practical assessment with real-time feedback and solution blueprints.</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveDrill(null)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Session initialized for "${activeDrill.title}". Workspace ready!`);
                  setActiveDrill(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Begin Assessment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
