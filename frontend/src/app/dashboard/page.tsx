'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DashboardDTO } from '@backend/types/dashboard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { NextActionCard } from '@/components/dashboard/NextActionCard';
import { CareerJourney } from '@/components/dashboard/CareerJourney';
import { CareerSnapshot } from '@/components/dashboard/CareerSnapshot';
import { LearningProgress } from '@/components/dashboard/LearningProgress';
import { OpportunityPreview } from '@/components/dashboard/OpportunityPreview';
import { MentorshipPreview } from '@/components/dashboard/MentorshipPreview';
import { InterviewPreview } from '@/components/dashboard/InterviewPreview';
import { AICopilotCard } from '@/components/dashboard/AICopilotCard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { Button } from '@/components/design-system/Button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/login?from=/dashboard';
          return;
        }
        throw new Error('Failed to load dashboard data');
      }
      const json = await res.json();
      if (json.success && json.data) {
        setDashboardData(json.data);
      } else {
        throw new Error(json.error || 'Failed to parse dashboard data');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while loading your dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-[#0F172A] font-sans antialiased">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {isLoading ? (
          <DashboardSkeleton />
        ) : error ? (
          <div className="max-w-xl mx-auto my-16 p-8 rounded-2xl bg-white border border-rose-200 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[#0F172A]">Unable to load dashboard</h2>
              <p className="text-sm text-slate-600">{error}</p>
            </div>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDashboard}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : dashboardData ? (
          <div className="space-y-8">
            {/* 1. Header: Greeting & Profile Completion Card */}
            <DashboardHeader
              userName={dashboardData.user.name}
              targetRole={dashboardData.careerSnapshot.targetRole}
              careerField={dashboardData.careerSnapshot.careerField}
              profileCompletionPercentage={dashboardData.profileCompletionPercentage}
              nextProfileSection={dashboardData.nextProfileSection}
              isProfileComplete={dashboardData.isProfileComplete}
            />

            {/* 2. Primary: Your Next Step (Single clear recommendation) */}
            <NextActionCard action={dashboardData.nextAction} />

            {/* 3. Secondary: Career Journey Timeline */}
            <CareerJourney journey={dashboardData.journey} />

            {/* 4. Supporting: Career Snapshot & Continue Learning */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <CareerSnapshot snapshot={dashboardData.careerSnapshot} />
              <LearningProgress learning={dashboardData.learning} />
            </div>

            {/* 5. Opportunities for You */}
            <OpportunityPreview opportunities={dashboardData.opportunities} />

            {/* 6. Contextual: Mentorship & Interview Preparation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <MentorshipPreview mentorship={dashboardData.mentorship} />
              <InterviewPreview interview={dashboardData.interview} />
            </div>

            {/* 7. AI Career Copilot Entry */}
            <AICopilotCard targetRole={dashboardData.careerSnapshot.targetRole} />
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
