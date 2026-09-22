'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { OnboardingHeader } from './OnboardingHeader';
import { OnboardingProgress } from './OnboardingProgress';
import { ResumeUploadBanner } from './ResumeUploadBanner';
import { ResumeReviewModal } from './ResumeReviewModal';

import { PersonalInfoStep } from './steps/PersonalInfoStep';
import { EducationStep } from './steps/EducationStep';
import { ExperienceStep } from './steps/ExperienceStep';
import { SkillsStep } from './steps/SkillsStep';
import { ProjectsStep } from './steps/ProjectsStep';
import { CareerDirectionStep } from './steps/CareerDirectionStep';
import { ReviewStep } from './steps/ReviewStep';

import {
  FullOnboardingPayload,
  Step1AboutYouInput,
  EducationItemInput,
  ExperienceItemInput,
  UserSkillInput,
  ProjectItemInput,
  Step6CareerDirectionInput,
  Step7PreferencesInput,
} from '@backend/validations/onboardingSchemas';
import { ParsedResumeData } from '@backend/services/resumeParserService';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { findCareerSlugByTitle, getCareerPathBySlug, setSavedTargetRole } from '@/lib/careers/career-repository';

export const OnboardingShell: React.FC = () => {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isResumed, setIsResumed] = useState<boolean>(false);

  // Resume Modal State
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [parsedResumeData, setParsedResumeData] = useState<ParsedResumeData | null>(null);
  const [resumeFilename, setResumeFilename] = useState('');

  // Main Form Payload
  const [payload, setPayload] = useState<FullOnboardingPayload>({
    aboutYou: {
      name: '',
      phone: '',
      location: '',
      candidateType: 'STUDENT',
      headline: '',
      bio: '',
    },
    education: [],
    hasNoExperience: false,
    experience: [],
    skills: [],
    projects: [],
    careerDirection: {
      targetRole: '',
      careerField: '',
      targetIndustry: '',
      careerGoalType: 'Get my first job',
      timeframe: 'Immediate (1-3 months)',
      notes: '',
    },
    preferences: {
      preferredJobType: 'Full-time',
      preferredLocation: '',
      workEnvironment: 'Remote',
      willingToRelocate: false,
      preferredIndustries: [],
      preferredSalaryRange: '',
      learningStyle: ['Hands-on projects', 'Structured Courses'],
      availableHoursPerWeek: '5–10 hours/week',
      mentorshipNeeds: ['Career direction'],
    },
    certifications: [],
    achievements: [],
    professionalLinks: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-save debounce ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial onboarding state
  useEffect(() => {
    let isMounted = true;
    const fetchState = async () => {
      try {
        const res = await fetch('/api/onboarding');
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login');
            return;
          }
        }
        const data = await res.json();

        if (isMounted && data) {
          const restoredStep = data.progress?.currentStep || 1;
          const restoredCompleted = data.progress?.completedSteps || [];
          
          if (restoredStep > 1 || restoredCompleted.length > 0) {
            setIsResumed(true);
          }

          setCurrentStep(restoredStep);
          setCompletedSteps(restoredCompleted);

          // Populate payload from normalized profile and user
          if (data.profile || data.name) {
            setPayload({
              aboutYou: {
                name: data.name || user?.name || '',
                phone: data.profile?.phone || '',
                location: data.profile?.location || '',
                candidateType: (data.profile?.candidateType as any) || 'STUDENT',
                headline: data.profile?.headline || '',
                bio: data.profile?.bio || '',
              },
              education: (data.profile?.education || []).map((e: any) => ({
                id: e.id,
                institution: e.institution,
                degree: e.degree,
                fieldOfStudy: e.fieldOfStudy,
                location: e.location || '',
                startYear: e.startYear,
                endYear: e.endYear,
                isCurrent: e.isCurrent,
                gpa: e.gpa || '',
                coursework: e.coursework || '',
                source: e.source || 'USER',
              })),
              hasNoExperience: data.profile?.experience?.length === 0,
              experience: (data.profile?.experience || []).map((exp: any) => ({
                id: exp.id,
                company: exp.company,
                roleTitle: exp.roleTitle,
                employmentType: exp.employmentType || 'Full-time',
                location: exp.location || '',
                startDate: exp.startDate,
                endDate: exp.endDate,
                isCurrent: exp.isCurrent,
                description: exp.description || '',
                source: exp.source || 'USER',
              })),
              skills: (data.profile?.userSkills || []).map((us: any) => ({
                id: us.id,
                name: us.skill?.name || 'Skill',
                category: us.skill?.category || 'General',
                level: (us.level as any) || 'INTERMEDIATE',
                source: (us.source as any) || 'USER',
                verified: Boolean(us.verified),
              })),
              projects: (data.profile?.projects || []).map((p: any) => ({
                id: p.id,
                title: p.title,
                description: p.description || '',
                role: p.role || '',
                technologies: p.technologies || [],
                projectType: p.projectType || 'Personal',
                projectUrl: p.projectUrl || '',
                githubUrl: p.githubUrl || '',
                source: p.source || 'USER',
              })),
              careerDirection: {
                targetRole: data.profile?.careerGoal?.targetRole || '',
                careerField: data.profile?.careerGoal?.careerField || '',
                targetIndustry: data.profile?.careerGoal?.targetIndustry || '',
                careerGoalType: data.profile?.careerGoal?.careerGoalType || 'Get my first job',
                timeframe: data.profile?.careerGoal?.timeframe || 'Immediate (1-3 months)',
                notes: data.profile?.careerGoal?.notes || '',
              },
              preferences: {
                preferredJobType: data.profile?.jobPreference?.preferredJobType || 'Full-time',
                preferredLocation: data.profile?.jobPreference?.preferredLocation || '',
                workEnvironment: data.profile?.jobPreference?.workEnvironment || 'Remote',
                willingToRelocate: Boolean(data.profile?.jobPreference?.willingToRelocate),
                preferredIndustries: data.profile?.jobPreference?.preferredIndustries || [],
                preferredSalaryRange: data.profile?.jobPreference?.preferredSalaryRange || '',
                learningStyle: data.profile?.learningStyle || ['Hands-on projects'],
                availableHoursPerWeek: data.profile?.availableHoursPerWeek || '5–10 hours/week',
                mentorshipNeeds: data.profile?.mentorshipNeeds || ['Career direction'],
              },
              certifications: data.profile?.certifications || [],
              achievements: data.profile?.achievements || [],
              professionalLinks: data.profile?.professionalLinks || [],
            });
          }
        }
      } catch (err) {
        console.error('Failed to load onboarding state:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchState();
    return () => {
      isMounted = false;
    };
  }, [router, user]);

  // Debounced progressive auto-save engine
  const triggerAutoSave = useCallback(
    (currentPayload: FullOnboardingPayload, step: number) => {
      setSaveStatus('saving');
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await fetch('/api/onboarding', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              currentStep: step,
              draftData: currentPayload,
            }),
          });
          setSaveStatus('saved');
        } catch {
          setSaveStatus('error');
        }
      }, 750);
    },
    []
  );

  const updatePayload = (partial: Partial<FullOnboardingPayload>) => {
    setPayload((prev) => {
      const next = { ...prev, ...partial };
      triggerAutoSave(next, currentStep);
      return next;
    });
  };

  // Resume Handler
  const handleResumeExtracted = (parsedData: ParsedResumeData, filename: string) => {
    setParsedResumeData(parsedData);
    setResumeFilename(filename);
    setIsResumeModalOpen(true);
  };

  const handleApplyResumeSuggestions = (approved: ParsedResumeData) => {
    setPayload((prev) => {
      const updated: FullOnboardingPayload = {
        ...prev,
        aboutYou: {
          ...prev.aboutYou,
          name: approved.personalInfo.name || prev.aboutYou.name,
          phone: approved.personalInfo.phone || prev.aboutYou.phone,
          location: approved.personalInfo.location || prev.aboutYou.location,
          headline: approved.personalInfo.headline || prev.aboutYou.headline,
        },
        education: approved.education.length > 0 ? (approved.education as any) : prev.education,
        experience: approved.experience.length > 0 ? (approved.experience as any) : prev.experience,
        skills: approved.skills.length > 0 ? (approved.skills as any) : prev.skills,
        projects: approved.projects.length > 0 ? (approved.projects as any) : prev.projects,
        professionalLinks: approved.professionalLinks.length > 0 ? (approved.professionalLinks as any) : prev.professionalLinks,
      };
      triggerAutoSave(updated, currentStep);
      return updated;
    });
  };

  // Step Validation & Save
  const validateStep = (step: number): boolean => {
    setErrors({});
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!payload.aboutYou.name || payload.aboutYou.name.trim().length < 2) {
        newErrors.name = 'Name is required (at least 2 characters)';
      }
      if (!payload.aboutYou.phone || payload.aboutYou.phone.trim().length < 5) {
        newErrors.phone = 'Phone number is required';
      }
      if (!payload.aboutYou.location || payload.aboutYou.location.trim().length < 2) {
        newErrors.location = 'Location is required';
      }
    }

    if (step === 2) {
      const isStudent = payload.aboutYou.candidateType === 'STUDENT' || payload.aboutYou.candidateType === 'GRADUATE';
      if (isStudent && payload.education.length === 0) {
        newErrors.general = 'Please add at least one education entry.';
      }
    }

    if (step === 4) {
      if (!payload.skills || payload.skills.length === 0) {
        newErrors.skills = 'Please add at least one skill.';
      }
    }

    if (step === 6) {
      if (!payload.careerDirection.targetRole) {
        newErrors.targetRole = 'Target job role is required.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  // Step transition scroll reference
  const rightPaneRef = useRef<HTMLDivElement | null>(null);

  const scrollToRightPaneTop = () => {
    if (rightPaneRef.current) {
      rightPaneRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextStep = async () => {
    if (!validateStep(currentStep)) return;

    // Save step data to backend
    setSaveStatus('saving');
    try {
      await fetch('/api/onboarding/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepNumber: currentStep,
          payload: {
            aboutYou: payload.aboutYou,
            education: payload.education,
            experience: payload.experience,
            skills: payload.skills,
            projects: payload.projects,
            careerDirection: payload.careerDirection,
            preferences: payload.preferences,
            certifications: payload.certifications,
            professionalLinks: payload.professionalLinks,
          },
        }),
      });
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }

    setCompletedSteps((prev) => Array.from(new Set([...prev, currentStep])));

    if (currentStep < 7) {
      setCurrentStep((prev) => prev + 1);
      scrollToRightPaneTop();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      scrollToRightPaneTop();
    }
  };

  // Atomic Completion Call
  const handleFinalCompletion = async () => {
    if (!validateStep(1) || !validateStep(4) || !validateStep(6)) {
      setErrors({ general: 'Please make sure all required fields are completed.' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Completion failed');
      }

      // Sync user chosen target role to local saved roles so "My Path" navigates there
      if (payload.careerDirection?.targetRole) {
        const matchedSlug = findCareerSlugByTitle(payload.careerDirection.targetRole);
        if (matchedSlug) {
          const career = getCareerPathBySlug(matchedSlug);
          if (career) {
            setSavedTargetRole({
              slug: career.slug,
              title: career.title,
              category: career.category,
            });
          }
        }
      }

      await refreshUser();
      router.push(result.redirectUrl || '/dashboard');
    } catch (err: any) {
      setErrors({ general: err.message || 'Failed to complete profile.' });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC] text-slate-900">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#6366F1] animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Loading your PATHWAY profile…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-between bg-[#F7F8FC] text-slate-900 font-sans antialiased selection:bg-[#6366F1]/20 selection:text-[#6366F1] lg:overflow-hidden">
      {/* Onboarding Focused Header */}
      <OnboardingHeader saveStatus={saveStatus} />

      {/* Main Container: Plain 30% / 70% Split Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:overflow-hidden flex flex-col min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start lg:h-full lg:min-h-0 flex-1">
          {/* Left Column (30%): Plain Vertical Pathway Stepper */}
          <div className="lg:col-span-4 lg:max-w-sm lg:h-full lg:overflow-y-auto pl-2 pr-2 py-1 shrink-0">
            <OnboardingProgress
              currentStep={currentStep}
              totalSteps={7}
              completedSteps={completedSteps}
              onSelectStep={(step) => {
                if (completedSteps.includes(step) || step <= currentStep) {
                  setCurrentStep(step);
                  scrollToRightPaneTop();
                }
              }}
            />
          </div>

          {/* Right Column (70%): Form Area & Compact Resume Banner */}
          <div
            ref={rightPaneRef}
            className="lg:col-span-8 space-y-8 lg:h-full lg:overflow-y-auto lg:pr-3 min-h-0 pb-6 scroll-smooth"
          >
            {/* Step 1 Short Compact Resume Upload Banner */}
            {currentStep === 1 && (
              <ResumeUploadBanner
                onResumeExtracted={handleResumeExtracted}
                onContinueManually={() => {}}
              />
            )}

            {/* Main Active Form Container */}
            <div className="w-full relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStep === 1 && (
                    <PersonalInfoStep
                      formData={payload.aboutYou}
                      accountEmail={user?.email || 'candidate@example.com'}
                      onChange={(updated) =>
                        updatePayload({ aboutYou: { ...payload.aboutYou, ...updated } })
                      }
                      errors={errors}
                    />
                  )}

                  {currentStep === 2 && (
                    <EducationStep
                      educationList={payload.education}
                      onChange={(updated) => updatePayload({ education: updated })}
                      errors={errors}
                      isStudent={payload.aboutYou.candidateType === 'STUDENT'}
                    />
                  )}

                  {currentStep === 3 && (
                    <ExperienceStep
                      experienceList={payload.experience}
                      hasNoExperience={payload.hasNoExperience}
                      onChangeExperience={(updated) => updatePayload({ experience: updated })}
                      onChangeNoExperience={(noExp) => updatePayload({ hasNoExperience: noExp })}
                      errors={errors}
                    />
                  )}

                  {currentStep === 4 && (
                    <SkillsStep
                      skillsList={payload.skills}
                      onChange={(updated) => updatePayload({ skills: updated })}
                      errors={errors}
                    />
                  )}

                  {currentStep === 5 && (
                    <ProjectsStep
                      projectsList={payload.projects}
                      onChange={(updated) => updatePayload({ projects: updated })}
                      errors={errors}
                    />
                  )}

                  {currentStep === 6 && (
                    <CareerDirectionStep
                      formData={payload.careerDirection}
                      onChange={(updated) =>
                        updatePayload({ careerDirection: { ...payload.careerDirection, ...updated } })
                      }
                      errors={errors}
                    />
                  )}

                  {currentStep === 7 && (
                    <ReviewStep
                      payload={payload}
                      accountEmail={user?.email || 'candidate@example.com'}
                      onEditStep={(step) => {
                        setCurrentStep(step);
                        scrollToRightPaneTop();
                      }}
                      onComplete={handleFinalCompletion}
                      isSubmitting={isSubmitting}
                      error={errors.general}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Controls (Steps 1 to 6) */}
              {currentStep < 7 && (
                <div className="flex items-center justify-between border-t border-slate-200/80 pt-6 mt-8">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={currentStep === 1}
                    className="h-11 px-5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs flex items-center gap-2 hover:text-slate-900 hover:border-slate-300 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="h-12 px-7 rounded-xl bg-blue-600 hover:bg-black text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Extracted Resume Review Modal */}
      {parsedResumeData && (
        <ResumeReviewModal
          parsedData={parsedResumeData}
          filename={resumeFilename}
          isOpen={isResumeModalOpen}
          onClose={() => setIsResumeModalOpen(false)}
          onApplySuggestions={handleApplyResumeSuggestions}
        />
      )}

      {/* Footer Notice */}
      <footer className="w-full py-3 text-center text-xs text-slate-500 border-t border-slate-200/80 shrink-0">
        © {new Date().getFullYear()} PATHWAY.ECO. Mandatory Candidate Profile Foundation. All progress auto-saved server-side.
      </footer>
    </div>
  );
};
