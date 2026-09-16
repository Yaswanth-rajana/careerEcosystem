'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps?: number;
  completedSteps: number[];
  onSelectStep: (step: number) => void;
}

const STEP_ITEMS = [
  { num: 1, title: 'About You', subtitle: 'Personal details & candidate type' },
  { num: 2, title: 'Education', subtitle: 'Degrees & institutions' },
  { num: 3, title: 'Experience', subtitle: 'Work history & internships' },
  { num: 4, title: 'Skills', subtitle: 'Competencies & levels' },
  { num: 5, title: 'Projects', subtitle: 'Portfolio & code repos' },
  { num: 6, title: 'Career Direction', subtitle: 'Target role & career vision' },
  { num: 7, title: 'Review & Activate', subtitle: 'Confirm candidate profile' },
];

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps = 8,
  completedSteps,
  onSelectStep,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full space-y-5 text-left pl-3 pr-2 py-1">
      {/* Header Summary */}
      <div className="space-y-2.5 border-b border-[#94A3B8]/12 pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1] text-[10px] font-bold uppercase tracking-wider">
          <Sparkles className="w-3 h-3" /> Career Pathway
        </div>
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold font-display text-white">Your Pathway</h2>
          <span className="text-sm font-bold text-[#6366F1] font-mono">{percentage}%</span>
        </div>

        {/* Thin Progress Line */}
        <div className="w-full h-1.5 rounded-full bg-[#94A3B8]/10 overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={
              shouldReduceMotion
                ? { duration: 0.2 }
                : { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
            }
            className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"
          />
        </div>
      </div>

      {/* Pixel-Perfect Dynamic Pathway Timeline */}
      <div className="space-y-1">
        {STEP_ITEMS.map((item, idx) => {
          const isCurrent = item.num === currentStep;
          const isDone = completedSteps.includes(item.num);
          const isSelectable = isDone || item.num <= currentStep;
          const isLast = idx === STEP_ITEMS.length - 1;
          const isLineFilled = isDone || item.num < currentStep;

          return (
            <div key={item.num} className="relative flex items-center gap-3 py-1 group">
              {/* Connecting Line Segment to Next Node (Only between nodes) */}
              {!isLast && (
                <div
                  className={`absolute left-[15.5px] top-8 -bottom-3 w-0.5 z-0 transition-colors ${
                    isLineFilled
                      ? 'bg-gradient-to-b from-emerald-500 to-[#6366F1]'
                      : 'bg-[#94A3B8]/15'
                  }`}
                />
              )}

              {/* Node Circle Anchor */}
              <button
                type="button"
                onClick={() => isSelectable && onSelectStep(item.num)}
                disabled={!isSelectable}
                className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center shrink-0 z-10 relative transition-all border ${
                  isCurrent
                    ? 'bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] text-white border-indigo-300 ring-4 ring-[#6366F1]/20 shadow-[0_0_12px_rgba(99,102,241,0.5)] scale-105'
                    : isDone
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold shadow-sm'
                    : 'bg-[#0B0F19] border-[#94A3B8]/25 text-[#94A3B8]/60 hover:border-[#94A3B8]/50'
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : item.num}
              </button>

              {/* Step Title & Subtitle Card */}
              <button
                type="button"
                onClick={() => isSelectable && onSelectStep(item.num)}
                disabled={!isSelectable}
                className={`flex-1 px-4 py-2 sm:px-4 sm:py-2 rounded-full text-left transition-all flex items-center justify-between border ${
                  isCurrent
                    ? 'bg-[#6366F1]/15 border-[#6366F1]/40 text-white shadow-lg shadow-indigo-500/10'
                    : isDone
                    ? 'bg-transparent border-transparent text-slate-200 hover:bg-[#111827]/40'
                    : 'bg-transparent border-transparent text-[#94A3B8]/40 cursor-not-allowed'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-xs font-semibold truncate ${
                      isCurrent ? 'text-white font-bold' : isDone ? 'text-slate-200' : 'text-[#94A3B8]/60'
                    }`}
                  >
                    {item.title}
                  </div>
                  <div className="text-[10px] text-[#94A3B8]/70 truncate hidden xl:block">
                    {item.subtitle}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
