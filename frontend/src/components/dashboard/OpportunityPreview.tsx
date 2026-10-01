import React from 'react';
import Link from 'next/link';
import { ArrowRight, Briefcase, Building2, MapPin, Sparkles } from 'lucide-react';
import { DashboardOpportunitiesDTO } from '@backend/types/dashboard';
import { Button } from '@/components/design-system/Button';

interface OpportunityPreviewProps {
  opportunities: DashboardOpportunitiesDTO;
}

export const OpportunityPreview: React.FC<OpportunityPreviewProps> = ({ opportunities }) => {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500 font-display">
            Opportunities For You
          </h2>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
        </div>
        <Link
          href="/jobs"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group"
        >
          <span>Explore All Jobs</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm">
        {opportunities.hasOpportunities && opportunities.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.items.map((job) => (
              <div
                key={job.id}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">{job.title}</h3>
                    <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {job.company}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold">
                    {job.type}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {job.location}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1">
                    {job.skills.slice(0, 3).map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-600">
                        {s}
                      </span>
                    ))}
                  </div>
                  <Link href={job.href}>
                    <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      View Job
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Clean, authentic empty state */
          <div className="py-8 px-4 rounded-xl bg-slate-50/70 border border-dashed border-slate-200 text-center space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#0F172A]">
                {opportunities.emptyState.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                {opportunities.emptyState.description}
              </p>
            </div>
            <div className="pt-2">
              <Link href={opportunities.emptyState.actionHref}>
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  {opportunities.emptyState.actionLabel.replace(/[→\s]+$/, '')}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
