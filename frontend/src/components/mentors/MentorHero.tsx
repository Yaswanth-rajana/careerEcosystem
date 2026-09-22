'use client';

import React from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, ArrowRight, Compass } from 'lucide-react';
import { Button } from '@/components/design-system/Button';

export const MentorHero: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const handleScrollToDiscovery = () => {
    const el = document.getElementById('mentor-discovery');
    if (el) {
      el.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
    }
  };

  const handleScrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-24 border-b border-slate-200/60 bg-[#FAFAFC]">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-glass-glow pointer-events-none opacity-70" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text & Actions Column */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> 1-ON-1 GUIDANCE
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-slate-900 leading-[1.1]">
              Find the right mentor{' '}
              <span className="text-blue-600">
                for your next step.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              Get practical guidance from experienced professionals who’ve already walked the path you’re taking.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={handleScrollToDiscovery}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md py-3.5 px-6 rounded-xl"
              >
                Find a Mentor
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleScrollToHowItWorks}
                className="border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold py-3.5 px-6 rounded-xl"
              >
                How mentorship works
              </Button>
            </div>

            {/* Trust Micro-Bullets */}
            <div className="pt-4 flex items-center gap-6 text-xs font-medium text-slate-500 border-t border-slate-200/60">
              <div className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>Custom Career Matching</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Verified Industry Experts</span>
              </div>
            </div>
          </motion.div>

          {/* Right Visual Column */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-6 relative flex justify-center items-center"
          >
            <div className="relative w-full max-w-lg lg:max-w-none rounded-2xl overflow-hidden border border-slate-200/80 bg-white/40 backdrop-blur-md shadow-2xl group">
              <Image
                src="/mentorHero.png"
                alt="PATHWAY.ECO 1-on-1 Mentorship Visual"
                width={1200}
                height={675}
                priority
                className="w-full h-auto object-cover rounded-2xl transform group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
