'use client';

import React from 'react';
import { StoryBeatContainer } from './StoryBeatContainer';
import { Badge } from '@/components/design-system/Badge';
import { User, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

export const Beat05Guidance = () => {
  const shouldReduceMotion = useReducedMotion();

  const mentorshipCategories = [
    { label: 'Career Guidance', desc: 'Find your direction' },
    { label: 'Resume & Portfolio Review', desc: 'Position yourself better' },
    { label: 'Mock Technical Interview', desc: 'Practice with feedback' },
    { label: 'Career Switch Strategy', desc: 'Plan your transition' },
  ];

  return (
    <StoryBeatContainer
      id="beat-05-guidance"
      beatNumber="05"
      eyebrow="THE GUIDANCE"
      title="You don't have to figure it out alone."
      subtext="Get guidance from people who have already been where you want to go."
    >
      <div className="space-y-10 max-w-5xl mx-auto">
        
        {/* Main Hero Visual Container: Candidate -> Mentor Bridge */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-100/90 via-slate-50/80 to-blue-50/40 border border-slate-200/80 backdrop-blur-md shadow-sm">
          
          {/* Header Label: MENTORSHIP */}
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-8 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" /> MENTORSHIP
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left Side — YOU (Clean, Subdued Baseline) */}
            <div className="md:col-span-4">
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-6 rounded-2xl bg-white border border-slate-200 text-left space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <Badge variant="neutral" size="sm" className="text-[10px]">
                    Your Journey
                  </Badge>
                </div>
                <div>
                  <h4 className="text-lg font-bold font-display text-slate-900">
                    YOU
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Exploring choices, closing skill gaps, and preparing for what&apos;s next.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Center Animated Long Arrow Bridge (Thinner & Subtler by 25%) */}
            <div className="md:col-span-4 flex flex-col items-center justify-center py-4 md:py-0">
              <div className="relative flex flex-col items-center justify-center w-full px-2">
                
                {/* Desktop Long SVG Arrow */}
                <div className="w-full hidden md:block">
                  <svg className="w-full h-8 overflow-visible" viewBox="0 0 200 24" preserveAspectRatio="none" fill="none">
                    <defs>
                      <linearGradient id="long-arrow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#2563EB" />
                        <stop offset="100%" stopColor="#3B82F6" />
                      </linearGradient>
                      <filter id="arrow-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="1.8" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Muted Track Arrow */}
                    <path
                      d="M 5,12 L 182,12 M 170,5 L 184,12 L 170,19"
                      className="stroke-slate-300"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Glowing Animated Primary Long Arrow (Thinner 2.5px) */}
                    <motion.path
                      d="M 5,12 L 182,12 M 170,5 L 184,12 L 170,19"
                      stroke="url(#long-arrow-gradient)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#arrow-glow)"
                      initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.1, ease: "easeInOut" }}
                    />
                  </svg>
                </div>

                {/* Mobile Fallback Arrow */}
                <div className="block md:hidden text-blue-600 my-2">
                  <motion.svg
                    className="w-5 h-7"
                    viewBox="0 0 24 32"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="2" x2="12" y2="24" />
                    <polyline points="6 18 12 24 18 18" />
                  </motion.svg>
                </div>

              </div>
            </div>

            {/* Right Side — Verified Industry Mentor (Prominent Destination Card) */}
            <div className="md:col-span-4">
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-6 rounded-2xl bg-white border border-blue-200 shadow-md text-left space-y-3 ring-1 ring-blue-500/20"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                    <Award className="w-5 h-5" />
                  </div>
                  <Badge variant="brand" size="sm" className="text-[10px]">
                    Verified Mentor
                  </Badge>
                </div>
                <div>
                  <h4 className="text-lg font-bold font-display text-slate-900">
                    Verified Industry Mentor
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Experienced professionals who offer practical guidance, feedback, and perspective.
                  </p>
                </div>
              </motion.div>
            </div>

          </div>
        </div>

        {/* Mentorship Categories Grid */}
        <div className="space-y-4 text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            MENTORSHIP TRACKS
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mentorshipCategories.map((cat, idx) => (
              <motion.div
                key={cat.label}
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="p-4 rounded-xl bg-white border border-slate-200 flex items-start gap-3 hover:border-blue-300 shadow-sm transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-slate-900">{cat.label}</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">{cat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </StoryBeatContainer>
  );
};
