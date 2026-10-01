import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const AdminBreadcrumbs: React.FC<AdminBreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center text-xs text-slate-500 space-x-1.5 mb-4">
      <Link href="/dashboard" className="hover:text-blue-600 transition-colors font-medium">
        Admin
      </Link>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {item.href ? (
            <Link href={item.href} className="hover:text-blue-600 transition-colors font-medium">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 font-semibold truncate max-w-xs">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
