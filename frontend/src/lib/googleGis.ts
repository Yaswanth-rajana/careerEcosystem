/**
 * Google Identity Services (GIS) Client Management Module
 *
 * Guarantees:
 * 1. Single script insertion and cached loading Promise.
 * 2. Strict page-scoped idempotent initialization (google.accounts.id.initialize called at most once).
 * 3. Safe, collision-free registration of active credential callback subscribers.
 * 4. Clean per-component button rendering into target containers.
 */

declare global {
  interface Window {
    google?: any;
  }
}

type CredentialResponse = { credential?: string; select_by?: string };
type CredentialCallback = (response: CredentialResponse) => void;

interface RegisteredSubscriber {
  id: string;
  handler: CredentialCallback;
  timestamp: number;
}

const SCRIPT_ID = 'google-identity-services';
const GIS_URL = 'https://accounts.google.com/gsi/client';

let gisScriptPromise: Promise<void> | null = null;
let gisInitialized = false;
let activeSubscribers: RegisteredSubscriber[] = [];

/**
 * Dispatches a verified Google credential to the currently active subscriber.
 */
function handleGisCredential(response: CredentialResponse) {
  if (activeSubscribers.length === 0) {
    console.warn('[googleGis] Credential received but no active SocialAuthButton subscriber is mounted.');
    return;
  }

  // The active subscriber is the most recently registered/focused instance
  const currentSubscriber = activeSubscribers[activeSubscribers.length - 1];
  currentSubscriber.handler(response);
}

/**
 * Loads the Google Identity Services SDK script from Google's CDN with deduplication.
 */
export function loadGoogleIdentityServices(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is not defined (SSR)'));
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (gisScriptPromise) {
    return gisScriptPromise;
  }

  gisScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }

      const handleLoad = () => {
        cleanup();
        resolve();
      };
      const handleError = () => {
        cleanup();
        gisScriptPromise = null;
        reject(new Error('Failed to load Google Identity Services from existing script element.'));
      };
      const cleanup = () => {
        existingScript.removeEventListener('load', handleLoad);
        existingScript.removeEventListener('error', handleError);
      };

      existingScript.addEventListener('load', handleLoad);
      existingScript.addEventListener('error', handleError);
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = GIS_URL;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = () => {
      gisScriptPromise = null;
      script.remove();
      reject(new Error('Failed to load Google Identity Services SDK from Google CDN.'));
    };

    document.head.appendChild(script);
  });

  return gisScriptPromise;
}

/**
 * Initializes Google Identity Services strictly ONCE per page lifecycle.
 */
export function initializeGoogleIdentityServices(clientId: string): void {
  if (gisInitialized) {
    return;
  }

  if (!window.google?.accounts?.id) {
    console.error('[googleGis] initialize called before Google Identity Services was loaded.');
    return;
  }

  if (!clientId) {
    console.warn('[googleGis] initialize called without a valid client ID.');
    return;
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: handleGisCredential,
  });

  gisInitialized = true;
}

/**
 * Registers an active SocialAuthButton subscriber to receive credentials.
 * Returns an unregister cleanup function.
 */
export function registerCredentialSubscriber(id: string, handler: CredentialCallback): () => void {
  activeSubscribers = activeSubscribers.filter((s) => s.id !== id);
  activeSubscribers.push({ id, handler, timestamp: Date.now() });

  return () => {
    activeSubscribers = activeSubscribers.filter((s) => s.id !== id);
  };
}

/**
 * Updates an existing subscriber's handler without changing registration order.
 */
export function updateCredentialSubscriber(id: string, handler: CredentialCallback): void {
  const target = activeSubscribers.find((s) => s.id === id);
  if (target) {
    target.handler = handler;
  }
}

/**
 * Renders the Google Sign-In button into a component's container element.
 */
export function renderGoogleButton(container: HTMLElement): void {
  if (!window.google?.accounts?.id) return;

  const measuredWidth = container.clientWidth
    ? Math.min(400, Math.max(200, Math.floor(container.clientWidth)))
    : 384;

  container.innerHTML = '';
  window.google.accounts.id.renderButton(container, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'continue_with',
    shape: 'pill',
    logo_alignment: 'center',
    width: measuredWidth,
  });
}
