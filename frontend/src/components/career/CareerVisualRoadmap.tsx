'use client';

import React from 'react';
import { CheckCircle2, ArrowRightCircle, Circle } from 'lucide-react';
import { CareerLevelDefinition } from '@/lib/careers/career-types';

export interface CareerVisualRoadmapProps {
  currentStageIndex: number;
  levelData?: CareerLevelDefinition;
}

export const SIX_STAGE_ROADMAP = [
  {
    id: 'learn',
    label: '01 Learn',
    defaultDesc: 'Required Knowledge & Skills',
    sectionId: 'learning-roadmap',
  },
  {
    id: 'practice',
    label: '02 Practice',
    defaultDesc: 'Drills, Labs & Simulations',
    sectionId: 'practice',
  },
  {
    id: 'mentorship',
    label: '03 Get Mentored',
    defaultDesc: '1-on-1 Expert Guidance',
    sectionId: 'mentorship',
  },
  {
    id: 'prepare',
    label: '04 Prepare',
    defaultDesc: 'Technical & Behavioral Prep',
    sectionId: 'interview-prep',
  },
  {
    id: 'job-ready',
    label: '05 Get Job Ready',
    defaultDesc: 'Profile & Proof of Skills',
    sectionId: 'profile-readiness',
  },
  {
    id: 'opportunities',
    label: '06 Find Opportunities',
    defaultDesc: 'Verified Matching Roles',
    sectionId: 'matching-jobs',
  },
] as const;

export const CareerVisualRoadmap: React.FC<CareerVisualRoadmapProps> = ({
  currentStageIndex,
  levelData,
}) => {
  const normalizedIndex = Math.min(Math.max(currentStageIndex, 0), SIX_STAGE_ROADMAP.length - 1);

  const getStageDescription = (stageId: string, defaultDesc: string) => {
    if (!levelData?.roadmapStageDescriptions) return defaultDesc;
    const descriptions = levelData.roadmapStageDescriptions;
    switch (stageId) {
      case 'learn':
        return descriptions.learn || defaultDesc;
      case 'practice':
        return descriptions.practice || defaultDesc;
      case 'mentorship':
        return descriptions.mentorship || defaultDesc;
      case 'prepare':
        return descriptions.prepare || defaultDesc;
      case 'job-ready':
        return descriptions.jobReady || defaultDesc;
      case 'opportunities':
        return descriptions.opportunities || defaultDesc;
      default:
        return defaultDesc;
    }
  };

  const handleStageClick = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
            Your Career Roadmap
          </h2>
          {levelData && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Target: {levelData.label}
            </span>
          )}
        </div>
        <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
          Current: {SIX_STAGE_ROADMAP[normalizedIndex]?.label || '01 Learn'}
        </span>
      </div>

      {/* Desktop Horizontal 6-Stage Pipeline */}
      <div className="hidden lg:block relative p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-x-auto">
        <div className="flex items-start justify-between min-w-[760px] relative">
          {/* Connector Line */}
          <div className="absolute top-[18px] left-[45px] right-[45px] h-1 bg-slate-200 pointer-events-none z-0" />

          {/* Active Connector Progress Fill */}
          <div
            style={{
              width: `${(normalizedIndex / (SIX_STAGE_ROADMAP.length - 1)) * 100}%`,
            }}
            className="absolute top-[18px] left-[45px] max-w-[calc(100%-90px)] h-1 bg-blue-600 transition-all duration-500 pointer-events-none z-0"
          />

          {SIX_STAGE_ROADMAP.map((stage, idx) => {
            const isCompleted = idx < normalizedIndex;
            const isCurrent = idx === normalizedIndex;
            const stageDesc = getStageDescription(stage.id, stage.defaultDesc);

            return (
              <div
                key={stage.id}
                onClick={() => handleStageClick(stage.sectionId)}
                className="relative z-10 flex flex-col items-center text-center max-w-[115px] group cursor-pointer"
                title={`Jump to ${stage.label}`}
              >
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
                    <div className="w-9 h-9 rounded-full bg-white border-2 border-slate-300 text-slate-400 flex items-center justify-center group-hover:border-blue-400 transition-colors">
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
                <span className="text-[10.5px] text-slate-500 leading-tight block mt-0.5 line-clamp-2">
                  {stageDesc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile & Tablet Vertical Stage Stepper (< lg) */}
      <div className="block lg:hidden relative p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        {SIX_STAGE_ROADMAP.map((stage, idx) => {
          const isCompleted = idx < normalizedIndex;
          const isCurrent = idx === normalizedIndex;
          const stageDesc = getStageDescription(stage.id, stage.defaultDesc);

          return (
            <div
              key={stage.id}
              onClick={() => handleStageClick(stage.sectionId)}
              className="flex items-center gap-3.5 cursor-pointer p-1 rounded-xl hover:bg-slate-50 transition-colors"
            >
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
                <p className="text-[11px] text-slate-500 mt-0.5">{stageDesc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
