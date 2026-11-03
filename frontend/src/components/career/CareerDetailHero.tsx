'use client';

import React, { useState, useEffect } from 'react';
import { CareerPath, CandidateCareerContext, CareerLevelId, CareerLevelDefinition } from '@/lib/careers/career-types';
import { toggleTargetRole, getSavedTargetRoles } from '@/lib/careers/career-repository';
import { Button } from '@/components/design-system/Button';
import {
  ArrowRight,
  Compass,
  CheckCircle2,
  BookmarkCheck,
  TrendingUp,
  AlertCircle,
  Info,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

export interface CareerDetailHeroProps {
  career: CareerPath;
  candidate: CandidateCareerContext | null;
  selectedLevel: CareerLevelId;
  onSelectLevel: (levelId: CareerLevelId) => void;
  levelData: CareerLevelDefinition;
}

const TRAJECTORY_LEVELS: Array<{
  id: CareerLevelId;
  defaultLabel: string;
  defaultRange: string;
  defaultDesc: string;
}> = [
  {
    id: 'entry',
    defaultLabel: 'Beginner / Entry Level',
    defaultRange: '0–1 yrs',
    defaultDesc: 'Master fundamentals, syntax, and guided project execution.',
  },
  {
    id: 'junior',
    defaultLabel: 'Junior',
    defaultRange: '1–3 yrs',
    defaultDesc: 'Own feature delivery, API integrations, and maintainable testing.',
  },
  {
    id: 'mid',
    defaultLabel: 'Mid-Level',
    defaultRange: '3–5 yrs',
    defaultDesc: 'Architect modular services, tune performance, and mentor peers.',
  },
  {
    id: 'senior',
    defaultLabel: 'Senior',
    defaultRange: '5+ yrs',
    defaultDesc: 'Drive technical strategy, distributed scale, and team excellence.',
  },
];

export const CareerDetailHero: React.FC<CareerDetailHeroProps> = ({
  career,
  candidate,
  selectedLevel,
  onSelectLevel,
  levelData,
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [notification, setNotification] = useState<{ type: 'selected' | 'deselected'; text: string } | null>(null);
  const [totalSavedCount, setTotalSavedCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setIsSaved(false);
      setTotalSavedCount(0);
      return;
    }

    const roles = getSavedTargetRoles();
    setIsSaved(roles.some((r) => r.slug === career.slug));
    setTotalSavedCount(roles.length);

    const handleUpdate = () => {
      if (!user) {
        setIsSaved(false);
        setTotalSavedCount(0);
        return;
      }
      const updatedRoles = getSavedTargetRoles();
      setIsSaved(updatedRoles.some((r) => r.slug === career.slug));
      setTotalSavedCount(updatedRoles.length);
    };
    window.addEventListener('pathway_selected_roles_changed', handleUpdate);
    return () => window.removeEventListener('pathway_selected_roles_changed', handleUpdate);
  }, [career.slug, user]);

  const handleStartPath = () => {
    if (!user) {
      router.push(`/login?from=/careers/${career.slug}`);
      return;
    }

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

  const getLevelDisplayData = (lvlId: CareerLevelId, idx: number) => {
    const fallback = TRAJECTORY_LEVELS[idx];
    const customTitle = career.typicalTrajectory?.[idx];

    let title = customTitle || fallback.defaultLabel;
    let range = fallback.defaultRange;
    let desc = fallback.defaultDesc;

    if (selectedLevel === lvlId && levelData) {
      title = levelData.roleTitle || levelData.label || title;
      range = levelData.experienceRange || range;
      desc = levelData.description || desc;
    }

    return { title, range, desc };
  };

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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-mono">
            Selected: <strong className="text-blue-600">{levelData?.label || 'Beginner'}</strong>
          </span>
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

        {/* Typical Career Trajectory Bar — Interactive Level Selector */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span>Typical Career Growth Trajectory</span>
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Click any level to personalize recommendations
            </span>
          </div>

          {/* Interactive 4-Level Selector Grid */}
          <div
            role="radiogroup"
            aria-label="Career Growth Trajectory Levels"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1"
          >
            {TRAJECTORY_LEVELS.map((level, idx) => {
              const isSelected = selectedLevel === level.id;
              const display = getLevelDisplayData(level.id, idx);

              return (
                <button
                  key={level.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onSelectLevel(level.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectLevel(level.id);
                    }
                  }}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-500/80 shadow-sm ring-1 ring-blue-500/40 scale-[1.01]'
                      : 'bg-slate-50/70 border-slate-200/70 hover:bg-slate-100/80 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span
                          className={`text-xs font-bold transition-colors line-clamp-1 ${
                            isSelected ? 'text-blue-900' : 'text-slate-800'
                          }`}
                        >
                          {display.title}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-snug">
                      {display.desc}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10.5px]">
                    <span className="font-mono font-medium text-slate-500">
                      {display.range}
                    </span>
                    <span
                      className={`font-semibold ${
                        isSelected ? 'text-blue-600 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {isSelected ? 'Active Target ✓' : 'Select'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dynamic Level-Specific Focus Summary Banner */}
          {levelData && (
            <div className="mt-3 p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/60 text-xs space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="font-bold text-blue-950">
                    Target Level Focus: {levelData.roleTitle || levelData.label} ({levelData.experienceRange})
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded">
                  Personalized Plan
                </span>
              </div>
              <p className="text-slate-600 text-[11.5px] leading-relaxed">
                {levelData.focusSummary}
              </p>
              {levelData.expectedCompetencies && levelData.expectedCompetencies.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-blue-200/40">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    Key Competencies:
                  </span>
                  {levelData.expectedCompetencies.slice(0, 4).map((comp) => (
                    <span
                      key={comp}
                      className="text-[10.5px] px-2 py-0.5 rounded-md bg-white border border-blue-200/80 text-blue-900 font-medium"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          <Button
            variant="primary"
            size="lg"
            onClick={handleStartPath}
            leftIcon={
              isSaved ? (
                <BookmarkCheck className="w-5 h-5 text-white" />
              ) : !user ? (
                <Lock className="w-4 h-4 text-white/90" />
              ) : undefined
            }
            rightIcon={!isSaved && user ? <ArrowRight className="w-5 h-5" /> : undefined}
            className={`shadow-md font-bold transition-all ${
              isSaved ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSaved
              ? 'Target Role Selected ✓'
              : !user
              ? 'Sign In to Select Role'
              : 'Start This Career Path'}
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
