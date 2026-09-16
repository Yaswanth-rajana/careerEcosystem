'use client';

import React from 'react';
import { ArrowRight, Target } from 'lucide-react';
import { Button } from '@/components/design-system/Button';

export interface YourNextStepCardProps {
  title: string;
  focusSkill?: string;
  currentLevel?: string;
  targetLevel?: string;
  actionLabel: string;
  rationale: string;
  actionUrl: string;
}

export const YourNextStepCard: React.FC<YourNextStepCardProps> = ({
  title,
  focusSkill,
  currentLevel = 'Beginner',
  targetLevel = 'Intermediate',
  actionLabel = 'Start Learning',
  rationale,
  actionUrl,
}) => {
  const handleClickAction = () => {
    if (actionUrl.startsWith('#')) {
      const el = document.getElementById(actionUrl.replace('#', ''));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = actionUrl;
    }
  };

  return (
    <div className="relative p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/60 dark:from-indigo-950/40 dark:via-[#111827] dark:to-purple-950/30 border border-indigo-200/80 dark:border-indigo-800/60 shadow-md text-left transition-all">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[#6366F1] text-white shadow-xs">
            <Target className="w-4 h-4" />
          </span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#6366F1] dark:text-[#818CF8]">
            YOUR NEXT STEP ⭐
          </span>
        </div>
        {focusSkill && (
          <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-700 px-2.5 py-0.5 rounded-full">
            Target Skill: {focusSkill} ({currentLevel} → {targetLevel})
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-2">
          <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong className="text-slate-800 dark:text-slate-200">Why?</strong> {rationale}
          </p>
        </div>

        <div className="md:col-span-4 flex justify-start md:justify-end">
          <Button
            variant="primary"
            size="md"
            onClick={handleClickAction}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-bold shadow-md"
          >
            {actionLabel.includes('→') ? actionLabel : `${actionLabel} →`}
          </Button>
        </div>
      </div>
    </div>
  );
};
