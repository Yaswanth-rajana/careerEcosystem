import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'animate-pulse rounded-lg bg-slate-200 dark:bg-obsidian-700/60',
      className
    )}
    {...props}
  />
);

export const LoadingSpinner = ({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className={cn('animate-spin text-brand-indigo', sizes[size], className)} />
    </div>
  );
};
