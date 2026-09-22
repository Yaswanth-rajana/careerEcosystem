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
        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
          Step 06 — Career Direction & Goal
        </span>
        <h3 className="text-2xl font-bold font-display text-slate-900">
          What are you working toward?
        </h3>
        <p className="text-xs sm:text-sm text-slate-600">
          Define your target job role(s) and primary objective. This powers PATHWAY.ECO skill-gap analysis and AI roadmap recommendations.
        </p>
      </div>

      <div className="space-y-5">
        {/* Target Job Role Input */}
        <div className="space-y-2">
          <label htmlFor="input-targetRole" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-600" /> Target Job Role(s) <span className="text-rose-500">*</span>
            </span>
            <span className="text-[10px] text-indigo-600 font-medium">Select multiple or type custom</span>
          </label>
          <input
            id="input-targetRole"
            type="text"
            placeholder="e.g. Software Engineer, ML Engineer, Data Scientist..."
            value={formData.targetRole || ''}
            onChange={(e) => onChange({ targetRole: e.target.value })}
            className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          {errors.targetRole && <p className="text-xs text-rose-600 font-medium">{errors.targetRole}</p>}

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
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 shadow-sm'
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
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Rocket className="w-3.5 h-3.5 text-indigo-600" /> What is your primary career goal?
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
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span>{gt.label}</span>
                  {isSelected && <Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Industry & Timeframe Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label htmlFor="input-targetIndustry" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Preferred Industry
            </label>
            <input
              id="input-targetIndustry"
              type="text"
              placeholder="e.g. Fintech, AI / Robotics, SaaS, Healthcare"
              value={formData.targetIndustry || ''}
              onChange={(e) => onChange({ targetIndustry: e.target.value })}
              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="input-timeframe" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" /> Target Timeline
            </label>
            <select
              id="input-timeframe"
              value={formData.timeframe || 'Immediate (1-3 months)'}
              onChange={(e) => onChange({ timeframe: e.target.value })}
              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
          <label htmlFor="input-notes" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-indigo-600" /> Where do you want to be next? (Free-text Vision)
          </label>
          <textarea
            id="input-notes"
            rows={3}
            placeholder="Share your dream milestone, ideal company culture, or specific technology stack you want to master..."
            value={formData.notes || ''}
            onChange={(e) => onChange({ notes: e.target.value })}
            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
          />
        </div>
      </div>
    </div>
  );
};
