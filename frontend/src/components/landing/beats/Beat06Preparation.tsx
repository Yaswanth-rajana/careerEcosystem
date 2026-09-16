'use client';

import React, { useState } from 'react';
import { StoryBeatContainer } from './StoryBeatContainer';
import { Sparkles, FolderGit2, Code2, MessageSquareCode, ShieldCheck } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

export const Beat06Preparation = () => {
  const [activeStep, setActiveStep] = useState<string>('04');
  const shouldReduceMotion = useReducedMotion();

  const steps = [
    {
      num: '01',
      title: 'Build Real-World Projects',
      desc: 'Turn what you’ve learned into practical work you can show.',
      icon: FolderGit2,
    },
    {
      num: '02',
      title: 'Build Your Portfolio',
      desc: 'Showcase your skills, projects, and experience with confidence.',
      icon: Code2,
    },
    {
      num: '03',
      title: 'Practice for Interviews',
      desc: 'Build confidence through realistic technical and behavioral practice.',
      icon: MessageSquareCode,
    },
    {
      num: '04',
      title: 'Know You’re Ready',
      desc: 'Review your progress and focus on what still needs improvement.',
      icon: ShieldCheck,
      isDestination: true,
    },
  ];

  return (
    <StoryBeatContainer
      id="beat-06-preparation"
      beatNumber="06"
      eyebrow="THE PREPARATION"
      title="Become ready."
      subtext="Build the practical skills, projects, and confidence you need to be ready for what's next."
    >
      <div className="w-full max-w-5xl text-left space-y-8">
        
        {/* Header Label: YOUR READINESS PATH */}
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-indigo" /> YOUR READINESS PATH
        </div>

        {/* Left-Aligned Vertical Timeline Container */}
        <div className="relative space-y-6 sm:space-y-8">
          
          {/* 4 Vertical Timeline Steps */}
          {steps.map((step, idx) => {
            const isActive = activeStep === step.num;
            const isLast = idx === steps.length - 1;
            const IconComponent = step.icon;

            const stepDelay = shouldReduceMotion ? 0 : 0.2 + idx * 0.22;

            let nodeClasses = '';
            let iconColorClass = '';

            if (isActive) {
              nodeClasses = 'bg-brand-gradient text-white border-white shadow-glow ring-4 ring-brand-indigo/30 scale-105';
              iconColorClass = 'text-white';
            } else if (step.isDestination) {
              nodeClasses = 'bg-white dark:bg-[#0B0B14] border-brand-violet text-brand-violet shadow-sm group-hover:border-brand-violet group-hover:scale-105';
              iconColorClass = 'text-brand-violet';
            } else {
              nodeClasses = 'bg-white dark:bg-[#0B0B14] border-slate-300 dark:border-slate-700 text-brand-indigo dark:text-brand-indigo-light group-hover:border-brand-indigo group-hover:scale-105 shadow-sm dark:shadow-none';
              iconColorClass = 'text-brand-indigo dark:text-brand-indigo-light';
            }

            return (
              <motion.div
                key={step.num}
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: stepDelay }}
                onClick={() => setActiveStep(step.num)}
                onMouseEnter={() => setActiveStep(step.num)}
                className="relative flex items-center gap-3 sm:gap-5 group cursor-pointer"
              >
                {/* Column 1: Step Number (01, 02, 03, 04) */}
                <div className="w-5 sm:w-6 text-left shrink-0">
                  <span
                    className={`text-xs font-mono font-bold tracking-tight transition-colors ${
                      isActive ? 'text-brand-indigo dark:text-brand-indigo-light' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {step.num}
                  </span>
                </div>

                {/* Column 2: Node Circle & Vertical Guide Line */}
                <div className="w-11 sm:w-12 relative flex items-center justify-center shrink-0">
                  
                  {/* Base Vertical Connector Line */}
                  {!isLast && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-1/2 h-20 sm:h-24 w-0.5 bg-slate-200 dark:bg-obsidian-700 pointer-events-none z-0" />
                  )}

                  {/* Animated Glowing Vertical Connector Line */}
                  {!isLast && (
                    <motion.div
                      initial={shouldReduceMotion ? { scaleY: 1 } : { scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: stepDelay + 0.1, ease: 'easeInOut' }}
                      style={{ transformOrigin: 'top center' }}
                      className="absolute left-1/2 -translate-x-1/2 top-1/2 h-20 sm:h-24 w-0.5 bg-gradient-to-b from-brand-indigo via-indigo-400 to-brand-violet shadow-[0_0_8px_rgba(99,102,241,0.6)] pointer-events-none z-0"
                    />
                  )}

                  {/* Circular Node Icon */}
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative z-10 ${nodeClasses}`}
                  >
                    <IconComponent className={`w-5 h-5 transition-colors ${iconColorClass}`} />
                  </div>
                </div>

                {/* Column 3: Step Title & Description */}
                <div className="flex-1 space-y-1 text-left">
                  <h3
                    className={`text-base sm:text-lg font-bold font-display transition-colors ${
                      isActive
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                    }`}
                  >
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </StoryBeatContainer>
  );
};
