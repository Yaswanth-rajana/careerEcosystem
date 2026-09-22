'use client';

import React from 'react';
import { CareerPath, CandidateCareerContext } from '@/lib/careers/career-types';
import { analyzeSkillGap } from '@/lib/careers/career-repository';
import { CheckCircle2, AlertCircle, ArrowRight, UserCheck, ShieldCheck, BookOpen } from 'lucide-react';
import Link from 'next/link';

export interface SkillGapSectionProps {
  career: CareerPath;
  candidate: CandidateCareerContext | null;
}

export const SkillGapSection: React.FC<SkillGapSectionProps> = ({ career, candidate }) => {
  const gap = analyzeSkillGap(candidate, career.slug);

  const scrollToLearning = () => {
    const el = document.getElementById('learning-roadmap');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // If candidate is missing or candidate skills are empty, display PROFILE SKILL DATA prompt
  if (!gap.hasEnoughData) {
    return (
      <div id="skill-gap" className="space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
              What do you need to learn? ⭐
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            PROFILE SKILL DATA NEEDED
          </span>
        </div>

        <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold font-display text-slate-900">
              Personalize Your Skill Breakdown
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Add your current skills in your profile or onboarding to compare what you already know against the required skills for {career.title}.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-opacity"
            >
              <span>Complete Profile Skills</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={scrollToLearning}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>View All Skills to Learn</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="skill-gap" className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
            What do you need to learn? ⭐
          </h2>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          {gap.matchPercentage}% Skill Match
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: YOU ALREADY KNOW */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              YOU ALREADY KNOW ({gap.matchedSkills.length})
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Verified Profile</span>
          </div>

          {gap.matchedSkills.length > 0 ? (
            <div className="space-y-2">
              {gap.matchedSkills.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/70 text-xs text-emerald-900"
                >
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{s.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase bg-white/60 px-2 py-0.5 rounded">
                    {s.level}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              No matching core skills detected yet. Complete your profile skills to view verified matches.
            </p>
          )}
        </div>

        {/* Right Column: NEXT SKILLS TO BUILD */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              NEXT SKILLS TO BUILD ({gap.missingSkills.length + gap.developingSkills.length})
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Target Gap</span>
          </div>

          {gap.missingSkills.length > 0 || gap.developingSkills.length > 0 ? (
            <div className="space-y-2.5">
              {gap.missingSkills.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-900"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold flex items-center gap-1.5">
                      <span>{s.name}</span>
                      <span className="text-[9px] font-mono text-blue-600 uppercase bg-blue-50 px-1.5 py-0.5 rounded">
                        {s.importance.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={scrollToLearning}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all"
                  >
                    <span>Learn</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-600 font-semibold">
              🎉 Outstanding! You have met all key skill requirements for {career.title}.
            </p>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Want to update your candidate skills?</span>
            <Link href="/profile" className="font-bold text-blue-600 hover:underline">
              Update Profile Skills →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
