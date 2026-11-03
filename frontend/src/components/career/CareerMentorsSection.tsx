'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CareerPath, CandidateCareerContext, CareerLevelId, CareerLevelDefinition } from '@/lib/careers/career-types';
import { getRecommendedMentorsForCandidate } from '@/lib/careers/career-repository';
import { Mentor } from '@/lib/mentors/mentor-types';
import { MentorCard } from '@/components/mentors/MentorCard';
import { BookingModal } from '@/components/mentors/BookingModal';
import { UserCheck, ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

export interface CareerMentorsSectionProps {
  career: CareerPath;
  candidate: CandidateCareerContext | null;
  selectedLevel?: CareerLevelId;
  levelData?: CareerLevelDefinition;
}

export const CareerMentorsSection: React.FC<CareerMentorsSectionProps> = ({
  career,
  candidate,
  selectedLevel = 'entry',
  levelData,
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedBookingMentor, setSelectedBookingMentor] = useState<Mentor | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    getRecommendedMentorsForCandidate({ candidate, careerSlug: career.slug }).then((res) => {
      setMentors(res);
    });
  }, [candidate, career.slug]);

  const handleOpenBooking = (mentor: Mentor) => {
    if (!user) {
      router.push(`/login?from=/careers/${career.slug}`);
      return;
    }
    setSelectedBookingMentor(mentor);
    setIsBookingOpen(true);
  };

  const getMentorshipFocus = (levelId: CareerLevelId) => {
    switch (levelId) {
      case 'senior':
        return {
          title: 'Staff & Senior Leadership Mentorship',
          desc: 'Connect on technical leadership, enterprise architecture reviews, staff-level impact, and strategic decision-making.',
        };
      case 'mid':
        return {
          title: 'Specialization & Architecture Mentorship',
          desc: 'Discuss deep domain specialization, production system design, technical trade-offs, and mid-to-senior transition.',
        };
      case 'junior':
        return {
          title: 'Code Quality & Production Mentorship',
          desc: 'Review practical code maintainability, real-world deployment workflows, and junior career progression.',
        };
      default:
        return {
          title: 'Foundational Direction & Career Guidance',
          desc: 'Clarify learning roadmaps, get personalized resume feedback, and navigate early-career entry points.',
        };
    }
  };

  const focus = getMentorshipFocus(selectedLevel);

  if (!mentors || mentors.length === 0) return null;

  return (
    <div id="mentorship" className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
              Need Guidance?
            </h2>
          </div>
          <p className="text-xs text-slate-600">
            Learn from verified industry professionals who have already walked the {career.title} path.
          </p>
        </div>

        <Link
          href="/mentors"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-600 hover:text-white transition-all shrink-0"
        >
          <span>Find a Mentor</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Level-Specific Mentorship Focus Area Recommendation */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 shadow-xs">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs">
              Recommended Focus for {levelData?.label || 'Target Level'}: {focus.title}
            </h4>
            <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
              {focus.desc}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold text-blue-700 bg-white border border-blue-200 px-2.5 py-1 rounded-md shrink-0 self-start sm:self-auto">
          Tailored Guidance
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mentors.map((mentor) => (
          <MentorCard
            key={mentor.id}
            mentor={mentor}
            onBookSession={handleOpenBooking}
          />
        ))}
      </div>

      <BookingModal
        mentor={selectedBookingMentor}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
};
