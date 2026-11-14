'use client';

import React from 'react';
import { ArrowRight, Target, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/design-system/Button';

export interface YourNextStepCardProps {
  title: string;
  focusSkill?: string;
  currentLevel?: string;
  targetLevel?: string;
  actionLabel: string;
  rationale: string;
  actionUrl: string;
  recommendedCourse?: {
    title: string;
    provider: string;
    url: string;
  };
}

export const YourNextStepCard: React.FC<YourNextStepCardProps> = ({
  title,
  focusSkill,
  currentLevel = 'Beginner',
  targetLevel = 'Intermediate',
  actionLabel = 'Start Learning',
  rationale,
  actionUrl,
  recommendedCourse,
}) => {
  const handleClickAction = () => {
    if (actionUrl.startsWith('#')) {
      const el = document.getElementById(actionUrl.replace('#', ''));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (actionUrl.startsWith('http://') || actionUrl.startsWith('https://')) {
      window.open(actionUrl, '_blank', 'noopener,noreferrer');
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
            {actionLabel.replace(/[→\s]+$/, '')}
          </Button>
        </div>
      </div>

      {recommendedCourse && (
        <div className="mt-4 pt-3.5 border-t border-blue-200/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Recommended Training: <strong>{recommendedCourse.title}</strong> ({recommendedCourse.provider})
            </span>
          </div>
          <a
            href={recommendedCourse.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            <span>Course Information on SMVEN</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
};
