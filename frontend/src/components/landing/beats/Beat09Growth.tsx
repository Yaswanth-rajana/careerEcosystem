'use client';

import React, { useState } from 'react';
import { StoryBeatContainer } from './StoryBeatContainer';
import { Briefcase, Award, TrendingUp, Sparkles, Rocket, Repeat } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

export const Beat09Growth = () => {
  const [activeStep, setActiveStep] = useState<string>('01');
  const shouldReduceMotion = useReducedMotion();

  // 5 Milestones 100% EQUALLY DISTANCED with PERFECT VERTICAL MIRROR SYMMETRY
  // Circle Center: (260, 260), Radius: 165 in 520x520 square viewBox
  // 01 JOB: 198° Top-Left (19.82%, 40.19%) -> Card LEFT
  // 02 EXPERIENCE: 270° Top-Center (50.0%, 18.27%) -> Card TOP
  // 03 UPSKILL: 342° Top-Right (80.18%, 40.19%) -> Card RIGHT
  // 04 CAREER GROWTH: 54° Bottom-Right (68.65%, 75.67%) -> Card RIGHT
  // 05 NEW OPPORTUNITIES: 126° Bottom-Left (31.35%, 75.67%) -> Card LEFT
  const loopNodes: Array<{
    num: string;
    title: string;
    desc: string;
    icon: React.ElementType;
    coords: {
      left: string;
      top: string;
      cardAlign: 'top' | 'bottom' | 'left' | 'right';
    };
  }> = [
    {
      num: '01',
      title: 'JOB',
      desc: 'Land your target role',
      icon: Briefcase,
      coords: { left: '19.82%', top: '40.19%', cardAlign: 'left' },
    },
    {
      num: '02',
      title: 'EXPERIENCE',
      desc: 'Build real-world mastery',
      icon: Award,
      coords: { left: '50.0%', top: '18.27%', cardAlign: 'top' },
    },
    {
      num: '03',
      title: 'UPSKILL',
      desc: 'Build your next capability',
      icon: TrendingUp,
      coords: { left: '80.18%', top: '40.19%', cardAlign: 'right' },
    },
    {
      num: '04',
      title: 'CAREER GROWTH',
      desc: 'Take on bigger opportunities',
      icon: Sparkles,
      coords: { left: '68.65%', top: '75.67%', cardAlign: 'right' },
    },
    {
      num: '05',
      title: 'NEW OPPORTUNITIES',
      desc: "Move toward what's next",
      icon: Rocket,
      coords: { left: '31.35%', top: '75.67%', cardAlign: 'left' },
    },
  ];

  return (
    <StoryBeatContainer
      id="beat-09-growth"
      beatNumber="09"
      eyebrow="THE GROWTH"
      title="Keep moving forward."
      subtext="Career growth doesn't stop when you get hired. Every milestone creates your next opportunity."
    >
      <div className="max-w-6xl mx-auto text-left space-y-6">
        
        {/* Header Label: CONTINUOUS CAREER JOURNEY */}
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Repeat className="w-3.5 h-3.5 text-brand-indigo animate-spin" style={{ animationDuration: '12s' }} />
          CONTINUOUS CAREER JOURNEY
        </div>

        {/* ================= DESKTOP PERFECT CIRCULAR ORBITAL PATH (md+) ================= */}
        <div className="hidden md:block relative h-[540px] w-full max-w-4xl mx-auto my-4">
          <div className="relative w-[520px] h-[520px] mx-auto">
          
          {/* Continuous Perfect Circle SVG Orbit Track */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 520 520"
              preserveAspectRatio="xMidYMid meet"
              fill="none"
            >
              <defs>
                <linearGradient id="growth-loop-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="50%" stopColor="#818CF8" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
                <filter id="growth-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Muted Track Perfect Circle Orbit */}
              <circle
                cx="260"
                cy="260"
                r="165"
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="3.5"
              />

              {/* Glowing Animated Perfect Circle Orbit Path starting at Node 01 (JOB) */}
              <motion.path
                d="M 103.08,209.01 A 165,165 0 1,1 416.92,310.99 A 165,165 0 1,1 103.08,209.01"
                stroke="url(#growth-loop-gradient)"
                strokeWidth="4"
                filter="url(#growth-glow)"
                strokeLinecap="round"
                initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
              />
            </svg>
          </div>

          {/* 5 Milestone Nodes & Floating Cards */}
          {loopNodes.map((node, idx) => {
            const isActive = activeStep === node.num;
            const IconComponent = node.icon;
            const coords = node.coords;
            const nodeDelay = shouldReduceMotion ? 0 : 0.2 + idx * 0.18;

            let cardStyle: React.CSSProperties = {};
            let cardTransformClass = '';

            if (coords.cardAlign === 'top') {
              cardStyle = { left: coords.left, bottom: `calc(100% - ${coords.top} + 28px)` };
              cardTransformClass = '-translate-x-1/2';
            } else if (coords.cardAlign === 'bottom') {
              cardStyle = { left: coords.left, top: `calc(${coords.top} + 28px)` };
              cardTransformClass = '-translate-x-1/2';
            } else if (coords.cardAlign === 'left') {
              cardStyle = { right: `calc(100% - ${coords.left} + 28px)`, top: coords.top };
              cardTransformClass = '-translate-y-1/2';
            } else if (coords.cardAlign === 'right') {
              cardStyle = { left: `calc(${coords.left} + 28px)`, top: coords.top };
              cardTransformClass = '-translate-y-1/2';
            }

            return (
              <React.Fragment key={node.num}>
                
                {/* Node Circle Anchor at (coords.left, coords.top) */}
                <div
                  style={{ left: coords.left, top: coords.top }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <motion.div
                    initial={shouldReduceMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: nodeDelay, type: 'spring', stiffness: 260, damping: 20 }}
                    onClick={() => setActiveStep(node.num)}
                    onMouseEnter={() => setActiveStep(node.num)}
                    className="relative cursor-pointer group"
                    aria-label={`Milestone ${node.num}: ${node.title}`}
                  >
                    {isActive && !shouldReduceMotion && (
                      <motion.div
                        initial={{ scale: 1, opacity: 0.8 }}
                        animate={{ scale: [1, 1.45, 1], opacity: [0.8, 0.2, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute -inset-1.5 rounded-full border-2 border-[#6C5CE7] pointer-events-none"
                      />
                    )}

                    <div
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-md ${
                        isActive
                          ? 'bg-brand-gradient text-white border-white shadow-glow scale-110'
                          : 'bg-white dark:bg-[#0B0B14] border-slate-300 dark:border-brand-indigo/40 text-brand-indigo dark:text-brand-indigo-light hover:border-brand-indigo group-hover:scale-105 shadow-sm dark:shadow-none'
                      }`}
                    >
                      <IconComponent className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-brand-indigo dark:text-indigo-300'}`} />
                    </div>
                  </motion.div>
                </div>

                {/* Milestone Floating Content Card */}
                <div
                  style={cardStyle}
                  className={`absolute ${cardTransformClass} z-10`}
                >
                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: coords.cardAlign === 'top' ? -10 : 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: nodeDelay + 0.1 }}
                    onClick={() => setActiveStep(node.num)}
                    onMouseEnter={() => setActiveStep(node.num)}
                    className={`w-44 lg:w-48 p-3.5 rounded-2xl backdrop-blur-md transition-all duration-200 border text-center cursor-pointer ${
                      isActive
                        ? 'bg-white/95 dark:bg-obsidian-800/95 border-[#6C5CE7] shadow-glow scale-[1.02]'
                        : 'bg-white/70 dark:bg-obsidian-800/70 border-slate-200/80 dark:border-obsidian-700/80 hover:border-brand-indigo/40'
                    }`}
                  >
                    <span className="text-[10px] font-extrabold font-mono tracking-wider text-brand-indigo dark:text-brand-indigo-light block mb-0.5">
                      0{idx + 1}
                    </span>
                    <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-900 dark:text-white mb-0.5">
                      {node.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                      {node.desc}
                    </p>
                  </motion.div>
                </div>

              </React.Fragment>
            );
          })}

          </div>
        </div>

        {/* ================= MOBILE VERTICAL ROADMAP (< md) ================= */}
        <div className="block md:hidden relative py-2 pl-2">
          <div className="relative pl-2 sm:pl-4 space-y-6">
            <div className="absolute left-[26px] sm:left-[34px] top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-obsidian-700 pointer-events-none" />

            {loopNodes.map((node, idx) => {
              const isActive = activeStep === node.num;
              const IconComponent = node.icon;

              return (
                <motion.div
                  key={node.num}
                  initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.12 }}
                  onClick={() => setActiveStep(node.num)}
                  className="relative flex items-start gap-4 cursor-pointer group"
                >
                  <div
                    className={`relative z-10 w-11 h-11 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isActive
                        ? 'bg-brand-gradient text-white border-white shadow-glow scale-105'
                        : 'bg-white dark:bg-[#0B0B14] border-slate-300 dark:border-brand-indigo/40 text-brand-indigo dark:text-indigo-300'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-300'}`} />
                  </div>

                  <div
                    className={`flex-1 p-4 rounded-xl border backdrop-blur-md transition-all duration-200 text-left ${
                      isActive
                        ? 'bg-white dark:bg-obsidian-800 border-[#6C5CE7] shadow-md'
                        : 'bg-white/70 dark:bg-obsidian-800/70 border-slate-200 dark:border-obsidian-700'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold text-brand-indigo dark:text-brand-indigo-light block mb-0.5">
                      0{idx + 1}
                    </span>
                    <h3 className="text-xs font-bold font-display uppercase tracking-wider text-slate-900 dark:text-white mb-0.5">
                      {node.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {node.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </StoryBeatContainer>
  );
};
