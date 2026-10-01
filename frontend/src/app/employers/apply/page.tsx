'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  Building2,
  User,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Globe,
  Sparkles,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

const INDUSTRIES = [
  'Technology & Software',
  'Fintech & Financial Services',
  'Healthcare & Biotech',
  'E-Commerce & Retail',
  'EdTech & Education',
  'Consulting & Professional Services',
  'Manufacturing & Robotics',
  'Media & Entertainment',
  'Other',
];

const COMPANY_SIZES = [
  '1-10 (Seed / Early Stage)',
  '11-50 (Startup)',
  '51-200 (Growth Stage)',
  '201-1000 (Mid-Market)',
  '1000+ (Enterprise)',
];

const WORK_MODES = ['Remote', 'Hybrid', 'On-site'];

const COMMON_ROLES = [
  'Software Engineer (Frontend / Backend / Fullstack)',
  'Data Scientist / AI Engineer',
  'DevOps & Cloud Engineer',
  'Product Manager',
  'Product Designer (UI/UX)',
  'Business Analyst',
  'Cybersecurity Analyst',
  'Marketing & Growth Specialist',
];

const EXPERIENCE_LEVELS = [
  'Fresher / College Graduate',
  '0-1 Years Experience',
  '1-3 Years Experience',
  '3-5 Years Experience',
  '5+ Years Senior / Lead',
];

export default function EmployerApplyPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: About You
    fullName: '',
    workEmail: '',
    phone: '',
    designation: '',
    linkedInUrl: '',

    // Step 2: Company
    companyName: '',
    companyWebsite: '',
    companyLinkedIn: '',
    industry: 'Technology & Software',
    companySize: '11-50 (Startup)',
    headquartersLocation: '',

    // Step 3: Hiring
    rolesHired: [] as string[],
    customRole: '',
    hiringVolume: '1-5 hires per quarter',
    preferredExperienceLevels: [] as string[],
    hiringLocations: ['India (Remote / Hybrid)'],
    workModes: ['Remote', 'Hybrid'] as string[],

    // Step 4: Verification
    verificationNotes: '',
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMessage(null);
  };

  const toggleArrayItem = (field: 'rolesHired' | 'preferredExperienceLevels' | 'workModes', item: string) => {
    setFormData((prev) => {
      const current = prev[field] as string[];
      if (current.includes(item)) {
        return { ...prev, [field]: current.filter((x) => x !== item) };
      } else {
        return { ...prev, [field]: [...current, item] };
      }
    });
  };

  const handleAddCustomRole = () => {
    if (formData.customRole.trim() && !formData.rolesHired.includes(formData.customRole.trim())) {
      setFormData((prev) => ({
        ...prev,
        rolesHired: [...prev.rolesHired, prev.customRole.trim()],
        customRole: '',
      }));
    }
  };

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (!formData.fullName.trim() || formData.fullName.length < 2) {
        setErrorMessage('Please provide your full name.');
        return false;
      }
      if (!formData.workEmail.trim() || !formData.workEmail.includes('@')) {
        setErrorMessage('Please provide a valid work email address.');
        return false;
      }
      if (!formData.phone.trim() || formData.phone.length < 7) {
        setErrorMessage('Please provide a valid phone number.');
        return false;
      }
      if (!formData.designation.trim()) {
        setErrorMessage('Please specify your designation / title.');
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.companyName.trim()) {
        setErrorMessage('Please enter your company name.');
        return false;
      }
      if (!formData.companyWebsite.trim() || !formData.companyWebsite.startsWith('http')) {
        setErrorMessage('Please provide a valid company website starting with http:// or https://');
        return false;
      }
      if (!formData.headquartersLocation.trim()) {
        setErrorMessage('Please specify your company headquarters location.');
        return false;
      }
    } else if (currentStep === 3) {
      if (formData.rolesHired.length === 0) {
        setErrorMessage('Please select or specify at least one role you are looking to hire.');
        return false;
      }
    }
    setErrorMessage(null);
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(5, prev + 1));
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setErrorMessage(null);
    setStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const res = await fetch('/api/employer-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          workEmail: formData.workEmail.trim(),
          phone: formData.phone.trim(),
          designation: formData.designation.trim(),
          linkedInUrl: formData.linkedInUrl.trim() || null,
          companyName: formData.companyName.trim(),
          companyWebsite: formData.companyWebsite.trim(),
          companyLinkedIn: formData.companyLinkedIn.trim() || null,
          industry: formData.industry,
          companySize: formData.companySize,
          headquartersLocation: formData.headquartersLocation.trim(),
          rolesHired: formData.rolesHired,
          hiringVolume: formData.hiringVolume,
          preferredExperienceLevels: formData.preferredExperienceLevels,
          hiringLocations: formData.hiringLocations,
          workModes: formData.workModes,
          verificationNotes: formData.verificationNotes.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application.');
      }

      setSubmittedRef(data.referenceId || 'EMP-2026-SUBMITTED');
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION STATE
  if (submittedRef) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Header />
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-6 shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h1 className="text-3xl font-display font-extrabold text-slate-900 mb-2">
            Employer Application Received
          </h1>
          <p className="text-slate-600 text-base max-w-md mx-auto mb-6">
            Thank you for applying to hire with PATHWAY.ECO. Your company profile has been submitted for verification.
          </p>

          <div className="w-full max-w-md bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-left mb-8 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs text-slate-500 uppercase font-semibold">Application Reference</span>
              <span className="font-mono text-sm font-bold text-blue-600">{submittedRef}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs text-slate-500 uppercase font-semibold">Company</span>
              <span className="text-sm font-semibold text-slate-800">{formData.companyName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 uppercase font-semibold">Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                Under Review
              </span>
            </div>
          </div>

          <div className="max-w-md w-full bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left text-xs text-slate-600 space-y-2 mb-8">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">What happens next?</h4>
            <p>1. <strong>Verification:</strong> Our team reviews your company details and work domain.</p>
            <p>2. <strong>Account Activation:</strong> Once approved, you will receive an email at <strong>{formData.workEmail}</strong> with an activation link to set your password and access the Employer Portal.</p>
            <p>3. <strong>Post Jobs:</strong> Create opportunities, review candidates, and conduct hiring pipelines directly inside your dedicated workspace.</p>
          </div>

          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Return to Homepage
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Banner Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> For Employers & Recruiters
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Hire Exceptional Pre-Vetted Talent
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Connect with motivated candidates who have proven real skills through structured roadmaps, hands-on projects, and mentorship.
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center justify-between max-w-2xl mx-auto bg-white p-3 rounded-2xl border border-slate-200 shadow-sm text-xs">
          {[
            { num: 1, label: 'About You' },
            { num: 2, label: 'Company' },
            { num: 3, label: 'Hiring' },
            { num: 4, label: 'Verification' },
            { num: 5, label: 'Review' },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-2 ${
                step === s.num
                  ? 'text-blue-600 font-bold'
                  : step > s.num
                  ? 'text-emerald-600 font-semibold'
                  : 'text-slate-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s.num
                    ? 'bg-blue-600 text-white'
                    : step > s.num
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </div>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Multi-step Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {/* STEP 1: About You */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold font-display text-slate-900">Step 1 — About You</h2>
                <p className="text-xs text-slate-500">Provide your contact and professional details.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Work Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.workEmail}
                    onChange={(e) => updateField('workEmail', e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Please use your official company domain email.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation / Role <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => updateField('designation', e.target.value)}
                    placeholder="e.g. Head of Talent Acquisition / Tech Recruiter"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedInUrl}
                    onChange={(e) => updateField('linkedInUrl', e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Company */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold font-display text-slate-900">Step 2 — Company Information</h2>
                <p className="text-xs text-slate-500">Tell us about your organization and hiring presence.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    placeholder="e.g. Acme Innovations Inc."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Website <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={formData.companyWebsite}
                    onChange={(e) => updateField('companyWebsite', e.target.value)}
                    placeholder="https://acme.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Industry <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => updateField('industry', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Size <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.companySize}
                    onChange={(e) => updateField('companySize', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                  >
                    {COMPANY_SIZES.map((sz) => (
                      <option key={sz} value={sz}>{sz}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Headquarters / Primary Location <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.headquartersLocation}
                    onChange={(e) => updateField('headquartersLocation', e.target.value)}
                    placeholder="e.g. Bengaluru, India or San Francisco, CA"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company LinkedIn Page
                  </label>
                  <input
                    type="url"
                    value={formData.companyLinkedIn}
                    onChange={(e) => updateField('companyLinkedIn', e.target.value)}
                    placeholder="https://linkedin.com/company/acme"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Hiring */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold font-display text-slate-900">Step 3 — Hiring Preferences</h2>
                <p className="text-xs text-slate-500">Select what types of roles and talent you intend to discover.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Roles Commonly Hired <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COMMON_ROLES.map((role) => {
                    const isSelected = formData.rolesHired.includes(role);
                    return (
                      <button
                        type="button"
                        key={role}
                        onClick={() => toggleArrayItem('rolesHired', role)}
                        className={`text-left p-2.5 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {role}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Role Input */}
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={formData.customRole}
                    onChange={(e) => updateField('customRole', e.target.value)}
                    placeholder="Or type another role..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomRole}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expected Quarterly Hiring Volume
                  </label>
                  <select
                    value={formData.hiringVolume}
                    onChange={(e) => updateField('hiringVolume', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                  >
                    <option value="1-5 hires per quarter">1-5 hires per quarter</option>
                    <option value="5-15 hires per quarter">5-15 hires per quarter</option>
                    <option value="15-50 hires per quarter">15-50 hires per quarter</option>
                    <option value="50+ hires per quarter">50+ hires per quarter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supported Work Modes
                  </label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {WORK_MODES.map((mode) => (
                      <button
                        type="button"
                        key={mode}
                        onClick={() => toggleArrayItem('workModes', mode)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          formData.workModes.includes(mode)
                            ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Experience Levels
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {EXPERIENCE_LEVELS.map((exp) => (
                    <button
                      type="button"
                      key={exp}
                      onClick={() => toggleArrayItem('preferredExperienceLevels', exp)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        formData.preferredExperienceLevels.includes(exp)
                          ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {exp}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Verification */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold font-display text-slate-900">Step 4 — Verification & Notes</h2>
                <p className="text-xs text-slate-500">Provide any additional verification details to expedite approval.</p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-950">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Employer Trust & Safety Policy
                </div>
                <p>
                  To protect candidates, PATHWAY.ECO requires verified company identity before opening job posting privileges. Applications submitted with generic personal emails (such as @gmail or @yahoo) may experience delays or require additional domain verification.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Verification Notes / Company Description
                </label>
                <textarea
                  value={formData.verificationNotes}
                  onChange={(e) => updateField('verificationNotes', e.target.value)}
                  rows={4}
                  placeholder="Share details about your hiring plans, tech stack, or any specific candidate requirements..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Review & Submit */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold font-display text-slate-900">Step 5 — Review & Confirm</h2>
                <p className="text-xs text-slate-500">Please review your employer application details before submitting.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Your Information</h4>
                  <p><strong className="text-slate-700">Name:</strong> {formData.fullName}</p>
                  <p><strong className="text-slate-700">Email:</strong> {formData.workEmail}</p>
                  <p><strong className="text-slate-700">Phone:</strong> {formData.phone}</p>
                  <p><strong className="text-slate-700">Designation:</strong> {formData.designation}</p>
                  {formData.linkedInUrl && <p><strong className="text-slate-700">LinkedIn:</strong> {formData.linkedInUrl}</p>}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Company Information</h4>
                  <p><strong className="text-slate-700">Company:</strong> {formData.companyName}</p>
                  <p><strong className="text-slate-700">Website:</strong> {formData.companyWebsite}</p>
                  <p><strong className="text-slate-700">Industry:</strong> {formData.industry}</p>
                  <p><strong className="text-slate-700">Size:</strong> {formData.companySize}</p>
                  <p><strong className="text-slate-700">Headquarters:</strong> {formData.headquartersLocation}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Hiring Profile</h4>
                <p><strong className="text-slate-700">Roles:</strong> {formData.rolesHired.join(', ')}</p>
                <p><strong className="text-slate-700">Volume:</strong> {formData.hiringVolume}</p>
                <p><strong className="text-slate-700">Work Modes:</strong> {formData.workModes.join(', ')}</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                <p className="font-semibold mb-1">Server Verification & Idempotency Guarantee</p>
                <p>
                  Your application will be marked <strong>PENDING</strong> for administrator verification. No candidate or job records will be compromised during account provisioning.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : <div />}

            {step < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                {isSubmitting ? (
                  <>Submitting Application...</>
                ) : (
                  <>Submit Application <CheckCircle2 className="w-4 h-4" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
