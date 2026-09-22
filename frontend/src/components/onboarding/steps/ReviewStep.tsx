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
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold uppercase">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Step 07 — Final Review & Activation
        </div>
        <h3 className="text-2xl font-bold font-display text-slate-900">
          Your PATHWAY is taking shape.
        </h3>
        <p className="text-xs sm:text-sm text-slate-600">
          Review your candidate profile information before completing onboarding and unlocking your dashboard.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Summary Cards */}
      <div className="space-y-4">
        {/* Card 1: Personal */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <User className="w-4 h-4 text-blue-600" />
              <span>Personal Overview</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600">
            <div><strong className="text-slate-900">Name:</strong> {aboutYou.name}</div>
            <div><strong className="text-slate-900">Email:</strong> {accountEmail}</div>
            <div><strong className="text-slate-900">Phone:</strong> {aboutYou.phone}</div>
            <div><strong className="text-slate-900">Location:</strong> {aboutYou.location}</div>
            <div><strong className="text-slate-900">Candidate Type:</strong> {aboutYou.candidateType}</div>
            {aboutYou.headline && <div className="sm:col-span-2"><strong className="text-slate-900">Headline:</strong> {aboutYou.headline}</div>}
          </div>
        </div>

        {/* Card 2: Education */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Education ({education.length})</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
          {education.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No education entries added.</p>
          ) : (
            <div className="space-y-2">
              {education.map((edu, idx) => (
                <div key={idx} className="text-xs text-slate-600 space-y-0.5">
                  <div className="font-semibold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</div>
                  <div>{edu.institution} ({edu.startYear} – {edu.endYear || 'Present'})</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 3: Experience */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>Experience ({hasNoExperience ? 'None' : experience.length})</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
          {hasNoExperience ? (
            <p className="text-xs text-slate-500 italic">No professional experience yet (Student entry level).</p>
          ) : (
            <div className="space-y-2">
              {experience.map((exp, idx) => (
                <div key={idx} className="text-xs text-slate-600 space-y-0.5">
                  <div className="font-semibold text-slate-900">{exp.roleTitle} @ {exp.company}</div>
                  <div>{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate} ({exp.employmentType || 'Full-time'})</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 4: Skills */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <Wrench className="w-4 h-4 text-blue-600" />
              <span>Skills ({skills.length})</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(4)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((s, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium">
                {s.name} ({s.level})
              </span>
            ))}
          </div>
        </div>

        {/* Card 5: Direction & Goal */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <Target className="w-4 h-4 text-blue-600" />
              <span>Career Direction</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(6)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
            <div><strong className="text-slate-900">Target Role:</strong> {careerDirection.targetRole}</div>
            <div><strong className="text-slate-900">Goal:</strong> {careerDirection.careerGoalType || 'Career Growth'}</div>
            {careerDirection.targetIndustry && <div><strong className="text-slate-900">Industry:</strong> {careerDirection.targetIndustry}</div>}
            {careerDirection.timeframe && <div><strong className="text-slate-900">Timeline:</strong> {careerDirection.timeframe}</div>}
          </div>
        </div>
      </div>

      {/* Completion Action Callout */}
      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="space-y-1">
          <h4 className="text-lg font-bold font-display text-slate-900">Ready to activate your career hub?</h4>
          <p className="text-xs text-slate-600">
            Completing onboarding saves your candidate profile foundation atomically and redirects you directly to your personalized PATHWAY.ECO dashboard.
          </p>
        </div>

        <button
          type="button"
          onClick={onComplete}
          disabled={isSubmitting}
          className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:pointer-events-none"
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
