'use client';

import React from 'react';
import { FullOnboardingPayload } from '@backend/validations/onboardingSchemas';
import { Sparkles, Edit2, User, GraduationCap, Briefcase, Wrench, FolderGit2, Target, Sliders, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface ReviewStepProps {
  payload: FullOnboardingPayload;
  accountEmail: string;
  onEditStep: (step: number) => void;
  onComplete: () => void;
  isSubmitting: boolean;
  error?: string | null;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  payload,
  accountEmail,
  onEditStep,
  onComplete,
  isSubmitting,
  error,
}) => {
  const { aboutYou, education, experience, hasNoExperience, skills, projects, careerDirection, preferences } = payload;

  return (
    <div className="space-y-6 text-left">
      {/* Header text */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase">
          <Sparkles className="w-3.5 h-3.5" /> Step 07 — Final Review & Activation
        </div>
        <h3 className="text-2xl font-bold font-display text-[#F9FAFB]">
          Your PATHWAY is taking shape.
        </h3>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          Review your candidate profile information before completing onboarding and unlocking your dashboard.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Summary Cards */}
      <div className="space-y-4">
        {/* Card 1: Personal */}
        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-[#94A3B8]/15 space-y-3">
          <div className="flex items-center justify-between border-b border-[#94A3B8]/10 pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-white">
              <User className="w-4 h-4 text-[#6366F1]" />
              <span>Personal Overview</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="text-xs font-semibold text-[#6366F1] hover:text-[#8B5CF6] flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#94A3B8]">
            <div><strong className="text-white">Name:</strong> {aboutYou.name}</div>
            <div><strong className="text-white">Email:</strong> {accountEmail}</div>
            <div><strong className="text-white">Phone:</strong> {aboutYou.phone}</div>
            <div><strong className="text-white">Location:</strong> {aboutYou.location}</div>
            <div><strong className="text-white">Candidate Type:</strong> {aboutYou.candidateType}</div>
            {aboutYou.headline && <div className="sm:col-span-2"><strong className="text-white">Headline:</strong> {aboutYou.headline}</div>}
          </div>
        </div>

        {/* Card 2: Education */}
        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-[#94A3B8]/15 space-y-3">
          <div className="flex items-center justify-between border-b border-[#94A3B8]/10 pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-white">
              <GraduationCap className="w-4 h-4 text-[#6366F1]" />
              <span>Education ({education.length})</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="text-xs font-semibold text-[#6366F1] hover:text-[#8B5CF6] flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
          {education.length === 0 ? (
            <p className="text-xs text-[#94A3B8] italic">No education entries added.</p>
          ) : (
            <div className="space-y-2">
              {education.map((edu, idx) => (
                <div key={idx} className="text-xs text-[#94A3B8] space-y-0.5">
                  <div className="font-semibold text-white">{edu.degree} in {edu.fieldOfStudy}</div>
                  <div>{edu.institution} ({edu.startYear} – {edu.endYear || 'Present'})</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 3: Experience */}
        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-[#94A3B8]/15 space-y-3">
          <div className="flex items-center justify-between border-b border-[#94A3B8]/10 pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-white">
              <Briefcase className="w-4 h-4 text-[#6366F1]" />
              <span>Experience ({hasNoExperience ? 'None' : experience.length})</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="text-xs font-semibold text-[#6366F1] hover:text-[#8B5CF6] flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
          {hasNoExperience ? (
            <p className="text-xs text-[#94A3B8] italic">No professional experience yet (Student entry level).</p>
          ) : (
            <div className="space-y-2">
              {experience.map((exp, idx) => (
                <div key={idx} className="text-xs text-[#94A3B8] space-y-0.5">
                  <div className="font-semibold text-white">{exp.roleTitle} @ {exp.company}</div>
                  <div>{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate} ({exp.employmentType || 'Full-time'})</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 4: Skills */}
        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-[#94A3B8]/15 space-y-3">
          <div className="flex items-center justify-between border-b border-[#94A3B8]/10 pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-white">
              <Wrench className="w-4 h-4 text-[#6366F1]" />
              <span>Skills ({skills.length})</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(4)}
              className="text-xs font-semibold text-[#6366F1] hover:text-[#8B5CF6] flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((s, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-[#111827] border border-[#94A3B8]/20 text-white text-xs">
                {s.name} ({s.level})
              </span>
            ))}
          </div>
        </div>

        {/* Card 5: Direction & Goal */}
        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-[#94A3B8]/15 space-y-3">
          <div className="flex items-center justify-between border-b border-[#94A3B8]/10 pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-white">
              <Target className="w-4 h-4 text-[#6366F1]" />
              <span>Career Direction</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(6)}
              className="text-xs font-semibold text-[#6366F1] hover:text-[#8B5CF6] flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#94A3B8]">
            <div><strong className="text-white">Target Role:</strong> {careerDirection.targetRole}</div>
            <div><strong className="text-white">Goal:</strong> {careerDirection.careerGoalType || 'Career Growth'}</div>
            {careerDirection.targetIndustry && <div><strong className="text-white">Industry:</strong> {careerDirection.targetIndustry}</div>}
            {careerDirection.timeframe && <div><strong className="text-white">Timeline:</strong> {careerDirection.timeframe}</div>}
          </div>
        </div>
      </div>

      {/* Completion Action Callout */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#6366F1]/15 via-[#111827] to-[#8B5CF6]/15 border border-[#6366F1]/30 text-center space-y-4">
        <div className="space-y-1">
          <h4 className="text-lg font-bold font-display text-white">Ready to activate your career hub?</h4>
          <p className="text-xs text-[#94A3B8]">
            Completing onboarding saves your candidate profile foundation atomically and redirects you directly to your personalized PATHWAY.ECO dashboard.
          </p>
        </div>

        <button
          type="button"
          onClick={onComplete}
          disabled={isSubmitting}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] disabled:opacity-60 disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Activating Your PATHWAY…</span>
            </>
          ) : (
            <>
              <span>Complete My Profile</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
