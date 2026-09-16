'use client';

import React, { useState, useEffect } from 'react';
import { CareerPath, CandidateCareerContext } from '@/lib/careers/career-types';
import { toggleTargetRole, isTargetRoleSelected } from '@/lib/careers/career-repository';
import { Button } from '@/components/design-system/Button';
import { ArrowRight, Compass, CheckCircle2, BookmarkCheck, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export interface CareerDetailHeroProps {
  career: CareerPath;
  candidate: CandidateCareerContext | null;
}

export const CareerDetailHero: React.FC<CareerDetailHeroProps> = ({ career, candidate }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [showGoalNotification, setShowGoalNotification] = useState(false);

  useEffect(() => {
    setIsSaved(isTargetRoleSelected(career.slug));
    const handleUpdate = () => {
      setIsSaved(isTargetRoleSelected(career.slug));
    };
    window.addEventListener('pathway_selected_roles_changed', handleUpdate);
    return () => window.removeEventListener('pathway_selected_roles_changed', handleUpdate);
  }, [career.slug]);

  const handleStartPath = () => {
    const { isSelected } = toggleTargetRole({
      slug: career.slug,
      title: career.title,
      category: career.category,
    });
    setIsSaved(isSelected);
    if (isSelected) {
      setShowGoalNotification(true);
      setTimeout(() => setShowGoalNotification(false), 4000);
    }
  };

  const scrollToSkillGap = () => {
    const el = document.getElementById('skill-gap');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const trajectorySteps = (career.typicalTrajectory && career.typicalTrajectory.length > 0)
    ? career.typicalTrajectory.map((step, idx) => ({
        label: step,
        detail: idx === 0 ? '0-1 yrs' : idx === 1 ? '1-3 yrs' : idx === 2 ? '3-5 yrs' : '5+ yrs',
      }))
    : [
        { label: 'Beginner', detail: '0-1 yrs' },
        { label: 'Junior', detail: '1-3 yrs' },
        { label: 'Mid-Level', detail: '3-5 yrs' },
        { label: 'Senior', detail: '5+ yrs' },
      ];

  return (
    <div className="relative pt-6 pb-10 border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-slate-100/70 via-slate-50 to-white dark:from-[#0B0F19] dark:via-[#0B0F19] dark:to-[#0B0F19] transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-left">
        
        {/* Category & Tag */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 text-[#6366F1] dark:text-[#818CF8] text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            {career.category}
          </span>
          {career.salaryRange?.formatted && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold">
              Estimated Entry: {career.salaryRange.formatted}
            </span>
          )}
        </div>

        {/* Title & Tagline / Description */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white leading-[1.1]">
            {career.title}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            {career.shortDescription}
          </p>
        </div>

        {/* Typical Career Trajectory Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-[#6366F1]" />
            <span>Typical Career Growth Trajectory</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {trajectorySteps.map((step, idx) => (
              <div
                key={step.label}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 text-[#6366F1] text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{step.label}</span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{step.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          <Button
            variant="primary"
            size="lg"
            onClick={handleStartPath}
            leftIcon={isSaved ? <BookmarkCheck className="w-5 h-5 text-white" /> : undefined}
            rightIcon={!isSaved ? <ArrowRight className="w-5 h-5" /> : undefined}
            className="shadow-md bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-bold"
          >
            {isSaved ? 'Target Role Selected ✓' : 'Start This Career Path'}
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={scrollToSkillGap}
            className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-semibold"
          >
            See What I Need to Learn
          </Button>
        </div>

        {/* Goal Notification */}
        {showGoalNotification && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-200 text-xs font-semibold flex items-center justify-between gap-3 max-w-xl shadow-xs"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#6366F1] shrink-0" />
              <span>
                <strong>{career.title}</strong> set as your target career path! Your &ldquo;My Path&rdquo; navigation will now lead here.
              </span>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};
