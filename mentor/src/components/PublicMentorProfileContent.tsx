'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MentorDiscoveryItemDTO, MentorSessionOptionDTO } from '@backend/types/mentorship';
import {
  Star,
  ShieldCheck,
  Clock,
  Briefcase,
  CheckCircle2,
  MessageSquare,
  User as UserIcon,
  Calendar,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface PublicMentorProfileContentProps {
  mentor: MentorDiscoveryItemDTO;
  isModalView?: boolean;
  onBookService?: (serviceId?: string) => void;
}

export function PublicMentorProfileContent({
  mentor,
  isModalView = false,
  onBookService,
}: PublicMentorProfileContentProps) {
  const [imgError, setImgError] = useState(false);
  const [bookingToast, setBookingToast] = useState<string | null>(null);

  const hasReviews = Boolean(mentor.reviews && mentor.reviews.length > 0);
  const hasRating = mentor.reviewCount > 0 && mentor.rating > 0;
  const isVerified = Boolean(mentor.isVerified);

  // Filter skills that are identical to expertise to avoid duplicate badge lists
  const distinctSkills = (mentor.skillsList || []).filter(
    (skill) => !(mentor.expertise || []).includes(skill)
  );
  const displaySkills = distinctSkills.length > 0 ? distinctSkills : (mentor.skillsList || []);
  const showDistinctSkills = distinctSkills.length > 0;

  // Resolve about paragraphs
  const paragraphs = (mentor.about && mentor.about.length > 0
    ? mentor.about
    : mentor.bio
    ? [mentor.bio]
    : []
  ).filter((p) => p && p.trim().length > 0);

  const handleBookClick = (optionId?: string, title?: string) => {
    if (onBookService) {
      onBookService(optionId);
    } else {
      setBookingToast(
        `Preview mode: In the public portal, candidates can select "${title || 'this session'}" to book directly.`
      );
      setTimeout(() => setBookingToast(null), 4500);
    }
  };

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Toast Notification */}
      {bookingToast && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center justify-between gap-2 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{bookingToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setBookingToast(null)}
            className="text-blue-500 hover:text-blue-800 font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Left Column (Content) & Right Column (Session Options) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 bg-white shadow-xs space-y-8">
            
            {/* 1. Header Profile Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-slate-200 shrink-0 bg-slate-100 shadow-sm flex items-center justify-center">
                {!imgError && mentor.avatar ? (
                  <Image
                    src={mentor.avatar}
                    alt={mentor.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                    priority
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50 text-blue-600 font-bold text-2xl">
                    <UserIcon className="w-10 h-10 text-blue-400" />
                  </div>
                )}
              </div>

              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
                    {mentor.name}
                  </h1>

                  {isVerified && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>{mentor.badgeLabel || 'Verified Mentor'}</span>
                    </div>
                  )}
                </div>

                <p className="text-sm sm:text-base font-semibold text-slate-700">
                  {mentor.role || mentor.headline || 'Industry Mentor'}
                </p>

                {(mentor.company || mentor.domain) && (
                  <p className="text-xs text-slate-500 font-medium">
                    {mentor.company ? mentor.company : ''}
                    {mentor.company && mentor.domain ? ' · ' : ''}
                    {mentor.domain ? mentor.domain : ''}
                  </p>
                )}

                {/* Rating & Stats row */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                  {hasRating ? (
                    <div className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{mentor.rating.toFixed(1)}</span>
                      <span className="text-slate-400 font-normal">
                        ({mentor.reviewCount} {mentor.reviewCount === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-500 font-medium">
                      ★ New Mentor (No reviews yet)
                    </span>
                  )}

                  <span>·</span>
                  <span className="font-medium">
                    {mentor.sessionCount || 0} session{mentor.sessionCount === 1 ? '' : 's'} completed
                  </span>

                  {mentor.experienceYears > 0 && (
                    <>
                      <span>·</span>
                      <span className="font-medium">{mentor.experienceYears}+ years experience</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 2. About Section */}
            <div className="pt-6 border-t border-slate-100 space-y-3">
              <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900">About</h2>
              {paragraphs.length > 0 ? (
                <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                  {paragraphs.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-slate-400 italic">
                  This mentor hasn&apos;t added a public introduction yet.
                </p>
              )}
            </div>

            {/* 3. Expertise & Skills */}
            {(mentor.expertise?.length > 0 || displaySkills.length > 0) && (
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900">
                  Expertise & Skills
                </h2>

                {mentor.expertise && mentor.expertise.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-display">
                      Domains
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {mentor.expertise.map((exp) => (
                        <span
                          key={exp}
                          className="px-3 py-1 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {showDistinctSkills && (
                  <div className="pt-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-display">
                      Core Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {displaySkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. Help Topics */}
            {mentor.helpTopics && mentor.helpTopics.length > 0 && (
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900">
                  I Can Help You With
                </h2>
                <div className="space-y-2.5">
                  {mentor.helpTopics.map((topic, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Professional Experience Timeline */}
            {mentor.workHistory && mentor.workHistory.length > 0 && (
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900">
                  Professional Experience
                </h2>
                <div className="space-y-4">
                  {mentor.workHistory.map((work, i) => (
                    <div key={i} className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200/50">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 font-display">{work.role}</h4>
                        <p className="text-xs text-slate-500">
                          {work.organizationType} · {work.period}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Verified Mentee Reviews */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span>Verified Mentee Reviews</span>
              </h2>

              {hasReviews ? (
                <div className="space-y-3.5">
                  {mentor.reviews!.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{rev.candidateName}</span>
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{rev.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-serif italic">
                        &quot;{rev.review}&quot;
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>{rev.serviceTitle}</span>
                        <span>{new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-1.5">
                  <p className="text-xs font-semibold text-slate-700">No public reviews yet</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Feedback from completed mentee sessions will be showcased here.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Column (4 cols on desktop): Services & Availability */}
        <div className="lg:col-span-4 lg:sticky lg:top-4 space-y-5">
          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-xs space-y-5">
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-slate-900">
                Session Options
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Publicly bookable 1-on-1 mentorship sessions
              </p>
            </div>

            {/* Session Option Cards */}
            <div className="space-y-3.5">
              {mentor.sessionOptions && mentor.sessionOptions.length > 0 ? (
                mentor.sessionOptions.map((opt) => (
                  <div
                    key={opt.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3 hover:border-blue-400 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-xs text-slate-900 font-display">{opt.title}</h4>
                      <span className="font-extrabold text-sm text-blue-600">
                        ₹{opt.price.toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {opt.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                      <span className="flex items-center gap-1 font-semibold text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        {opt.durationMin} mins
                      </span>

                      <button
                        type="button"
                        onClick={() => handleBookClick(opt.id, opt.title)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        Book Session
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  No active session options currently published.
                </div>
              )}
            </div>

            {/* Live Availability Status */}
            {mentor.nextAvailableAt ? (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-2.5 text-xs text-emerald-800 font-semibold">
                <Clock className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Next slot: {mentor.nextAvailableAt}</span>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                <Clock className="w-4 h-4 shrink-0 text-slate-400" />
                <span>No upcoming open slots scheduled currently.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
