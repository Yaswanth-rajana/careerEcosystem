import React from 'react';
import { Calendar, Clock, AlertCircle, Users, CheckCircle2, Star } from 'lucide-react';

interface StatCardsProps {
  summary: {
    todaySessionCount: number;
    upcomingBookingsCount: number;
    pendingRequestsCount: number;
    activeMenteesCount: number;
    completedMentorshipsCount: number;
    averageRating: number;
    totalReviews: number;
  };
}

export function StatCards({ summary }: StatCardsProps) {
  const cards = [
    {
      label: "Today's Sessions",
      value: summary.todaySessionCount,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      label: 'Upcoming Bookings',
      value: summary.upcomingBookingsCount,
      icon: Calendar,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
    },
    {
      label: 'Action Required',
      value: summary.pendingRequestsCount,
      icon: AlertCircle,
      color: summary.pendingRequestsCount > 0 ? 'text-amber-600' : 'text-slate-500',
      bgColor: summary.pendingRequestsCount > 0 ? 'bg-amber-50' : 'bg-slate-50',
      borderColor: summary.pendingRequestsCount > 0 ? 'border-amber-200' : 'border-slate-200',
      highlight: summary.pendingRequestsCount > 0,
    },
    {
      label: 'Active Mentees',
      value: summary.activeMenteesCount,
      icon: Users,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`bg-white rounded-xl border p-4 sm:p-5 shadow-sm transition hover:shadow ${
              card.highlight ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200/80'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`p-2 rounded-lg ${card.bgColor} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
              {card.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
