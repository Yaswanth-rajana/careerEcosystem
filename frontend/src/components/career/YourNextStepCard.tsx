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
    <div className="relative p-6 sm:p-7 rounded-2xl bg-blue-50/50 border border-blue-200/80 shadow-md text-left transition-all">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
            <Target className="w-4 h-4" />
          </span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600">
            YOUR NEXT STEP ⭐
          </span>
        </div>
        {focusSkill && (
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 border border-blue-200 px-2.5 py-0.5 rounded-full">
            Target Skill: {focusSkill} ({currentLevel} → {targetLevel})
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-2">
          <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            <strong className="text-slate-800">Why?</strong> {rationale}
          </p>
        </div>

        <div className="md:col-span-4 flex justify-start md:justify-end">
          <Button
            variant="primary"
            size="md"
            onClick={handleClickAction}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md"
          >
            {actionLabel.includes('→') ? actionLabel : `${actionLabel} →`}
          </Button>
        </div>
      </div>
    </div>
  );
};
