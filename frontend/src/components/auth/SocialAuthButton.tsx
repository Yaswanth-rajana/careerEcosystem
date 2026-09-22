'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { loginWithGoogle, type GoogleAuthResponse } from '@/lib/auth';
import {
  loadGoogleIdentityServices,
  initializeGoogleIdentityServices,
  registerCredentialSubscriber,
  updateCredentialSubscriber,
  renderGoogleButton,
} from '@/lib/googleGis';

interface SocialAuthButtonProps {
  onSuccess?: (response: GoogleAuthResponse) => void;
  onError?: (errorMessage: string) => void;
  disabled?: boolean;
}

export const SocialAuthButton: React.FC<SocialAuthButtonProps> = ({
  onSuccess,
  onError,
  disabled = false,
}) => {
  const instanceId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGisReady, setIsGisReady] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Maintain current credential callback logic
  const handleCredentialResponse = useRef(async (response: { credential?: string }) => {
    if (!response.credential) {
      onErrorRef.current?.('No credential received from Google. Please try again.');
      return;
    }

    setIsAuthenticating(true);
    try {
      const res = await loginWithGoogle(response.credential);
      if (res.error) {
        onErrorRef.current?.(res.error);
        setIsAuthenticating(false);
      } else {
        onSuccessRef.current?.(res);
      }
    } catch (err: any) {
      onErrorRef.current?.(err.message || 'We couldn’t complete Google sign-in. Please try again.');
      setIsAuthenticating(false);
    }
  });

  // Keep subscriber handler fresh on updates
  useEffect(() => {
    handleCredentialResponse.current = async (response: { credential?: string }) => {
      if (!response.credential) {
        onErrorRef.current?.('No credential received from Google. Please try again.');
        return;
      }

      setIsAuthenticating(true);
      try {
        const res = await loginWithGoogle(response.credential);
        if (res.error) {
          onErrorRef.current?.(res.error);
          setIsAuthenticating(false);
        } else {
          onSuccessRef.current?.(res);
        }
      } catch (err: any) {
        onErrorRef.current?.(err.message || 'We couldn’t complete Google sign-in. Please try again.');
        setIsAuthenticating(false);
      }
    };

    updateCredentialSubscriber(instanceId, (res) => handleCredentialResponse.current(res));
  });

  // Register this component instance on mount, unregister on unmount
  useEffect(() => {
    const unregister = registerCredentialSubscriber(instanceId, (res) =>
      handleCredentialResponse.current(res)
    );
    return unregister;
  }, [instanceId]);

  // Load GIS script, ensure single initialization, and render button
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('[SocialAuthButton] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set.');
      return;
    }

    let isMounted = true;
    const container = containerRef.current;
    let resizeObserver: ResizeObserver | null = null;
    let lastRenderedWidth = 0;

    loadGoogleIdentityServices()
      .then(() => {
        if (!isMounted) return;

        // 1. Initialize strictly once per page lifetime
        initializeGoogleIdentityServices(clientId);

        // 2. Render Google button into this container
        if (container) {
          const render = () => {
            if (!container) return;
            const currentWidth = Math.min(400, Math.max(200, Math.floor(container.clientWidth || 384)));
            if (Math.abs(currentWidth - lastRenderedWidth) >= 4 || lastRenderedWidth === 0) {
              lastRenderedWidth = currentWidth;
              renderGoogleButton(container);
              setIsGisReady(true);
            }
          };

          render();

          if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => {
              render();
            });
            resizeObserver.observe(container);
          }
        }
      })
      .catch((err) => {
        console.error('[SocialAuthButton] Failed to load Google Identity Services:', err);
      });

    return () => {
      isMounted = false;
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  // Loading state while verifying token & creating session
  if (isAuthenticating) {
    return (
      <div className="w-full h-[52px] rounded-full bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm flex items-center justify-center gap-3">
        <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
        <span>Signing in with Google...</span>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* GIS rendered official Google Button container */}
      <div
        ref={containerRef}
        className={`w-full flex justify-center items-center ${
          isGisReady && !disabled ? 'block min-h-[40px]' : 'hidden'
        }`}
      />

      {/* Fallback PATHWAY styled button shown while GIS is loading or if disabled */}
      {(!isGisReady || disabled) && (
        <button
          type="button"
          disabled={disabled || !isGisReady}
          className="w-full h-[52px] rounded-full bg-slate-50 hover:bg-slate-100 active:scale-[0.99] border border-slate-200 text-slate-800 font-semibold text-sm flex items-center justify-center gap-3 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] disabled:opacity-50"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      )}
    </div>
  );
};
