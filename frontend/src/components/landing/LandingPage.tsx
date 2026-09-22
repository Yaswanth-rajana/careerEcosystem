'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/design-system/Button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';

// 11-Beat Story Components
import { Beat02Possibilities } from './beats/Beat02Possibilities';
import { Beat03Direction } from './beats/Beat03Direction';
import { Beat04Learning } from './beats/Beat04Learning';
import { Beat05Guidance } from './beats/Beat05Guidance';
import { Beat06Preparation } from './beats/Beat06Preparation';
import { Beat07Opportunity } from './beats/Beat07Opportunity';
import { Beat08Match } from './beats/Beat08Match';
import { Beat09Growth } from './beats/Beat09Growth';
import { Beat10Ecosystem } from './beats/Beat10Ecosystem';
import { Beat11FinalCTA } from './beats/Beat11FinalCTA';

const HeroArtwork = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative w-full flex items-center justify-center"
    >
      <div className="relative w-full max-w-2xl lg:max-w-none">
        <Image
          src="/heroImg.png"
          alt="PATHWAY.ECO Career Path Ecosystem"
          width={1183}
          height={834}
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="w-full h-auto object-contain rounded-2xl shadow-lg"
        />

        {/* Soft Edge Blending */}
        <div className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-slate-900/10" />
      </div>
    </motion.div>
  );
};

export const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-slate-900">
      
      {/* HERO SECTION — BEAT 01 THE QUESTION */}
      <section id="beat-01-question" className="relative pt-16 pb-20 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28 overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-slate-100/80 via-[#F7F8FC] to-white">
        
        {/* Subtle Ambient Background Lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-indigo-500/5 opacity-40 pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-left z-10">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-slate-900 leading-[1.1]">
                There are many possible career paths.{' '}
                <span className="text-blue-600">
                  Find the right one.
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl font-normal leading-relaxed">
                One unified ecosystem for students, graduates, and professionals to navigate skill growth, mentorship, and career milestones.
              </p>

              {/* Dynamic Context-Aware CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                {user ? (
                  <>
                    <Link href="/dashboard">
                      <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md" rightIcon={<ArrowRight className="w-5 h-5" />}>
                        Continue Your Journey
                      </Button>
                    </Link>

                    <Link href="/dashboard">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white border-slate-300 text-slate-800 hover:bg-slate-50 shadow-sm">
                        View Dashboard
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/register">
                      <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md" rightIcon={<ArrowRight className="w-5 h-5" />}>
                        Start Your Journey
                      </Button>
                    </Link>

                    <Link href="/login">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white border-slate-300 text-slate-800 hover:bg-slate-50 shadow-sm">
                        Sign In to Account
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Dynamic Benefit Pills */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-600">
                {user ? (
                  <>
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Profile Ready
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Career Path Active
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Personalized Next Steps
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Free Candidate Profile
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Tailored Milestones
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> WCAG 2.1 AA
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Right Hero Artwork Column */}
            <div className="lg:col-span-6 relative w-full">
              <HeroArtwork />
            </div>

          </div>
        </div>
      </section>

      {/* SCROLL-BASED 11-BEAT STORY ARCHITECTURE */}
      <div className="space-y-0">
        <Beat02Possibilities />
        <Beat03Direction />
        <Beat04Learning />
        <Beat05Guidance />
        <Beat06Preparation />
        <Beat07Opportunity />
        <Beat08Match />
        <Beat09Growth />
        <Beat10Ecosystem />
        <Beat11FinalCTA />
      </div>

    </div>
  );
};
