'use client';

import React from 'react';
import { CAREER_CATEGORIES } from '@/lib/careers/career-repository';
import { Cpu, Database, Layout, Shield, TrendingUp, Zap, Wrench, Layers } from 'lucide-react';

export interface CareerCategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  All: Layers,
  Technology: Cpu,
  'Data & AI': Database,
  'Product & Design': Layout,
  Cybersecurity: Shield,
  'Business & Growth': TrendingUp,
  'Electronics & Systems': Zap,
  'Mechanical & Manufacturing': Wrench,
};

export const CareerCategorySelector: React.FC<CareerCategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const categories = ['All', ...CAREER_CATEGORIES];

  return (
    <div className="w-full overflow-x-auto py-2 scrollbar-none">
      <div className="flex items-center gap-2 justify-start md:justify-center min-w-max px-2">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const IconComp = CATEGORY_ICONS[cat] || Layers;

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 select-none ${
                isSelected
                  ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-md shadow-indigo-500/20 scale-[1.02]'
                  : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:border-[#6366F1]/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#6366F1]'}`} />
              <span>{cat}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
