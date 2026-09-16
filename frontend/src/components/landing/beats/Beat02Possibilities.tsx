'use client';

import React, { useState } from 'react';
import { StoryBeatContainer } from './StoryBeatContainer';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { Cpu, Database, Palette, TrendingUp, Zap, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Beat02Possibilities = () => {
  const [selectedId, setSelectedId] = useState<string>('tech');

  const pathways = [
    {
      id: 'tech',
      title: 'Technology',
      icon: <Cpu className="w-4 h-4" />,
      role: 'AI / Machine Learning Engineer',
      skills: ['Python', 'Statistics', 'Machine Learning', 'Deep Learning'],
    },
    {
      id: 'data',
      title: 'Data & AI',
      icon: <Database className="w-4 h-4" />,
      role: 'Data Scientist',
      skills: ['Python', 'SQL', 'Statistics', 'Machine Learning'],
    },
    {
      id: 'design',
      title: 'Product Design',
      icon: <Palette className="w-4 h-4" />,
      role: 'Product Designer',
      skills: ['UX Research', 'Figma', 'Interaction Design', 'Design Systems'],
    },
    {
      id: 'business',
      title: 'Business & Growth',
      icon: <TrendingUp className="w-4 h-4" />,
      role: 'Growth / Product Strategist',
      skills: ['Analytics', 'Market Research', 'Strategy', 'Communication'],
    },
    {
      id: 'systems',
      title: 'Electronics & Systems',
      icon: <Zap className="w-4 h-4" />,
      role: 'Embedded Systems Engineer',
      skills: ['C/C++', 'Microcontrollers', 'Electronics', 'Embedded Systems'],
    },
  ];

  const activePath = pathways.find((p) => p.id === selectedId) || pathways[0];

  return (
    <StoryBeatContainer
      id="beat-02-possibilities"
      beatNumber="02"
      eyebrow="THE POSSIBILITIES"
      title="What could you become?"
      subtext="Your starting point doesn't limit where you can go. Explore a direction and see where it could lead."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Interactive Crossroads Selection Column */}
        <div className="lg:col-span-6 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Select A Career Direction
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pathways.map((path) => {
              const isSelected = selectedId === path.id;
              return (
                <button
                  key={path.id}
                  onClick={() => setSelectedId(path.id)}
                  onMouseEnter={() => setSelectedId(path.id)}
                  className={`p-4 rounded-xl text-left border transition-all duration-200 flex items-center justify-between group ${
                    isSelected
                      ? 'bg-brand-gradient text-white border-transparent shadow-glow scale-[1.02]'
                      : 'bg-white dark:bg-obsidian-800/80 border-slate-200 dark:border-obsidian-700 text-slate-700 dark:text-slate-200 hover:border-brand-indigo/50 hover:bg-slate-50 dark:hover:bg-obsidian-700/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-obsidian-700 text-brand-indigo dark:text-brand-indigo-light'
                      }`}
                    >
                      {path.icon}
                    </div>
                    <span className="text-sm font-semibold">{path.title}</span>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 transition-transform ${
                      isSelected ? 'translate-x-1 opacity-100' : 'opacity-0 group-hover:opacity-60'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Trajectory Card Column */}
        <div className="lg:col-span-6">
          <Card variant="accent" className="relative p-5 sm:p-6 backdrop-blur-xl border-slate-200/80 dark:border-obsidian-700">
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-indigo shrink-0" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  YOUR POSSIBLE PATH
                </span>
              </div>
              <Badge variant="brand" size="sm" className="font-semibold uppercase tracking-wider text-[10px]">
                {activePath.title}
              </Badge>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activePath.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Possible Role */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    POSSIBLE ROLE
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white leading-tight">
                    {activePath.role}
                  </h3>
                </div>

                {/* Skills to Build */}
                <div className="space-y-2 pt-3 border-t border-slate-200/60 dark:border-obsidian-700/60">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    SKILLS TO BUILD
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {activePath.skills.map((skill) => (
                      <Badge key={skill} variant="neutral" size="sm" className="bg-white/80 dark:bg-obsidian-700/60 text-slate-700 dark:text-slate-200">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Visual Journey Progression */}
                <div className="pt-3 border-t border-slate-200/60 dark:border-obsidian-700/60 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                    <div className="flex items-center gap-1.5 text-brand-indigo dark:text-brand-indigo-light font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-indigo shrink-0" />
                      <span>Learn</span>
                    </div>
                    <span className="text-slate-300 dark:text-slate-600">→</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
                      <span>Build</span>
                    </div>
                    <span className="text-slate-300 dark:text-slate-600">→</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
                      <span>Prepare</span>
                    </div>
                    <span className="text-slate-300 dark:text-slate-600">→</span>
                    <div className="flex items-center gap-1.5 text-brand-violet dark:text-brand-violet-light font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-violet shrink-0" />
                      <span>Opportunity</span>
                    </div>
                  </div>

                  <a
                    href={`/explore?category=${encodeURIComponent(activePath.title)}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-gradient text-white text-xs font-bold shadow-sm hover:opacity-95 transition-opacity shrink-0"
                  >
                    <span>Explore Path</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>

              </motion.div>
            </AnimatePresence>

          </Card>
        </div>

      </div>
    </StoryBeatContainer>
  );
};
