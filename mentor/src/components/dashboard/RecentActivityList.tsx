import React from 'react';
import { Activity, CalendarCheck, CheckCircle2, UserCheck, Star } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'BOOKING_CREATED' | 'BOOKING_CONFIRMED' | 'SESSION_COMPLETED' | 'REVIEW_RECEIVED';
  title: string;
  description: string;
  timestamp: string;
}

export function RecentActivityList({ activities }: { activities: ActivityItem[] }) {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 text-center text-xs text-slate-500">
        No recent operational activity recorded yet.
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_CONFIRMED':
        return <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />;
      case 'SESSION_COMPLETED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'REVIEW_RECEIVED':
        return <Star className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <UserCheck className="w-3.5 h-3.5 text-indigo-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-slate-500" />
        <h3 className="text-base font-bold text-slate-900 font-display">
          Recent Activity
        </h3>
      </div>

      <div className="space-y-3">
        {activities.map((act) => {
          const date = new Date(act.timestamp);
          const timeAgo = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

          return (
            <div key={act.id} className="flex items-start gap-3 text-xs">
              <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                {getIcon(act.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">{act.title}</p>
                <p className="text-[11px] text-slate-500 truncate">{act.description}</p>
              </div>
              <span className="text-[11px] text-slate-400 flex-shrink-0">{timeAgo}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
