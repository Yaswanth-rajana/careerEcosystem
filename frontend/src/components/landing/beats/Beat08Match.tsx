'use client';

import React from 'react';
import { StoryBeatContainer } from './StoryBeatContainer';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { CheckCircle2, Zap, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

export const Beat08Match = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <StoryBeatContainer
      id="beat-08-match"
      beatNumber="08"
      eyebrow="THE MATCH ENGINE"
      title="The right match, not just any match."
      subtext="No blind applications. You only see roles where your skills already fit — and recruiters only see candidates who actually qualify."
    >
      <div className="max-w-4xl mx-auto">
        <Card variant="accent" className="relative p-6 sm:p-8 backdrop-blur-xl border-slate-200/80 dark:border-obsidian-700/80 text-left">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-8">
            
            {/* Left Side: Icon + Headline + Copy */}
            <div className="flex items-start gap-4 max-w-md">
              <div className="w-10.5 h-10.5 rounded-xl bg-brand-gradient text-white flex items-center justify-center shadow-glow shrink-0 mt-0.5">
                <Zap className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white">
                  How the match works
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Your verified skills and career goals are checked against real role requirements — not just keywords.
                </p>
              </div>
            </div>

            {/* Right Side: Animated Visual Flow (YOUR SKILLS ──→ ROLE NEEDS) */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="w-full md:w-auto flex items-center justify-between sm:justify-start gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl bg-slate-100/70 dark:bg-obsidian-800/70 border border-slate-200/70 dark:border-obsidian-700/70 text-xs shrink-0 shadow-sm"
            >
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  YOUR SKILLS
                </span>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verified Strengths</span>
                </div>
              </div>

              {/* Animated Arrow Connector */}
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: 0.25 }}
                className="text-brand-indigo dark:text-brand-indigo-light px-1 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
              >
                <ArrowRight className="w-4.5 h-4.5" />
              </motion.div>

              <div className="space-y-1.5 text-left">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-indigo dark:text-brand-indigo-light block">
                  ROLE NEEDS
                </span>
                <Badge variant="brand" size="sm" className="text-xs py-1 px-2.5 font-bold">
                  Good Match
                </Badge>
              </div>
            </motion.div>

          </div>
        </Card>
      </div>
    </StoryBeatContainer>
  );
};
