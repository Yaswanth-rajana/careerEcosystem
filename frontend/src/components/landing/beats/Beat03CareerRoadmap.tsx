'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Target, CheckCircle2, AlertCircle, BookOpen, LucideIcon } from 'lucide-react';

export interface RoadmapStep {
  num: string;
  tag: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  color: string;
  align: 'top' | 'bottom';
  isDestination?: boolean;
}

export interface Beat03CareerRoadmapProps {
  steps?: RoadmapStep[];
  className?: string;
}

const DEFAULT_STEPS: RoadmapStep[] = [
  {
    num: '01',
    tag: 'YOUR GOAL',
    title: 'Target Career Outcome',
    desc: 'Define your desired destination.',
    icon: Target,
    color: 'text-black',
    align: 'bottom',
  },
  {
    num: '02',
    tag: 'YOUR SKILLS',
    title: 'Verified Baseline',
    desc: 'Map your existing strengths, education, and experience.',
    icon: CheckCircle2,
    color: 'text-black',
    align: 'top',
  },
  {
    num: '03',
    tag: 'SKILL GAP',
    title: 'Targeted Delta',
    desc: 'Identify what is missing between where you are and where you want to be.',
    icon: AlertCircle,
    color: 'text-black',
    align: 'bottom',
  },
  {
    num: '04',
    tag: 'LEARN',
    title: 'Action Plan',
    desc: 'Build the skills that move you toward your goal.',
    icon: BookOpen,
    color: 'text-black',
    align: 'top',
    isDestination: true,
  },
];

export const Beat03CareerRoadmap: React.FC<Beat03CareerRoadmapProps> = ({
  steps = DEFAULT_STEPS,
  className = '',
}) => {
  const [activeStep, setActiveStep] = useState<string>('04');
  const shouldReduceMotion = useReducedMotion();

  // 4 Horizontal Track Positions (15%, 38.33%, 61.66%, 85%)
  const nodePositions = [
    { left: '15%', align: 'bottom' as const },
    { left: '38.33%', align: 'top' as const },
    { left: '61.66%', align: 'bottom' as const },
    { left: '85%', align: 'top' as const },
  ];

  return (
    <div className={`max-w-6xl mx-auto relative px-2 sm:px-4 ${className}`}>
      
      {/* ================= DESKTOP HORIZONTAL STRAIGHT ROADMAP (md & lg >= 768px) ================= */}
      <div className="hidden md:block relative h-[420px] w-full mt-0 mb-2">
        
        {/* 1. Muted Track Base Line - Starts at Node 01 (15%) and ends at Node 04 (85%) */}
        <div className="absolute left-[15%] right-[15%] top-1/2 -translate-y-1/2 h-[3px] bg-slate-200 rounded-full z-0 pointer-events-none" />

        {/* 2. Glowing Animated Progress Track Line - Starts at Node 01 (15%) and ends at Node 04 (85%) */}
        <div className="absolute left-[15%] right-[15%] top-1/2 -translate-y-1/2 h-[3px] z-0 pointer-events-none overflow-hidden rounded-full">
          <motion.div
            initial={shouldReduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="w-full h-full bg-slate-900 shadow-md origin-left"
          />
        </div>

        {/* 4 Milestone Nodes, Subtler Stem Lines, and Alternating Content Cards */}
        {steps.map((step, idx) => {
          const isActive = activeStep === step.num;
          const IconComponent = step.icon;
          const pos = nodePositions[idx];

          // Staggered animation delays
          const nodeDelay = shouldReduceMotion ? 0 : 0.3 + idx * 0.25;
          const cardDelay = shouldReduceMotion ? 0 : nodeDelay + 0.12;

          let stemBgClass = 'bg-slate-300';
          let nodeStyleClasses = '';
          let iconColorClass = '';

          if (isActive) {
            stemBgClass = 'bg-black shadow-sm';
            nodeStyleClasses = 'bg-black border-white text-white shadow-md scale-110 z-30';
            iconColorClass = 'text-white';
          } else {
            stemBgClass = 'bg-slate-300';
            nodeStyleClasses = 'bg-white border-slate-300 text-slate-700 hover:border-black group-hover:scale-105 shadow-sm';
            iconColorClass = 'text-slate-700';
          }

          return (
            <React.Fragment key={step.num}>
              
              {/* Connector Stem Container - Thinner/subtler 1.5px line for clean relationship without clutter */}
              <div
                style={{
                  left: pos.left,
                  top: pos.align === 'bottom' ? 'calc(50% + 24px)' : 'auto',
                  bottom: pos.align === 'top' ? 'calc(50% + 24px)' : 'auto',
                }}
                className="absolute -translate-x-1/2 w-[1.5px] h-8 z-10 pointer-events-none"
              >
                <motion.div
                  initial={shouldReduceMotion ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
                  whileInView={{ scaleY: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.25, delay: cardDelay }}
                  style={{ transformOrigin: pos.align === 'bottom' ? 'top center' : 'bottom center' }}
                  className={`w-full h-full transition-colors ${stemBgClass}`}
                />
              </div>

              {/* Milestone Node Circle Container - Exact (pos.left, 50%) center alignment */}
              <div
                style={{ left: pos.left, top: '50%' }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
              >
                <motion.div
                  initial={shouldReduceMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: nodeDelay, type: 'spring', stiffness: 280, damping: 22 }}
                  onClick={() => setActiveStep(step.num)}
                  onMouseEnter={() => setActiveStep(step.num)}
                  className="relative cursor-pointer group"
                  aria-label={`Milestone step ${step.num}: ${step.title}`}
                >
                  {/* Active Soft Pulsing Glow Ring */}
                  {isActive && !shouldReduceMotion && (
                    <motion.div
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute -inset-1.5 rounded-full border-2 border-black pointer-events-none"
                    />
                  )}

                  <div
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-md ${nodeStyleClasses}`}
                  >
                    <IconComponent className={`w-5 h-5 transition-colors ${iconColorClass}`} />
                  </div>
                </motion.div>
              </div>

              {/* Milestone Content Card Container - Positioned relative to 50% line */}
              <div
                style={{
                  left: pos.left,
                  top: pos.align === 'bottom' ? 'calc(50% + 56px)' : 'auto',
                  bottom: pos.align === 'top' ? 'calc(50% + 56px)' : 'auto',
                }}
                className="absolute -translate-x-1/2 z-10"
              >
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: pos.align === 'top' ? -12 : 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: cardDelay }}
                  onClick={() => setActiveStep(step.num)}
                  onMouseEnter={() => setActiveStep(step.num)}
                  className={`w-64 lg:w-72 p-4 rounded-xl backdrop-blur-md transition-all duration-200 border text-left cursor-pointer ${
                    isActive
                      ? 'bg-white border-black shadow-md scale-[1.02]'
                      : 'bg-white/80 border-slate-200 hover:border-black shadow-sm'
                  }`}
                >
                  {/* Card Top-Right Step Number Badge */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-black">
                      {step.tag}
                    </span>
                    <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                      0{idx + 1}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold font-display text-slate-900 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </motion.div>
              </div>

            </React.Fragment>
          );
        })}

      </div>

      {/* ================= MOBILE VERTICAL STACKED LIST (< 768px) ================= */}
      <div className="block md:hidden relative py-2 px-2">
        <div className="relative pl-2 sm:pl-4 space-y-6">
          
          {/* Continuous Vertical Guide Line */}
          <div className="absolute left-[26px] sm:left-[34px] top-6 bottom-6 w-0.5 bg-slate-200 pointer-events-none" />

          {steps.map((step, idx) => {
            const isActive = activeStep === step.num;
            const IconComponent = step.icon;

            let mobileNodeStyle = '';
            let iconColor = '';
            if (isActive) {
              mobileNodeStyle = 'bg-black border-white text-white shadow-md scale-105';
              iconColor = 'text-white';
            } else {
              mobileNodeStyle = 'bg-white border-slate-300 text-slate-700 shadow-xs';
              iconColor = 'text-slate-700';
            }

            return (
              <motion.div
                key={step.num}
                initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.12 }}
                onClick={() => setActiveStep(step.num)}
                className="relative flex items-start gap-4 cursor-pointer group"
              >
                {/* Mobile Left Node Marker */}
                <div
                  className={`relative z-10 w-11 h-11 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${mobileNodeStyle}`}
                >
                  <IconComponent className={`w-4 h-4 ${iconColor}`} />
                </div>

                {/* Mobile Right Content Card */}
                <div
                  className={`flex-1 p-4 rounded-xl border backdrop-blur-md transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-white border-black shadow-md'
                      : 'bg-white/80 border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-black">
                      {step.tag}
                    </span>
                    <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                      0{idx + 1}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold font-display text-slate-900 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
