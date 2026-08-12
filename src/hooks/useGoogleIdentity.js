// hooks/useGoogleIdentity.js
//
// Loads the new Google Identity Services script exactly once per page
// load and exposes a single, memoized `google.accounts.id` handle.
//
// WHY THIS MATTERS FOR "SIGN IN TWICE":
// React 18 StrictMode intentionally double-invokes effects in dev.
// If you call `google.accounts.id.initialize()` inside a bare
// useEffect, it can register the callback twice, or race with the
// script still loading — leading to a first click that does nothing
// (or fires an already-stale callback) and a second click that works.
// The module-level singleton below guarantees the script loads once
// and `initialize` is called exactly once, regardless of how many
// components mount/unmount or how many times effects re-run.

import { useEffect, useRef, useState, useCallback } from 'react';

const GIS_SRC = 'https://accounts.google.com/gsi/client';

// Module-level (not component-level) singleton state — survives
// remounts and StrictMode's double-invoke.
let scriptLoadPromise = null;
let initialized = false;

function loadGisScript() {
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve(window.google);
      return;
    }
    const existing = document.querySelector(`script[src="${GIS_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google));
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

/**
 * @param {(response: { credential: string }) => void} onCredential
 *   Called once with the GIS ID token when the user signs in.
 */
export function useGoogleIdentity(onCredential) {
  const [ready, setReady] = useState(false);
  const callbackRef = useRef(onCredential);
  callbackRef.current = onCredential; // always call the latest callback

  useEffect(() => {
    let cancelled = false;

    loadGisScript().then((google) => {
      if (cancelled) return;

      if (!initialized) {
        google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: (response) => callbackRef.current?.(response),
          auto_select: false,        // don't silently re-auth returning users
          use_fedcm_for_prompt: true, // required — Google is phasing out the old prompt
          itp_support: true,          // Safari/ITP compatibility
        });
        initialized = true;
      }
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  /** Renders the standard Google button into the given DOM node. */
  const renderButton = useCallback((container, options = {}) => {
    if (!ready || !container || !window.google) return;
    // Clear first — prevents duplicate buttons on re-render.
    container.innerHTML = '';
    window.google.accounts.id.renderButton(container, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      width: 320,
      text: 'continue_with',
      ...options,
    });
  }, [ready]);

  /** Optional: trigger One Tap. Safe to call multiple times. */
  const promptOneTap = useCallback(() => {
    if (!ready || !window.google) return;
    window.google.accounts.id.prompt();
  }, [ready]);

  return { ready, renderButton, promptOneTap };
}