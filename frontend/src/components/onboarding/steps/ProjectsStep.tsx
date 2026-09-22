'use client';

import React, { useState } from 'react';
import { ProjectItemInput } from '@backend/validations/onboardingSchemas';
import { FolderGit2, Plus, Trash2, Globe, Github, Sparkles } from 'lucide-react';

interface ProjectsStepProps {
  projectsList: ProjectItemInput[];
  onChange: (updated: ProjectItemInput[]) => void;
  errors: Record<string, string>;
}

const PROJECT_TYPES = [
  'Academic',
  'Personal',
  'Freelance',
  'Open Source',
  'Professional',
  'Research',
  'Hackathon',
];

export const ProjectsStep: React.FC<ProjectsStepProps> = ({ projectsList, onChange, errors }) => {
  const [techInput, setTechInput] = useState<{ [key: number]: string }>({});

  const handleAdd = () => {
    const newItem: ProjectItemInput = {
      title: '',
      description: '',
      role: '',
      technologies: [],
      projectType: 'Personal',
      source: 'USER',
    };
    onChange([...projectsList, newItem]);
  };

  const handleUpdate = (index: number, fields: Partial<ProjectItemInput>) => {
    const updated = [...projectsList];
    updated[index] = { ...updated[index], ...fields };
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = projectsList.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleAddTech = (index: number) => {
    const text = techInput[index]?.trim();
    if (!text) return;
    const currentTech = projectsList[index].technologies || [];
    if (!currentTech.includes(text)) {
      handleUpdate(index, { technologies: [...currentTech, text] });
    }
    setTechInput({ ...techInput, [index]: '' });
  };

  const handleRemoveTech = (index: number, tech: string) => {
    const currentTech = projectsList[index].technologies || [];
    handleUpdate(index, { technologies: currentTech.filter((t) => t !== tech) });
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header text */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
          Step 05 — Portfolio Showcase
        </span>
        <h3 className="text-2xl font-bold font-display text-slate-900">
          Projects & Code Repositories
        </h3>
        <p className="text-xs sm:text-sm text-slate-600">
          Showcase your academic, personal, or hackathon projects. These are heavily weighted in PATHWAY.ECO job matching.
        </p>
      </div>

      <div className="space-y-6">
        {projectsList.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-3">
            <FolderGit2 className="w-10 h-10 text-indigo-600 mx-auto opacity-70" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">No projects added yet</p>
              <p className="text-xs text-slate-500">Adding projects helps recruiters and AI understand your hands-on build experience.</p>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-200 hover:bg-indigo-100 transition-colors"
            >
              + Add Project Entry
            </button>
          </div>
        ) : (
          projectsList.map((proj, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 relative group"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <FolderGit2 className="w-4 h-4 text-indigo-600" />
                  <span>Project #{idx + 1}</span>
                  {proj.source === 'RESUME' && (
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

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor={`proj-title-${idx}`} className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Project Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id={`proj-title-${idx}`}
                    type="text"
                    placeholder="e.g. AI-Powered Resume Autofill Engine"
                    value={proj.title || ''}
                    onChange={(e) => handleUpdate(idx, { title: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`proj-type-${idx}`} className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Project Type
                  </label>
                  <select
                    id={`proj-type-${idx}`}
                    value={proj.projectType || 'Personal'}
                    onChange={(e) => handleUpdate(idx, { projectType: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    {PROJECT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`proj-role-${idx}`} className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Your Role
                  </label>
                  <input
                    id={`proj-role-${idx}`}
                    type="text"
                    placeholder="e.g. Lead Full Stack Developer"
                    value={proj.role || ''}
                    onChange={(e) => handleUpdate(idx, { role: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor={`proj-desc-${idx}`} className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Project Overview & Achievements
                  </label>
                  <textarea
                    id={`proj-desc-${idx}`}
                    rows={2}
                    placeholder="Briefly describe what you built, key features, and outcomes..."
                    value={proj.description || ''}
                    onChange={(e) => handleUpdate(idx, { description: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`proj-github-${idx}`} className="block text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                    <Github className="w-3 h-3 text-indigo-600" /> GitHub Repository URL
                  </label>
                  <input
                    id={`proj-github-${idx}`}
                    type="url"
                    placeholder="https://github.com/username/project"
                    value={proj.githubUrl || ''}
                    onChange={(e) => handleUpdate(idx, { githubUrl: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`proj-demo-${idx}`} className="block text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                    <Globe className="w-3 h-3 text-indigo-600" /> Live Demo / Project URL
                  </label>
                  <input
                    id={`proj-demo-${idx}`}
                    type="url"
                    placeholder="https://myproject.com"
                    value={proj.projectUrl || ''}
                    onChange={(e) => handleUpdate(idx, { projectUrl: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Tech Tag Input */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor={`proj-tech-input-${idx}`} className="block text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-600" /> Technologies & Tools Used
                  </label>
                  <div className="flex gap-2">
                    <input
                      id={`proj-tech-input-${idx}`}
                      type="text"
                      placeholder="e.g. React, TypeScript, MongoDB"
                      value={techInput[idx] || ''}
                      onChange={(e) => setTechInput({ ...techInput, [idx]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTech(idx);
                        }
                      }}
                      className="flex-1 h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTech(idx)}
                      className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-200 hover:bg-indigo-100 transition-colors"
                    >
                      Add Tag
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(proj.technologies || []).map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-800 flex items-center gap-1 font-medium"
                      >
                        <span>{tech}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTech(idx, tech)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
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
          <Plus className="w-4 h-4" /> Add Project Entry
        </button>
      </div>
    </div>
  );
};
