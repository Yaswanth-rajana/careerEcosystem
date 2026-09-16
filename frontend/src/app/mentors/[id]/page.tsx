'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getMentorById } from '@/lib/mentors/mentor-repository';
import { Mentor, MentorSessionOption } from '@/lib/mentors/mentor-types';
import { BookingModal } from '@/components/mentors/BookingModal';
import { Button } from '@/components/design-system/Button';
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  Clock,
  Calendar,
  Briefcase,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  SearchX,
} from 'lucide-react';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

export default function MentorProfilePage() {
  const params = useParams();
  const mentorId = params?.id as string;
  const { user } = useAuth();
  const router = useRouter();

  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;
    const fetchMentor = async () => {
      setIsLoading(true);
      try {
        if (mentorId) {
          const res = await getMentorById(mentorId);
          if (isMounted) setMentor(res);
        }
      } catch {
        if (isMounted) setMentor(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchMentor();
    return () => {
      isMounted = false;
    };
  }, [mentorId]);

  const handleOpenBooking = (optionId?: string) => {
    if (!user) {
      router.push(`/login?from=/mentors/${mentorId}`);
      return;
    }
    setSelectedOptionId(optionId);
    setIsBookingOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#FAFAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-16 w-full flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-brand-indigo border-t-transparent animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#FAFAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100">
        <Header />
        <main className="flex-1 max-w-xl mx-auto px-4 py-20 w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-indigo/10 text-brand-indigo flex items-center justify-center mx-auto border border-brand-indigo/20">
            <SearchX className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Mentor Profile Not Found</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            The mentor profile you are looking for may have been updated or is no longer available.
          </p>
          <div className="pt-4">
            <Link href="/mentors">
              <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />} className="bg-brand-gradient text-white">
                Back to Mentors Discovery
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAFAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/mentors"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-indigo dark:hover:text-brand-indigo-light transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Mentors Discovery</span>
          </Link>
        </div>

        {/* Profile Grid Header & Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Info Column (8 cols) - Single Plain Card Container */}
          <div className="lg:col-span-8 text-left">
            <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm space-y-8">
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shrink-0 shadow-md">
                  <Image src={mentor.avatar} alt={mentor.name} fill className="object-cover" sizes="112px" priority />
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white">
                      {mentor.name}
                    </h1>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-indigo/10 text-brand-indigo dark:text-brand-indigo-light text-xs font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{mentor.badgeLabel}</span>
                    </div>
                  </div>

                  <p className="text-base font-semibold text-slate-700 dark:text-slate-200">{mentor.role}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{mentor.domain}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-1">
                    <div className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{mentor.rating.toFixed(1)}</span>
                      <span className="text-slate-400 font-normal">({mentor.reviewCount} reviews)</span>
                    </div>
                    <span>·</span>
                    <span>{mentor.sessionCount} sessions completed</span>
                    <span>·</span>
                    <span>{mentor.experienceYears}+ years experience</span>
                  </div>
                </div>
              </div>

              {/* About Section (Unified Bio + Details) */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">About</h2>
                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {mentor.bio && (
                    <p className="font-medium italic text-slate-700 dark:text-slate-200">
                      &quot;{mentor.bio}&quot;
                    </p>
                  )}
                  {mentor.about.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Expertise & Skills */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
                <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">Expertise & Skills</h2>
                
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 font-display">
                    Domains
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.map((exp) => (
                      <span key={exp} className="px-3 py-1 rounded-xl bg-brand-indigo/10 text-brand-indigo dark:text-brand-indigo-light text-xs font-bold">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 font-display">
                    Core Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.skillsList.map((skill) => (
                      <span key={skill} className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* "I Can Help You With" Checklist */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
                <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">I Can Help You With</h2>
                <div className="space-y-3">
                  {mentor.helpTopics.map((topic, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience Timeline */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
                <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">Professional Experience</h2>
                <div className="space-y-4">
                  {mentor.workHistory.map((work, i) => (
                    <div key={i} className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white font-display">{work.role}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{work.organizationType} · {work.period}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              {mentor.reviews && mentor.reviews.length > 0 && (
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
                  <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-brand-indigo" />
                    <span>Verified Mentee Reviews</span>
                  </h2>
                  <div className="space-y-4">
                    {mentor.reviews.map((rev) => (
                      <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{rev.authorName}</span>
                          <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{rev.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-serif italic">
                          &quot;{rev.comment}&quot;
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span>{rev.sessionType}</span>
                          <span>{rev.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right Session Options Column (4 cols) */}
          <div className="lg:col-span-4 sticky top-24 space-y-6 text-left">
            <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-lg space-y-6">
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">Session Options</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Book 1-on-1 private guidance</p>
              </div>

              {/* Session cards */}
              <div className="space-y-4">
                {mentor.sessionOptions?.map((opt: MentorSessionOption) => (
                  <div
                    key={opt.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3 hover:border-brand-indigo/60 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white font-display">{opt.title}</h4>
                      <span className="font-extrabold text-sm text-brand-indigo dark:text-brand-indigo-light">
                        ₹{opt.price.toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{opt.description}</p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-brand-violet" />
                        {opt.durationMin} mins
                      </span>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenBooking(opt.id)}
                        className="bg-brand-gradient text-white text-xs font-bold py-1.5 px-3"
                      >
                        Book Session
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Availability Note */}
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                <Clock className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>Next slot: {mentor.nextAvailableAt}</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Booking Modal */}
      <BookingModal
        mentor={mentor}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        preSelectedOptionId={selectedOptionId}
      />

      <Footer />
    </div>
  );
}
