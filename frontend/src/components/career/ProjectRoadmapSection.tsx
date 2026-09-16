'use client';

import React from 'react';
import { CareerPath } from '@/lib/careers/career-types';
import { FolderGit2, ArrowRight } from 'lucide-react';

export interface ProjectRoadmapSectionProps {
  career: CareerPath;
}

export const ProjectRoadmapSection: React.FC<ProjectRoadmapSectionProps> = ({ career }) => {
  return (
    <div id="project-roadmap" className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-[#6366F1]" />
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
              Build Your Portfolio (Projects) ⭐
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Build real projects to demonstrate practical competence to hiring managers.
          </p>
        </div>
        <span className="text-xs font-mono font-semibold text-[#6366F1] bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full shrink-0">
          {career.projects.length} Portfolio Projects
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {career.projects.map((proj, idx) => (
          <div
            key={proj.id}
            className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-[#6366F1]/50 transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#6366F1] bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 rounded-full">
                  PROJECT 0{idx + 1}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    proj.difficulty === 'Beginner'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : proj.difficulty === 'Intermediate'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      : 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                  }`}
                >
                  Level: {proj.difficulty}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                  {proj.title}
                </h3>
              </div>

              {/* What You'll Build */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  WHAT YOU&apos;LL BUILD:
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {proj.expectedOutcome || proj.description}
                </p>
              </div>

              {/* You'll Practice */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6366F1]">
                  YOU&apos;LL PRACTICE:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {proj.skillsRequired.map((s) => (
                    <span
                      key={s}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/50 font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => alert(`Project Details: "${proj.title}" brief loaded. Workspace setup coming soon!`)}
                className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] py-2.5 rounded-xl shadow-xs hover:opacity-95 transition-opacity"
              >
                <span>View Project</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
