'use client';

import React from 'react';
import { CAREER_CATEGORIES } from '@/lib/careers/career-repository';
import { Cpu, Database, Layout, Shield, TrendingUp, Wrench, Layers } from 'lucide-react';

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
              className={`group flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 select-none ${
                isSelected
                  ? 'bg-black text-white border-black shadow-md scale-[1.02]'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-black hover:border-black hover:text-white shadow-sm'
              }`}
            >
              <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-600 group-hover:text-white'}`} />
              <span>{cat}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
