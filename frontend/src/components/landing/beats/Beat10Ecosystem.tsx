'use client';

import React from 'react';
import { StoryBeatContainer } from './StoryBeatContainer';
import { Compass, BookOpen, Users, Briefcase, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

export const Beat10Ecosystem = () => {
  const shouldReduceMotion = useReducedMotion();

  const modules = [
    {
      id: 'learn',
      title: 'LEARN',
      desc: 'Build the skills you need.',
      icon: BookOpen,
      color: 'text-blue-600',
      strokeColor: '#2563EB',
      // Coordinates in 800x400 viewBox
      cardPos: 'top-left',
      startPoint: { x: 280, y: 90 },
      endPoint: { x: 341, y: 146 },
      delay: 0.2,
    },
    {
      id: 'mentor',
      title: 'MENTOR',
      desc: "Learn from people who've been there.",
      icon: Users,
      color: 'text-blue-600',
      strokeColor: '#3B82F6',
      cardPos: 'top-right',
      startPoint: { x: 520, y: 90 },
      endPoint: { x: 459, y: 146 },
      delay: 0.6,
    },
    {
      id: 'jobs',
      title: 'JOBS',
      desc: 'Find opportunities that fit.',
      icon: Briefcase,
      color: 'text-blue-600',
      strokeColor: '#2563EB',
      cardPos: 'bottom-left',
      startPoint: { x: 280, y: 310 },
      endPoint: { x: 341, y: 254 },
      delay: 1.0,
    },
    {
      id: 'guidance',
      title: 'CAREER GUIDANCE',
      desc: 'Know what to do next.',
      icon: Compass,
      color: 'text-blue-600',
      strokeColor: '#3B82F6',
      cardPos: 'bottom-right',
      startPoint: { x: 520, y: 310 },
      endPoint: { x: 459, y: 254 },
      delay: 1.4,
    },
  ];

  return (
    <StoryBeatContainer
      id="beat-10-ecosystem"
      beatNumber="10"
      eyebrow="THE ECOSYSTEM"
      title="Everything works together."
      subtext="Four core building blocks converging into one continuous career platform."
    >
      <div className="max-w-5xl mx-auto text-left space-y-4">

        {/* ================= DESKTOP CONVERGENCE DIAGRAM (md+) ================= */}
        <div className="hidden md:block relative h-[440px] w-full my-2">
          
          {/* SVG Uncrossed Converging Connector Lines */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <svg
              className="w-full h-full"
              viewBox="0 0 800 400"
              preserveAspectRatio="xMidYMid meet"
              fill="none"
            >
              <defs>
                <filter id="connector-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 4 Clean Direct Connectors */}
              {modules.map((mod) => (
                <g key={`path-${mod.id}`}>
                  {/* Background Track Line */}
                  <line
                    x1={mod.startPoint.x}
                    y1={mod.startPoint.y}
                    x2={mod.endPoint.x}
                    y2={mod.endPoint.y}
                    stroke="#E2E8F0"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                  />

                  {/* Sequential Animated Connector Line */}
                  <motion.line
                    x1={mod.startPoint.x}
                    y1={mod.startPoint.y}
                    x2={mod.endPoint.x}
                    y2={mod.endPoint.y}
                    stroke={mod.strokeColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: mod.delay, ease: 'easeOut' }}
                  />
                </g>
              ))}
            </svg>
          </div>

          {/* Central Ecosystem Center Node */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <motion.div
              initial={shouldReduceMotion ? { scale: 1, opacity: 1 } : { scale: 0.85, opacity: 0.6 }}
              whileInView={
                shouldReduceMotion
                  ? { scale: 1, opacity: 1 }
                  : {
                      scale: [0.85, 1.08, 1],
                      opacity: [0.6, 1, 1],
                    }
              }
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1.8, ease: 'easeOut' }}
              className="w-40 h-40 sm:w-44 sm:h-44 rounded-full bg-blue-600 flex flex-col items-center justify-center text-center p-4 shadow-lg z-20 relative ring-4 ring-blue-500/20"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-1.5 backdrop-blur-sm">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-extrabold font-display uppercase tracking-wider text-white leading-tight">
                CAREER ECOSYSTEM
              </span>
              <span className="text-[10px] sm:text-xs text-white/80 font-medium mt-1">
                One connected journey
              </span>
            </motion.div>
          </div>

          {/* 4 Corner Module Cards */}
          {/* Top-Left: LEARN */}
          <div className="absolute left-[8%] top-[10%] z-10 w-64">
            <ModuleCard module={modules[0]} shouldReduceMotion={shouldReduceMotion} />
          </div>

          {/* Top-Right: MENTOR */}
          <div className="absolute right-[8%] top-[10%] z-10 w-64">
            <ModuleCard module={modules[1]} shouldReduceMotion={shouldReduceMotion} />
          </div>

          {/* Bottom-Left: JOBS */}
          <div className="absolute left-[8%] bottom-[10%] z-10 w-64">
            <ModuleCard module={modules[2]} shouldReduceMotion={shouldReduceMotion} />
          </div>

          {/* Bottom-Right: CAREER GUIDANCE */}
          <div className="absolute right-[8%] bottom-[10%] z-10 w-64">
            <ModuleCard module={modules[3]} shouldReduceMotion={shouldReduceMotion} />
          </div>

        </div>

        {/* ================= MOBILE STACKED / GRID (< md) ================= */}
        <div className="block md:hidden space-y-4 pt-2">
          {/* Central Mobile Badge */}
          <div className="flex justify-center my-4">
            <div className="px-5 py-3 rounded-full bg-blue-600 text-white flex items-center gap-2 shadow-md text-xs font-bold font-display uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>CAREER ECOSYSTEM • One connected journey</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {modules.map((mod, idx) => (
              <ModuleCard key={mod.id} module={mod} shouldReduceMotion={shouldReduceMotion} delay={idx * 0.1} />
            ))}
          </div>
        </div>

      </div>
    </StoryBeatContainer>
  );
};

interface ModuleCardProps {
  module: {
    title: string;
    desc: string;
    icon: React.ElementType;
    color: string;
    delay?: number;
  };
  shouldReduceMotion?: boolean | null;
  delay?: number;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, shouldReduceMotion, delay }) => {
  const IconComponent = module.icon;
  const cardDelay = delay ?? module.delay ?? 0;

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: cardDelay }}
      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 transition-all text-left flex items-start gap-3.5 group cursor-pointer"
    >
      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
        <IconComponent className={`w-5 h-5 ${module.color}`} />
      </div>
      <div>
        <h4 className="text-xs font-extrabold font-display uppercase tracking-wider text-slate-900 mb-0.5">
          {module.title}
        </h4>
        <p className="text-xs text-slate-600 leading-snug">
          {module.desc}
        </p>
      </div>
    </motion.div>
  );
};

