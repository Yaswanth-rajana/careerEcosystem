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
    <section id="my-mentorship" className="py-12 border-b border-slate-200/60 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 sm:p-8">
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900">
                My Mentorship Activity
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Track your booked sessions, history, and saved mentor profiles.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-200/60 self-start sm:self-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('upcoming')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'upcoming'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
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
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
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
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Saved Mentors</span>
              </button>
            </div>
          </div>

          {/* Honest Empty State for No Sessions */}
          <div className="py-12 text-center max-w-sm mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Your mentorship journey starts here.
              </h3>
              <p className="text-xs text-slate-500 mt-1">
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 shadow-sm"
            >
              Find a Mentor
            </Button>
          </div>

        </div>

      </div>
    </section>
  );
};
