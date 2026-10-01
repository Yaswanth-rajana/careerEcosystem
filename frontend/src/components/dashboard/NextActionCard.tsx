import React from 'react';
import Link from 'next/link';
import { ArrowRight, Compass, Target, FolderPlus, Sparkles, UserCircle, BookOpen, Wrench } from 'lucide-react';
import { NextActionDTO } from '@backend/types/dashboard';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';

interface NextActionCardProps {
  action: NextActionDTO;
}

export const NextActionCard: React.FC<NextActionCardProps> = ({ action }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PROJECTS':
        return <FolderPlus className="w-5 h-5 text-blue-600" />;
      case 'PROFILE':
        return <UserCircle className="w-5 h-5 text-indigo-600" />;
      case 'EXPLORE':
        return <Compass className="w-5 h-5 text-sky-600" />;
      case 'LEARN':
        return <BookOpen className="w-5 h-5 text-emerald-600" />;
      case 'PREPARE':
        return <Wrench className="w-5 h-5 text-violet-600" />;
      default:
        return <Target className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500 font-display">
          Your Next Step
        </h2>
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
      </div>

      <div className="relative rounded-2xl bg-gradient-to-r from-blue-50/60 via-indigo-50/30 to-white border border-blue-200/80 p-6 sm:p-7 shadow-sm transition-all duration-200 hover:border-blue-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-blue-200/80 shadow-sm flex items-center justify-center shrink-0">
              {getCategoryIcon(action.category)}
            </div>

            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge variant="brand" size="sm">
                  Recommended Action
                </Badge>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] tracking-tight">
                {action.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {action.description}
              </p>
            </div>
          </div>

          <div className="shrink-0 pt-2 sm:pt-0">
            <Link href={action.actionHref}>
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto shadow-sm"
              >
                {action.actionLabel.replace(/[→\s]+$/, '')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
