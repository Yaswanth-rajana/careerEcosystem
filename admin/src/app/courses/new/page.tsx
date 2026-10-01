'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/AdminShell';
import { AdminBreadcrumbs } from '@/components/AdminBreadcrumbs';
import { fetchAdminApi } from '@/lib/apiHelper';
import {
  Plus,
  Trash2,
  BookOpen,
  Layers,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Video,
} from 'lucide-react';

interface LessonDraft {
  title: string;
  durationMin: number;
  type: 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'PROJECT';
  contentUrl?: string;
  contentBody?: string;
}

interface ModuleDraft {
  title: string;
  description?: string;
  lessons: LessonDraft[];
}

export default function NewCoursePage() {
  const router = useRouter();

  // Basic info state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [category, setCategory] = useState('Software Engineering');
  const [level, setLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER');
  const [instructorName, setInstructorName] = useState('');
  const [instructorTitle, setInstructorTitle] = useState('');
  const [durationHours, setDurationHours] = useState(10);
  const [skillsRaw, setSkillsRaw] = useState('React, TypeScript, Next.js');
  const [objectivesRaw, setObjectivesRaw] = useState(
    'Understand fundamental architecture patterns\nBuild production web applications\nDeploy containerized services'
  );
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');

  // Dynamic modules
  const [modules, setModules] = useState<ModuleDraft[]>([
    {
      title: 'Module 1: Getting Started & Foundations',
      description: 'Introduction to foundational patterns and setups',
      lessons: [
        { title: 'Course Orientation & Environment Setup', durationMin: 15, type: 'VIDEO' },
        { title: 'Core Architectural Concepts', durationMin: 25, type: 'VIDEO' },
      ],
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddModule = () => {
    setModules((prev) => [
      ...prev,
      {
        title: `Module ${prev.length + 1}: Next Phase`,
        description: '',
        lessons: [{ title: 'Lesson 1', durationMin: 15, type: 'VIDEO' }],
      },
    ]);
  };

  const handleRemoveModule = (mIdx: number) => {
    setModules((prev) => prev.filter((_, idx) => idx !== mIdx));
  };

  const handleAddLesson = (mIdx: number) => {
    setModules((prev) =>
      prev.map((mod, idx) => {
        if (idx !== mIdx) return mod;
        return {
          ...mod,
          lessons: [
            ...mod.lessons,
            {
              title: `Lesson ${mod.lessons.length + 1}`,
              durationMin: 15,
              type: 'VIDEO',
            },
          ],
        };
      })
    );
  };

  const handleRemoveLesson = (mIdx: number, lIdx: number) => {
    setModules((prev) =>
      prev.map((mod, idx) => {
        if (idx !== mIdx) return mod;
        return {
          ...mod,
          lessons: mod.lessons.filter((_, i) => i !== lIdx),
        };
      })
    );
  };

  const handleUpdateLessonTitle = (mIdx: number, lIdx: number, val: string) => {
    setModules((prev) =>
      prev.map((mod, idx) => {
        if (idx !== mIdx) return mod;
        return {
          ...mod,
          lessons: mod.lessons.map((les, i) => (i === lIdx ? { ...les, title: val } : les)),
        };
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !instructorName) {
      setError('Please fill out all required basic information fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const skills = skillsRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const learningObjectives = objectivesRaw
        .split('\n')
        .map((o) => o.trim())
        .filter(Boolean);

      const payload = {
        title,
        description,
        shortDescription: shortDescription || null,
        category,
        level,
        instructorName,
        instructorTitle: instructorTitle || null,
        durationHours: Number(durationHours) || 0,
        skills,
        learningObjectives,
        status,
        modules: modules.map((m, mIdx) => ({
          title: m.title,
          description: m.description,
          order: mIdx + 1,
          lessons: m.lessons.map((l, lIdx) => ({
            title: l.title,
            durationMin: Number(l.durationMin) || 10,
            type: l.type,
            order: lIdx + 1,
          })),
        })),
      };

      const res = await fetchAdminApi<{ course: { id: string } }>('/api/admin/courses', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      router.push(`/courses/${res.course.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminShell title="Create Structured Course">
      <AdminBreadcrumbs
        items={[
          { label: 'Courses', href: '/courses' },
          { label: 'New Course' },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Basic Information */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>1. Basic Course Details</span>
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-1">
                Course Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Distributed Systems Architecture with Go"
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-1">
                Short Tagline / Summary
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Concise 1-line elevator pitch for candidate cards"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-1">
                Comprehensive Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="In-depth explanation of what candidates will learn and build..."
                required
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 shadow-sm"
                >
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="AI / Data Science">AI / Data Science</option>
                  <option value="Design">Design</option>
                  <option value="Product">Product</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Business">Business</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-1">
                  Target Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 shadow-sm"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-1">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  min="1"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-1">
                  Instructor Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-1">
                  Instructor Professional Title
                </label>
                <input
                  type="text"
                  value={instructorTitle}
                  onChange={(e) => setInstructorTitle(e.target.value)}
                  placeholder="e.g. Principal Systems Architect"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Skills & Learning Objectives */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>2. Skills & Learning Objectives</span>
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-1">
                Target Skills (comma-separated)
              </label>
              <input
                type="text"
                value={skillsRaw}
                onChange={(e) => setSkillsRaw(e.target.value)}
                placeholder="TypeScript, Next.js, Docker, MongoDB"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-1">
                Learning Objectives (one per line)
              </label>
              <textarea
                rows={3}
                value={objectivesRaw}
                onChange={(e) => setObjectivesRaw(e.target.value)}
                placeholder="Master full-stack architecture principles&#10;Implement end-to-end type safety"
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Structured Modules & Lessons */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>3. Curriculum Modules & Lessons ({modules.length} Modules)</span>
            </h2>
            <button
              type="button"
              onClick={handleAddModule}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Module</span>
            </button>
          </div>

          <div className="space-y-4">
            {modules.map((mod, mIdx) => (
              <div
                key={mIdx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    value={mod.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setModules((prev) =>
                        prev.map((m, i) => (i === mIdx ? { ...m, title: val } : m))
                      );
                    }}
                    placeholder="Module Title"
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
                  />
                  {modules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveModule(mIdx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove Module"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Lessons in module */}
                <div className="pl-4 border-l-2 border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Lessons in this module
                  </span>

                  {mod.lessons.map((les, lIdx) => (
                    <div key={lIdx} className="flex items-center gap-2">
                      <Video className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <input
                        type="text"
                        value={les.title}
                        onChange={(e) => handleUpdateLessonTitle(mIdx, lIdx, e.target.value)}
                        placeholder="Lesson Title"
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-600 shadow-sm"
                      />
                      <input
                        type="number"
                        min="1"
                        value={les.durationMin}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setModules((prev) =>
                            prev.map((m, i) =>
                              i === mIdx
                                ? {
                                    ...m,
                                    lessons: m.lessons.map((l, j) =>
                                      j === lIdx ? { ...l, durationMin: val } : l
                                    ),
                                  }
                                : m
                            )
                          );
                        }}
                        title="Duration in minutes"
                        className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 text-center font-mono shadow-sm"
                      />
                      <span className="text-[11px] text-slate-500">min</span>
                      {mod.lessons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLesson(mIdx, lIdx)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleAddLesson(mIdx)}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 pt-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Lesson</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Initial Publication Status & Submit */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700">Initial State:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 shadow-sm"
            >
              <option value="DRAFT">Save as DRAFT</option>
              <option value="PUBLISHED">Publish Immediately</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/courses')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {isSubmitting && (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>Create Course Structure</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </AdminShell>
  );
}
