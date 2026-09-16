'use client';

import React from 'react';
import { CareerPath } from '@/lib/careers/career-types';
import { Dumbbell, ArrowRight, Code2, FolderGit2, CheckSquare, MessageSquare } from 'lucide-react';

export interface PracticeSectionProps {
  career: CareerPath;
}

export const PracticeSection: React.FC<PracticeSectionProps> = ({ career }) => {
  const practiceCategories = [
    {
      id: 'prac-tech',
      category: 'Technical',
      title: `${career.title} Technical Drills`,
      description: `Solve targeted coding & technical challenges tailored to ${career.title} requirements.`,
      icon: Code2,
      count: '15+ Challenges',
    },
    {
      id: 'prac-portfolio',
      category: 'Portfolio',
      title: 'Portfolio & Code Review',
      description: 'Review your project repositories against industry clean code and architecture standards.',
      icon: FolderGit2,
      count: '4 Checklists',
    },
    {
      id: 'prac-scenario',
      category: 'Scenario',
      title: 'Scenario-based Assessments',
      description: 'Practice real-world troubleshooting, architecture trade-offs, and system design problems.',
      icon: CheckSquare,
      count: '10 Scenarios',
    },
    {
      id: 'prac-interview',
      category: 'Interview',
      title: 'Behavioral & Role Simulation',
      description: 'Master STAR-framework responses for behavioral and situational team interviews.',
      icon: MessageSquare,
      count: '12 Questions',
    },
  ];

  return (
    <div id="practice" className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-[#6366F1]" />
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
              Practice Your Skills
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Build muscle memory through technical drills, portfolio reviews, and scenario assessments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {practiceCategories.map((item) => {
          const IconComp = item.icon;
          return (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#6366F1]/50 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#6366F1] bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full">
                    {item.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {item.count}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <IconComp className="w-4 h-4 text-[#6366F1]" />
                  <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => alert(`Practice Drill "${item.title}" loaded. Session starting!`)}
                  className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] py-2 rounded-xl shadow-xs hover:opacity-95 transition-opacity"
                >
                  <span>Start Practice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
