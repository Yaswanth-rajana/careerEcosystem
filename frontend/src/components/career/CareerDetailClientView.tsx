'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CareerPath, CandidateCareerContext, CareerLevelId } from '@/lib/careers/career-types';
import {
  getCareerLevelData,
  resolveInitialCareerLevel,
} from '@/lib/careers/career-levels-data';
import {
  getRecommendedNextStep,
  calculateCareerProgress,
} from '@/lib/careers/career-repository';

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

export interface CareerDetailClientViewProps {
  career: CareerPath;
  candidate: CandidateCareerContext | null;
  initialLevelParam?: string;
}

export const CareerDetailClientView: React.FC<CareerDetailClientViewProps> = ({
  career,
  candidate,
  initialLevelParam,
}) => {
  // 1. Initial level resolution: URL param > Profile data > Default (Entry)
  const [selectedLevel, setSelectedLevel] = useState<CareerLevelId>(() => {
    return resolveInitialCareerLevel(candidate, initialLevelParam, career.slug);
  });

  // 2. Client-side mount: If no explicit URL param was passed on server, restore from localStorage if exists
  useEffect(() => {
    if (!initialLevelParam) {
      try {
        const saved = localStorage.getItem(`pathway_career_level_${career.slug}`);
        if (saved && ['entry', 'junior', 'mid', 'senior'].includes(saved)) {
          setSelectedLevel(saved as CareerLevelId);
        }
      } catch (e) {
        // Ignore storage exceptions in restricted environments
      }
    }
  }, [career.slug, initialLevelParam]);

  // 3. Level selection handler: updates state, persists in localStorage and updates URL query param without page reload
  const handleSelectLevel = useCallback(
    (levelId: CareerLevelId) => {
      setSelectedLevel(levelId);
      try {
        localStorage.setItem(`pathway_career_level_${career.slug}`, levelId);
      } catch (e) {
        // Ignore storage exceptions
      }

      // Update URL query parameter seamlessly
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('level', levelId);
        window.history.replaceState({ ...window.history.state, level: levelId }, '', url.toString());
      }
    },
    [career.slug]
  );

  // 4. Reactive level-specific data computation
  const levelData = useMemo(() => {
    return getCareerLevelData(career, selectedLevel);
  }, [career, selectedLevel]);

  const nextStep = useMemo(() => {
    return getRecommendedNextStep(candidate, career.slug, selectedLevel);
  }, [candidate, career.slug, selectedLevel]);

  const progressMetrics = useMemo(() => {
    return calculateCareerProgress(candidate, career.slug, selectedLevel);
  }, [candidate, career.slug, selectedLevel]);

  return (
    <>
      {/* Section 01 — Career Hero with Interactive Growth Trajectory */}
      <CareerDetailHero
        career={career}
        candidate={candidate}
        selectedLevel={selectedLevel}
        onSelectLevel={handleSelectLevel}
        levelData={levelData}
      />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-12">
        {/* Section 02 — Your Career Roadmap (6-Stage, dynamic descriptions) */}
        <CareerVisualRoadmap
          currentStageIndex={progressMetrics.currentStageIndex}
          levelData={levelData}
        />

        {/* Section 03 — YOUR NEXT STEP ⭐ */}
        <YourNextStepCard
          title={nextStep.title}
          focusSkill={nextStep.focusSkill}
          actionLabel={nextStep.actionLabel}
          rationale={nextStep.rationale}
          actionUrl={nextStep.actionUrl}
        />

        {/* Section 04 — What do you need to learn? ⭐ (Skill Gap) */}
        <SkillGapSection
          career={career}
          candidate={candidate}
          selectedLevel={selectedLevel}
          levelData={levelData}
        />

        {/* Section 05 — Your Preparation Progress */}
        <PersonalizedProgressSection
          career={career}
          candidate={candidate}
          selectedLevel={selectedLevel}
          levelData={levelData}
        />

        {/* Section 06 — Understand the Role */}
        <RoleOverviewSection career={career} levelData={levelData} />

        {/* Section 07 — Skills You Need */}
        <RequiredSkillsSection career={career} levelData={levelData} />

        {/* Section 08 — Learning Roadmap ⭐ */}
        <LearningRoadmapSection career={career} levelData={levelData} />

        {/* Section 09 — Practical Work / Portfolio / Labs & Simulations ⭐ */}
        <ProjectRoadmapSection career={career} levelData={levelData} />

        {/* Section 10 — Optional Certifications */}
        <CertificationSection career={career} levelData={levelData} />

        {/* Section 11 — Practice Your Skills / Simulations */}
        <PracticeSection career={career} levelData={levelData} />

        {/* Section 12 — Need Guidance? (Mentorship Focus) */}
        <CareerMentorsSection career={career} candidate={candidate} levelData={levelData} />

        {/* Section 13 — Prepare for Interviews & Evaluations */}
        <InterviewPrepSection career={career} levelData={levelData} />

        {/* Section 14 — Make Your Profile Job-Ready */}
        <ProfileReadinessSection
          candidate={candidate}
          career={career}
          levelData={levelData}
        />

        {/* Section 15 — Matching Opportunities */}
        <CareerOpportunitiesSection
          career={career}
          candidate={candidate}
          selectedLevel={selectedLevel}
          levelData={levelData}
        />

        {/* Section 16 — PATHWAY Ecosystem Loop */}
        <CareerLoopSection />
      </main>
    </>
  );
};
