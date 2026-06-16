import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { users as usersApi } from '@/api/client';
import useAuthStore from '@/context/authStore';
import { Field, Modal, PageLoader } from '@/components/ui';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [tab, setTab]     = useState('profile');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addrModal, setAddrModal] = useState(false);

  useEffect(() => {
    usersApi.getProfile()
      .then(({ data }) => setProfile(data.user))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const TABS = [
    { id: 'profile',   label: '👤 Profile' },
    { id: 'addresses', label: '📍 Addresses' },
    { id: 'password',  label: '🔒 Password' },
    { id: 'newsletter',label: '📧 Newsletter' },
  ];

  return (
    <div style={{ padding: 'var(--space-8) 0 var(--space-16)' }}>
      <div className='container'>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 'var(--space-8)' }}>My Account</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 'var(--space-8)', alignItems: 'start' }}>
          {/* Sidebar */}
          <div className='card' style={{ padding: 'var(--space-4)', position: 'sticky', top: 80 }}>
            {/* Avatar */}
            <div style={{ textAlign: 'center', padding: 'var(--space-4) 0 var(--space-5)', borderBottom: '1px solid var(--border-light)', marginBottom: 'var(--space-3)' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'var(--sage)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, fontWeight: 700, margin: '0 auto 10px',
              }}>
                {profile?.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ fontWeight: 600, color: 'var(--forest-deep)' }}>{profile?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{profile?.email}</div>
              {!profile?.isEmailVerified && (
                <span className='badge badge-amber' style={{ marginTop: 6 }}>Email not verified</span>
              )}
            </div>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius)',
                  fontSize: 14, fontWeight: 500,
                  background: tab === t.id ? 'var(--cream)' : 'transparent',
                  color: tab === t.id ? 'var(--forest)' : 'var(--muted)',
                  border: 'none', cursor: 'pointer',
                  borderLeft: tab === t.id ? '3px solid var(--sage)' : '3px solid transparent',
                  marginBottom: 2,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div>
            {tab === 'profile'    && <ProfileTab profile={profile} setProfile={setProfile} setUser={setUser} />}
            {tab === 'addresses'  && <AddressesTab profile={profile} setProfile={setProfile} addrModal={addrModal} setAddrModal={setAddrModal} />}
            {tab === 'password'   && <PasswordTab />}
            {tab === 'newsletter' && <NewsletterTab profile={profile} setProfile={setProfile} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Profile Tab ───────────────────────────────────────────────────
function ProfileTab({ profile, setProfile, setUser }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: profile?.name, phone: profile?.phone },
  });

  const onSubmit = async (data) => {
    try {
      const res = await usersApi.updateProfile(data);
      setProfile(res.data.user);
      setUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className='card' style={{ padding: 'var(--space-6)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 'var(--space-6)' }}>Profile Details</h2>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: 440 }}>
        <Field label='Full Name' error={errors.name?.message}>
          <input className='input' {...register('name', { required: 'Required', maxLength: { value: 60, message: 'Too long' } })} />
        </Field>
        <Field label='Phone Number' error={errors.phone?.message}>
          <input className='input' placeholder='08012345678' {...register('phone')} />
        </Field>
        <div>
          <label className='label'>Email Address</label>
          <input className='input' value={profile?.email} disabled style={{ background: 'var(--cream)', cursor: 'not-allowed' }} />
          <span style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, display: 'block' }}>Email cannot be changed</span>
        </div>
        <div style={{ display: 'flex', gap: 12, paddingTop: 'var(--space-2)' }}>
          <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius)', padding: '10px 16px', fontSize: 13 }}>
            <span style={{ color: 'var(--muted)' }}>Member since </span>
            <span style={{ fontWeight: 600, color: 'var(--forest)' }}>
              {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : '—'}
            </span>
          </div>
          <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius)', padding: '10px 16px', fontSize: 13 }}>
            <span style={{ color: 'var(--muted)' }}>Role </span>
            <span style={{ fontWeight: 600, color: 'var(--forest)', textTransform: 'capitalize' }}>{profile?.role}</span>
          </div>
        </div>
        <button className='btn btn-primary' type='submit' disabled={isSubmitting} style={{ alignSelf: 'flex-start' }}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

// ── Addresses Tab ─────────────────────────────────────────────────
function AddressesTab({ profile, setProfile, addrModal, setAddrModal }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onAdd = async (data) => {
    try {
      const res = await usersApi.addAddress(data);
      setProfile(res.data.user);
      toast.success('Address added');
      reset();
      setAddrModal(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add address');
    }
  };

  const onRemove = async (id) => {
    try {
      const res = await usersApi.removeAddress(id);
      setProfile(res.data.user);
      toast.success('Address removed');
    } catch (err) {
      toast.error('Failed to remove address');
    }
  };

  return (
    <div className='card' style={{ padding: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>Saved Addresses</h2>
        <button className='btn btn-outline btn-sm' onClick={() => setAddrModal(true)}>+ Add Address</button>
      </div>

      {profile?.addresses?.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--muted)' }}>
          No saved addresses yet
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
          {profile?.addresses?.map((addr) => (
            <div key={addr._id} style={{
              border: '1.5px solid var(--border-light)', borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)', position: 'relative',
            }}>
              {addr.isDefault && <span className='badge badge-green' style={{ position: 'absolute', top: 10, right: 10 }}>Default</span>}
              <div style={{ fontWeight: 600, color: 'var(--forest-deep)', marginBottom: 4 }}>{addr.label}</div>
              <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
                {addr.street}<br />
                {addr.city}, {addr.state}<br />
                {addr.country}
              </div>
              <button
                className='btn btn-ghost btn-sm'
                style={{ color: 'var(--rust)', marginTop: 8 }}
                onClick={() => onRemove(addr._id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={addrModal} onClose={() => setAddrModal(false)} title='Add New Address'>
        <form onSubmit={handleSubmit(onAdd)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Field label='Label (e.g. Home, Office)'>
            <input className='input' placeholder='Home' {...register('label')} />
          </Field>
          <Field label='Street Address *' error={errors.street?.message}>
            <input className='input' {...register('street', { required: 'Required' })} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <Field label='City *' error={errors.city?.message}>
              <input className='input' {...register('city', { required: 'Required' })} />
            </Field>
            <Field label='State *' error={errors.state?.message}>
              <input className='input' {...register('state', { required: 'Required' })} />
            </Field>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type='checkbox' id='default' {...register('isDefault')} />
            <label htmlFor='default' style={{ fontSize: 14, cursor: 'pointer' }}>Set as default address</label>
          </div>
          <button className='btn btn-primary btn-full' type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Address'}
          </button>
        </form>
      </Modal>
    </div>
  );
}

// ── Password Tab ──────────────────────────────────────────────────
function PasswordTab() {
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await usersApi.changePassword({ currentPassword: data.current, newPassword: data.password });
      toast.success('Password changed successfully!');
      reset();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div className='card' style={{ padding: 'var(--space-6)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 'var(--space-6)' }}>Change Password</h2>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: 400 }}>
        <Field label='Current Password' error={errors.current?.message}>
          <input className='input' type='password' {...register('current', { required: 'Required' })} />
        </Field>
        <Field label='New Password' error={errors.password?.message}>
          <input className='input' type='password' {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })} />
        </Field>
        <Field label='Confirm New Password' error={errors.confirm?.message}>
          <input className='input' type='password' {...register('confirm', {
            required: 'Required',
            validate: (v) => v === watch('password') || 'Passwords do not match',
          })} />
        </Field>
        <button className='btn btn-primary' type='submit' disabled={isSubmitting} style={{ alignSelf: 'flex-start' }}>
          {isSubmitting ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}

// ── Newsletter Tab ────────────────────────────────────────────────
function NewsletterTab({ profile, setProfile }) {
  const [loading, setLoading] = useState(false);
  const subscribed = profile?.newsletterSubscribed;

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await usersApi.newsletter({ subscribe: !subscribed });
      setProfile((p) => ({ ...p, newsletterSubscribed: !subscribed }));
      toast.success(subscribed ? 'Unsubscribed from newsletter' : 'Subscribed to newsletter!');
    } catch (err) {
      toast.error('Failed to update preference');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='card' style={{ padding: 'var(--space-6)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 'var(--space-6)' }}>Newsletter</h2>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-5)' }}>
        <div style={{ fontSize: 48 }}>{subscribed ? '✉️' : '📭'}</div>
        <div>
          <h3 style={{ fontWeight: 600, color: 'var(--forest-deep)', marginBottom: 6 }}>
            {subscribed ? "You're subscribed!" : "Stay in active with our newsletter"}
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, maxWidth: 400, marginBottom: 16 }}>
            {subscribed
              ? 'You receive weekly wellness tips, exclusive offers, and new product alerts.'
              : 'Get weekly wellness tips, exclusive member offers, and be first to know about new products.'}
          </p>
          <button
            className={`btn ${subscribed ? 'btn-outline' : 'btn-primary'}`}
            onClick={toggle}
            disabled={loading}
          >
            {loading ? '...' : subscribed ? 'Unsubscribe' : 'Subscribe Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
