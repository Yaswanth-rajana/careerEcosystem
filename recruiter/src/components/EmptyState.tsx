import React from 'react';
import Link from 'next/link';
import { LucideIcon, FolderSearch } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  actionClick?: () => void;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderSearch,
  title,
  description,
  actionText,
  actionHref,
  actionClick,
  action,
}) => {
  const label = actionText || action?.label;
  const href = actionHref || action?.href;
  const onClick = actionClick || action?.onClick;

  return (
    <div className="py-12 px-4 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-dashed border-slate-200">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {label && (
        href ? (
          <Link
            href={href}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            {label}
          </Link>
        ) : onClick ? (
          <button
            type="button"
            onClick={onClick}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            {label}
          </button>
        ) : null
      )}
    </div>
  );
};
