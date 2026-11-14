'use client';

import React from 'react';
import Image from 'next/image';
import { CareerPath, CareerLevelDefinition } from '@/lib/careers/career-types';
import {
  getSmvenCoursesForCareer,
  getPrimarySmvenCourseForCareer,
  SMVEN_IT_INFRASTRUCTURE_URL,
} from '@/lib/careers/career-repository';
import { BookOpen, ArrowRight, CheckCircle2, Sparkles, Layers, ExternalLink } from 'lucide-react';

export interface LearningRoadmapSectionProps {
  career: CareerPath;
  levelData?: CareerLevelDefinition;
}

export const LearningRoadmapSection: React.FC<LearningRoadmapSectionProps> = ({
  career,
  levelData,
}) => {
  const phases = levelData?.learningPhases || career.learningPhases;
  const smvenCourses = getSmvenCoursesForCareer(career.slug);
  const primarySmvenCourse = getPrimarySmvenCourseForCareer(career.slug);

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

      {/* Dedicated SMVEN Training Programs Banner */}
      {smvenCourses.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-blue-600 text-white shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-950">
                Recommended SMVEN Training Programs for {career.title}
              </span>
            </div>
            <a
              href={SMVEN_IT_INFRASTRUCTURE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-slate-500 hover:text-blue-600 inline-flex items-center gap-1 transition-colors"
            >
              smven.com <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className={`grid grid-cols-1 ${smvenCourses.length > 1 ? 'sm:grid-cols-2' : ''} gap-3`}>
            {smvenCourses.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-white border border-blue-200/60 flex flex-col justify-between gap-3 shadow-2xs hover:border-blue-400 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{c.title}</h4>
                    <Image
                      src="/smvenLogo.png"
                      alt="SMVEN"
                      width={64}
                      height={16}
                      className="h-4 w-auto object-contain"
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                    {c.tagline}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {c.skills.slice(0, 3).map((s) => (
                      <span key={s} className="text-[9.5px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors shrink-0"
                  >
                    <span>View Course</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {phases.map((phase) => {
          const course = phase.recommendedCourse;
          const matchingSmvenCourse =
            smvenCourses.find((c) =>
              c.skills.some((cs) =>
                phase.skills.some((ps) => ps.toLowerCase().includes(cs.toLowerCase()) || cs.toLowerCase().includes(ps.toLowerCase()))
              )
            ) || primarySmvenCourse;
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
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>{matchingSmvenCourse?.title ? `${matchingSmvenCourse.title} Training` : course?.title || `${career.title} Pathway Modules`}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Provider: <strong className="text-slate-700">{matchingSmvenCourse ? 'SMVEN Training' : course?.provider || 'PATHWAY Recommended Learning'}</strong>
                    </p>
                    {matchingSmvenCourse ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 inline-block font-semibold">
                        Official Partner Program ↗
                      </span>
                    ) : (
                      course?.level && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 inline-block">
                          Target Level: {course.level}
                        </span>
                      )
                    )}
                  </div>

                  <div>
                    {matchingSmvenCourse ? (
                      <a
                        href={matchingSmvenCourse.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all group"
                      >
                        <span>View Course on SMVEN</span>
                        <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    ) : (
                      <a
                        href="/learn"
                        className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-opacity"
                      >
                        <span>Explore Learning Modules</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    )}
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
