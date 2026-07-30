// src/hooks/GoogleAuth.jsx
//
// Matches the import path used in LoginPage.jsx and App.jsx:
//   import { GoogleLoginButton } from '@/hooks/GoogleAuth';
//   import { OAuthCallbackPage } from '@/hooks/GoogleAuth';
//
// Deliberately thin — all auth state changes go through useAuthStore so
// there's exactly one place (authStore.js) that knows how tokens/user get
// set, not two competing implementations.

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '@/context/authStore';

export function GoogleLoginButton({ label = 'Continue with Google' }) {
  const googleLogin = useAuthStore((s) => s.googleLogin);

  return (
    <button
      type="button"
      onClick={googleLogin}
      className="btn btn-outline btn-full"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
    >
      <GoogleIcon />
      {label}
    </button>
  );
}

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const handleGoogleCallback = useAuthStore((s) => s.handleGoogleCallback);
  // Exchange codes are single-use server-side — React 18 StrictMode
  // double-invokes effects in dev, and this guard stops the second
  // invocation from burning through a code the first one already redeemed.
  const attempted = useRef(false);

  useEffect(() => {
    const oauthError = searchParams.get('error');
    const code = searchParams.get('code');

    if (oauthError) {
      setError(oauthError);
      return;
    }
    if (!code) {
      setError('missing_code');
      return;
    }
    if (attempted.current) return;
    attempted.current = true;

    // Drop the code from the URL before the network round-trip completes —
    // it's already single-use server-side, but no reason to leave it
    // sitting in browser history / visible in the address bar.
    window.history.replaceState({}, '', '/oauth/callback');

    handleGoogleCallback(code).then((result) => {
      if (!result.success) {
        setError(result.error || 'oauth_exchange_failed');
        return;
      }
      navigate('/', { replace: true });
    });
  }, [searchParams, navigate, handleGoogleCallback]);

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--danger, #dc2626)' }}>Google sign-in failed ({error}).</p>
          <button onClick={() => navigate('/login')} className="btn btn-outline" style={{ marginTop: 16 }}>
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>Signing you in…</p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  );
}