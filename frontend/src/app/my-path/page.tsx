'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/lib/AuthContext';
import { getSavedTargetRoles } from '@/lib/careers/career-repository';
import { Compass, Sparkles, ArrowRight, HelpCircle } from 'lucide-react';

export default function MyPathPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hasPath, setHasPath] = useState(false);

  useEffect(() => {
    const saved = getSavedTargetRoles();
    if (saved.length > 0) {
      setHasPath(true);
      const primary = saved[saved.length - 1];
      router.replace(`/careers/${primary.slug}`);
    } else {
      setHasPath(false);
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading || hasPath) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span className="text-xs text-slate-400 font-medium">Loading My Path…</span>
        </div>
      </div>
    );
  }

  const isNotOnboarded = user && !user.isOnboarded;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0B0F19] text-slate-100 font-sans">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full flex items-center justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          {isNotOnboarded ? (
            /* ================= STATE 1: UNFINISHED ONBOARDING ================= */
            <>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Candidate Profile Setup</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display text-white">
                Let&rsquo;s figure out where you&rsquo;re going.
              </h1>

              {/* Subtitle */}
              <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                Complete your profile to get personalized career paths, learning recommendations, mentors, and opportunities.
              </p>

              {/* Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/onboarding"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 gap-2 text-sm"
                >
                  <span>Continue Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </>
          ) : (
            /* ================= STATE 2: PREFERRED PATHWAY.ECO EMPTY STATE ================= */
            <>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Your Career Journey Starts Here</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display text-white leading-tight">
                Not sure what&rsquo;s next? That&rsquo;s okay.
              </h1>

              {/* Subtitle */}
              <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                Your career journey doesn&rsquo;t need to start with a perfect plan. Explore different paths and find one that fits your interests, skills, and goals.
              </p>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/explore"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 gap-2 text-sm"
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore Career Paths</span>
                </Link>

                <Link
                  href="/tools"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 font-semibold hover:bg-slate-800 hover:text-white transition-all gap-2 text-sm"
                >
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>Help Me Find My Path</span>
                </Link>
              </div>

              {/* Guidance Link Underneath */}
              <div className="pt-4">
                <Link
                  href="/mentors"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Not sure what fits you? Get personalized guidance</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
