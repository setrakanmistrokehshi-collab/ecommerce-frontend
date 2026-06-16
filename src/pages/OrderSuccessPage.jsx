import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { payments as paymentsApi } from '@/api/client';
import { PageLoader } from '@/components/ui';

export default function OrderSuccessPage() {
  const [params] = useSearchParams();
  const ref = params.get('reference') || params.get('ref');
  const [status, setStatus] = useState('loading');
  const [order, setOrder]   = useState(null);

  useEffect(() => {
    if (!ref) { setStatus('success'); return; }
    paymentsApi.verifyStatus(ref)
      .then(({ data }) => {
        setOrder(data.order);
        setStatus(data.paymentStatus === 'completed' ? 'success' : 'pending');
      })
      .catch(() => setStatus('success'));
  }, [ref]);

  if (status === 'loading') return <PageLoader />;

  return (
    <div style={{
      minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-8)',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 520, animation: 'fadeUp 0.4s ease' }}>
        <div style={{ fontSize: 80, marginBottom: 'var(--space-6)' }}>
          {status === 'success' ? '🎉' : '⏳'}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--forest-deep)', marginBottom: 12 }}>
          {status === 'success' ? 'Order Confirmed!' : 'Payment Processing'}
        </h1>
        <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: 'var(--space-8)', fontSize: 16 }}>
          {status === 'success'
            ? 'Thank you for your order! We\'ll prepare your supplements with care and deliver them to you soon.'
            : 'Your payment is being processed. You\'ll receive a confirmation email shortly.'}
        </p>

        {order && (
          <div style={{
            background: 'var(--cream)', borderRadius: 'var(--radius-md)',
            padding: 'var(--space-5)', marginBottom: 'var(--space-6)', textAlign: 'left',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>Order Number</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--forest)' }}>{order.orderNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>Total Paid</span>
              <span style={{ fontWeight: 700, color: 'var(--forest)' }}>₦{order.total?.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to='/orders' className='btn btn-primary btn-lg'>View My Orders</Link>
          <Link to='/products' className='btn btn-outline btn-lg'>Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
