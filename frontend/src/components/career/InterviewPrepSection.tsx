'use client';

import React, { useState } from 'react';
import { CareerPath, CareerLevelDefinition, CareerInterviewTopic } from '@/lib/careers/career-types';
import { MessageSquareCode, ArrowRight, HelpCircle, Sparkles, X, CheckCircle2 } from 'lucide-react';

export interface InterviewPrepSectionProps {
  career: CareerPath;
  levelData?: CareerLevelDefinition;
}

export const InterviewPrepSection: React.FC<InterviewPrepSectionProps> = ({
  career,
  levelData,
}) => {
  const [activeTopic, setActiveTopic] = useState<CareerInterviewTopic | null>(null);
  const topics: CareerInterviewTopic[] = levelData?.interviewTopics || career.interviewTopics;

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
            Questions, scenario drills, and technical rounds tailored for{' '}
            <strong className="text-blue-600">{levelData?.label || 'this level'}</strong> in{' '}
            {career.title}.
          </p>
        </div>
        {levelData && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
            Target Level: {levelData.label}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topics.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="line-clamp-1">{item.topic}</span>
                </h3>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 shrink-0">
                  {item.category}
                </span>
              </div>

              <div className="space-y-2">
                {item.keyQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <span className="font-mono font-bold text-blue-600 shrink-0">Q{idx + 1}.</span>
                    <span className="text-slate-700 leading-snug">{q}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTopic(item)}
                className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                <span>Practice Interview Mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Practice Interview Mode Modal */}
      {activeTopic && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-left">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {activeTopic.category} Interview Practice
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-display mt-1">
                  {activeTopic.topic}
                </h3>
              </div>
              <button
                onClick={() => setActiveTopic(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Practice Questions in this round:
              </h4>
              {activeTopic.keyQuestions.map((q, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-blue-600">Question {idx + 1}</span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium">{q}</p>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/70 text-xs text-slate-600 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Use the <strong>STAR method</strong> (Situation, Task, Action, Result) for behavioral questions, and state trade-offs explicitly for system design questions.
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTopic(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
              >
                Done Practicing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
