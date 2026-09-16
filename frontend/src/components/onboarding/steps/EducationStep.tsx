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
        <h3 className="text-2xl font-bold font-display text-[#F9FAFB]">
          Education & Qualifications
        </h3>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          Add your degrees, certifications, universities, and academic achievements.
          {isStudent && <span className="text-indigo-400 font-medium"> (At least 1 required for students)</span>}
        </p>
      </div>

      {errors.general && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
          {errors.general}
        </div>
      )}

      {/* Education Entries List */}
      <div className="space-y-6">
        {educationList.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#0B0F19] border border-dashed border-[#94A3B8]/20 text-center space-y-3">
            <GraduationCap className="w-10 h-10 text-[#6366F1] mx-auto opacity-70" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">No education added yet</p>
              <p className="text-xs text-[#94A3B8]">Add your degree, university, or academic achievements.</p>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-2 rounded-xl bg-[#6366F1]/15 text-[#6366F1] font-semibold text-xs border border-[#6366F1]/30 hover:bg-[#6366F1]/25 transition-colors"
            >
              + Add Education Entry
            </button>
          </div>
        ) : (
          educationList.map((edu, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-2xl bg-[#0B0F19] border border-[#94A3B8]/15 space-y-4 relative group"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-[#94A3B8]/10 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <GraduationCap className="w-4 h-4 text-[#6366F1]" />
                  <span>Education #{idx + 1}</span>
                  {edu.source === 'RESUME' && (
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono">
                      Imported from Resume
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="text-rose-400 hover:text-rose-300 p-1 rounded-lg hover:bg-rose-500/10 transition-colors text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor={`edu-institution-${idx}`} className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                    Institution / University <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id={`edu-institution-${idx}`}
                    type="text"
                    placeholder="e.g. Stanford University or MIT"
                    value={edu.institution || ''}
                    onChange={(e) => handleUpdate(idx, { institution: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#111827] border border-[#94A3B8]/20 text-[#F9FAFB] placeholder-[#94A3B8]/40 text-sm focus:outline-none focus:border-[#6366F1]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`edu-degree-${idx}`} className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                    Degree / Qualification <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id={`edu-degree-${idx}`}
                    type="text"
                    placeholder="e.g. B.Tech / B.S. / M.S."
                    value={edu.degree || ''}
                    onChange={(e) => handleUpdate(idx, { degree: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#111827] border border-[#94A3B8]/20 text-[#F9FAFB] placeholder-[#94A3B8]/40 text-sm focus:outline-none focus:border-[#6366F1]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`edu-field-${idx}`} className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                    Field of Study <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id={`edu-field-${idx}`}
                    type="text"
                    placeholder="e.g. Computer Science & Engineering"
                    value={edu.fieldOfStudy || ''}
                    onChange={(e) => handleUpdate(idx, { fieldOfStudy: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#111827] border border-[#94A3B8]/20 text-[#F9FAFB] placeholder-[#94A3B8]/40 text-sm focus:outline-none focus:border-[#6366F1]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`edu-startYear-${idx}`} className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#6366F1]" /> Start Year
                  </label>
                  <input
                    id={`edu-startYear-${idx}`}
                    type="number"
                    placeholder="2022"
                    value={edu.startYear || ''}
                    onChange={(e) => handleUpdate(idx, { startYear: parseInt(e.target.value) || 2022 })}
                    className="w-full h-11 px-4 rounded-xl bg-[#111827] border border-[#94A3B8]/20 text-[#F9FAFB] text-sm focus:outline-none focus:border-[#6366F1]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`edu-endYear-${idx}`} className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#6366F1]" /> End Year (or Expected)
                  </label>
                  <input
                    id={`edu-endYear-${idx}`}
                    type="number"
                    placeholder="2026"
                    value={edu.endYear || ''}
                    onChange={(e) => handleUpdate(idx, { endYear: parseInt(e.target.value) || null })}
                    className="w-full h-11 px-4 rounded-xl bg-[#111827] border border-[#94A3B8]/20 text-[#F9FAFB] text-sm focus:outline-none focus:border-[#6366F1]"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id={`edu-current-${idx}`}
                    checked={Boolean(edu.isCurrent)}
                    onChange={(e) => handleUpdate(idx, { isCurrent: e.target.checked })}
                    className="w-4 h-4 rounded border-[#94A3B8]/30 text-[#6366F1] focus:ring-[#6366F1]"
                  />
                  <label htmlFor={`edu-current-${idx}`} className="text-xs text-[#F9FAFB] cursor-pointer">
                    Currently studying here
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`edu-gpa-${idx}`} className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
                    <Award className="w-3 h-3 text-[#6366F1]" /> GPA / Grade (Optional)
                  </label>
                  <input
                    id={`edu-gpa-${idx}`}
                    type="text"
                    placeholder="e.g. 3.8 / 4.0 or 88%"
                    value={edu.gpa || ''}
                    onChange={(e) => handleUpdate(idx, { gpa: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#111827] border border-[#94A3B8]/20 text-[#F9FAFB] text-sm focus:outline-none focus:border-[#6366F1]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`edu-location-${idx}`} className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#6366F1]" /> Location (Optional)
                  </label>
                  <input
                    id={`edu-location-${idx}`}
                    type="text"
                    placeholder="e.g. Stanford, CA"
                    value={edu.location || ''}
                    onChange={(e) => handleUpdate(idx, { location: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#111827] border border-[#94A3B8]/20 text-[#F9FAFB] text-sm focus:outline-none focus:border-[#6366F1]"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor={`edu-coursework-${idx}`} className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-[#6366F1]" /> Relevant Coursework & Achievements (Optional)
                  </label>
                  <input
                    id={`edu-coursework-${idx}`}
                    type="text"
                    placeholder="e.g. Data Structures, Distributed Systems, Machine Learning, Dean's List 2023"
                    value={edu.coursework || ''}
                    onChange={(e) => handleUpdate(idx, { coursework: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#111827] border border-[#94A3B8]/20 text-[#F9FAFB] text-sm focus:outline-none focus:border-[#6366F1]"
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
