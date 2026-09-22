'use client';

import React from 'react';
import { EducationItemInput } from '@backend/validations/onboardingSchemas';
import { GraduationCap, Plus, Trash2, Calendar, MapPin, BookOpen, Award } from 'lucide-react';

interface EducationStepProps {
  educationList: EducationItemInput[];
  onChange: (updated: EducationItemInput[]) => void;
  errors: Record<string, string>;
  isStudent?: boolean;
}

export const EducationStep: React.FC<EducationStepProps> = ({
  educationList,
  onChange,
  errors,
  isStudent = false,
}) => {
  const handleAdd = () => {
    const newItem: EducationItemInput = {
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startYear: new Date().getFullYear() - 2,
      endYear: new Date().getFullYear() + 2,
      isCurrent: true,
      source: 'USER',
    };
    onChange([...educationList, newItem]);
  };

  const handleUpdate = (index: number, fields: Partial<EducationItemInput>) => {
    const updated = [...educationList];
    updated[index] = { ...updated[index], ...fields };
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = educationList.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header text */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6366F1]">
          Step 02 — Academic Background
        </span>
        <h3 className="text-2xl font-bold font-display text-slate-900">
          Education & Qualifications
        </h3>
        <p className="text-xs sm:text-sm text-slate-600">
          Add your degrees, certifications, universities, and academic achievements.
          {isStudent && <span className="text-indigo-600 font-medium"> (At least 1 required for students)</span>}
        </p>
      </div>

      {errors.general && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {errors.general}
        </div>
      )}

      {/* Education Entries List */}
      <div className="space-y-6">
        {educationList.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-3">
            <GraduationCap className="w-10 h-10 text-[#6366F1] mx-auto opacity-70" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">No education added yet</p>
              <p className="text-xs text-slate-500">Add your degree, university, or academic achievements.</p>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-2 rounded-xl bg-[#6366F1]/10 text-[#6366F1] font-semibold text-xs border border-[#6366F1]/20 hover:bg-[#6366F1]/20 transition-colors"
            >
              + Add Education Entry
            </button>
          </div>
        ) : (
          educationList.map((edu, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 space-y-4 relative group shadow-sm"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <GraduationCap className="w-4 h-4 text-[#6366F1]" />
                  <span>Education #{idx + 1}</span>
                  {edu.source === 'RESUME' && (
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-mono border border-indigo-200">
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

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor={`edu-institution-${idx}`} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Institution / University <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id={`edu-institution-${idx}`}
                    type="text"
                    placeholder="e.g. Stanford University or MIT"
                    value={edu.institution || ''}
                    onChange={(e) => handleUpdate(idx, { institution: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#6366F1] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`edu-degree-${idx}`} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Degree / Qualification <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id={`edu-degree-${idx}`}
                    type="text"
                    placeholder="e.g. B.Tech / B.S. / M.S."
                    value={edu.degree || ''}
                    onChange={(e) => handleUpdate(idx, { degree: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#6366F1] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`edu-field-${idx}`} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Field of Study <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id={`edu-field-${idx}`}
                    type="text"
                    placeholder="e.g. Computer Science & Engineering"
                    value={edu.fieldOfStudy || ''}
                    onChange={(e) => handleUpdate(idx, { fieldOfStudy: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#6366F1] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`edu-startYear-${idx}`} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#6366F1]" /> Start Year
                  </label>
                  <input
                    id={`edu-startYear-${idx}`}
                    type="number"
                    placeholder="2022"
                    value={edu.startYear || ''}
                    onChange={(e) => handleUpdate(idx, { startYear: parseInt(e.target.value) || 2022 })}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#6366F1] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`edu-endYear-${idx}`} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#6366F1]" /> End Year (or Expected)
                  </label>
                  <input
                    id={`edu-endYear-${idx}`}
                    type="number"
                    placeholder="2026"
                    value={edu.endYear || ''}
                    onChange={(e) => handleUpdate(idx, { endYear: parseInt(e.target.value) || null })}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#6366F1] focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id={`edu-current-${idx}`}
                    checked={Boolean(edu.isCurrent)}
                    onChange={(e) => handleUpdate(idx, { isCurrent: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-[#6366F1] focus:ring-[#6366F1]"
                  />
                  <label htmlFor={`edu-current-${idx}`} className="text-xs text-slate-900 font-medium cursor-pointer">
                    Currently studying here
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`edu-gpa-${idx}`} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Award className="w-3 h-3 text-[#6366F1]" /> GPA / Grade (Optional)
                  </label>
                  <input
                    id={`edu-gpa-${idx}`}
                    type="text"
                    placeholder="e.g. 3.8 / 4.0 or 88%"
                    value={edu.gpa || ''}
                    onChange={(e) => handleUpdate(idx, { gpa: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#6366F1] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`edu-location-${idx}`} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#6366F1]" /> Location (Optional)
                  </label>
                  <input
                    id={`edu-location-${idx}`}
                    type="text"
                    placeholder="e.g. Stanford, CA"
                    value={edu.location || ''}
                    onChange={(e) => handleUpdate(idx, { location: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#6366F1] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor={`edu-coursework-${idx}`} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-[#6366F1]" /> Relevant Coursework & Achievements (Optional)
                  </label>
                  <input
                    id={`edu-coursework-${idx}`}
                    type="text"
                    placeholder="e.g. Data Structures, Distributed Systems, Machine Learning, Dean's List 2023"
                    value={edu.coursework || ''}
                    onChange={(e) => handleUpdate(idx, { coursework: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#6366F1] focus:bg-white"
                  />
                </div>
              </div>
            </div>
          ))
        )}

        <button
          type="button"
          onClick={handleAdd}
          className="w-full py-3.5 rounded-xl border border-dashed border-[#6366F1]/40 bg-[#6366F1]/5 hover:bg-[#6366F1]/10 text-[#6366F1] font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Another Education Entry
        </button>
      </div>
    </div>
  );
};
