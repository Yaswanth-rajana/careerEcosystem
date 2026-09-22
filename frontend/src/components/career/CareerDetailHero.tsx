'use client';

import React, { useState, useEffect } from 'react';
import { CareerPath, CandidateCareerContext } from '@/lib/careers/career-types';
import { toggleTargetRole, isTargetRoleSelected, getSavedTargetRoles } from '@/lib/careers/career-repository';
import { Button } from '@/components/design-system/Button';
import { ArrowRight, Compass, CheckCircle2, BookmarkCheck, TrendingUp, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CareerDetailHeroProps {
  career: CareerPath;
  candidate: CandidateCareerContext | null;
}

export const CareerDetailHero: React.FC<CareerDetailHeroProps> = ({ career, candidate }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [notification, setNotification] = useState<{ type: 'selected' | 'deselected'; text: string } | null>(null);
  const [totalSavedCount, setTotalSavedCount] = useState(0);

  useEffect(() => {
    const roles = getSavedTargetRoles();
    setIsSaved(roles.some((r) => r.slug === career.slug));
    setTotalSavedCount(roles.length);

    const handleUpdate = () => {
      const updatedRoles = getSavedTargetRoles();
      setIsSaved(updatedRoles.some((r) => r.slug === career.slug));
      setTotalSavedCount(updatedRoles.length);
    };
    window.addEventListener('pathway_selected_roles_changed', handleUpdate);
    return () => window.removeEventListener('pathway_selected_roles_changed', handleUpdate);
  }, [career.slug]);

  const handleStartPath = () => {
    const { isSelected, roles } = toggleTargetRole({
      slug: career.slug,
      title: career.title,
      category: career.category,
    });
    setIsSaved(isSelected);
    setTotalSavedCount(roles.length);

    if (isSelected) {
      setNotification({
        type: 'selected',
        text: `${career.title} set as your target career path! Your "My Path" navigation will now lead here.`,
      });
    } else {
      setNotification({
        type: 'deselected',
        text: `Deselected ${career.title}. Please select at least one career path to view your personalized roadmap.`,
      });
    }
    setTimeout(() => setNotification(null), 5000);
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
    <div className="relative pt-6 pb-10 border-b border-slate-200/80 bg-gradient-to-b from-slate-100/70 via-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-left">
        
        {/* Category & Tag */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-blue-600 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            {career.category}
          </span>
          {career.salaryRange?.formatted && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-bold">
              Estimated Entry: {career.salaryRange.formatted}
            </span>
          )}
        </div>

        {/* Title & Tagline / Description */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-slate-900 leading-[1.1]">
            {career.title}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl leading-relaxed">
            {career.shortDescription}
          </p>
        </div>

        {/* Typical Career Trajectory Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>Typical Career Growth Trajectory</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {trajectorySteps.map((step, idx) => (
              <div
                key={step.label}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{step.label}</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1">{step.detail}</span>
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
            className={`shadow-md font-bold transition-all ${
              isSaved ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSaved ? 'Target Role Selected ✓' : 'Start This Career Path'}
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={scrollToSkillGap}
            className="border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
          >
            See What I Need to Learn
          </Button>
        </div>

        {/* Goal Notification / Toast Banner */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between gap-3 max-w-xl shadow-xs ${
                notification.type === 'selected'
                  ? 'bg-blue-50 border-blue-200 text-blue-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2">
                {notification.type === 'selected' ? (
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>{notification.text}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No active role warning when totalSavedCount is 0 and no notification active */}
        {!isSaved && totalSavedCount === 0 && !notification && (
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs font-medium flex items-center gap-2 max-w-xl">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Please select a career path to set your target goal for <strong>My Path</strong>.</span>
          </div>
        )}

      </div>
    </div>
  );
};
