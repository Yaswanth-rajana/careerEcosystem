'use client';

import React from 'react';
import { ArrowRight, Repeat, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const CareerLoopSection: React.FC = () => {
  const steps = [
    'Career Goal',
    'Learn',
    'Build',
    'Get Mentored',
    'Prepare',
    'Find Opportunities',
    'Grow',
  ];

  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0B0F19] to-indigo-950 text-white text-center space-y-6 shadow-xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-glass-glow opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-indigo-300">
          <Repeat className="w-3.5 h-3.5 text-[#818CF8]" />
          <span>THE PATHWAY CONTINUOUS ECOSYSTEM</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold font-display">
          Your next step is closer than you think.
        </h2>

        {/* Ecosystem Loop Single-Line Chain (No scrollbar needed) */}
        <div className="w-full flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 py-2">
          {steps.map((step, idx) => (
            <React.Fragment key={step}>
              <span className="text-[10.5px] sm:text-xs font-bold px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl bg-white/10 border border-white/15 text-slate-100 whitespace-nowrap">
                {step}
              </span>
              {idx < steps.length - 1 && (
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="pt-4">
          <Link
            href="#learning-roadmap"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-bold text-sm shadow-glow hover:opacity-95 transition-opacity"
          >
            <span>Continue Your Path</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
