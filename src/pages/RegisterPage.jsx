// src/pages/auth/RegisterPage.jsx  (or wherever your auth pages live)
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '@/context/authStore';
import { Field } from '@/components/ui';
import { GoogleLoginButton } from '@/hooks/GoogleAuth';
import toast from 'react-hot-toast';

// ── Shared Auth Card Shell (same as Login – already responsive-ready) ──
function AuthShell({ title, subtitle, children }) {
  return (
    <div
      className="auth-shell"
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, var(--cream) 0%, var(--parchment) 100%)',
      }}
    >
      {/* Left panel – hidden on mobile */}
      <div
        className="auth-left"
        style={{
          width: '45%',
          background: 'var(--forest-deep)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'var(--space-12)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '20%',
            right: '-10%',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'rgba(122,158,126,0.2)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            left: '-5%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(200,133,74,0.15)',
          }}
        />

        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 'var(--space-12)',
            position: 'relative',
          }}
        >
          <span style={{ fontSize: 32 }}>🌿</span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 24,
              color: 'var(--cream)',
              fontWeight: 700,
            }}
          >
            Winners Health
          </span>
        </Link>

        <div style={{ position: 'relative' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 36,
              color: 'var(--cream)',
              marginBottom: 16,
              lineHeight: 1.2,
            }}
          >
            Your wellness journey starts here.
          </h2>
          <p
            style={{
              color: 'var(--sage-light)',
              lineHeight: 1.7,
              fontSize: 15,
              maxWidth: 360,
            }}
          >
            Premium supplements trusted by 50,000+ Nigerians. Quality ingredients, real results.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 40 }}>
            {['✓ Free delivery over ₦20,000', '✓ 30-day returns', '✓ 100% natural ingredients'].map(
              (t) => (
                <div key={t} style={{ color: 'var(--sage-light)', fontSize: 14 }}>
                  {t}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div
        className="auth-right"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-8)',
        }}
      >
        <div style={{ width: '100%', maxWidth: 440, animation: 'fadeUp 0.4s ease' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 30,
              color: 'var(--forest-deep)',
              marginBottom: 6,
            }}
          >
            {title}
          </h1>
          <p style={{ color: 'var(--muted)', marginBottom: 'var(--space-8)' }}>{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Register Page ─────────────────────────────────────────────────
export function RegisterPage() {
  const { register: registerUser, isLoading } = useAuthStore(); // adjust if your store method is named differently
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    // Remove confirmPassword before sending
    const { confirmPassword, ...payload } = data;

    const result = await registerUser(payload); // expects { name, email, password }

    if (result?.success) {
      toast.success('Account created! Welcome 🌿');
      navigate('/');
    } else {
      toast.error(result?.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <AuthShell title="Create account" subtitle="Join thousands of healthy Nigerians">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Google */}
        <GoogleLoginButton />

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '8px 0' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e5e7eb' }} />
          <span style={{ color: '#9ca3af', fontSize: '14px' }}>or continue with email</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e5e7eb' }} />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
        >
          <Field label="Full Name" error={errors.name?.message}>
            <input
              className={`input ${errors.name ? 'error' : ''}`}
              type="text"
              placeholder="Chidi Okonkwo"
              {...register('name', {
                required: 'Full name is required',
                minLength: { value: 2, message: 'Name is too short' },
              })}
            />
          </Field>

          <Field label="Email Address" error={errors.email?.message}>
            <input
              className={`input ${errors.email ? 'error' : ''}`}
              type="email"
              placeholder="you@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email',
                },
              })}
            />
          </Field>

          <Field label="Password" error={errors.password?.message}>
            <input
              className={`input ${errors.password ? 'error' : ''}`}
              type="password"
              placeholder="Create a password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Minimum 6 characters' },
              })}
            />
          </Field>

          <Field label="Confirm Password" error={errors.confirmPassword?.message}>
            <input
              className={`input ${errors.confirmPassword ? 'error' : ''}`}
              type="password"
              placeholder="Repeat your password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />
          </Field>

          <button
            className="btn btn-primary btn-full btn-lg"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner" style={{ width: 18, height: 18 }} /> Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--sage-dark)', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </AuthShell>
  );
}
export default RegisterPage;