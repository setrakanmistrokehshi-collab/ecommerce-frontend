import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '@/context/authStore';
import { auth as authApi } from '@/api/client';
import { Field } from '@/components/ui';
import toast from 'react-hot-toast';

// ── Shared Auth Card Shell ────────────────────────────────────────
function AuthShell({ title, subtitle, children }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, var(--cream) 0%, var(--parchment) 100%)',
    }}>
      {/* Left panel */}
      <div style={{
        width: '45%', background: 'var(--forest-deep)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: 'var(--space-12)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '20%', right: '-10%', width: 320, height: 320, borderRadius: '50%', background: 'rgba(122,158,126,0.2)' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '-5%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(200,133,74,0.15)' }} />
        <Link to='/' style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-12)', position: 'relative' }}>
          <span style={{ fontSize: 32 }}>🌿</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--cream)', fontWeight: 700 }}>VitaCore</span>
        </Link>
        <div style={{ position: 'relative' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--cream)', marginBottom: 16, lineHeight: 1.2 }}>
            Your wellness journey starts here.
          </h2>
          <p style={{ color: 'var(--sage-light)', lineHeight: 1.7, fontSize: 15, maxWidth: 360 }}>
            Premium supplements trusted by 50,000+ Nigerians. Quality ingredients, real results.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 40 }}>
            {['✓ Free delivery over ₦20,000', '✓ 30-day returns', '✓ 100% natural ingredients'].map(t => (
              <div key={t} style={{ color: 'var(--sage-light)', fontSize: 14 }}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)' }}>
        <div style={{ width: '100%', maxWidth: 440, animation: 'fadeUp 0.4s ease' }}>
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
  const { login, isLoading } = useAuthStore();
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

  return (
    <AuthShell title='Welcome back' subtitle='Sign in to your account'>
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
    </AuthShell>
  );
}

// ── Register ──────────────────────────────────────────────────────
export function RegisterPage() {
  const { register: storeRegister, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [done, setDone] = useState(false);

  const onSubmit = async (data) => {
    const result = await storeRegister({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    if (result.success) {
      setDone(true);
    } else {
      toast.error(result.error);
    }
  };
  if (done) return (
    <AuthShell title='Check your email' subtitle='Account created successfully!'>
      <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>📧</div>
        <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
          We've sent a verification link to your email. Click it to activate your account.
        </p>
        <Link to='/login' className='btn btn-primary btn-full' style={{ marginTop: 'var(--space-6)' }}>
          Go to Login
        </Link>
      </div>
    </AuthShell>
  );

  return (
    <AuthShell title='Create account' subtitle='Start your wellness journey today'>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Field label='Full Name' error={errors.name?.message}>
          <input className={`input ${errors.name ? 'error' : ''}`} placeholder='Adaeze Okonkwo'
            {...register('name', { required: 'Name is required', maxLength: { value: 60, message: 'Name too long' } })} />
        </Field>
        <Field label='Email Address' error={errors.email?.message}>
          <input className={`input ${errors.email ? 'error' : ''}`} type='email' placeholder='you@example.com'
            {...register('email', { required: 'Email is required' })} />
        </Field>
        <Field label='Password' error={errors.password?.message}>
          <input className={`input ${errors.password ? 'error' : ''}`} type='password' placeholder='At least 8 characters'
            {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })} />
        </Field>
        <Field label='Confirm Password' error={errors.confirm?.message}>
          <input className={`input ${errors.confirm ? 'error' : ''}`} type='password' placeholder='Repeat your password'
            {...register('confirm', {
              required: 'Please confirm',
              validate: (v) => v === watch('password') || 'Passwords do not match',
            })} />
        </Field>
        <button className='btn btn-primary btn-full btn-lg' type='submit' disabled={isLoading}>
          {isLoading ? <><div className='spinner' style={{ width: 18, height: 18 }} /> Creating...</> : 'Create Account'}
        </button>
        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>
          Already have an account? <Link to='/login' style={{ color: 'var(--sage-dark)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </form>
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

export default LoginPage;
