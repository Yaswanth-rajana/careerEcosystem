import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getCareerPathBySlug, getRecommendedNextStep, calculateCareerProgress } from '@/lib/careers/career-repository';
import { getCandidateContextFromSession } from '@/lib/careers/career-server-helper';

import { CareerDetailHero } from '@/components/career/CareerDetailHero';
import { CareerVisualRoadmap } from '@/components/career/CareerVisualRoadmap';
import { YourNextStepCard } from '@/components/career/YourNextStepCard';
import { SkillGapSection } from '@/components/career/SkillGapSection';
import { PersonalizedProgressSection } from '@/components/career/PersonalizedProgressSection';
import { RoleOverviewSection } from '@/components/career/RoleOverviewSection';
import { RequiredSkillsSection } from '@/components/career/RequiredSkillsSection';
import { LearningRoadmapSection } from '@/components/career/LearningRoadmapSection';
import { ProjectRoadmapSection } from '@/components/career/ProjectRoadmapSection';
import { CertificationSection } from '@/components/career/CertificationSection';
import { PracticeSection } from '@/components/career/PracticeSection';
import { CareerMentorsSection } from '@/components/career/CareerMentorsSection';
import { InterviewPrepSection } from '@/components/career/InterviewPrepSection';
import { ProfileReadinessSection } from '@/components/career/ProfileReadinessSection';
import { CareerOpportunitiesSection } from '@/components/career/CareerOpportunitiesSection';
import { CareerLoopSection } from '@/components/career/CareerLoopSection';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const career = getCareerPathBySlug(params.slug);
  if (!career) return { title: 'Career Not Found | PATHWAY.ECO' };

  return {
    title: `${career.title} Career Roadmap & Execution Plan | PATHWAY.ECO`,
    description: career.shortDescription,
  };
}

export default async function CareerDetailPage({ params }: { params: { slug: string } }) {
  const career = getCareerPathBySlug(params.slug);
  if (!career) {
    notFound();
  }

  const candidate = await getCandidateContextFromSession();
  const nextStep = getRecommendedNextStep(candidate, career.slug);
  const progressMetrics = calculateCareerProgress(candidate, career.slug);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans">
      <Header />

      {/* Section 01 — Career Hero */}
      <CareerDetailHero career={career} candidate={candidate} />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-12">
        
        {/* Section 02 — Your Career Roadmap */}
        <CareerVisualRoadmap currentStageIndex={progressMetrics.currentStageIndex} />

        {/* Section 03 — YOUR NEXT STEP ⭐ */}
        <YourNextStepCard
          title={nextStep.title}
          focusSkill={nextStep.focusSkill}
          actionLabel={nextStep.actionLabel}
          rationale={nextStep.rationale}
          actionUrl={nextStep.actionUrl}
        />

        {/* Section 04 — What do you need to learn? ⭐ */}
        <SkillGapSection career={career} candidate={candidate} />

        {/* Section 05 — Your Preparation Progress */}
        <PersonalizedProgressSection career={career} candidate={candidate} />

        {/* Section 06 — Understand the Role */}
        <RoleOverviewSection career={career} />

        {/* Section 07 — Skills You Need */}
        <RequiredSkillsSection career={career} />

        {/* Section 08 — Learning Roadmap ⭐ */}
        <LearningRoadmapSection career={career} />

        {/* Section 09 — Build Your Portfolio (Projects) ⭐ */}
        <ProjectRoadmapSection career={career} />

        {/* Section 10 — Optional Certifications */}
        <CertificationSection career={career} />

        {/* Section 11 — Practice Your Skills */}
        <PracticeSection career={career} />

        {/* Section 12 — Need Guidance? */}
        <CareerMentorsSection career={career} candidate={candidate} />

        {/* Section 13 — Prepare for Interviews */}
        <InterviewPrepSection career={career} />

        {/* Section 14 — Make Your Profile Job-Ready */}
        <ProfileReadinessSection candidate={candidate} />

        {/* Section 15 — Matching Opportunities */}
        <CareerOpportunitiesSection career={career} candidate={candidate} />

        {/* Section 16 — PATHWAY Ecosystem Loop */}
        <CareerLoopSection />

      </main>

      <Footer />
    </div>
  );
}
