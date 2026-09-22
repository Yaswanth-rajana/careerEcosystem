'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, UserCheck } from 'lucide-react';
import { Mentor, CandidateContext } from '@/lib/mentors/mentor-types';
import { getRecommendedMentors } from '@/lib/mentors/mentor-repository';
import { MentorCard } from './MentorCard';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/design-system/Button';

interface RecommendedMentorsProps {
  onBookSession: (mentor: Mentor) => void;
}

export const RecommendedMentors: React.FC<RecommendedMentorsProps> = ({ onBookSession }) => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Candidate context extracted if available
  const candidateContext: CandidateContext | null = React.useMemo(() => {
    return user
      ? {
          targetRole: 'Software Engineer',
          skills: ['React', 'Node.js', 'Python', 'System Design'],
          mentorshipNeeds: ['Career Guidance', 'Mock Interview'],
        }
      : null;
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    const fetchRecommended = async () => {
      try {
        const data = await getRecommendedMentors(candidateContext, 3);
        if (isMounted) {
          setMentors(data);
        }
      } catch {
        if (isMounted) setMentors([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchRecommended();
    return () => {
      isMounted = false;
    };
  }, [candidateContext]);

  return (
    <section className="py-12 border-b border-slate-200/60 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tailored Guidance</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
              {user ? 'Recommended for you' : 'Find a mentor for your next step'}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {user
                ? 'Based on your career goals, current skills, and active mentorship needs.'
                : 'Connect with experienced professionals matched to your ambitions.'}
            </p>
          </div>

          {!user && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const el = document.getElementById('mentor-discovery');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="border-slate-300 text-xs font-semibold self-start md:self-auto"
            >
              Explore All Mentors
            </Button>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-200/60 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                candidateContext={candidateContext}
                onBookSession={onBookSession}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
