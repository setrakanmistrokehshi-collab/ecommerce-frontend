import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '@/context/cartStore';
import useAuthStore from '@/context/authStore';
import { EmptyState } from '@/components/ui';

export default function CartPage() {
  const { items, removeItem, updateQty, clear } = useCartStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping  = subtotal >= 20000 ? 0 : 1500;
  const total     = subtotal + shipping;

  if (items.length === 0) return (
    <div style={{ padding: 'var(--space-8) 0' }}>
      <div className='container'>
        <EmptyState
          emoji='🛒'
          title='Your cart is empty'
          message="Looks like you haven\'t added anything yet. Browse our collection to get started."
          action={<Link to='/products' className='btn btn-primary'>Shop Now</Link>}
        />
      </div>
    </div>
  );

  return (
    <div style={{ padding: 'var(--space-8) 0 var(--space-16)' }}>
      <div className='container'>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 'var(--space-8)' }}>
          Shopping Cart ({items.length} item{items.length !== 1 ? 's' : ''})
        </h1>

        <div className='cart-grid' style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-8)', alignItems: 'start' }}>
          {/* Items */}
          <div className='card'>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--border-light)' }}>
              <button className='btn btn-ghost btn-sm' onClick={clear}>Clear all</button>
            </div>
            {items.map((item) => (
              <div key={item._id} className='cart-item' style={{
                display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-5)',
                borderBottom: '1px solid var(--border-light)',
                alignItems: 'center',
              }}>
                {/* Image */}
                <div className='cart-item-image' style={{
                  width: 80, height: 80, borderRadius: 'var(--radius)',
                  background: 'var(--cream)', overflow: 'hidden', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {item.images?.[0]
                    ? <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 36 }}>{item.emoji || '💊'}</span>
                  }
                </div>

                {/* Info */}
                <div className='cart-item-info' style={{ flex: 1 }}>
                  <Link to={`/products/${item.slug || item._id}`} style={{ fontWeight: 600, color: 'var(--forest-deep)', fontSize: 15 }}>
                    {item.name}
                  </Link>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{item.category}</div>
                </div>

                {/* Qty + Price — display:contents on desktop keeps them as
                    separate flex items (unchanged); mobile makes this a
                    full-width row via .cart-item-qtyprice */}
                <div className='cart-item-qtyprice' style={{ display: 'contents' }}>
                  {/* Qty */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                    <button onClick={() => updateQty(item._id, item.quantity - 1)} style={{ width: 34, height: 36, cursor: 'pointer', background: 'none', border: 'none', fontSize: 16 }}>−</button>
                    <span style={{ width: 34, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                    <button onClick={() => updateQty(item._id, item.quantity + 1)} style={{ width: 34, height: 36, cursor: 'pointer', background: 'none', border: 'none', fontSize: 16 }}>+</button>
                  </div>

                  {/* Price */}
                  <div style={{ textAlign: 'right', minWidth: 100 }}>
                    <div style={{ fontWeight: 700, color: 'var(--forest)', fontSize: 16 }}>₦{(item.price * item.quantity).toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>₦{item.price?.toLocaleString()} each</div>
                  </div>
                </div>

                <button className='cart-item-remove' onClick={() => removeItem(item._id)} style={{ color: 'var(--muted)', cursor: 'pointer', background: 'none', border: 'none', fontSize: 18, padding: 4 }}>×</button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className='card cart-summary' style={{ padding: 'var(--space-6)', position: 'sticky', top: 80 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 'var(--space-5)' }}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--muted)' }}>
                <span>Subtotal</span><span>₦{subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--muted)' }}>
                <span>Shipping</span>
                <span style={{ color: shipping === 0 ? 'var(--success)' : undefined }}>
                  {shipping === 0 ? 'Free' : `₦${shipping.toLocaleString()}`}
                </span>
              </div>
              {shipping > 0 && (
                <div style={{ fontSize: 12, color: 'var(--sage-dark)', background: 'var(--cream)', padding: '8px 12px', borderRadius: 'var(--radius)' }}>
                  Add ₦{(20000 - subtotal).toLocaleString()} more for free shipping!
                </div>
              )}
              <hr className='divider' style={{ margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18 }}>
                <span>Total</span><span style={{ color: 'var(--forest)' }}>₦{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              className='btn btn-amber btn-full btn-lg'
              style={{ marginTop: 'var(--space-5)' }}
              onClick={() => isAuthenticated ? navigate('/checkout') : navigate('/login?redirect=/checkout')}
            >
              {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
            </button>
            <Link to='/products' className='btn btn-ghost btn-full' style={{ marginTop: 8, textAlign: 'center' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
