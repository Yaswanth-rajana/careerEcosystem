'use client';

import React, { useState } from 'react';
import { StoryBeatContainer } from './StoryBeatContainer';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { User, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Beat04Learning = () => {
  const [activePersona, setActivePersona] = useState<'beginner' | 'mid' | 'expert'>('mid');

  const personas = [
    {
      id: 'beginner',
      label: 'College Student / Graduate',
      stageIndex: 0,
      stageName: 'Foundation',
      badgeLead: 'START HERE: FOUNDATION',
      focusText: 'Build core fundamentals from scratch, including Programming Basics, Data Structures & Git.',
    },
    {
      id: 'mid',
      label: 'Mid-Level Professional',
      stageIndex: 1,
      stageName: 'Intermediate',
      badgeLead: 'START HERE: INTERMEDIATE',
      focusText: 'Skip the fundamentals and focus on building practical skills in System Architecture, Web APIs & Database Tuning.',
    },
    {
      id: 'expert',
      label: 'Experienced Specialist',
      stageIndex: 2,
      stageName: 'Advanced',
      badgeLead: 'START HERE: ADVANCED',
      focusText: 'Move directly into advanced topics such as Distributed Systems & GenAI Model Deployment.',
    },
  ];

  const currentPersona = personas.find((p) => p.id === activePersona) || personas[1];
  const stages = ['Foundation', 'Intermediate', 'Advanced'];

  return (
    <StoryBeatContainer
      id="beat-04-learning"
      beatNumber="04"
      eyebrow="THE LEARNING"
      title="Learn what you need."
      subtext="Start where you are. You never have to repeat what you already know."
    >
      <div className="space-y-8 max-w-5xl mx-auto">
        
        {/* Persona Selector Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
            Select Your Experience Level:
          </span>
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
            {personas.map((p) => {
              const isSelected = activePersona === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePersona(p.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Horizontal Stages Stepper Card */}
        <Card variant="neutral" className="relative p-6 sm:p-10 bg-white border border-slate-200 shadow-sm">
          
          {/* Header Label: Humanized YOUR LEARNING PATH */}
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-8 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" /> YOUR LEARNING PATH
          </div>

          {/* Stages Progress Track with Subtle Progression Connectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 relative mb-8">
            {stages.map((stage, idx) => {
              const isActiveStage = currentPersona.stageIndex === idx;
              const isPassed = currentPersona.stageIndex > idx;

              return (
                <div key={stage} className="relative group">
                  
                  {/* Subtle Horizontal Progression Connector Arrow (between stages on md+) */}
                  {idx < stages.length - 1 && (
                    <div className="hidden md:flex absolute -right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-10 text-slate-300 pointer-events-none">
                      <ArrowRight className="w-4 h-4 opacity-50" />
                    </div>
                  )}

                  <div
                    className={`p-5 rounded-2xl border transition-all duration-300 relative h-full flex flex-col justify-between ${
                      isActiveStage
                        ? 'bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                        : isPassed
                        ? 'bg-slate-50 border-slate-200 text-slate-400'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-extrabold font-display uppercase tracking-wider text-blue-600">
                        STAGE 0{idx + 1}
                      </span>
                      {isActiveStage && (
                        <Badge variant="brand" size="sm" className="text-[10px] animate-pulse">
                          Your starting point
                        </Badge>
                      )}
                      {isPassed && (
                        <Badge variant="neutral" size="sm" className="text-[10px] opacity-75">
                          Already covered
                        </Badge>
                      )}
                    </div>

                    <h4 className="text-lg font-bold font-display text-slate-900 mb-2">
                      {stage}
                    </h4>

                    {isActiveStage && (
                      <motion.div
                        layoutId="activeMarker"
                        className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-blue-600"
                      >
                        <User className="w-3.5 h-3.5" /> Active Learning Focus
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* One-Line Micro Example Breakdown */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPersona.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left"
            >
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider">
                  YOUR STARTING POINT: {currentPersona.stageName.toUpperCase()}
                </span>
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                  <span className="font-bold text-slate-900">{currentPersona.badgeLead}:</span> {currentPersona.focusText}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors shrink-0 cursor-pointer pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 w-full sm:w-auto justify-between sm:justify-start">
                <span>View Tailored Plan</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          </AnimatePresence>

        </Card>

      </div>
    </StoryBeatContainer>
  );
};
