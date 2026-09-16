'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CareerPath, CandidateCareerContext } from '@/lib/careers/career-types';
import { getRecommendedMentorsForCandidate } from '@/lib/careers/career-repository';
import { Mentor } from '@/lib/mentors/mentor-types';
import { UserCheck, Star, ArrowRight } from 'lucide-react';

export interface CareerMentorsSectionProps {
  career: CareerPath;
  candidate: CandidateCareerContext | null;
}

export const CareerMentorsSection: React.FC<CareerMentorsSectionProps> = ({ career, candidate }) => {
  const [mentors, setMentors] = useState<Mentor[]>([]);

  useEffect(() => {
    getRecommendedMentorsForCandidate({ candidate, careerSlug: career.slug }).then((res) => {
      setMentors(res);
    });
  }, [candidate, career.slug]);

  if (!mentors || mentors.length === 0) return null;

  return (
    <div id="mentorship" className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#6366F1]" />
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
              Need Guidance?
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Learn from verified industry professionals who have already walked the {career.title} path.
          </p>
        </div>

        <Link
          href="/mentors"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-[#6366F1] dark:text-[#818CF8] text-xs font-bold hover:bg-[#6366F1] hover:text-white transition-all shrink-0"
        >
          <span>Find a Mentor</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mentors.map((mentor) => (
          <div
            key={mentor.id}
            className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#6366F1]/50 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                  {mentor.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {mentor.name}
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-[170px]">{mentor.role}</p>
                  <p className="text-[11px] font-semibold text-[#6366F1]">{mentor.domain}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {mentor.rating.toFixed(1)}
                </span>
                <span className="text-slate-400">({mentor.reviewCount} sessions)</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 font-mono">{mentor.experienceYears}+ yrs exp</span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {mentor.expertise.slice(0, 3).map((exp) => (
                  <span
                    key={exp}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    {exp}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <Link
                href={`/mentors/${mentor.id}`}
                className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] py-2.5 rounded-xl shadow-xs hover:opacity-95 transition-opacity"
              >
                <span>View Mentor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
