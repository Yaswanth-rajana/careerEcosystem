import React from 'react';
import Link from 'next/link';
import { MentorServiceDTO } from '@backend/types/mentorship';
import { Briefcase, Plus, ArrowUpRight } from 'lucide-react';
import { EmptyState } from '../EmptyState';

export function ServicesPreview({ services }: { services: MentorServiceDTO[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-slate-500" />
          <h3 className="text-base font-bold text-slate-900 font-display">
            Active Mentorship Services
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {services.length}
          </span>
        </div>
        <Link
          href="/mentorship/services"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition"
        >
          Manage All <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No services created yet"
          description="Create your first mentorship service so candidates know how you can help them achieve their career goals."
          actionText="Create Service"
          actionHref="/mentorship/services"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 transition bg-slate-50/40"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {svc.title}
                </h4>
                <span className="text-xs font-bold text-blue-600 flex-shrink-0">
                  {svc.price === 0 ? 'Free' : `₹${svc.price.toLocaleString()}`}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
                {svc.description}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                <span>{svc.duration} mins</span>
                <span className="text-emerald-700 font-medium">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
