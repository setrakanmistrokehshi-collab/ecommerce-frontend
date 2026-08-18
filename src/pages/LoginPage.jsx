import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '@/context/authStore';
import { auth as authApi } from '@/api/client';
import { Field } from '@/components/ui';
import GoogleSignInButton  from '@/components/GoogleSignInButton';
import toast from 'react-hot-toast';

// ── Shared Auth Card Shell ────────────────────────────────────────
// Added: responsive breakpoint. Below 768px the brand panel drops out
// entirely and the form takes the full width — previously this was a
// fixed 45%/flex split with no mobile behavior at all.
function AuthShell({ title, subtitle, children }) {
  return (
    <div className="auth-shell" style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, var(--cream) 0%, var(--parchment) 100%)',
    }}>
      <style>{`
        @media (max-width: 768px) {
          .auth-shell__brand { display: none; }
          .auth-shell__form { padding: var(--space-6) var(--space-4) !important; }
        }
        @media (max-width: 420px) {
          .auth-shell__form-inner { max-width: 100% !important; }
        }
      `}</style>

      {/* Left panel */}
      <div className="auth-shell__brand" style={{
        width: '45%', background: 'var(--forest-deep)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: 'var(--space-12)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '20%', right: '-10%', width: 320, height: 320, borderRadius: '50%', background: 'rgba(122,158,126,0.2)' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '-5%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(200,133,74,0.15)' }} />
        <Link to='/' style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-12)', position: 'relative' }}>
          <span style={{ fontSize: 32 }}>🌿</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--cream)', fontWeight: 700 }}>Winners Health</span>
        </Link>
        <div style={{ position: 'relative' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--cream)', marginBottom: 16, lineHeight: 1.2 }}>
            Your wellness journey starts here.
          </h2>
          <p style={{ color: 'var(--sage-light)', lineHeight: 1.7, fontSize: 15, maxWidth: 360 }}>
            Premium supplements trusted by 50,000+ Nigerians. Quality ingredients, real results.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 40 }}>
            {['✓ Free delivery over ₦40,000', '✓ 30-day returns', '✓ 100% natural ingredients'].map(t => (
              <div key={t} style={{ color: 'var(--sage-light)', fontSize: 14 }}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-shell__form" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)' }}>
        <div className="auth-shell__form-inner" style={{ width: '100%', maxWidth: 440, animation: 'fadeUp 0.4s ease' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: 'var(--forest-deep)', marginBottom: 6 }}>{title}</h1>
          <p style={{ color: 'var(--muted)', marginBottom: 'var(--space-8)' }}>{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────────
export function LoginPage() {
  const { login, loginWithGoogle, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const result = await login(data);
    if (result.success) {
      toast.success('Welcome back!');
      navigate(params.get('redirect') || '/');
    } else {
      toast.error(result.error);
    }
  };

  const handleGoogleSuccess = (data) => {
    loginWithGoogle(data);
    toast.success('Welcome back!');
    navigate(params.get('redirect') || '/');
  };

  const handleGoogleError = (err) => {
    toast.error(err.message || 'Google sign-in failed.');
  };

  return (
    <AuthShell title='Welcome back' subtitle='Sign in to your account'>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

        <GoogleSignInButton
         onSuccess={handleGoogleSuccess}
         onError={handleGoogleError}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '8px 0' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e5e7eb' }} />
          <span style={{ color: '#9ca3af', fontSize: '14px' }}>or continue with email</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e5e7eb' }} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Field label='Email Address' error={errors.email?.message}>
            <input className={`input ${errors.email ? 'error' : ''}`} type='email' placeholder='you@example.com'
              {...register('email', { required: 'Email is required' })} />
          </Field>
          <Field label='Password' error={errors.password?.message}>
            <input className={`input ${errors.password ? 'error' : ''}`} type='password' placeholder='Your password'
              {...register('password', { required: 'Password is required' })} />
          </Field>
          <div style={{ textAlign: 'right' }}>
            <Link to='/forgot-password' style={{ fontSize: 13, color: 'var(--sage-dark)' }}>Forgot password?</Link>
          </div>
          <button className='btn btn-primary btn-full btn-lg' type='submit' disabled={isLoading}>
            {isLoading ? <><div className='spinner' style={{ width: 18, height: 18 }} /> Signing in...</> : 'Sign In'}
          </button>
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>
            Don't have an account? <Link to='/register' style={{ color: 'var(--sage-dark)', fontWeight: 600 }}>Sign up</Link>
          </p>
        </form>
      </div>
    </AuthShell>
  );
}

// ── Forgot Password ───────────────────────────────────────────────
export function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [sent, setSent] = useState(false);

  const onSubmit = async (data) => {
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
    } catch (_) {
      setSent(true); // Always show success (prevent enumeration)
    }
  };

  return (
    <AuthShell title="Reset password" subtitle="Enter your email and we'll send a reset link">
      {sent ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✉️</div>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
            If an account with that email exists, you'll receive a reset link shortly.
          </p>
          <Link to="/login" className='btn btn-outline btn-full' style={{ marginTop: 'var(--space-6)' }}>Back to Login</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Field label='Email Address' error={errors.email?.message}>
            <input className={`input ${errors.email ? 'error' : ''}`} type='email' placeholder='you@example.com'
              {...register('email', { required: 'Email is required' })} />
          </Field>
          <button className='btn btn-primary btn-full btn-lg' type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>
          <Link to="/login" style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>← Back to Login</Link>
        </form>
      )}
    </AuthShell>
  );
}

// ── Reset Password ────────────────────────────────────────────────
// authApi.resetPassword(token, password) is assumed to mirror the
// forgotPassword(email) shape above — check /api/client and rename
// if your backend expects e.g. authApi.resetPassword({ token, password }).
export function ResetPasswordPage() {
  const { token } = useParams();
  // Fallback in case your email link uses a query string instead of
  // a path param (?token=...) — harmless if unused.
  const [searchParams] = useSearchParams();
  const resetToken = token || searchParams.get('token');

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();
  const [done, setDone] = useState(false);
  const [invalid, setInvalid] = useState(!resetToken);

  const password = watch('password', '');

  
const onSubmit = async (data) => {
  try {
    await authApi.resetPassword({ token: resetToken, password: data.password });
    setDone(true);
    toast.success('Password updated');
    setTimeout(() => navigate('/login'), 1800);
  } catch (err) {
    const status = err?.response?.status;
    if (status === 400 || status === 410) {
      setInvalid(true);
    } else {
      toast.error(err?.response?.data?.message || 'Something went wrong. Try again.');
    }
  }
};

  if (invalid) {
    return (
      <AuthShell title="Link expired" subtitle="This reset link is no longer valid">
        <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⚠️</div>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
            The link may have expired or already been used. Request a fresh one to continue.
          </p>
          <Link to="/forgot-password" className='btn btn-primary btn-full' style={{ marginTop: 'var(--space-6)' }}>
            Request new link
          </Link>
          <Link to="/login" style={{ display: 'block', textAlign: 'center', fontSize: 14, color: 'var(--muted)', marginTop: 12 }}>
            Back to Login
          </Link>
        </div>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title="Password updated" subtitle="Taking you to sign in...">
        <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
            Your password has been changed successfully.
          </p>
          <Link to="/login" className='btn btn-primary btn-full' style={{ marginTop: 'var(--space-6)' }}>
            Go to sign in now
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose something strong and memorable">
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Field label='New Password' error={errors.password?.message}>
          <input className={`input ${errors.password ? 'error' : ''}`} type='password' placeholder='Enter new password'
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'At least 8 characters' },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                message: 'Include upper, lower case and a number',
              },
            })} />
        </Field>

        <Field label='Confirm Password' error={errors.confirm?.message}>
          <input className={`input ${errors.confirm ? 'error' : ''}`} type='password' placeholder='Re-enter new password'
            {...register('confirm', {
              required: 'Please confirm your password',
              validate: (v) => v === password || 'Passwords do not match',
            })} />
        </Field>

        <button className='btn btn-primary btn-full btn-lg' type='submit' disabled={isSubmitting}>
          {isSubmitting ? <><div className='spinner' style={{ width: 18, height: 18 }} /> Updating...</> : 'Update Password'}
        </button>

        <Link to="/login" style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>← Back to Login</Link>
      </form>
    </AuthShell>
  );
}

export default LoginPage;