'use client';

import React from 'react';
import Image from 'next/image';

interface AuthVisualPanelProps {
  mode: 'signin' | 'signup';
  imageSrc?: string;
}

export const AuthVisualPanel: React.FC<AuthVisualPanelProps> = ({ mode, imageSrc }) => {
  const finalImageSrc = imageSrc || (mode === 'signup' ? '/signup1.png' : '/login.png');

  return (
    <div className="relative w-full h-full min-h-[400px] lg:min-h-[600px] overflow-hidden rounded-2xl lg:rounded-2xl bg-[#0B0F19] flex flex-col justify-between p-6 text-left border border-white/[0.06] group shadow-2xl">
      {/* Main Image Asset */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src={finalImageSrc}
          alt="PATHWAY.ECO Authentication Visual"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
        />
        {/* Subtle Dark Gradient Overlay for polished depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19]/40 via-transparent to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

