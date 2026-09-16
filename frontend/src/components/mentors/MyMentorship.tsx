'use client';

import React, { useState } from 'react';
import { Calendar, Bookmark, History, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/design-system/Button';

export const MyMentorship: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'saved'>('upcoming');

  if (!user) {
    return null; // Only show for authenticated users
  }

  const handleScrollToDiscovery = () => {
    const el = document.getElementById('mentor-discovery');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="my-mentorship" className="py-12 border-b border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-[#0B0F19]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-[#111827]/50 p-6 sm:p-8">
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                My Mentorship Activity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Track your booked sessions, history, and saved mentor profiles.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 self-start sm:self-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('upcoming')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'upcoming'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Upcoming</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('past')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'past'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Past Sessions</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('saved')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'saved'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Saved Mentors</span>
              </button>
            </div>
          </div>

          {/* Honest Empty State for No Sessions */}
          <div className="py-12 text-center max-w-sm mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-indigo/10 text-brand-indigo flex items-center justify-center mx-auto border border-brand-indigo/20">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Your mentorship journey starts here.
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {activeTab === 'upcoming' && "You haven't booked any mentorship sessions yet."}
                {activeTab === 'past' && 'No completed session history available.'}
                {activeTab === 'saved' && 'You have not saved any mentor profiles yet.'}
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleScrollToDiscovery}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="bg-brand-gradient hover:opacity-95 text-white font-bold text-xs py-2.5 px-4 shadow-sm"
            >
              Find a Mentor
            </Button>
          </div>

        </div>

      </div>
    </section>
  );
};
