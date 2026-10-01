import React from 'react';
import Link from 'next/link';
import { ArrowRight, Briefcase, MapPin, Sparkles, Award, Layers } from 'lucide-react';
import { CareerSnapshotDTO } from '@backend/types/dashboard';
import { Badge } from '@/components/design-system/Badge';

interface CareerSnapshotProps {
  snapshot: CareerSnapshotDTO;
}

export const CareerSnapshot: React.FC<CareerSnapshotProps> = ({ snapshot }) => {
  const getReadinessBadge = (readiness: string) => {
    switch (readiness) {
      case 'JOB_READY':
        return <Badge variant="success" size="sm">Job Ready</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="brand" size="sm">In Progress</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Getting Started</Badge>;
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 font-display">
              My Career Snapshot
            </h3>
          </div>
          {getReadinessBadge(snapshot.readiness)}
        </div>

        {/* Target Role & Career Field */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Target Role
          </span>
          <p className="text-base sm:text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            {snapshot.targetRole || <span className="text-slate-400 font-normal italic">Not added yet</span>}
          </p>
          {snapshot.careerField && (
            <p className="text-xs text-slate-500 pl-6">
              Field: <span className="font-semibold text-slate-700">{snapshot.careerField}</span>
            </p>
          )}
        </div>

        {/* Experience Level & Location */}
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Experience
            </span>
            <p className="text-xs sm:text-sm font-semibold text-[#0F172A] mt-0.5">
              {snapshot.experienceLevel || 'Entry Level'}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Location
            </span>
            <p className="text-xs sm:text-sm font-semibold text-[#0F172A] mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {snapshot.location || <span className="text-slate-400 font-normal italic">Not specified</span>}
            </p>
          </div>
        </div>

        {/* Key Skills */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-600" /> Key Skills
            </span>
            {snapshot.topSkills.length > 0 && (
              <span className="text-[11px] text-slate-400">
                {snapshot.topSkills.length} added
              </span>
            )}
          </div>

          {snapshot.topSkills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {snapshot.topSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No skills added yet.{' '}
              <Link href="/profile" className="text-blue-600 font-medium hover:underline">
                Add skills
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-3 border-t border-slate-100">
        <Link
          href="/profile"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group"
        >
          <span>View & Edit Profile</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
};
