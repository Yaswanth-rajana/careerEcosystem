'use client';

import React from 'react';
import { Compass, FileText, Video, Code, ArrowRightLeft, Award, Check } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { MentorSessionType } from '@/lib/mentors/mentor-types';

interface MentorshipNeedsProps {
  onSelectNeed: (preference: string, sessionType: MentorSessionType) => void;
  selectedPreference?: string | null;
}

const NEEDS_CARDS: Array<{
  id: string;
  num: string;
  title: string;
  description: string;
  preference: string;
  sessionType: MentorSessionType;
  icon: React.ReactNode;
}> = [
  {
    id: 'need-1',
    num: '01',
    title: 'Career Direction',
    description: "Not sure what's next? Map out your trajectory with an expert.",
    preference: 'CAREER_DIRECTION',
    sessionType: 'Career Guidance',
    icon: <Compass className="w-5 h-5 text-blue-600" />,
  },
  {
    id: 'need-2',
    num: '02',
    title: 'Resume Review',
    description: 'Make your profile & portfolio stand out to recruiters.',
    preference: 'RESUME_REVIEW',
    sessionType: 'Resume Review',
    icon: <FileText className="w-5 h-5 text-blue-600" />,
  },
  {
    id: 'need-3',
    num: '03',
    title: 'Mock Interview',
    description: 'Practice live interviews before the real high-stakes round.',
    preference: 'MOCK_INTERVIEW',
    sessionType: 'Mock Interview',
    icon: <Video className="w-5 h-5 text-blue-600" />,
  },
  {
    id: 'need-4',
    num: '04',
    title: 'Technical Guidance',
    description: 'Get unstuck with expert system design & code review help.',
    preference: 'TECHNICAL_GUIDANCE',
    sessionType: 'Technical Guidance',
    icon: <Code className="w-5 h-5 text-blue-600" />,
  },
  {
    id: 'need-5',
    num: '05',
    title: 'Career Switch',
    description: 'Move into a new field or domain with a battle-tested roadmap.',
    preference: 'CAREER_SWITCH',
    sessionType: 'Career Switch',
    icon: <ArrowRightLeft className="w-5 h-5 text-emerald-500" />,
  },
  {
    id: 'need-6',
    num: '06',
    title: 'Leadership',
    description: 'Prepare for senior engineering, lead, or manager roles.',
    preference: 'LEADERSHIP',
    sessionType: 'Leadership',
    icon: <Award className="w-5 h-5 text-amber-500" />,
  },
];

export const MentorshipNeeds: React.FC<MentorshipNeedsProps> = ({
  onSelectNeed,
  selectedPreference,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const handleCardClick = (preference: string, sessionType: MentorSessionType) => {
    onSelectNeed(preference, sessionType);
    const el = document.getElementById('mentor-discovery');
    if (el) {
      el.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <section id="mentorship-needs" className="py-16 border-b border-slate-200/60 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl font-extrabold font-display text-slate-900 tracking-tight">
            What do you need help with?
          </h2>
          <p className="text-base text-slate-600">
            Start with your challenge. We&apos;ll match you with mentors offering active services in this area.
          </p>
        </div>

        {/* 6 Grid Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {NEEDS_CARDS.map((item, index) => {
            const isSelected = selectedPreference === item.preference;
            return (
              <motion.div
                key={item.id}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handleCardClick(item.preference, item.sessionType)}
                className={`group cursor-pointer p-6 rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-lg text-left relative overflow-hidden ${
                  isSelected
                    ? 'ring-2 ring-blue-600 bg-white border-blue-500 shadow-md'
                    : 'border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-blue-500/60'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform ${
                    isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'
                  }`}>
                    {item.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        <Check className="w-3 h-3" /> Selected
                      </span>
                    )}
                    <span className={`font-display font-extrabold text-2xl transition-colors ${
                      isSelected ? 'text-blue-600' : 'text-slate-300 group-hover:text-blue-600'
                    }`}>
                      {item.num}
                    </span>
                  </div>
                </div>

                <h3 className={`font-bold text-lg font-display mb-1.5 transition-colors ${
                  isSelected ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-600'
                }`}>
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  &quot;{item.description}&quot;
                </p>

                {/* Click Indicator */}
                <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center gap-1.5 text-xs font-semibold text-blue-600 opacity-80 group-hover:opacity-100">
                  <span>{isSelected ? 'Active Preference Filter' : `Find mentors offering ${item.title}`}</span>
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
