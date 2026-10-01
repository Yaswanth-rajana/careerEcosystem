import React from 'react';
import Link from 'next/link';
import { AvailabilityRuleDTO } from '@backend/types/mentorship';
import { Clock, Globe, ArrowUpRight } from 'lucide-react';

interface AvailabilitySummaryCardProps {
  summary: {
    activeRulesCount: number;
    weeklyAvailableHours: number;
    timezone: string;
    rules: AvailabilityRuleDTO[];
  };
}

export function AvailabilitySummaryCard({ summary }: AvailabilitySummaryCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <h3 className="text-base font-bold text-slate-900 font-display">
            Weekly Availability
          </h3>
        </div>
        <Link
          href="/availability"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition"
        >
          Adjust Schedule <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Weekly Hours
          </span>
          <span className="text-xl font-bold text-slate-900 font-display mt-0.5 block">
            {summary.weeklyAvailableHours} hrs
          </span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Active Days
          </span>
          <span className="text-xl font-bold text-slate-900 font-display mt-0.5 block">
            {summary.activeRulesCount} days
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
        <Globe className="w-3.5 h-3.5 text-slate-400" />
        <span>Timezone: {summary.timezone}</span>
      </div>

      {/* Mini day pills */}
      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayAbbr, idx) => {
          // dayOfWeek mapping: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 0=Sun
          const dayIndex = idx === 6 ? 0 : idx + 1;
          const rule = summary.rules.find((r) => r.dayOfWeek === dayIndex && r.active);

          return (
            <div
              key={dayAbbr}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                rule
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                  : 'bg-slate-100 text-slate-400'
              }`}
              title={rule ? `${dayAbbr}: ${rule.startTime} - ${rule.endTime}` : `${dayAbbr}: Off`}
            >
              {dayAbbr}
            </div>
          );
        })}
      </div>
    </div>
  );
}
