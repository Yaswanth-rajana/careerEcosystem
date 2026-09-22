'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CareerPath, CandidateCareerContext } from '@/lib/careers/career-types';
import { getRecommendedMentorsForCandidate } from '@/lib/careers/career-repository';
import { Mentor } from '@/lib/mentors/mentor-types';
import { MentorCard } from '@/components/mentors/MentorCard';
import { BookingModal } from '@/components/mentors/BookingModal';
import { UserCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

export interface CareerMentorsSectionProps {
  career: CareerPath;
  candidate: CandidateCareerContext | null;
}

export const CareerMentorsSection: React.FC<CareerMentorsSectionProps> = ({ career, candidate }) => {
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
