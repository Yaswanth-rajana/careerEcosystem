'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  Award,
  Users,
  FileCheck2,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { RecruiterShell } from '@/components/RecruiterShell';
import { EmptyState } from '@/components/EmptyState';
import { RecruiterAssessmentDTO } from '@backend/types/recruiter';

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<RecruiterAssessmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('MCQ');
  const [timeLimit, setTimeLimit] = useState(30);
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<any[]>([
    {
      question: 'Which HTTP method should be used for idempotent resource replacement in REST?',
      type: 'MCQ',
      options: ['PUT', 'POST', 'PATCH', 'CONNECT'],
      correctAnswer: 'PUT',
      points: 10,
    },
    {
      question: 'In React, which hook is optimal for memoizing complex derived calculations?',
      type: 'MCQ',
      options: ['useMemo', 'useEffect', 'useCallback', 'useRef'],
      correctAnswer: 'useMemo',
      points: 10,
    },
  ]);

  const [newQText, setNewQText] = useState('');
  const [newQOptions, setNewQOptions] = useState('');
  const [newQAnswer, setNewQAnswer] = useState('');

  useEffect(() => {
    fetchAssessments();
  }, []);

  async function fetchAssessments() {
    setLoading(true);
    try {
      const res = await fetch('/api/recruiter/assessments');
      const json = await res.json();
      if (json.success) setAssessments(json.data || []);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }

  function addQuestion() {
    if (!newQText.trim()) return;
    const opts = newQOptions
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setQuestions([
      ...questions,
      {
        question: newQText.trim(),
        type: 'MCQ',
        options: opts.length ? opts : undefined,
        correctAnswer: newQAnswer.trim() || undefined,
        points: 10,
      },
    ]);
    setNewQText('');
    setNewQOptions('');
    setNewQAnswer('');
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  async function handleCreateAssessment(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || questions.length === 0) {
      alert('Please provide a title and at least one question.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/recruiter/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          type,
          timeLimitMinutes: Number(timeLimit),
          passingScore: Number(passingScore),
          questions,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to create assessment');
      }

      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      fetchAssessments();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <RecruiterShell
      title="Candidate Assessments"
      subtitle="Standardized skill evaluations and role-specific testing benchmarks"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Assessments test candidates on verifiable skills before final interview rounds.
          </p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            Create Assessment
          </button>
        </div>

        {/* Assessment Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading assessments...</div>
        ) : !assessments.length ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8">
            <EmptyState
              title="No assessments configured"
              description="Create a technical evaluation or MCQ test to filter candidate quality."
              actionText="Create First Assessment"
              actionClick={() => setShowCreateModal(true)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {assessments.map((ass) => (
              <div
                key={ass.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase">
                      {ass.type}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600">
                      Pass: {ass.passingScore}%
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mt-2">{ass.title}</h3>
                  {ass.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{ass.description}</p>
                  )}
                  {ass.jobTitle && (
                    <p className="text-xs text-slate-600 mt-2 font-medium">
                      Linked: <span className="text-slate-800">{ass.jobTitle}</span>
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {ass.timeLimitMinutes} mins
                  </span>
                  <span>{ass.questionsCount} questions</span>
                  <span className="font-medium text-slate-700">
                    {ass.submissionsCount} submissions
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Assessment Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl space-y-4 my-8">
              <h3 className="text-base font-semibold text-slate-900">Create Assessment</h3>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateAssessment} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700">Assessment Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Full-Stack JavaScript & Systems Assessment"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Instructions and requirements for the candidate..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700">Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    >
                      <option value="MCQ">Multiple Choice</option>
                      <option value="CODING">Coding Challenge</option>
                      <option value="ESSAY">Short Essay</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700">Time Limit (mins)</label>
                    <input
                      type="number"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700">Passing Score (%)</label>
                    <input
                      type="number"
                      value={passingScore}
                      onChange={(e) => setPassingScore(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Questions Builder */}
                <div className="border-t border-slate-200 pt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-800">
                      Questions ({questions.length})
                    </h4>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {questions.map((q, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg bg-slate-50 p-2.5 flex items-start justify-between gap-2 border border-slate-100"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">
                            Q{idx + 1}: {q.question}
                          </p>
                          {q.options && (
                            <p className="text-slate-500 text-[11px] mt-0.5">
                              Options: {q.options.join(', ')}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeQuestion(idx)}
                          className="text-slate-400 hover:text-red-600 flex-shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Question Sub-form */}
                  <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50 space-y-2">
                    <p className="font-medium text-slate-700 text-[11px]">Add New Question</p>
                    <input
                      type="text"
                      placeholder="Question prompt..."
                      value={newQText}
                      onChange={(e) => setNewQText(e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Comma-separated options (A, B, C, D)..."
                        value={newQOptions}
                        onChange={(e) => setNewQOptions(e.target.value)}
                        className="rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Correct answer..."
                        value={newQAnswer}
                        onChange={(e) => setNewQAnswer(e.target.value)}
                        className="rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="rounded bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-300 transition"
                    >
                      + Add Question
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Save Assessment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RecruiterShell>
  );
}
