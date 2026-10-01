import React from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, CheckCircle, Sparkles } from 'lucide-react';
import { DashboardInterviewDTO } from '@backend/types/dashboard';
import { Button } from '@/components/design-system/Button';

interface InterviewPreviewProps {
  interview: DashboardInterviewDTO;
}

export const InterviewPreview: React.FC<InterviewPreviewProps> = ({ interview }) => {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between space-y-5">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 font-display">
              Interview Preparation
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
            AI Practice
          </span>
        </div>

        {interview.hasHistory && interview.lastPractice ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F172A]">Last Practice Session</span>
              <span className="text-[11px] text-slate-400">{interview.lastPractice.date}</span>
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {interview.lastPractice.roleTitle} ({interview.lastPractice.type})
            </p>
            <div className="pt-2">
              <Link href={interview.lastPractice.practiceHref}>
                <Button variant="outline" size="sm" className="w-full">
                  Practice Again
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="py-6 px-4 rounded-xl bg-slate-50/70 border border-dashed border-slate-200 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#0F172A]">
                {interview.emptyState.title}
              </h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                {interview.emptyState.description}
              </p>
            </div>
            <div className="pt-2">
              <Link href={interview.emptyState.actionHref}>
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  {interview.emptyState.actionLabel.replace(/[→\s]+$/, '')}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Real-time instant feedback</span>
        <Link href="/tools" className="text-indigo-600 font-semibold hover:underline">
          Explore tools →
        </Link>
      </div>
    </div>
  );
};
