'use client';

import React, { useState } from 'react';
import { UserSkillInput } from '@backend/validations/onboardingSchemas';
import { Wrench, Plus, X, Search, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface SkillsStepProps {
  skillsList: UserSkillInput[];
  onChange: (updated: UserSkillInput[]) => void;
  errors: Record<string, string>;
}

const POPULAR_SKILLS = [
  { name: 'Python', category: 'Programming' },
  { name: 'JavaScript', category: 'Programming' },
  { name: 'TypeScript', category: 'Programming' },
  { name: 'React', category: 'Frontend' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'SQL', category: 'Data' },
  { name: 'Machine Learning', category: 'AI / ML' },
  { name: 'Deep Learning', category: 'AI / ML' },
  { name: 'AWS', category: 'Cloud' },
  { name: 'Docker', category: 'DevOps' },
  { name: 'Git', category: 'Tools' },
  { name: 'Data Structures & Algorithms', category: 'Computer Science' },
  { name: 'Communication', category: 'Soft Skills' },
  { name: 'Problem Solving', category: 'Soft Skills' },
  { name: 'Product Management', category: 'Management' },
  { name: 'Figma', category: 'Design' },
];

export const SkillsStep: React.FC<SkillsStepProps> = ({ skillsList, onChange, errors }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddSkill = (skillName: string, category?: string) => {
    const name = skillName.trim();
    if (!name) return;
    if (skillsList.some((s) => s.name.toLowerCase() === name.toLowerCase())) return;

    const newSkill: UserSkillInput = {
      name,
      category: category || 'Other',
      level: 'INTERMEDIATE',
      source: 'USER',
      verified: false,
    };
    onChange([...skillsList, newSkill]);
  };

  const handleRemoveSkill = (name: string) => {
    onChange(skillsList.filter((s) => s.name !== name));
  };

  const filteredSuggestions = POPULAR_SKILLS.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !skillsList.some((existing) => existing.name.toLowerCase() === s.name.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      {/* Header text */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6366F1]">
          Step 04 — Core Competencies
        </span>
        <h3 className="text-2xl font-bold font-display text-[#F9FAFB]">
          Skills & Technical Expertise
        </h3>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          Add your technical skills, programming languages, and soft skills.
          <span className="text-indigo-400 font-medium"> (At least 1 required)</span>
        </p>
      </div>

      {errors.skills && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
          {errors.skills}
        </div>
      )}

      {/* Selected Skills Grid */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-[#6366F1]" /> Selected Skills ({skillsList.length})
          </span>
          <span className="text-[10px] text-[#6366F1] font-mono">Provenanced Data Foundation</span>
        </label>

        {skillsList.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#0B0F19] border border-dashed border-[#94A3B8]/20 text-center text-xs text-[#94A3B8]">
            No skills added yet. Select from suggestions below or search to add your skills.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {skillsList.map((skill) => (
              <div
                key={skill.name}
                className="px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-[#94A3B8]/20 flex items-center gap-2 group hover:border-[#6366F1]/50 transition-all"
              >
                <span className="font-semibold text-xs text-white">{skill.name}</span>
                {skill.source === 'RESUME' && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-mono font-bold bg-indigo-500/20 text-indigo-300">
                    Resume
                  </span>
                )}
                {skill.verified && (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill.name)}
                  className="text-[#94A3B8] hover:text-rose-400 p-0.5 rounded transition-colors ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Custom / Search Input */}
      <div className="space-y-3 pt-2">
        <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-[#6366F1]" /> Search or Add Custom Skill
        </label>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search or type a skill (e.g. Next.js, TensorFlow, Kubernetes)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill(searchTerm);
                  setSearchTerm('');
                }
              }}
              className="w-full h-11 px-4 rounded-xl bg-[#0B0F19] border border-[#94A3B8]/20 text-[#F9FAFB] placeholder-[#94A3B8]/40 text-sm focus:outline-none focus:border-[#6366F1]"
            />
          </div>

          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                handleAddSkill(searchTerm);
                setSearchTerm('');
              }}
              className="px-4 py-2 rounded-xl bg-[#6366F1] text-white font-semibold text-xs flex items-center gap-1 hover:bg-[#5558DD] transition-colors"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          )}
        </div>

        {/* Popular Suggestions Chips */}
        <div className="space-y-1.5 pt-2">
          <span className="text-[11px] text-[#94A3B8] font-medium block">Popular Skills:</span>
          <div className="flex flex-wrap gap-2">
            {filteredSuggestions.slice(0, 14).map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => handleAddSkill(s.name, s.category)}
                className="px-3 py-1.5 rounded-lg bg-[#111827] border border-[#94A3B8]/15 text-xs text-[#94A3B8] hover:text-white hover:border-[#6366F1] hover:bg-[#6366F1]/10 transition-all flex items-center gap-1"
              >
                <Plus className="w-3 h-3 text-[#6366F1]" />
                <span>{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
