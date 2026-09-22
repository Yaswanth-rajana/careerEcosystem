'use client';

import React from 'react';
import { CareerPath } from '@/lib/careers/career-types';
import { MessageSquareCode, ArrowRight, HelpCircle } from 'lucide-react';

export interface InterviewPrepSectionProps {
  career: CareerPath;
}

export const InterviewPrepSection: React.FC<InterviewPrepSectionProps> = ({ career }) => {
  return (
    <div id="interview-prep" className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquareCode className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
              Prepare for Interviews
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Master frequent technical, system design, and situational interview questions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {career.interviewTopics.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  {item.topic}
                </h3>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
                  {item.keyQuestions.length} Key Questions
                </span>
              </div>

              <div className="space-y-2">
                {item.keyQuestions.map((q, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-mono font-bold text-blue-600 shrink-0">Q{idx + 1}.</span>
                    <span className="text-slate-700 leading-snug">{q}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => alert(`Interview Bank for "${item.topic}" opened. Practice mode starting!`)}
                className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                <span>Start Interview Prep</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
