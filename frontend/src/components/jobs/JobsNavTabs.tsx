import React from 'react';
import { Sparkles, Briefcase, Bookmark, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export type JobTabType = 'recommended' | 'all' | 'saved' | 'applications';

interface Props {
  activeTab: JobTabType;
  onChangeTab: (tab: JobTabType) => void;
  savedCount?: number;
  applicationCount?: number;
  className?: string;
}

export const JobsNavTabs: React.FC<Props> = ({
  activeTab,
  onChangeTab,
  savedCount,
  applicationCount,
  className,
}) => {
  const tabs: {
    id: JobTabType;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    {
      id: 'recommended',
      label: 'For You',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'all',
      label: 'All Jobs',
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      id: 'saved',
      label: 'Saved',
      icon: <Bookmark className="w-4 h-4" />,
      count: savedCount,
    },
    {
      id: 'applications',
      label: 'Applications',
      icon: <FileText className="w-4 h-4" />,
      count: applicationCount,
    },
  ];

  return (
    <div
      className={cn(
        'inline-flex items-center p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/80 overflow-x-auto max-w-full scrollbar-none',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600',
              isActive
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={cn(
                  'ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-slate-200 text-slate-700'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
