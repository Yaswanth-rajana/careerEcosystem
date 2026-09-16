'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AuthVisualPanel } from './AuthVisualPanel';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';

interface AuthShellProps {
  mode: 'signin' | 'signup';
  onSwitchMode: (newMode: 'signin' | 'signup') => void;
}

export const AuthShell: React.FC<AuthShellProps> = ({ mode, onSwitchMode }) => {
  const shouldReduceMotion = useReducedMotion();

  const handleToggle = () => {
    onSwitchMode(mode === 'signin' ? 'signup' : 'signin');
  };

  const transitionConfig = shouldReduceMotion
    ? { duration: 0.3 }
    : { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const };

  return (
    <div className="w-full max-w-[1160px] min-h-[650px] mx-auto rounded-[24px] sm:rounded-[32px] border border-[#94A3B8]/12 bg-[#111827] shadow-[0_0_80px_rgba(99,102,241,0.12)] overflow-hidden relative">
      {/* DESKTOP 50/50 SLIDING LAYOUT */}
      <div className="hidden lg:grid lg:grid-cols-2 relative w-full min-h-[650px] overflow-hidden">
        {/* FORM PANEL CONTAINER (50% width) */}
        <motion.div
          initial={false}
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : { x: mode === 'signin' ? '0%' : '100%' }
          }
          transition={transitionConfig}
          className="w-full h-full flex items-center justify-center p-10 xl:p-14 z-20 bg-[#111827]"
        >
          <div className="w-full">
            {mode === 'signin' ? (
              <SignInForm onSwitchMode={handleToggle} />
            ) : (
              <SignUpForm onSwitchMode={handleToggle} />
            )}
          </div>
        </motion.div>

        {/* VISUAL PANEL CONTAINER (50% width) */}
        <motion.div
          initial={false}
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : { x: mode === 'signin' ? '0%' : '-100%' }
          }
          transition={transitionConfig}
          className="w-full h-full z-10 p-4"
        >
          <AuthVisualPanel mode={mode} />
        </motion.div>
      </div>

      {/* MOBILE & TABLET STACKED LAYOUT */}
      <div className="lg:hidden flex flex-col w-full min-h-[650px] p-4 sm:p-6 space-y-6">
        {/* Top Visual Panel */}
        <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden">
          <AuthVisualPanel mode={mode} />
        </div>

        {/* Bottom Form Panel */}
        <div className="w-full flex-1 flex items-center justify-center p-4 sm:p-8 bg-[#111827]">
          {mode === 'signin' ? (
            <SignInForm onSwitchMode={handleToggle} />
          ) : (
            <SignUpForm onSwitchMode={handleToggle} />
          )}
        </div>
      </div>
    </div>
  );
};
