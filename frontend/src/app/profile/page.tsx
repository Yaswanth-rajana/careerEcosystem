'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileNavigation } from '@/components/profile/ProfileNavigation';
import { PersonalSection } from '@/components/profile/PersonalSection';
import { EducationSection } from '@/components/profile/EducationSection';
import { ExperienceSection } from '@/components/profile/ExperienceSection';
import { SkillsSection } from '@/components/profile/SkillsSection';
import { ProjectsSection } from '@/components/profile/ProjectsSection';
import { CareerDirectionSection } from '@/components/profile/CareerDirectionSection';
import { JobPreferencesSection } from '@/components/profile/JobPreferencesSection';
import { LinksAndCertsSection } from '@/components/profile/LinksAndCertsSection';
import { AccountSettingsSection } from '@/components/profile/AccountSettingsSection';
import { ProfileCoreDTO, PersonalProfileDTO, CareerGoalDTO, JobPreferenceDTO } from '@backend/types/profile';
import { fetchProfileCore } from '@/lib/profileApi';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/design-system/Button';

export default function ProfilePage() {
  const [core, setCore] = useState<ProfileCoreDTO | null>(null);
  const [activeSection, setActiveSection] = useState<string>('personal');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchProfileCore();
      setCore(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load candidate profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdatePersonal = (updated: PersonalProfileDTO) => {
    if (!core) return;
    setCore({
      ...core,
      personal: updated,
    });
    // Silent refetch to sync canonical completion score
    fetchProfileCore().then((refreshed) => setCore(refreshed)).catch(() => {});
  };

  const handleUpdateCareer = (updated: CareerGoalDTO) => {
    if (!core) return;
    setCore({
      ...core,
      careerDirection: updated,
    });
    fetchProfileCore().then((refreshed) => setCore(refreshed)).catch(() => {});
  };

  const handleUpdatePreferences = (updated: JobPreferenceDTO) => {
    if (!core) return;
    setCore({
      ...core,
      jobPreferences: updated,
    });
    fetchProfileCore().then((refreshed) => setCore(refreshed)).catch(() => {});
  };

  const handleCountChange = useCallback((key: string, count: number) => {
    setCore((prev) => {
      if (!prev) return prev;
      if (prev.counts[key as keyof typeof prev.counts] === count) return prev;
      return {
        ...prev,
        counts: {
          ...prev.counts,
          [key]: count,
        },
      };
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
        {isLoading ? (
          /* Profile Skeletons */
          <div className="space-y-6 animate-pulse">
            <div className="w-full h-36 rounded-2xl bg-white border border-slate-200/80 shadow-sm" />
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-64 h-96 rounded-2xl bg-white border border-slate-200/80 shadow-sm hidden lg:block" />
              <div className="flex-1 h-96 rounded-2xl bg-white border border-slate-200/80 shadow-sm" />
            </div>
          </div>
        ) : error || !core ? (
          /* Error State */
          <div className="p-8 text-center bg-white rounded-2xl border border-red-200 shadow-sm max-w-md mx-auto space-y-4">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h2 className="text-base font-bold text-slate-900">Unable to load profile</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {error || 'An unexpected error occurred while loading your profile data.'}
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={loadProfile}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Try Again
            </Button>
          </div>
        ) : (
          /* Authenticated Profile Content */
          <>
            {/* Header Banner */}
            <ProfileHeader
              core={core}
              onNavigateSection={(sectionKey) => setActiveSection(sectionKey)}
            />

            {/* 2-Column Responsive Layout */}
            <div className="flex flex-col lg:flex-row items-start gap-6">
              {/* Navigation Sidebar / Mobile Pill Tabs */}
              <ProfileNavigation
                activeSection={activeSection}
                onSelectSection={setActiveSection}
                completion={core.completion}
                counts={core.counts as any}
              />

              {/* Main Active Section Card */}
              <section className="flex-1 w-full min-w-0">
                {activeSection === 'personal' && (
                  <PersonalSection
                    personal={core.personal}
                    onUpdate={handleUpdatePersonal}
                  />
                )}

                {activeSection === 'education' && (
                  <EducationSection
                    onCountChange={(cnt) => handleCountChange('education', cnt)}
                  />
                )}

                {activeSection === 'experience' && (
                  <ExperienceSection
                    onCountChange={(cnt) => handleCountChange('experience', cnt)}
                  />
                )}

                {activeSection === 'skills' && (
                  <SkillsSection
                    onCountChange={(cnt) => handleCountChange('skills', cnt)}
                  />
                )}

                {activeSection === 'projects' && (
                  <ProjectsSection
                    onCountChange={(cnt) => handleCountChange('projects', cnt)}
                  />
                )}

                {activeSection === 'careerDirection' && (
                  <CareerDirectionSection
                    careerDirection={core.careerDirection}
                    onUpdate={handleUpdateCareer}
                  />
                )}

                {activeSection === 'preferences' && (
                  <JobPreferencesSection
                    jobPreferences={core.jobPreferences}
                    onUpdate={handleUpdatePreferences}
                  />
                )}

                {activeSection === 'linksAndCertifications' && (
                  <LinksAndCertsSection />
                )}

                {activeSection === 'account' && (
                  <AccountSettingsSection
                    account={core.account}
                    onPasswordChanged={loadProfile}
                  />
                )}
              </section>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
