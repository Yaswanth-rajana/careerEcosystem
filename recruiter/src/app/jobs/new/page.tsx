'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Briefcase,
  DollarSign,
  FileText,
  ListPlus,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { RecruiterShell } from '@/components/RecruiterShell';

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Remote, India');
  const [workMode, setWorkMode] = useState('Remote');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [experienceLevel, setExperienceLevel] = useState('3-5 years');
  const [skillsInput, setSkillsInput] = useState('');
  const [skills, setSkills] = useState<string[]>(['TypeScript', 'React', 'Node.js']);

  const [salaryMin, setSalaryMin] = useState<number | ''>(800000);
  const [salaryMax, setSalaryMax] = useState<number | ''>(1500000);
  const [salaryCurrency, setSalaryCurrency] = useState('INR');
  const [salaryPeriod, setSalaryPeriod] = useState('YEAR');

  const [description, setDescription] = useState(
    'We are seeking an experienced and passionate software engineer to join our growing engineering team. You will design, develop, and maintain resilient web applications, collaborating closely with product and design to build world-class candidate and recruiter workflows.'
  );

  const [responsibilities, setResponsibilities] = useState<string[]>([
    'Architect and implement scalable web applications and RESTful APIs.',
    'Collaborate with product designers and product managers to refine features.',
    'Write clean, test-driven, maintainable code with high performance benchmarks.',
  ]);
  const [respInput, setRespInput] = useState('');

  const [requirements, setRequirements] = useState<string[]>([
    '3+ years of professional full-stack development experience.',
    'Deep expertise in modern JavaScript/TypeScript, React, Next.js, and Node.js.',
    'Solid database design skills using relational or document databases.',
  ]);
  const [reqInput, setReqInput] = useState('');

  const [niceToHave, setNiceToHave] = useState<string[]>([
    'Experience with cloud infrastructure (AWS/GCP/Vercel).',
    'Understanding of microservices and event-driven patterns.',
  ]);
  const [niceInput, setNiceInput] = useState('');

  const [benefits, setBenefits] = useState<string[]>([
    'Flexible remote working model',
    'Comprehensive health insurance',
    'Annual learning and development stipend',
  ]);
  const [benefitInput, setBenefitInput] = useState('');

  function addSkill() {
    if (skillsInput.trim() && !skills.includes(skillsInput.trim())) {
      setSkills([...skills, skillsInput.trim()]);
      setSkillsInput('');
    }
  }

  function removeSkill(s: string) {
    setSkills(skills.filter((item) => item !== s));
  }

  function addToList(
    item: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    inputSetter: React.Dispatch<React.SetStateAction<string>>,
    list: string[]
  ) {
    if (item.trim()) {
      setter([...list, item.trim()]);
      inputSetter('');
    }
  }

  function removeFromList(
    index: number,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    list: string[]
  ) {
    setter(list.filter((_, i) => i !== index));
  }

  async function handleSubmit(publish: boolean) {
    setError(null);
    if (!title.trim()) {
      setError('Please provide a job title.');
      return;
    }
    if (description.trim().length < 50) {
      setError('Job description must be at least 50 characters.');
      return;
    }
    if (skills.length === 0) {
      setError('Please add at least one required skill.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        location: location.trim(),
        workMode,
        employmentType,
        experienceLevel,
        skills,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        salaryCurrency,
        salaryPeriod,
        description: description.trim(),
        responsibilities,
        requirements,
        niceToHave,
        benefits,
        status: publish ? 'PUBLISHED' : 'DRAFT',
      };

      const res = await fetch('/api/recruiter/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to create job posting');
      }

      router.push(`/jobs/${json.data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <RecruiterShell
      title="Create New Job Posting"
      subtitle="Publish an opening to the PATHWAY.ECO candidate marketplace or save as draft"
    >
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Section 1: Basic Role Details */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Briefcase className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">1. Job Details</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Full-Stack Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bengaluru, India or Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Work Mode</label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Employment Type</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Fresher">Fresher</option>
                <option value="0-1 years">0-1 years</option>
                <option value="1-3 years">1-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
              </select>
            </div>
          </div>

          {/* Skills Input */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700">
              Required Skills <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                placeholder="Type skill and press Enter or Add..."
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addSkill}
                className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 transition"
              >
                Add Skill
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSkill(s)}
                    className="hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Compensation */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">2. Compensation & Currency</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Minimum Salary</label>
              <input
                type="number"
                placeholder="800000"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value ? Number(e.target.value) : '')}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Maximum Salary</label>
              <input
                type="number"
                placeholder="1500000"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value ? Number(e.target.value) : '')}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Currency</label>
              <select
                value={salaryCurrency}
                onChange={(e) => setSalaryCurrency(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Period</label>
              <select
                value={salaryPeriod}
                onChange={(e) => setSalaryPeriod(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                <option value="YEAR">Per Year</option>
                <option value="MONTH">Per Month</option>
                <option value="HOUR">Per Hour</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Job Description & Details */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-semibold text-slate-900">3. Description & Responsibilities</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Overview Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              placeholder="Provide a compelling overview of the role, team, and mission..."
            />
          </div>

          {/* Responsibilities list */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">Core Responsibilities</label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                placeholder="Add a key responsibility..."
                value={respInput}
                onChange={(e) => setRespInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToList(respInput, setResponsibilities, setRespInput, responsibilities);
                  }
                }}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => addToList(respInput, setResponsibilities, setRespInput, responsibilities)}
                className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                Add
              </button>
            </div>
            <ul className="mt-2 space-y-1.5">
              {responsibilities.map((r, i) => (
                <li key={i} className="flex items-center justify-between gap-2 text-xs text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg">
                  <span>• {r}</span>
                  <button
                    type="button"
                    onClick={() => removeFromList(i, setResponsibilities, responsibilities)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Requirements list */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">Role Requirements</label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                placeholder="Add a required qualification or experience..."
                value={reqInput}
                onChange={(e) => setReqInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToList(reqInput, setRequirements, setReqInput, requirements);
                  }
                }}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => addToList(reqInput, setRequirements, setReqInput, requirements)}
                className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                Add
              </button>
            </div>
            <ul className="mt-2 space-y-1.5">
              {requirements.map((r, i) => (
                <li key={i} className="flex items-center justify-between gap-2 text-xs text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg">
                  <span>• {r}</span>
                  <button
                    type="button"
                    onClick={() => removeFromList(i, setRequirements, requirements)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit(false)}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow hover:bg-blue-700 transition"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Publish Job Immediately
          </button>
        </div>
      </div>
    </RecruiterShell>
  );
}
