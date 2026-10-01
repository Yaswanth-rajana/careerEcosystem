import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Compass, GraduationCap } from 'lucide-react';
import { DashboardLearningDTO } from '@backend/types/dashboard';
import { Button } from '@/components/design-system/Button';

interface LearningProgressProps {
  learning: DashboardLearningDTO;
}

export const LearningProgress: React.FC<LearningProgressProps> = ({ learning }) => {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 font-display">
            Continue Learning
          </h3>
          <Link
            href="/learn"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group"
          >
            <span>Browse Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {learning.hasActivity && learning.items.length > 0 ? (
          <div className="space-y-4">
            {learning.items.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 hover:border-slate-300 transition-all space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-[#0F172A] truncate">
                    {item.title}
                  </h4>
                  <span className="text-xs font-bold text-blue-600 shrink-0">
                    {item.progressPercent}%
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${item.progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    {item.completedModules !== undefined && item.totalModules !== undefined
                      ? `${item.completedModules} of ${item.totalModules} modules`
                      : 'In progress'}
                  </span>
                  <Link
                    href={item.href}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-0.5"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Honest, encouraging empty state without fake numbers */
          <div className="py-6 px-4 rounded-xl bg-slate-50/70 border border-dashed border-slate-200 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#0F172A]">
                {learning.emptyState.title}
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                {learning.emptyState.description}
              </p>
            </div>
            <div className="pt-2">
              <Link href={learning.emptyState.actionHref}>
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  {learning.emptyState.actionLabel.replace(/[→\s]+$/, '')}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          Interactive roadmaps
        </span>
        <Link href="/learn" className="text-blue-600 font-semibold hover:underline">
          View all tracks →
        </Link>
      </div>
    </div>
  );
};
