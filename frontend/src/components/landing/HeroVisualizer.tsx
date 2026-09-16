'use client';

import React, { useState } from 'react';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { Sparkles, Compass, Target, BookOpen, Users, Briefcase } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

export const HeroVisualizer = () => {
  const [activeStage, setActiveStage] = useState<string>('01');
  const shouldReduceMotion = useReducedMotion();

  const stages = [
    {
      num: '01',
      title: 'Discover',
      preview: 'Map your starting baseline & career intent',
      icon: <Compass className="w-3.5 h-3.5" />,
    },
    {
      num: '02',
      title: 'Explore Paths',
      preview: 'Discover non-obvious career trajectories',
      icon: <Target className="w-3.5 h-3.5" />,
    },
    {
      num: '03',
      title: 'Build Skills',
      preview: 'Bridge high-impact skill gaps with zero fluff',
      icon: <BookOpen className="w-3.5 h-3.5" />,
    },
    {
      num: '04',
      title: 'Get Mentored',
      preview: 'Connect with verified 1-on-1 industry experts',
      icon: <Users className="w-3.5 h-3.5" />,
    },
    {
      num: '05',
      title: 'Get Hired',
      preview: 'Target roles aligned with your verified strengths',
      icon: <Briefcase className="w-3.5 h-3.5" />,
    },
  ];

  const currentStageObj = stages.find((s) => s.num === activeStage) || stages[0];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Card variant="accent" className="relative p-6 sm:p-8 backdrop-blur-xl border-slate-200/80 dark:border-obsidian-700">
      
      {/* Panel Header: Dominant "Live Journey Preview" */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-obsidian-700/60 mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-indigo shrink-0" /> Live Journey Preview
        </span>
      </div>

      {/* Animated Sequential Stage List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-2.5 py-1"
      >
        {stages.map((stage) => {
          const isActive = activeStage === stage.num;

          return (
            <motion.button
              key={stage.num}
              variants={itemVariants}
              onClick={() => setActiveStage(stage.num)}
              className={`w-full p-3.5 rounded-xl border text-left transition-all duration-200 flex items-center justify-between group ${
                isActive
                  ? 'bg-white dark:bg-obsidian-800 border-brand-indigo/50 shadow-glow text-slate-900 dark:text-white opacity-100 scale-[1.01]'
                  : 'bg-white/50 dark:bg-obsidian-800/50 border-brand-indigo/20 dark:border-brand-indigo/20 text-slate-700 dark:text-slate-300 opacity-60 hover:opacity-100 hover:bg-white dark:hover:bg-obsidian-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex flex-col items-center justify-center transition-all duration-200 shrink-0 ${
                    isActive
                      ? 'bg-brand-gradient text-white shadow-sm opacity-100'
                      : 'bg-slate-100 dark:bg-obsidian-700/80 text-slate-600 dark:text-slate-300 group-hover:bg-brand-gradient group-hover:text-white opacity-80 group-hover:opacity-100'
                  }`}
                >
                  {stage.icon}
                  <span className="text-[8px] font-mono leading-none opacity-80 mt-0.5 font-semibold">
                    {stage.num}
                  </span>
                </div>
                <span className="text-xs font-bold tracking-tight">{stage.title}</span>
              </div>

              {isActive ? (
                <Badge variant="brand" size="sm" className="text-[10px] py-0.5 px-2">
                  Active Focus
                </Badge>
              ) : (
                <span className="text-[10px] font-mono text-brand-indigo/70 dark:text-brand-indigo-light/70 opacity-70 group-hover:opacity-100">
                  Upcoming
                </span>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Lightweight Interactive One-Line Micro-Preview */}
      <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-obsidian-700/60 text-center">
        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium transition-all">
          <strong className="text-brand-indigo dark:text-brand-indigo-light font-bold mr-1">
            Stage {currentStageObj.num}:
          </strong>
          {currentStageObj.preview}
        </p>
      </div>

    </Card>
  );
};
