'use client';

import React from 'react';
import { Compass, FileText, Video, Code, ArrowRightLeft, Award } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { MentorSessionType } from '@/lib/mentors/mentor-types';

interface MentorshipNeedsProps {
  onSelectNeed: (sessionType: MentorSessionType) => void;
}

const NEEDS_CARDS: Array<{
  id: string;
  num: string;
  title: string;
  description: string;
  sessionType: MentorSessionType;
  icon: React.ReactNode;
}> = [
  {
    id: 'need-1',
    num: '01',
    title: 'Career Direction',
    description: "Not sure what's next? Map out your trajectory with an expert.",
    sessionType: 'Career Guidance',
    icon: <Compass className="w-5 h-5 text-blue-600" />,
  },
  {
    id: 'need-2',
    num: '02',
    title: 'Resume Review',
    description: 'Make your profile & portfolio stand out to recruiters.',
    sessionType: 'Resume Review',
    icon: <FileText className="w-5 h-5 text-blue-600" />,
  },
  {
    id: 'need-3',
    num: '03',
    title: 'Mock Interview',
    description: 'Practice live interviews before the real high-stakes round.',
    sessionType: 'Mock Interview',
    icon: <Video className="w-5 h-5 text-blue-600" />,
  },
  {
    id: 'need-4',
    num: '04',
    title: 'Technical Guidance',
    description: 'Get unstuck with expert system design & code review help.',
    sessionType: 'Technical Guidance',
    icon: <Code className="w-5 h-5 text-blue-600" />,
  },
  {
    id: 'need-5',
    num: '05',
    title: 'Career Switch',
    description: 'Move into a new field or domain with a battle-tested roadmap.',
    sessionType: 'Career Switch',
    icon: <ArrowRightLeft className="w-5 h-5 text-emerald-500" />,
  },
  {
    id: 'need-6',
    num: '06',
    title: 'Leadership',
    description: 'Prepare for senior engineering, lead, or manager roles.',
    sessionType: 'Leadership',
    icon: <Award className="w-5 h-5 text-amber-500" />,
  },
];

export const MentorshipNeeds: React.FC<MentorshipNeedsProps> = ({ onSelectNeed }) => {
  const shouldReduceMotion = useReducedMotion();

  const handleCardClick = (sessionType: MentorSessionType) => {
    onSelectNeed(sessionType);
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
            Start with the challenge. We&apos;ll help you find the right mentor.
          </p>
        </div>

        {/* 6 Grid Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {NEEDS_CARDS.map((item, index) => (
            <motion.div
              key={item.id}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => handleCardClick(item.sessionType)}
              className="group cursor-pointer p-6 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-blue-500/60 transition-all duration-300 shadow-sm hover:shadow-lg text-left relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="font-display font-extrabold text-2xl text-slate-300 group-hover:text-blue-600 transition-colors">
                  {item.num}
                </span>
              </div>

              <h3 className="font-bold text-lg text-slate-900 font-display mb-1.5 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                &quot;{item.description}&quot;
              </p>

              {/* Click Indicator */}
              <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center gap-1.5 text-xs font-semibold text-blue-600 opacity-80 group-hover:opacity-100">
                <span>Filter mentors for {item.sessionType}</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
