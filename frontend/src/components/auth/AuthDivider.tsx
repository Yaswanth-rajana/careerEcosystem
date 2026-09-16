'use client';

import React from 'react';

export const AuthDivider: React.FC = () => {
  return (
    <div className="relative my-5 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[#94A3B8]/12" />
      </div>
      <div className="relative px-3 bg-[#111827] text-xs text-[#94A3B8] font-medium tracking-wider lowercase">
        or continue with
      </div>
    </div>
  );
};
