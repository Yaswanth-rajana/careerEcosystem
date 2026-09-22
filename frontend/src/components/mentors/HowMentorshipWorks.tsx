'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Compass, Search, Calendar, TrendingUp } from 'lucide-react';

interface StageItem {
  number: string;
  title: string;
  headline: string;
  detail: string;
  icon: React.ReactNode;
  colorClass: string;
  bgGlowClass: string;
}

export const HowMentorshipWorks: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const stages: StageItem[] = [
    {
      number: '01',
      title: 'CHOOSE',
      headline: 'Start with what you need.',
      detail: 'Career direction, resume, interviews, technical guidance, or a career switch.',
      icon: <Compass className="w-3.5 h-3.5 text-blue-600" />,
      colorClass: 'text-blue-600',
      bgGlowClass: 'bg-blue-50 border-blue-200',
    },
    {
      number: '02',
      title: 'FIND',
      headline: 'Meet someone who fits your goal.',
      detail: 'Discover mentors based on their experience and expertise.',
      icon: <Search className="w-3.5 h-3.5 text-blue-600" />,
      colorClass: 'text-blue-600',
      bgGlowClass: 'bg-blue-50 border-blue-200',
    },
    {
      number: '03',
      title: 'BOOK',
      headline: 'Choose a session that works for you.',
      detail: 'Pick your session type, duration, and available time.',
      icon: <Calendar className="w-3.5 h-3.5 text-blue-600" />,
      colorClass: 'text-blue-600',
      bgGlowClass: 'bg-blue-50 border-blue-200',
    },
    {
      number: '04',
      title: 'GROW',
      headline: 'Turn guidance into your next step.',
      detail: 'Apply what you learn and keep moving forward.',
      icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />,
      colorClass: 'text-emerald-600',
      bgGlowClass: 'bg-emerald-50 border-emerald-200',
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-14 sm:py-16 border-b border-slate-200/60 bg-[#FAFAFC] text-slate-900 transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16 space-y-2">
          <h2 className="text-3xl font-extrabold font-display text-slate-900 tracking-tight">
            How mentorship works
          </h2>
          <p className="text-sm font-medium text-slate-600">
            Find guidance that moves you forward.
          </p>
        </div>

        {/* Desktop Journey: Single Continuous Horizontal Track */}
        <div className="hidden lg:block relative py-4">
          
          {/* Continuous Blue Path Line passing through VERTICAL CENTER of pills */}
          <div className="absolute top-[43px] left-[12.5%] right-[12.5%] h-[2px] bg-slate-200 z-0">
            <div className="h-full bg-blue-600 opacity-90" />
          </div>

          <div className="grid grid-cols-4 gap-6 relative z-10">
            {stages.map((stage, idx) => (
              <motion.div
                key={stage.number}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="flex flex-col items-center text-center space-y-3 p-2"
              >
                {/* Node Pill Header (Solid section background hides line behind node) */}
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-slate-300 bg-[#FAFAFC] shadow-sm z-10">
                  <span className={`text-xs font-black font-display ${stage.colorClass}`}>
                    {stage.number}
                  </span>
                  <div className={`p-1.5 rounded-full ${stage.bgGlowClass} border`}>
                    {stage.icon}
                  </div>
                  <span className="text-xs font-bold font-display tracking-wider text-slate-900 uppercase">
                    {stage.title}
                  </span>
                </div>

                {/* Content Block */}
                <div className="space-y-1.5 pt-2 max-w-[220px]">
                  <p className="text-sm font-bold text-slate-900 font-display">
                    {stage.headline}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {stage.detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile Journey: Vertical Continuous Path */}
        <div className="lg:hidden relative pl-6 space-y-8 max-w-md mx-auto">
          {/* Vertical Connecting Line */}
          <div className="absolute top-4 bottom-4 left-[23px] w-[2px] bg-blue-600 opacity-70" />

          {stages.map((stage, idx) => (
            <motion.div
              key={stage.number}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className="relative flex items-start gap-4"
            >
              {/* Node Indicator */}
              <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 bg-white shadow-sm shrink-0">
                <span className={`text-xs font-extrabold font-display ${stage.colorClass}`}>
                  {stage.number}
                </span>
              </div>

              {/* Node Details */}
              <div className="space-y-1 text-left pt-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold font-display tracking-wider text-slate-900 uppercase">
                    {stage.title}
                  </span>
                  <div className={`p-0.5 rounded-full ${stage.bgGlowClass} border`}>
                    {stage.icon}
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-900 font-display">
                  {stage.headline}
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {stage.detail}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};


