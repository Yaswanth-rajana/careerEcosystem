'use client';

import React, { useEffect, useState } from 'react';
import { MentorShell } from '@/components/MentorShell';
import { StatCards } from '@/components/dashboard/StatCards';
import { TodaySessions } from '@/components/dashboard/TodaySessions';
import { UpcomingBookings } from '@/components/dashboard/UpcomingBookings';
import { PendingRequests } from '@/components/dashboard/PendingRequests';
import { ServicesPreview } from '@/components/dashboard/ServicesPreview';
import { AvailabilitySummaryCard } from '@/components/dashboard/AvailabilitySummaryCard';
import { RecentActivityList } from '@/components/dashboard/RecentActivityList';
import { CardSkeleton } from '@/components/Skeleton';
import { MentorDashboardDTO } from '@backend/types/mentorship';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function MentorDashboardPage() {
  const [data, setData] = useState<MentorDashboardDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/mentor/dashboard');
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to load dashboard data');
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Error loading dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <MentorShell>
      <div className="space-y-6">
        {/* Error notification banner with retry */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchDashboard}
              className="inline-flex items-center gap-1 font-semibold text-rose-700 hover:text-rose-900 underline"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        ) : data ? (
          <>
            {/* 1. Stat cards */}
            <StatCards summary={data.summary} />

            {/* 2. Pending action requests if any */}
            <PendingRequests requests={data.pendingRequests} onActionComplete={fetchDashboard} />

            {/* 3. Today's Sessions */}
            <TodaySessions sessions={data.todaySessions} />

            {/* 4. Upcoming Bookings */}
            <UpcomingBookings bookings={data.upcomingBookings} />

            {/* 5. Services Preview & Availability Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ServicesPreview services={data.servicesPreview} />
              <AvailabilitySummaryCard summary={data.availabilitySummary} />
            </div>

            {/* 6. Recent Activity */}
            <RecentActivityList activities={data.recentActivity} />
          </>
        ) : null}
      </div>
    </MentorShell>
  );
}
