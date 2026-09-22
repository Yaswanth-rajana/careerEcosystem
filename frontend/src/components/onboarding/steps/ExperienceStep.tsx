'use client';

import React from 'react';
import { ExperienceItemInput } from '@backend/validations/onboardingSchemas';
import { Briefcase, Plus, Trash2, Calendar, MapPin, CheckSquare, Sparkles } from 'lucide-react';

interface ExperienceStepProps {
  experienceList: ExperienceItemInput[];
  hasNoExperience: boolean;
  onChangeExperience: (updated: ExperienceItemInput[]) => void;
  onChangeNoExperience: (noExp: boolean) => void;
  errors: Record<string, string>;
}

const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Internship',
  'Contract',
  'Freelance',
  'Self-employed',
];

export const ExperienceStep: React.FC<ExperienceStepProps> = ({
  experienceList,
  hasNoExperience,
  onChangeExperience,
  onChangeNoExperience,
  errors,
}) => {
  const handleAdd = () => {
    const newItem: ExperienceItemInput = {
      company: '',
      roleTitle: '',
      employmentType: 'Full-time',
      startDate: '2023-01',
      endDate: null,
      isCurrent: true,
      description: '',
      source: 'USER',
    };
    onChangeExperience([...experienceList, newItem]);
    if (hasNoExperience) onChangeNoExperience(false);
  };

  const handleUpdate = (index: number, fields: Partial<ExperienceItemInput>) => {
    const updated = [...experienceList];
    updated[index] = { ...updated[index], ...fields };
    onChangeExperience(updated);
  };

  const handleRemove = (index: number) => {
    const updated = experienceList.filter((_, i) => i !== index);
    onChangeExperience(updated);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header text */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
          Step 03 — Work Experience
        </span>
        <h3 className="text-2xl font-bold font-display text-slate-900">
          Professional & Internship Experience
        </h3>
        <p className="text-xs sm:text-sm text-slate-600">
          Tell us where you&apos;ve worked or interned. If you are a student without work experience yet, you can indicate that below.
        </p>
      </div>

      {errors.general && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {errors.general}
        </div>
      )}

      {/* No Experience Toggle Card for Students */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CheckSquare className={`w-5 h-5 ${hasNoExperience ? 'text-indigo-600' : 'text-slate-400'}`} />
          <div>
            <div className="font-semibold text-xs text-slate-900">I don&apos;t have professional experience yet</div>
            <div className="text-[11px] text-slate-500">Valid for students and entry-level candidates.</div>
          </div>
        </div>

        <input
          type="checkbox"
          id="no-exp-toggle"
          checked={hasNoExperience}
          onChange={(e) => {
            onChangeNoExperience(e.target.checked);
            if (e.target.checked) onChangeExperience([]);
          }}
          className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
      </div>

      {/* Experience List */}
      {!hasNoExperience && (
        <div className="space-y-6">
          {experienceList.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-3">
              <Briefcase className="w-10 h-10 text-indigo-600 mx-auto opacity-70" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">No work experience entries added</p>
                <p className="text-xs text-slate-500">Add your internships, part-time work, or full-time roles.</p>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-200 hover:bg-indigo-100 transition-colors"
              >
                + Add Experience Entry
              </button>
            </div>
          ) : (
            experienceList.map((exp, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 relative group"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    <span>Experience #{idx + 1}</span>
                    {exp.source === 'RESUME' && (
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-mono font-medium">
                        Imported from Resume
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="text-rose-600 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition-colors text-xs flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor={`exp-roleTitle-${idx}`} className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Job Title / Role <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id={`exp-roleTitle-${idx}`}
                      type="text"
                      placeholder="e.g. Software Engineer Intern or Product Designer"
                      value={exp.roleTitle || ''}
                      onChange={(e) => handleUpdate(idx, { roleTitle: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor={`exp-company-${idx}`} className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Company / Organization <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id={`exp-company-${idx}`}
                      type="text"
                      placeholder="e.g. Acme Corp or Pathway Technologies"
                      value={exp.company || ''}
                      onChange={(e) => handleUpdate(idx, { company: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor={`exp-employmentType-${idx}`} className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Employment Type
                    </label>
                    <select
                      id={`exp-employmentType-${idx}`}
                      value={exp.employmentType || 'Full-time'}
                      onChange={(e) => handleUpdate(idx, { employmentType: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    >
                      {EMPLOYMENT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor={`exp-location-${idx}`} className="block text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-indigo-600" /> Location (Optional)
                    </label>
                    <input
                      id={`exp-location-${idx}`}
                      type="text"
                      placeholder="e.g. New York, NY (Hybrid)"
                      value={exp.location || ''}
                      onChange={(e) => handleUpdate(idx, { location: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor={`exp-startDate-${idx}`} className="block text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-600" /> Start Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id={`exp-startDate-${idx}`}
                      type="text"
                      placeholder="e.g. Jun 2023"
                      value={exp.startDate || ''}
                      onChange={(e) => handleUpdate(idx, { startDate: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor={`exp-endDate-${idx}`} className="block text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-600" /> End Date
                    </label>
                    <input
                      id={`exp-endDate-${idx}`}
                      type="text"
                      placeholder="e.g. Aug 2024"
                      disabled={exp.isCurrent}
                      value={exp.isCurrent ? '' : exp.endDate || ''}
                      onChange={(e) => handleUpdate(idx, { endDate: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-40"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id={`exp-current-${idx}`}
                      checked={Boolean(exp.isCurrent)}
                      onChange={(e) => handleUpdate(idx, { isCurrent: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor={`exp-current-${idx}`} className="text-xs text-slate-700 cursor-pointer">
                      I currently work in this role
                    </label>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor={`exp-description-${idx}`} className="block text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-600" /> Description & Achievements (Optional)
                    </label>
                    <textarea
                      id={`exp-description-${idx}`}
                      rows={3}
                      placeholder="Describe your primary responsibilities, projects, and impact..."
                      value={exp.description || ''}
                      onChange={(e) => handleUpdate(idx, { description: e.target.value })}
                      className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            ))
          )}

          <button
            type="button"
            onClick={handleAdd}
            className="w-full py-3.5 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-600 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Experience Entry
          </button>
        </div>
      )}
    </div>
  );
};
