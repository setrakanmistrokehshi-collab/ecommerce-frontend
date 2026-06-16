import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useCartStore from '@/context/cartStore';
import useAuthStore from '@/context/authStore';
import { payments as paymentsApi } from '@/api/client';
import { Field } from '@/components/ui';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { items, clear } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [promo, setPromo] = useState('');
  const [promoData, setPromoData] = useState(null);
  const [checkingPromo, setCheckingPromo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      street: '', city: '', state: '',
    },
  });

  const subtotal  = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping  = subtotal >= 20000 ? 0 : 1500;
  const discount  = promoData ? Math.round(subtotal * (promoData.discountPercent / 100)) : 0;
  const total     = subtotal + shipping - discount;

  const handlePromo = async () => {
    if (!promo.trim()) return;
    setCheckingPromo(true);
    try {
      const { data } = await paymentsApi.validatePromo(promo.trim().toUpperCase());
      setPromoData(data);
      toast.success(`🎉 ${data.discountPercent}% discount applied!`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid promo code');
      setPromoData(null);
    } finally {
      setCheckingPromo(false);
    }
  };

  const onSubmit = async (formData) => {
    if (items.length === 0) { toast.error('Cart is empty'); return; }
    setSubmitting(true);
    try {
      const payload = {
        items: items.map((i) => ({ productId: i._id, quantity: i.quantity })),
        shippingAddress: {
          street: formData.street,
          city:   formData.city,
          state:  formData.state,
          country: 'Nigeria',
        },
        customerName:  formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        promoCode: promoData ? promo.trim().toUpperCase() : undefined,
      };

      const { data } = await paymentsApi.checkout(payload);
      // Nomba redirect
      if (data.checkoutUrl) {
        clear();
        window.location.href = data.checkoutUrl;
      } else {
        toast.error('Payment initiation failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 'var(--space-8) 0 var(--space-16)' }}>
      <div className='container'>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 'var(--space-8)' }}>Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='checkout-grid' style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-8)', alignItems: 'start' }}>
            {/* ── Left: Details ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              {/* Contact */}
              <div className='card' style={{ padding: 'var(--space-6)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 'var(--space-5)' }}>Contact Info</h2>
                <div className='checkout-2col' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <Field label='Full Name *' error={errors.name?.message}>
                    <input className={`input ${errors.name ? 'error' : ''}`} {...register('name', { required: 'Required' })} />
                  </Field>
                  <Field label='Email *' error={errors.email?.message}>
                    <input className={`input ${errors.email ? 'error' : ''}`} type='email' {...register('email', { required: 'Required' })} />
                  </Field>
                  <Field label='Phone *' error={errors.phone?.message} style={{ gridColumn: '1 / -1' }}>
                    <input className={`input ${errors.phone ? 'error' : ''}`} placeholder='08012345678' {...register('phone', { required: 'Required' })} />
                  </Field>
                </div>
              </div>

              {/* Shipping */}
              <div className='card' style={{ padding: 'var(--space-6)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 'var(--space-5)' }}>Delivery Address</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <Field label='Street Address *' error={errors.street?.message}>
                    <input className={`input ${errors.street ? 'error' : ''}`} placeholder='12 Adeola Odeku Street' {...register('street', { required: 'Required' })} />
                  </Field>
                  <div className='checkout-2col' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <Field label='City *' error={errors.city?.message}>
                      <input className={`input ${errors.city ? 'error' : ''}`} placeholder='Lagos' {...register('city', { required: 'Required' })} />
                    </Field>
                    <Field label='State *' error={errors.state?.message}>
                      <input className={`input ${errors.state ? 'error' : ''}`} placeholder='Lagos State' {...register('state', { required: 'Required' })} />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Items preview */}
              <div className='card' style={{ padding: 'var(--space-6)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 'var(--space-4)' }}>Order Items</h2>
                {items.map((item) => (
                  <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 24 }}>{item.emoji || '💊'}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--forest)' }}>₦{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Summary ── */}
            <div className='checkout-summary' style={{ position: 'sticky', top: 80 }}>
              <div className='card' style={{ padding: 'var(--space-6)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 'var(--space-5)' }}>Order Summary</h2>

                {/* Promo code */}
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      className='input'
                      placeholder='Promo code'
                      value={promo}
                      onChange={(e) => setPromo(e.target.value.toUpperCase())}
                      style={{ flex: 1 }}
                    />
                    <button type='button' className='btn btn-outline btn-sm' onClick={handlePromo} disabled={checkingPromo}>
                      {checkingPromo ? '...' : 'Apply'}
                    </button>
                  </div>
                  {promoData && (
                    <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 4 }}>
                      ✓ {promoData.discountPercent}% discount applied
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <LineItem label='Subtotal' value={`₦${subtotal.toLocaleString()}`} />
                  <LineItem label='Shipping' value={shipping === 0 ? 'Free' : `₦${shipping.toLocaleString()}`} valueColor={shipping === 0 ? 'var(--success)' : undefined} />
                  {discount > 0 && <LineItem label={`Promo (${promoData?.discountPercent}%)`} value={`-₦${discount.toLocaleString()}`} valueColor='var(--success)' />}
                  <hr className='divider' style={{ margin: '4px 0' }} />
                  <LineItem label='Total' value={`₦${total.toLocaleString()}`} bold />
                </div>

                <button
                  type='submit'
                  className='btn btn-amber btn-full btn-lg'
                  style={{ marginTop: 'var(--space-5)' }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <><div className='spinner' style={{ width: 18, height: 18, borderColor: 'white' }} /> Processing...</>
                  ) : (
                    `Pay ₦${total.toLocaleString()} →`
                  )}
                </button>

                <div style={{ marginTop: 'var(--space-4)', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 12 }}>
                    🔒 Secured by Nomba · Your data is safe
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function LineItem({ label, value, bold, valueColor }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: bold ? 18 : 14, fontWeight: bold ? 700 : 400, color: bold ? 'var(--forest-deep)' : 'var(--muted)' }}>
      <span>{label}</span>
      <span style={{ color: valueColor }}>{value}</span>
    </div>
  );
}
