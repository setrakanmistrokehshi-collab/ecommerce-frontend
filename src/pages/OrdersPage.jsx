import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orders as ordersApi } from '@/api/client';
import { PageLoader, EmptyState, OrderStatusBadge, Modal } from '@/components/ui';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    ordersApi.myOrders()
      .then(({ data }) => setOrderList(data.orders))
      .catch(() => setOrderList([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      await ordersApi.cancel(id);
      toast.success('Order cancelled');
      setOrderList((prev) =>
        prev.map((o) => o._id === id ? { ...o, status: 'cancelled' } : o)
      );
      setSelected((prev) => prev ? { ...prev, status: 'cancelled' } : prev);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Cannot cancel this order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div style={{ padding: 'var(--space-8) 0 var(--space-16)' }}>
      <div className='container'>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 'var(--space-8)' }}>My Orders</h1>

        {orderList.length === 0 ? (
          <EmptyState
            emoji='📦'
            title='No orders yet'
            message="You haven't placed any orders. Start shopping to see them here."
            action={<Link to='/products' className='btn btn-primary'>Shop Now</Link>}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {orderList.map((order) => (
              <div key={order._id} className='card' style={{ padding: 'var(--space-5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--forest)', fontSize: 15 }}>
                        {order.orderNumber}
                      </span>
                      <OrderStatusBadge status={order.status} />
                      {order.paymentStatus === 'completed' && (
                        <span className='badge badge-green' style={{ fontSize: 10 }}>Paid</span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                      {format(new Date(order.createdAt), 'MMM d, yyyy · h:mm a')}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--forest)' }}>
                      ₦{order.total?.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                      {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Items preview */}
                <div style={{ display: 'flex', gap: 8, marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
                  {order.items?.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: 'var(--cream)', borderRadius: 'var(--radius)',
                      padding: '4px 10px', fontSize: 13,
                    }}>
                      <span>{item.emoji || '💊'}</span>
                      <span style={{ fontWeight: 500 }}>{item.name}</span>
                      <span style={{ color: 'var(--muted)' }}>×{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, marginTop: 'var(--space-4)' }}>
                  <button className='btn btn-outline btn-sm' onClick={() => setSelected(order)}>
                    View Details
                  </button>
                  {['pending', 'paid'].includes(order.status) && (
                    <button
                      className='btn btn-ghost btn-sm'
                      style={{ color: 'var(--rust)' }}
                      onClick={() => handleCancel(order._id)}
                      disabled={cancelling}
                    >
                      Cancel Order
                    </button>
                  )}
                  {order.trackingNumber && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--muted)' }}>
                      🚚 Track: <code style={{ fontFamily: 'var(--font-mono)' }}>{order.trackingNumber}</code>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Order ${selected?.orderNumber}`} maxWidth={580}>
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {/* Status timeline */}
            <div>
              <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-3)', fontSize: 14 }}>Status History</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selected.statusHistory?.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sage)', marginTop: 5, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{s.status}</div>
                      {s.note && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.note}</div>}
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                        {format(new Date(s.timestamp), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <hr className='divider' />

            {/* Items */}
            <div>
              <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-3)', fontSize: 14 }}>Items</h4>
              {selected.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: 14 }}>
                  <span>{item.emoji} {item.name} ×{item.quantity}</span>
                  <span style={{ fontWeight: 600 }}>₦{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { l: 'Subtotal', v: `₦${selected.subtotal?.toLocaleString()}` },
                { l: 'Shipping', v: selected.shipping === 0 ? 'Free' : `₦${selected.shipping?.toLocaleString()}` },
                ...(selected.discount > 0 ? [{ l: 'Discount', v: `-₦${selected.discount?.toLocaleString()}` }] : []),
              ].map((r) => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--muted)' }}>
                  <span>{r.l}</span><span>{r.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, paddingTop: 8, borderTop: '1px solid var(--border-light)' }}>
                <span>Total</span><span style={{ color: 'var(--forest)' }}>₦{selected.total?.toLocaleString()}</span>
              </div>
            </div>

            {/* Shipping address */}
            <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius)', padding: 'var(--space-4)', fontSize: 14 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Delivery Address</div>
              <div style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
                {selected.shippingAddress?.street}, {selected.shippingAddress?.city},{' '}
                {selected.shippingAddress?.state}
              </div>
            </div>

            {['pending', 'paid'].includes(selected.status) && (
              <button
                className='btn btn-full'
                style={{ background: 'rgba(184,92,56,0.1)', color: 'var(--rust)', border: '1px solid rgba(184,92,56,0.3)' }}
                onClick={() => handleCancel(selected._id)}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
