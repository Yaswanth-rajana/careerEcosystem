'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { StoryBeatContainer } from './StoryBeatContainer';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import {
  Cloud,
  GitBranch,
  Activity,
  Layers,
  Server,
  ShieldCheck,
  HardDrive,
  Network,
  LayoutGrid,
  Workflow,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CAREER_DIRECTIONS } from '@/lib/careers/career-directions';

const ICON_MAP: Record<string, React.ElementType> = {
  Cloud,
  GitBranch,
  Activity,
  Layers,
  Server,
  ShieldCheck,
  HardDrive,
  Network,
  LayoutGrid,
  Workflow,
};

export const Beat02Possibilities = () => {
  const [selectedId, setSelectedId] = useState<string>(CAREER_DIRECTIONS[0].id);

  const activePath =
    CAREER_DIRECTIONS.find((p) => p.id === selectedId) || CAREER_DIRECTIONS[0];

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
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Select A Career Direction
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CAREER_DIRECTIONS.map((path) => {
              const isSelected = selectedId === path.id;
              const IconComp = ICON_MAP[path.iconName] || Layers;

              return (
                <button
                  key={path.id}
                  type="button"
                  onClick={() => setSelectedId(path.id)}
                  onMouseEnter={() => setSelectedId(path.id)}
                  className={`p-3.5 sm:p-4 rounded-xl text-left border transition-all duration-200 flex items-center justify-between group min-h-[64px] sm:min-h-[68px] ${
                    isSelected
                      ? 'bg-black text-white border-black shadow-md scale-[1.02]'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-black hover:bg-black hover:text-white shadow-sm'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`p-2 rounded-lg transition-colors shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-700 group-hover:bg-white/20 group-hover:text-white'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold leading-snug line-clamp-2">
                      {path.title}
                    </span>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'translate-x-1 opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Trajectory Card Column */}
        <div className="lg:col-span-6 lg:sticky lg:top-28">
          <Card variant="accent" className="relative p-5 sm:p-6 backdrop-blur-xl border-slate-200/80 bg-white shadow-sm">
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
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
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    POSSIBLE ROLE
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900 leading-tight">
                    {activePath.role}
                  </h3>
                </div>

                {/* Skills to Build */}
                <div className="space-y-2 pt-3 border-t border-slate-200/60">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    SKILLS TO BUILD
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {activePath.skills.map((skill) => (
                      <Badge key={skill} variant="neutral" size="sm" className="bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Visual Journey Progression */}
                <div className="pt-3 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 flex-wrap">
                    <div className="flex items-center gap-1.5 text-blue-600 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                      <span>Learn</span>
                    </div>
                    <span className="text-slate-300">→</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                      <span>Build</span>
                    </div>
                    <span className="text-slate-300">→</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                      <span>Prepare</span>
                    </div>
                    <span className="text-slate-300">→</span>
                    <div className="flex items-center gap-1.5 text-blue-600 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                      <span>Opportunity</span>
                    </div>
                  </div>

                  <Link
                    href={activePath.href}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm hover:bg-blue-700 transition-colors shrink-0"
                  >
                    <span>Explore Path</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </motion.div>
            </AnimatePresence>

          </Card>
        </div>

      </div>
    </StoryBeatContainer>
  );
};
