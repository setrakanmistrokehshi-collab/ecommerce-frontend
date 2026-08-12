// components/GoogleSignInButton.jsx.

import { useEffect, useRef, useState } from 'react';
import { useGoogleIdentity } from '../hooks/useGoogleIdentity';

const API_BASE = import.meta.env.VITE_API_BASE_URL; 

export default function GoogleSignInButton({ onSuccess, onError }) {
  const buttonRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCredential = async (response) => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.errors?.[0]?.msg || 'Google sign-in failed.');
      }

      onSuccess?.(data);
    } catch (err) {
      onError?.(err);
    } finally {
      setSubmitting(false);
    }
  };

  const { ready, renderButton } = useGoogleIdentity(handleCredential);

  useEffect(() => {
    if (ready && buttonRef.current) {
      renderButton(buttonRef.current);
    }
  }, [ready, renderButton]);

  return (
    <div>
      <div ref={buttonRef} aria-busy={submitting} />
      {submitting && <p style={{ fontSize: 13, opacity: 0.7 }}>Signing you in…</p>}
    </div>
  );
}


<GoogleSignInButton
  onSuccess={(user) => setCurrentUser(user)}
  onError={(err) => toast.error(err.message)}
/>