'use client';

import React from 'react';
import { Step6CareerDirectionInput } from '@backend/validations/onboardingSchemas';
import { Compass, Target, Rocket, Clock, Building2, Sparkles } from 'lucide-react';

interface CareerDirectionStepProps {
  formData: Step6CareerDirectionInput;
  onChange: (updated: Partial<Step6CareerDirectionInput>) => void;
  errors: Record<string, string>;
}

const POPULAR_TARGET_ROLES = [
  'Software Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Engineer',
  'Data Analyst',
  'Data Scientist',
  'ML / AI Engineer',
  'Cybersecurity Engineer',
  'Cloud / DevOps Engineer',
  'UI/UX Designer',
  'Product Manager',
  'Embedded Systems Engineer',
  'Mechanical Engineer',
  'Business Analyst',
];

const GOAL_TYPES = [
  { id: 'Get my first job', label: 'Get my first job' },
  { id: 'Get an internship', label: 'Get an internship' },
  { id: 'Switch careers', label: 'Switch careers' },
  { id: 'Switch companies', label: 'Switch companies' },
  { id: 'Upskill', label: 'Upskill & learn new technologies' },
  { id: 'Get promoted', label: 'Get promoted in current company' },
  { id: 'Move into leadership', label: 'Move into leadership / management' },
  { id: 'Explore options', label: 'Explore career options' },
];

export const CareerDirectionStep: React.FC<CareerDirectionStepProps> = ({
  formData,
  onChange,
  errors,
}) => {
  const selectedRoles = (formData.targetRole || '')
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean);

  const handleToggleRole = (role: string) => {
    const exists = selectedRoles.some((r) => r.toLowerCase() === role.toLowerCase());
    let updatedRoles: string[];
    if (exists) {
      updatedRoles = selectedRoles.filter((r) => r.toLowerCase() !== role.toLowerCase());
    } else {
      updatedRoles = [...selectedRoles, role];
    }
    onChange({ targetRole: updatedRoles.join(', ') });
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header text */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6366F1]">
          Step 06 — Career Direction & Goal
        </span>
        <h3 className="text-2xl font-bold font-display text-[#F9FAFB]">
          What are you working toward?
        </h3>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          Define your target job role(s) and primary objective. This powers PATHWAY.ECO skill-gap analysis and AI roadmap recommendations.
        </p>
      </div>

      <div className="space-y-5">
        {/* Target Job Role Input */}
        <div className="space-y-2">
          <label htmlFor="input-targetRole" className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#6366F1]" /> Target Job Role(s) <span className="text-rose-400">*</span>
            </span>
            <span className="text-[10px] text-[#6366F1] font-normal">Select multiple or type custom</span>
          </label>
          <input
            id="input-targetRole"
            type="text"
            placeholder="e.g. Software Engineer, ML Engineer, Data Scientist..."
            value={formData.targetRole || ''}
            onChange={(e) => onChange({ targetRole: e.target.value })}
            className="w-full h-12 px-4 rounded-xl bg-[#0B0F19] border border-[#94A3B8]/20 text-[#F9FAFB] placeholder-[#94A3B8]/40 text-sm focus:outline-none focus:border-[#6366F1] transition-all"
          />
          {errors.targetRole && <p className="text-xs text-rose-400 font-medium">{errors.targetRole}</p>}

          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {POPULAR_TARGET_ROLES.map((role) => {
              const isSelected = selectedRoles.some((r) => r.toLowerCase() === role.toLowerCase());
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleToggleRole(role)}
                  className={`px-3 py-1 rounded-lg text-xs transition-all border ${
                    isSelected
                      ? 'bg-[#6366F1] text-white border-[#6366F1] shadow-sm'
                      : 'bg-[#0B0F19] border-[#94A3B8]/15 text-[#94A3B8] hover:text-white hover:border-[#6366F1]'
                  }`}
                >
                  {role}
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Objective Selection */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
            <Rocket className="w-3.5 h-3.5 text-[#6366F1]" /> What is your primary career goal?
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {GOAL_TYPES.map((gt) => {
              const isSelected = formData.careerGoalType === gt.id;
              return (
                <button
                  key={gt.id}
                  type="button"
                  onClick={() => onChange({ careerGoalType: gt.id })}
                  className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#6366F1]/15 border-[#6366F1] text-white shadow-sm'
                      : 'bg-[#0B0F19] border-[#94A3B8]/15 text-[#94A3B8] hover:border-[#94A3B8]/30 hover:text-white'
                  }`}
                >
                  <span>{gt.label}</span>
                  {isSelected && <Sparkles className="w-3.5 h-3.5 text-[#6366F1]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Industry & Timeframe Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label htmlFor="input-targetIndustry" className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#6366F1]" /> Preferred Industry
            </label>
            <input
              id="input-targetIndustry"
              type="text"
              placeholder="e.g. Fintech, AI / Robotics, SaaS, Healthcare"
              value={formData.targetIndustry || ''}
              onChange={(e) => onChange({ targetIndustry: e.target.value })}
              className="w-full h-11 px-4 rounded-xl bg-[#0B0F19] border border-[#94A3B8]/20 text-[#F9FAFB] text-sm focus:outline-none focus:border-[#6366F1]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="input-timeframe" className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#6366F1]" /> Target Timeline
            </label>
            <select
              id="input-timeframe"
              value={formData.timeframe || 'Immediate (1-3 months)'}
              onChange={(e) => onChange({ timeframe: e.target.value })}
              className="w-full h-11 px-4 rounded-xl bg-[#0B0F19] border border-[#94A3B8]/20 text-[#F9FAFB] text-sm focus:outline-none focus:border-[#6366F1]"
            >
              <option value="Immediate (1-3 months)">Immediate (1–3 months)</option>
              <option value="Short term (3-6 months)">Short term (3–6 months)</option>
              <option value="Medium term (6-12 months)">Medium term (6–12 months)</option>
              <option value="Long term (1-2 years)">Long term (1–2 years)</option>
            </select>
          </div>
        </div>

        {/* Free text goal */}
        <div className="space-y-1.5 pt-2">
          <label htmlFor="input-notes" className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#6366F1]" /> Where do you want to be next? (Free-text Vision)
          </label>
          <textarea
            id="input-notes"
            rows={3}
            placeholder="Share your dream milestone, ideal company culture, or specific technology stack you want to master..."
            value={formData.notes || ''}
            onChange={(e) => onChange({ notes: e.target.value })}
            className="w-full p-4 rounded-xl bg-[#0B0F19] border border-[#94A3B8]/20 text-[#F9FAFB] text-sm focus:outline-none focus:border-[#6366F1] resize-none"
          />
        </div>
      </div>
    </div>
  );
};
