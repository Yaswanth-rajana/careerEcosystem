'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/design-system/Button';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { StoryBeatContainer } from './StoryBeatContainer';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';

export const Beat11FinalCTA = () => {
  const shouldReduceMotion = useReducedMotion();
  const { user } = useAuth();

  return (
    <StoryBeatContainer id="beat-11-final-cta">
      <Card variant="accent" className="p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden backdrop-blur-2xl border-slate-200 bg-white shadow-sm">
        
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          
          {/* Eyebrow Badge */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <Badge variant="brand" className="py-1 px-3">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 inline text-blue-600" />
              {user ? 'YOUR JOURNEY CONTINUES' : 'YOUR NEXT STEP STARTS HERE'}
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h3
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-slate-900 tracking-tight leading-tight"
          >
            {user ? 'Continue your career journey.' : 'Start your journey.'}
          </motion.h3>

          {/* Supporting Text */}
          <motion.p
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.25 }}
            className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal"
          >
            {user
              ? 'Discover where you want to go, understand what you need, and move forward with the right guidance.'
              : 'Whether you&apos;re starting out, changing direction, or ready for what&apos;s next — your journey starts here.'}
          </motion.p>

          {/* Context-Aware CTA Buttons */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.35 }}
            className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto px-7" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Continue Your Journey
                  </Button>
                </Link>

                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto px-7">
                    View Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/register">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto px-7" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Start Your Journey
                  </Button>
                </Link>

                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto px-7">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </motion.div>

          {/* Value Points / Benefit Pills */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 border-t border-slate-200 mt-6"
          >
            {user ? (
              <>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Profile Ready
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Career Path Set
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Next Step Ready
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Free Candidate Profile
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Personalized Career Path
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Built Around Your Goals
                </span>
              </>
            )}
          </motion.div>

        </div>

      </Card>
    </StoryBeatContainer>
  );
};
