'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  User,
  Briefcase,
  Layers,
  Award,
  FileText,
  CheckCheck,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

interface ApplicationFormData {
  // Step 1: About You
  fullName: string;
  email: string;
  phone: string;
  location: string;

  // Step 2: Professional Experience
  currentRole: string;
  company: string;
  experienceYears: number;
  industry: string;
  linkedIn: string;
  gitHub: string;
  portfolio: string;

  // Step 3: Expertise
  domain: string;
  expertise: string[];
  additionalExpertise: string;

  // Step 4: Mentorship Offering
  offerings: string[];
  preferredSessionDuration: 30 | 45 | 60;
  startingPrice: number;

  // Step 5: Application Details
  whyMentor: string;
  whoToHelp: string;
  additionalInfo: string;

  // Step 6: Confirmation
  confirmAccuracy: boolean;
}

const DOMAIN_OPTIONS = [
  'Software Engineering',
  'AI / Data Science',
  'Product Management',
  'Engineering Leadership',
  'Design & UX',
  'Cloud & DevOps',
];

const DOMAIN_EXPERTISE_MAP: Record<string, string[]> = {
  'Software Engineering': [
    'System Design',
    'Frontend Architecture',
    'Backend Scalability',
    'Full Stack Development',
    'Microservices',
    'Clean Code & Refactoring',
    'Algorithms & Data Structures',
  ],
  'AI / Data Science': [
    'Large Language Models (LLMs)',
    'Computer Vision',
    'Deep Learning',
    'Data Pipelines & ETL',
    'MLOps & Production AI',
    'Statistical Modeling',
  ],
  'Product Management': [
    'Product Strategy',
    'Roadmapping & Prioritization',
    'User Research & Validation',
    'Go-to-Market Strategy',
    'Product Analytics & Metrics',
  ],
  'Engineering Leadership': [
    'Tech Lead Transition',
    'Engineering Management',
    'Hiring & Team Culture',
    'Executive Communication',
    'Architecture Governance',
  ],
  'Design & UX': [
    'Design Systems',
    'User Experience Research',
    'Interaction Design',
    'Figma Mastery',
    'Product Prototyping',
  ],
  'Cloud & DevOps': [
    'AWS / GCP Architecture',
    'Kubernetes & Containers',
    'CI/CD Automation',
    'Infrastructure as Code (Terraform)',
    'Observability & SRE',
  ],
};

const OFFERING_OPTIONS = [
  'Career Guidance',
  'Resume Review',
  'Mock Interview',
  'Technical Mentorship',
  'Career Switching',
  'Portfolio Review',
];

const STEPS = [
  { id: 1, name: 'About You', icon: User },
  { id: 2, name: 'Experience', icon: Briefcase },
  { id: 3, name: 'Expertise', icon: Layers },
  { id: 4, name: 'Offerings', icon: Award },
  { id: 5, name: 'Motivation', icon: FileText },
  { id: 6, name: 'Review', icon: CheckCheck },
];

export default function MentorApplyPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ApplicationFormData>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    currentRole: '',
    company: '',
    experienceYears: 3,
    industry: '',
    linkedIn: '',
    gitHub: '',
    portfolio: '',
    domain: 'Software Engineering',
    expertise: [],
    additionalExpertise: '',
    offerings: ['Career Guidance', 'Mock Interview'],
    preferredSessionDuration: 45,
    startingPrice: 0,
    whyMentor: '',
    whoToHelp: '',
    additionalInfo: '',
    confirmAccuracy: false,
  });

  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState(false);

  // Result state
  const [submissionResult, setSubmissionResult] = useState<{
    referenceId: string;
    status: string;
    duplicate?: boolean;
    createdAt: string;
  } | null>(null);

  // Pre-fill profile if authenticated
  useEffect(() => {
    async function loadPrefill() {
      try {
        const res = await fetch('/api/mentor-applications/prefill');
        const data = await res.json();
        if (data.prefill) {
          setFormData((prev) => ({
            ...prev,
            fullName: data.prefill.fullName || prev.fullName,
            email: data.prefill.email || prev.email,
            phone: data.prefill.phone ? data.prefill.phone.replace(/\D/g, '').slice(-10) : prev.phone,
            location: data.prefill.location || prev.location,
            currentRole: data.prefill.currentRole || prev.currentRole,
            experienceYears: data.prefill.experienceYears || prev.experienceYears,
            linkedIn: data.prefill.linkedIn || prev.linkedIn,
            gitHub: data.prefill.gitHub || prev.gitHub,
            portfolio: data.prefill.portfolio || prev.portfolio,
            expertise: data.prefill.expertise?.length > 0 ? data.prefill.expertise : prev.expertise,
          }));
          setPrefilled(true);
        }
      } catch {}
    }

    loadPrefill();
  }, [user]);

  // Check if applicant already has an active application
  useEffect(() => {
    async function checkExisting() {
      try {
        const res = await fetch('/api/mentor-applications');
        const data = await res.json();
        if (data.application && ['PENDING', 'UNDER_REVIEW'].includes(data.application.status)) {
          setSubmissionResult({
            referenceId: data.application.referenceId,
            status: data.application.status,
            duplicate: true,
            createdAt: data.application.createdAt,
          });
        }
      } catch {}
    }

    if (user) {
      checkExisting();
    }
  }, [user]);

  const updateField = (field: keyof ApplicationFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (stepErrors[field]) {
      setStepErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const toggleExpertise = (skill: string) => {
    setFormData((prev) => {
      const exists = prev.expertise.includes(skill);
      const next = exists ? prev.expertise.filter((s) => s !== skill) : [...prev.expertise, skill];
      return { ...prev, expertise: next };
    });
  };

  const toggleOffering = (offering: string) => {
    setFormData((prev) => {
      const exists = prev.offerings.includes(offering);
      const next = exists ? prev.offerings.filter((o) => o !== offering) : [...prev.offerings, offering];
      return { ...prev, offerings: next };
    });
  };

  // Step Validations
  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
        errors.fullName = 'Full Name is required (at least 2 characters).';
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        errors.email = 'Please provide a valid email address.';
      }
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (!cleanPhone || cleanPhone.length !== 10) {
        errors.phone = 'Please enter a valid 10-digit mobile number.';
      }
    } else if (currentStep === 2) {
      if (!formData.currentRole.trim() || formData.currentRole.trim().length < 2) {
        errors.currentRole = 'Current or most recent role is required.';
      }
      if (formData.experienceYears < 0) {
        errors.experienceYears = 'Experience years must be 0 or higher.';
      }
      if (formData.linkedIn && !formData.linkedIn.startsWith('http')) {
        errors.linkedIn = 'LinkedIn URL must start with http:// or https://';
      }
    } else if (currentStep === 3) {
      if (!formData.domain) {
        errors.domain = 'Please select a primary domain.';
      }
      if (formData.expertise.length === 0) {
        errors.expertise = 'Please select at least one area of expertise.';
      }
    } else if (currentStep === 4) {
      if (formData.offerings.length === 0) {
        errors.offerings = 'Please select at least one mentorship offering.';
      }
    } else if (currentStep === 5) {
      if (!formData.whyMentor.trim() || formData.whyMentor.trim().length < 20) {
        errors.whyMentor = 'Please provide a thoughtful motivation (minimum 20 characters).';
      }
      if (!formData.whoToHelp.trim() || formData.whoToHelp.trim().length < 10) {
        errors.whoToHelp = 'Please describe who you would like to help (minimum 10 characters).';
      }
    } else if (currentStep === 6) {
      if (!formData.confirmAccuracy) {
        errors.confirmAccuracy = 'You must confirm that the information provided is accurate.';
      }
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(STEPS.length, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    try {
      setIsSubmitting(true);
      setApiError(null);

      const payload = {
        ...formData,
        phone: formData.phone.startsWith('+') ? formData.phone : `+91 ${formData.phone.replace(/\D/g, '').slice(0, 10)}`,
      };

      const res = await fetch('/api/mentor-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit mentor application.');
      }

      setSubmissionResult({
        referenceId: data.referenceId,
        status: data.status || 'PENDING',
        duplicate: data.duplicate,
        createdAt: data.createdAt,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setApiError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // Success Confirmation Screen (Section 12)
  // ----------------------------------------------------
  if (submissionResult) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#F8FAFC] text-slate-900 font-sans">
        <Header />

        <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-16 flex items-center justify-center">
          <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-12 text-center space-y-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                Application Received ✓
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
                Thank you for your interest in becoming a PATHWAY.ECO mentor.
              </h1>
              <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                We&apos;ve received your application and our team will review it. We review applicant experience, domain expertise, and mentorship offerings.
              </p>
            </div>

            {/* Reference & Status Card */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto text-left space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Application ID:</span>
                <span className="font-mono font-bold text-base text-blue-600 tracking-tight">
                  {submissionResult.referenceId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status:</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Under Review</span>
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed space-y-2">
              <p>
                We&apos;ll notify you by email once a decision has been made. If approved, you will receive a secure welcome link to activate your mentor account and access the Mentor Workspace.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/mentors"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-sm"
              >
                Return to Mentors
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ----------------------------------------------------
  // Multi-step Application Form
  // ----------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8FAFC] text-slate-900 font-sans">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Breadcrumbs / Title */}
        <div className="mb-8 space-y-2 text-left">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/mentors" className="hover:text-blue-600 transition-colors">
              Mentors
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-900">Become a Mentor</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
                Apply to become a PATHWAY.ECO Mentor
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Share your industry experience and guide students, graduates, and professionals toward career milestones.
              </p>
            </div>

            {prefilled && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Profile details pre-filled</span>
              </div>
            )}
          </div>
        </div>

        {/* Step Progress Stepper */}
        <div className="mb-8 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between min-w-[560px]">
            {STEPS.map((step) => {
              const StepIcon = step.icon;
              const isPassed = step.id < currentStep;
              const isCurrent = step.id === currentStep;

              return (
                <div
                  key={step.id}
                  onClick={() => {
                    if (step.id < currentStep) setCurrentStep(step.id);
                  }}
                  className={`flex items-center gap-2.5 transition-all ${
                    step.id < currentStep ? 'cursor-pointer opacity-90 hover:opacity-100' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                      isPassed
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isPassed ? <Check className="w-4 h-4 stroke-[2.5]" /> : <StepIcon className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Step {step.id}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isCurrent ? 'text-blue-600' : isPassed ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* API Error Banner */}
        {apiError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 text-left">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">Submission Error</span>
              <p>{apiError}</p>
            </div>
          </div>
        )}

        {/* Step Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-left space-y-6">
          {/* STEP 1: About You */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900 font-display">Personal Details</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  How should we address you and reach out with application updates?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    placeholder="e.g. Siddharth Verma"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                  {stepErrors.fullName && (
                    <p className="text-rose-600 text-xs mt-1">{stepErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="e.g. siddharth@example.com"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                  {stepErrors.email && (
                    <p className="text-rose-600 text-xs mt-1">{stepErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number *
                  </label>
                  <div className="flex rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-600 focus-within:bg-white transition">
                    <div className="px-3.5 py-2.5 bg-slate-100/90 border-r border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 select-none shrink-0">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      required
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length === 12 && val.startsWith('91')) {
                          val = val.slice(2);
                        }
                        updateField('phone', val.slice(0, 10));
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === 'e' ||
                          e.key === 'E' ||
                          e.key === '+' ||
                          e.key === '-' ||
                          e.key === '.' ||
                          e.key === ' ' ||
                          (/^[a-zA-Z]$/.test(e.key) && !e.ctrlKey && !e.metaKey)
                        ) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="9876543210"
                      className="w-full px-3.5 py-2.5 text-sm bg-transparent focus:outline-none placeholder:text-slate-400"
                    />
                  </div>
                  {stepErrors.phone && (
                    <p className="text-rose-600 text-xs mt-1">{stepErrors.phone}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Location / City
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    placeholder="e.g. Bengaluru, India or Remote"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Professional Experience */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900 font-display">Professional Background</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your current industry credentials and relevant profile links.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Current / Most Recent Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.currentRole}
                    onChange={(e) => updateField('currentRole', e.target.value)}
                    placeholder="e.g. Senior Staff Engineer"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                  {stepErrors.currentRole && (
                    <p className="text-rose-600 text-xs mt-1">{stepErrors.currentRole}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => updateField('company', e.target.value)}
                    placeholder="e.g. Google, Flipkart, or Stealth"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Years of Professional Experience *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    required
                    value={formData.experienceYears}
                    onChange={(e) => updateField('experienceYears', parseInt(e.target.value || '0', 10))}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                  {stepErrors.experienceYears && (
                    <p className="text-rose-600 text-xs mt-1">{stepErrors.experienceYears}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => updateField('industry', e.target.value)}
                    placeholder="e.g. FinTech, SaaS, HealthTech"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedIn}
                    onChange={(e) => updateField('linkedIn', e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                  {stepErrors.linkedIn && (
                    <p className="text-rose-600 text-xs mt-1">{stepErrors.linkedIn}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    GitHub Profile URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.gitHub}
                    onChange={(e) => updateField('gitHub', e.target.value)}
                    placeholder="https://github.com/yourhandle"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Portfolio / Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.portfolio}
                    onChange={(e) => updateField('portfolio', e.target.value)}
                    placeholder="https://yourportfolio.dev"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Expertise */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900 font-display">Domain &amp; Areas of Expertise</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select your primary discipline and specialized topics for candidate discovery.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Primary Domain *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {DOMAIN_OPTIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => updateField('domain', d)}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                        formData.domain === d
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Specialized Skills &amp; Focus Areas *
                </label>
                <div className="flex flex-wrap gap-2">
                  {(DOMAIN_EXPERTISE_MAP[formData.domain] || DOMAIN_EXPERTISE_MAP['Software Engineering']).map(
                    (skill) => {
                      const selected = formData.expertise.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleExpertise(skill)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                            selected
                              ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    }
                  )}
                </div>
                {stepErrors.expertise && (
                  <p className="text-rose-600 text-xs mt-1.5">{stepErrors.expertise}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Additional Skills or Tooling (Optional)
                </label>
                <input
                  type="text"
                  value={formData.additionalExpertise}
                  onChange={(e) => updateField('additionalExpertise', e.target.value)}
                  placeholder="e.g. Next.js, Rust, Distributed Caching, PyTorch"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Mentorship Offering */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900 font-display">Mentorship Offerings</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  What session formats will you offer to students and candidates?
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Supported Mentorship Formats *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {OFFERING_OPTIONS.map((offering) => {
                    const selected = formData.offerings.includes(offering);
                    return (
                      <div
                        key={offering}
                        onClick={() => toggleOffering(offering)}
                        className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                          selected
                            ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="text-xs font-semibold">{offering}</span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center text-white transition-all ${
                            selected ? 'bg-blue-600 border-blue-600 shadow-sm' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {selected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {stepErrors.offerings && (
                  <p className="text-rose-600 text-xs mt-1.5">{stepErrors.offerings}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Preferred Session Duration
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => updateField('preferredSessionDuration', mins)}
                      className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                        formData.preferredSessionDuration === mins
                          ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {mins} Minutes
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  PATHWAY.ECO curates fair session fee benchmarks based on domain and student cohort tiers. You will be able to customize session availability and rates after approval in your Mentor Workspace.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: Motivation & Goals */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900 font-display">Mentorship Philosophy</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Help the review board understand your motivations and candidate focus.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Why do you want to become a PATHWAY.ECO mentor? *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.whyMentor}
                  onChange={(e) => updateField('whyMentor', e.target.value)}
                  placeholder="Share what drives you to mentor and how your background will empower candidates..."
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition leading-relaxed"
                />
                {stepErrors.whyMentor && (
                  <p className="text-rose-600 text-xs mt-1">{stepErrors.whyMentor}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Who would you like to help most? *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.whoToHelp}
                  onChange={(e) => updateField('whoToHelp', e.target.value)}
                  placeholder="e.g. Undergraduates seeking first software engineering internships, career switchers into AI..."
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition leading-relaxed"
                />
                {stepErrors.whoToHelp && (
                  <p className="text-rose-600 text-xs mt-1">{stepErrors.whoToHelp}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Anything else we should know? (Optional)
                </label>
                <input
                  type="text"
                  value={formData.additionalInfo}
                  onChange={(e) => updateField('additionalInfo', e.target.value)}
                  placeholder="Any awards, speaking engagements, or specific timezone preferences..."
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>
            </div>
          )}

          {/* STEP 6: Review & Submit */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900 font-display">Review Your Application</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Please review all provided details before submitting for administrative review.
                </p>
              </div>

              <div className="space-y-4">
                {/* Summary Card 1 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                      Applicant Identity
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Name</span>
                      <span className="font-semibold text-slate-800">{formData.fullName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Email</span>
                      <span className="font-semibold text-slate-800">{formData.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Phone</span>
                      <span className="font-semibold text-slate-800">
                        {formData.phone ? `+91 ${formData.phone}` : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Location</span>
                      <span className="font-semibold text-slate-800">{formData.location || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Summary Card 2 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                      Professional Credentials
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Current Role</span>
                      <span className="font-semibold text-slate-800">{formData.currentRole}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Company</span>
                      <span className="font-semibold text-slate-800">{formData.company || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Experience</span>
                      <span className="font-semibold text-slate-800">{formData.experienceYears} Years</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">LinkedIn</span>
                      <span className="font-semibold text-slate-800 truncate block">
                        {formData.linkedIn || 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Summary Card 3 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                      Expertise &amp; Offerings
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-2 text-slate-600 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Domain:</span>
                      <span className="font-semibold text-slate-800">{formData.domain}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {formData.expertise.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[11px] font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-1.5">
                      {formData.offerings.map((o) => (
                        <span
                          key={o}
                          className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[11px] font-medium"
                        >
                          {o}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirmation Checkbox (Section 8) */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-2xl bg-blue-50/50 border border-blue-100 hover:bg-blue-50/80 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.confirmAccuracy}
                    onChange={(e) => updateField('confirmAccuracy', e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center text-white shrink-0 transition-all ${
                      formData.confirmAccuracy
                        ? 'bg-blue-600 border-blue-600 shadow-sm ring-2 ring-blue-100'
                        : 'border-slate-300 bg-white hover:border-blue-400'
                    }`}
                  >
                    {formData.confirmAccuracy && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 leading-snug select-none">
                    I confirm that the information provided is accurate and represents my authentic professional experience.
                  </span>
                </label>
                {stepErrors.confirmAccuracy && (
                  <p className="text-rose-600 text-xs mt-1.5">{stepErrors.confirmAccuracy}</p>
                )}
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md flex items-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Mentor Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
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
