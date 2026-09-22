'use client';

import React from 'react';
import { CheckCircle2, ArrowRightCircle, Circle } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';

export interface CareerVisualRoadmapProps {
  currentStageIndex: number;
}

export const ROADMAP_STAGES = [
  { id: 'learn', label: '01 Learn', desc: 'Core Skills & Topics' },
  { id: 'build', label: '02 Build', desc: 'Real-World Projects' },
  { id: 'practice', label: '03 Practice', desc: 'Skill Challenges' },
  { id: 'mentorship', label: '04 Get Mentored', desc: '1-on-1 Guidance' },
  { id: 'prepare', label: '05 Prepare', desc: 'Interview Prep' },
  { id: 'job-ready', label: '06 Get Job Ready', desc: 'Profile & Resume' },
  { id: 'opportunities', label: '07 Find Opportunities', desc: 'Matching Job Roles' },
];

export const CareerVisualRoadmap: React.FC<CareerVisualRoadmapProps> = ({ currentStageIndex }) => {
  const normalizedIndex = Math.min(Math.max(currentStageIndex, 0), ROADMAP_STAGES.length - 1);

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
          Your Career Roadmap
        </h2>
        <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
          Current: {ROADMAP_STAGES[normalizedIndex]?.label || '01 Learn'}
        </span>
      </div>

      {/* Desktop Horizontal 7-Stage Pipeline */}
      <div className="hidden lg:block relative p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-x-auto">
        <div className="flex items-start justify-between min-w-[780px] relative">
          
          {/* Connector Line */}
          <div className="absolute top-[18px] left-[35px] right-[35px] h-1 bg-slate-200 pointer-events-none z-0" />
          
          {/* Active Connector Progress Fill */}
          <div
            style={{
              width: `${(normalizedIndex / (ROADMAP_STAGES.length - 1)) * 100}%`,
            }}
            className="absolute top-[18px] left-[35px] max-w-[calc(100%-70px)] h-1 bg-blue-600 transition-all duration-500 pointer-events-none z-0"
          />

          {ROADMAP_STAGES.map((stage, idx) => {
            const isCompleted = idx < normalizedIndex;
            const isCurrent = idx === normalizedIndex;

            return (
              <div key={stage.id} className="relative z-10 flex flex-col items-center text-center max-w-[100px] group cursor-pointer">
                {/* Node Marker */}
                <div className="mb-2 transition-transform duration-200 group-hover:scale-110">
                  {isCompleted ? (
                    <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg ring-4 ring-blue-500/20 animate-pulse">
                      <ArrowRightCircle className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-white border-2 border-slate-300 text-slate-400 flex items-center justify-center">
                      <Circle className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Stage Label */}
                <span
                  className={`text-xs font-bold tracking-tight block ${
                    isCurrent
                      ? 'text-blue-600'
                      : isCompleted
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </span>
                <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
                  {stage.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile & Tablet Vertical Stage Stepper (< lg) */}
      <div className="block lg:hidden relative p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        {ROADMAP_STAGES.map((stage, idx) => {
          const isCompleted = idx < normalizedIndex;
          const isCurrent = idx === normalizedIndex;

          return (
            <div key={stage.id} className="flex items-center gap-3.5">
              <div className="shrink-0">
                {isCompleted ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                ) : isCurrent ? (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md ring-2 ring-blue-500/30">
                    <ArrowRightCircle className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-slate-300 text-slate-400 flex items-center justify-center">
                    <Circle className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isCurrent
                        ? 'text-blue-600'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-500'
                    }`}
                  >
                    {stage.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      Current Stage
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-[10px] font-semibold text-emerald-600">
                      Completed ✓
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{stage.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
