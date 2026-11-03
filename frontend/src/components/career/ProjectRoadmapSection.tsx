'use client';

import React, { useState } from 'react';
import { CareerPath, CareerProject, CareerLevelDefinition } from '@/lib/careers/career-types';
import { FolderGit2, ArrowRight, Cpu, Layers, CheckCircle2, X } from 'lucide-react';

export interface ProjectRoadmapSectionProps {
  career: CareerPath;
  levelData?: CareerLevelDefinition;
}

export const ProjectRoadmapSection: React.FC<ProjectRoadmapSectionProps> = ({
  career,
  levelData,
}) => {
  const [selectedItem, setSelectedItem] = useState<CareerProject | null>(null);

  const sectionTitle =
    levelData?.practicalWorkTitle ||
    (career.category === 'Electronics & Systems'
      ? 'Labs, Circuits & Simulations'
      : career.category === 'Cybersecurity'
      ? 'Security Labs & Incident Simulations'
      : career.slug.includes('cloud') || career.slug.includes('devops')
      ? 'Infrastructure Labs & Real-World Deployments'
      : career.category === 'Data & AI'
      ? 'Data Analysis & ML Case Studies'
      : 'Build Your Portfolio (Projects) ⭐');

  const sectionDescription =
    levelData?.practicalWorkDescription ||
    (career.category === 'Electronics & Systems'
      ? 'Hands-on circuit design, microcontroller firmware development, and hardware test simulations.'
      : 'Complete real-world practical work to demonstrate verified competence to hiring managers.');

  const practicalItems = levelData?.practicalWork || career.projects;

  const IconComponent =
    career.category === 'Electronics & Systems' ? Cpu : FolderGit2;

  return (
    <div id="project-roadmap" className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <IconComponent className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
              {sectionTitle}
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">{sectionDescription}</p>
        </div>
        <div className="flex items-center gap-2">
          {levelData && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Level: {levelData.label}
            </span>
          )}
          <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full shrink-0">
            {practicalItems.length} Practical Assignment{practicalItems.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {practicalItems.map((proj, idx) => (
          <div
            key={proj.id}
            className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-blue-500/50 transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  PRACTICAL 0{idx + 1}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    proj.difficulty === 'Beginner'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : proj.difficulty === 'Intermediate'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  Difficulty: {proj.difficulty}
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 leading-snug">
                  {proj.title}
                </h3>
              </div>

              {/* What You'll Build / Practice */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  EXPECTED DELIVERABLE & OUTCOME:
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {proj.expectedOutcome || proj.description}
                </p>
              </div>

              {/* Practical Competencies */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  COMPETENCIES VERIFIED:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {proj.skillsRequired.map((s) => (
                    <span
                      key={s}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/60 font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedItem(proj)}
                className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                <span>View Practical Brief</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Brief Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {selectedItem.difficulty} Level Assignment
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1 font-display">
                  {selectedItem.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <h4 className="font-bold text-slate-800 uppercase text-[10.5px]">Assignment Brief:</h4>
              <p className="leading-relaxed">{selectedItem.description}</p>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <h4 className="font-bold text-slate-800 uppercase text-[10.5px]">Expected Outcome:</h4>
              <p className="leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {selectedItem.expectedOutcome}
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-800 uppercase text-[10.5px]">Skills Required:</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedItem.skillsRequired.map((s) => (
                  <span
                    key={s}
                    className="text-[11px] px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
              >
                Close Brief
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
