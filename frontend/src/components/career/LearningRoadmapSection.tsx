'use client';

import React from 'react';
import { CareerPath, CareerLevelDefinition } from '@/lib/careers/career-types';
import { BookOpen, ArrowRight, CheckCircle2, Sparkles, Layers } from 'lucide-react';

export interface LearningRoadmapSectionProps {
  career: CareerPath;
  levelData?: CareerLevelDefinition;
}

export const LearningRoadmapSection: React.FC<LearningRoadmapSectionProps> = ({
  career,
  levelData,
}) => {
  const phases = levelData?.learningPhases || career.learningPhases;

  return (
    <div id="learning-roadmap" className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
              Learning Roadmap ⭐
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Curated, ordered curriculum for{' '}
            <strong className="text-blue-600">{levelData?.label || 'this level'}</strong> in{' '}
            {career.title}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {levelData && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Level: {levelData.label}
            </span>
          )}
          <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full shrink-0">
            {phases.length} Structured Phase{phases.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {phases.map((phase) => {
          const course = phase.recommendedCourse;
          const topics =
            phase.topics || phase.skills.map((s) => `Master ${s} principles and applications`);

          return (
            <div
              key={phase.phaseNumber}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm transition-all hover:border-blue-500/40"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Left Phase Details & Bullet Topics */}
                <div className="md:col-span-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-mono font-extrabold text-xs tracking-wider uppercase shadow-xs shrink-0 whitespace-nowrap">
                      Phase {phase.phaseNumber}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold font-display text-slate-900">
                        {phase.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {phase.subtitle}
                      </p>
                    </div>
                  </div>

                  {phase.description && (
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {phase.description}
                    </p>
                  )}

                  {/* Bullet Topics of What to Learn */}
                  <div className="space-y-2 pt-1">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      WHAT YOU WILL LEARN IN THIS PHASE:
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {topics.map((topic, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Skills Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                    {phase.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Course Card & View Courses CTA */}
                <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>{course?.title || `${career.title} Pathway Modules`}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Provider: {course?.provider || 'PATHWAY Recommended Learning'}
                    </p>
                    {course?.level && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 inline-block">
                        Target Level: {course.level}
                      </span>
                    )}
                  </div>

                  <div>
                    <a
                      href="/learn"
                      className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-opacity"
                    >
                      <span>Explore Learning Modules</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
