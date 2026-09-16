'use client';

import React from 'react';
import { StoryBeatContainer } from './StoryBeatContainer';
import { Sparkles, ArrowRight, ArrowDown } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

export const Beat07Opportunity = () => {
  const shouldReduceMotion = useReducedMotion();

  const flowSteps = [
    { num: '01', label: 'YOUR PROFILE', desc: 'Background & Intent' },
    { num: '02', label: 'YOUR SKILLS', desc: 'Verified Capabilities' },
    { num: '03', label: 'JOB REQUIREMENTS', desc: 'Real Employer Needs' },
    { num: '04', label: 'MATCH', desc: 'Skills & Role Fit', isMatch: true },
    { num: '05', label: 'RIGHT OPPORTUNITY', desc: 'High-Fit Placement' },
  ];

  return (
    <StoryBeatContainer
      id="beat-07-opportunity"
      beatNumber="07"
      eyebrow="THE OPPORTUNITY & MATCH"
      title="Don't apply everywhere. Apply where you fit."
      subtext="Quality over volume. Align your verified strengths directly with organizations that need your exact capabilities."
    >
      <div className="max-w-5xl mx-auto text-left space-y-6">
        
        {/* Header Label: HOW IT WORKS */}
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-indigo" /> HOW IT WORKS
        </div>

        {/* ================= DESKTOP HORIZONTAL FLOW (md+) ================= */}
        <div className="hidden md:flex items-center justify-between gap-2 relative">
          {flowSteps.map((step, idx) => {
            const isMatch = step.isMatch;
            const isLast = idx === flowSteps.length - 1;
            const stepDelay = shouldReduceMotion ? 0 : idx * 0.18;

            return (
              <React.Fragment key={step.num}>
                {/* Step Card */}
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: isMatch ? 0.95 : 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: isMatch ? 0.45 : 0.35,
                    delay: stepDelay,
                    ease: 'easeOut',
                  }}
                  className={`flex-1 p-4 sm:p-4.5 rounded-2xl border text-center flex flex-col items-center justify-center space-y-1.5 transition-all duration-300 relative ${
                    isMatch
                      ? 'bg-brand-gradient text-white border-transparent shadow-[0_0_16px_rgba(108,92,231,0.4)] scale-[1.03] z-10'
                      : 'bg-white dark:bg-obsidian-800/80 border-slate-200 dark:border-obsidian-700/80 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {/* Integrated Focal Glow Pulse for Step 04 MATCH */}
                  {isMatch && !shouldReduceMotion && (
                    <motion.div
                      initial={{ scale: 1, opacity: 0.6 }}
                      animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.2, 0.6] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-0 rounded-2xl border border-white/40 pointer-events-none"
                    />
                  )}

                  <span
                    className={`text-[10px] font-extrabold font-mono tracking-wider ${
                      isMatch ? 'text-white/80' : 'text-brand-indigo dark:text-brand-indigo-light'
                    }`}
                  >
                    {step.num}
                  </span>

                  <h4 className={`text-xs font-bold font-display uppercase tracking-wider ${
                    isMatch ? 'text-white text-sm' : 'text-slate-900 dark:text-white'
                  }`}>
                    {step.label}
                  </h4>

                  <p className={`text-[11px] leading-tight ${
                    isMatch ? 'text-white/90 font-medium' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {step.desc}
                  </p>
                </motion.div>

                {/* Visible Thin Indigo Horizontal Connector Arrow */}
                {!isLast && (
                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -4 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: stepDelay + 0.1 }}
                    className="shrink-0 text-brand-indigo/80 dark:text-brand-indigo-light/80 px-1 drop-shadow-[0_0_6px_rgba(99,102,241,0.4)]"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* ================= MOBILE VERTICAL FLOW (< md) ================= */}
        <div className="flex md:hidden flex-col items-center space-y-3 relative">
          {flowSteps.map((step, idx) => {
            const isMatch = step.isMatch;
            const isLast = idx === flowSteps.length - 1;
            const stepDelay = shouldReduceMotion ? 0 : idx * 0.15;

            return (
              <React.Fragment key={step.num}>
                {/* Step Card Mobile */}
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: stepDelay }}
                  className={`w-full p-4 rounded-2xl border text-center flex flex-col items-center justify-center space-y-1 transition-all ${
                    isMatch
                      ? 'bg-brand-gradient text-white border-transparent shadow-[0_0_16px_rgba(108,92,231,0.4)] scale-[1.02] z-10'
                      : 'bg-white dark:bg-obsidian-800/80 border-slate-200 dark:border-obsidian-700 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <span
                    className={`text-[10px] font-extrabold font-mono tracking-wider ${
                      isMatch ? 'text-white/80' : 'text-brand-indigo dark:text-brand-indigo-light'
                    }`}
                  >
                    {step.num}
                  </span>

                  <h4 className={`text-xs font-bold font-display uppercase tracking-wider ${
                    isMatch ? 'text-white text-sm' : 'text-slate-900 dark:text-white'
                  }`}>
                    {step.label}
                  </h4>

                  <p className={`text-[11px] ${
                    isMatch ? 'text-white/90 font-medium' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {step.desc}
                  </p>
                </motion.div>

                {/* Visible Thin Indigo Vertical Connector Arrow Mobile */}
                {!isLast && (
                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.25, delay: stepDelay + 0.08 }}
                    className="text-brand-indigo/80 dark:text-brand-indigo-light/80 py-1 drop-shadow-[0_0_6px_rgba(99,102,241,0.4)]"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </motion.div>
                )}
              </React.Fragment>
            );
          })}
        </div>

      </div>
    </StoryBeatContainer>
  );
};
