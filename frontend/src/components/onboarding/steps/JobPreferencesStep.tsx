'use client';

import React from 'react';
import { Step7PreferencesInput } from '@backend/validations/onboardingSchemas';
import { Sliders, MapPin, DollarSign, Clock, BookOpen, Users, CheckCircle2 } from 'lucide-react';

interface JobPreferencesStepProps {
  formData: Step7PreferencesInput;
  onChange: (updated: Partial<Step7PreferencesInput>) => void;
  errors: Record<string, string>;
  isStudent?: boolean;
}

const JOB_TYPES_STUDENT = ['Internship', 'Full-time', 'Both'];
const JOB_TYPES_PRO = ['Full-time', 'Contract', 'Freelance', 'Leadership', 'Both'];

const WORK_ENVIRONMENTS = ['Remote', 'Hybrid', 'Onsite', 'Any'];

const LEARNING_STYLES = [
  { id: 'Courses', label: 'Structured Courses' },
  { id: 'Hands-on projects', label: 'Hands-on Projects' },
  { id: 'Practice', label: 'Coding Practice & Challenges' },
  { id: 'Mentorship', label: '1-on-1 Mentorship' },
  { id: 'Reading', label: 'Documentation & Articles' },
  { id: 'Videos', label: 'Video Tutorials' },
];

const TIME_AVAILABILITY = [
  'Under 3 hours/week',
  '3–5 hours/week',
  '5–10 hours/week',
  '10+ hours/week',
];

const MENTORSHIP_NEEDS = [
  'Career direction',
  'Resume review',
  'Portfolio review',
  'Mock interview',
  'Technical guidance',
  'Career switch advice',
  'Leadership growth',
  'Industry insights',
];

export const JobPreferencesStep: React.FC<JobPreferencesStepProps> = ({
  formData,
  onChange,
  errors,
  isStudent = false,
}) => {
  const jobTypesList = isStudent ? JOB_TYPES_STUDENT : JOB_TYPES_PRO;

  const toggleArrayItem = (currentList: string[], item: string) => {
    if (currentList.includes(item)) {
      return currentList.filter((i) => i !== item);
    }
    return [...currentList, item];
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header text */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6366F1]">
          Step 07 — Ecosystem Preferences
        </span>
        <h3 className="text-2xl font-bold font-display text-[#F9FAFB]">
          Job, Learning & Mentorship Preferences
        </h3>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          Configure your work environment, available learning hours, and guidance needs to personalize your PATHWAY experience.
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1: Job Preferences */}
        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-[#94A3B8]/15 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-[#94A3B8]/10 pb-3">
            <Sliders className="w-4 h-4 text-[#6366F1]" />
            <span>Job Matching & Workplace Preferences</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="pref-jobType" className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                Preferred Job Type
              </label>
              <select
                id="pref-jobType"
                value={formData.preferredJobType || jobTypesList[0]}
                onChange={(e) => onChange({ preferredJobType: e.target.value })}
                className="w-full h-11 px-4 rounded-xl bg-[#111827] border border-[#94A3B8]/20 text-[#F9FAFB] text-sm focus:outline-none focus:border-[#6366F1]"
              >
                {jobTypesList.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pref-workEnv" className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                Work Environment
              </label>
              <select
                id="pref-workEnv"
                value={formData.workEnvironment || 'Remote'}
                onChange={(e) => onChange({ workEnvironment: e.target.value })}
                className="w-full h-11 px-4 rounded-xl bg-[#111827] border border-[#94A3B8]/20 text-[#F9FAFB] text-sm focus:outline-none focus:border-[#6366F1]"
              >
                {WORK_ENVIRONMENTS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pref-location" className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#6366F1]" /> Preferred Work Location
              </label>
              <input
                id="pref-location"
                type="text"
                placeholder="e.g. San Francisco, CA / London / Remote"
                value={formData.preferredLocation || ''}
                onChange={(e) => onChange({ preferredLocation: e.target.value })}
                className="w-full h-11 px-4 rounded-xl bg-[#111827] border border-[#94A3B8]/20 text-[#F9FAFB] text-sm focus:outline-none focus:border-[#6366F1]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pref-salary" className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-[#6366F1]" /> Expected Salary Range (Optional)
              </label>
              <input
                id="pref-salary"
                type="text"
                placeholder="e.g. $90k – $120k / year"
                value={formData.preferredSalaryRange || ''}
                onChange={(e) => onChange({ preferredSalaryRange: e.target.value })}
                className="w-full h-11 px-4 rounded-xl bg-[#111827] border border-[#94A3B8]/20 text-[#F9FAFB] text-sm focus:outline-none focus:border-[#6366F1]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="pref-relocate"
              checked={Boolean(formData.willingToRelocate)}
              onChange={(e) => onChange({ willingToRelocate: e.target.checked })}
              className="w-4 h-4 rounded border-[#94A3B8]/30 text-[#6366F1] focus:ring-[#6366F1]"
            />
            <label htmlFor="pref-relocate" className="text-xs text-[#F9FAFB] cursor-pointer">
              Willing to relocate for the right role
            </label>
          </div>
        </div>

        {/* Section 2: Learning Preferences */}
        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-[#94A3B8]/15 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-[#94A3B8]/10 pb-3">
            <BookOpen className="w-4 h-4 text-[#6366F1]" />
            <span>Learning & Skill Building Preferences</span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
              How do you prefer to learn?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {LEARNING_STYLES.map((style) => {
                const current = formData.learningStyle || [];
                const isSelected = current.includes(style.id);
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => onChange({ learningStyle: toggleArrayItem(current, style.id) })}
                    className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                      isSelected
                        ? 'bg-[#6366F1]/15 border-[#6366F1] text-white'
                        : 'bg-[#111827] border-[#94A3B8]/15 text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    {style.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label htmlFor="pref-hours" className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#6366F1]" /> Learning Time Available Per Week
            </label>
            <select
              id="pref-hours"
              value={formData.availableHoursPerWeek || TIME_AVAILABILITY[1]}
              onChange={(e) => onChange({ availableHoursPerWeek: e.target.value })}
              className="w-full h-11 px-4 rounded-xl bg-[#111827] border border-[#94A3B8]/20 text-[#F9FAFB] text-sm focus:outline-none focus:border-[#6366F1]"
            >
              {TIME_AVAILABILITY.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 3: Mentorship Preferences */}
        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-[#94A3B8]/15 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-[#94A3B8]/10 pb-3">
            <Users className="w-4 h-4 text-[#6366F1]" />
            <span>Mentorship & Guidance Needs</span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
              What kind of guidance are you looking for?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MENTORSHIP_NEEDS.map((need) => {
                const current = formData.mentorshipNeeds || [];
                const isSelected = current.includes(need);
                return (
                  <button
                    key={need}
                    type="button"
                    onClick={() => onChange({ mentorshipNeeds: toggleArrayItem(current, need) })}
                    className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                      isSelected
                        ? 'bg-[#6366F1]/15 border-[#6366F1] text-white'
                        : 'bg-[#111827] border-[#94A3B8]/15 text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    {need}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
