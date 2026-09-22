'use client';

import React from 'react';
import { CareerPath, CareerSkill } from '@/lib/careers/career-types';
import { Code2, Star, Zap, ArrowRight } from 'lucide-react';

export interface RequiredSkillsSectionProps {
  career: CareerPath;
}

export const RequiredSkillsSection: React.FC<RequiredSkillsSectionProps> = ({ career }) => {
  const { mustKnow, goodToKnow, advanced } = career.skillGroups;

  const scrollToLearning = () => {
    const el = document.getElementById('learning-roadmap');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const renderSkillGroup = (
    title: string,
    badgeColor: string,
    skills: CareerSkill[],
    icon: React.ElementType
  ) => {
    const IconComponent = icon;
    return (
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-lg ${badgeColor}`}>
              <IconComponent className="w-4 h-4 text-white" />
            </span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              {title}
            </h3>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-500">
            {skills.length} skills
          </span>
        </div>

        <div className="space-y-2.5">
          {skills.map((skill) => (
            <div
              key={skill.name}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 hover:border-blue-500/40 transition-colors group"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {skill.name}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-600">
                    {skill.level}
                  </span>
                </div>
                {skill.description && (
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    {skill.description}
                  </p>
                )}
              </div>
              <button
                onClick={scrollToLearning}
                className="inline-flex items-center gap-1 shrink-0 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white px-2.5 py-1 rounded-lg transition-all"
              >
                <span>Learn</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div id="required-skills" className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
            Skills You Need
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderSkillGroup('Must Know', 'bg-blue-600', mustKnow, Star)}
        {renderSkillGroup('Good to Know', 'bg-sky-600', goodToKnow, Zap)}
        {renderSkillGroup('Advanced', 'bg-blue-800', advanced, Code2)}
      </div>
    </div>
  );
};
