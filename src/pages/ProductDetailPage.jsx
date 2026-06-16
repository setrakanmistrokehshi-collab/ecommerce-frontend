import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products as productsApi } from '@/api/client';
import useCartStore from '@/context/cartStore';
import useAuthStore from '@/context/authStore';
import { PageLoader, OrderStatusBadge } from '@/components/ui';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    setLoading(true);
    productsApi.get(slug)
      .then(({ data }) => setProduct(data.product))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    addItem(product, qty);
    toast.success(`${product.emoji || '💊'} ${qty}× added to cart`);
  };

  const onReview = async (data) => {
    try {
      await productsApi.addReview(product._id, data);
      toast.success('Review submitted!');
      reset();
      setReviewOpen(false);
      // Refresh
      const res = await productsApi.get(slug);
      setProduct(res.data.product);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) return <PageLoader />;
  if (!product) return (
    <div style={{ textAlign: 'center', padding: 'var(--space-20)' }}>
      <h2>Product not found</h2>
      <Link to='/products' className='btn btn-outline' style={{ marginTop: 16 }}>← Back to Products</Link>
    </div>
  );

  const discount = product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <div style={{ padding: 'var(--space-8) 0 var(--space-16)' }}>
      <div className='container'>
        <Link to='/products' style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 'var(--space-6)', display: 'inline-block' }}>
          ← Back to Products
        </Link>

        <div className='product-detail-grid' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)', alignItems: 'start' }}>
          {/* ── Images ── */}
          <div>
            <div style={{
              aspectRatio: '1', borderRadius: 'var(--radius-lg)',
              background: 'var(--cream)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', marginBottom: 'var(--space-3)',
              border: '1px solid var(--border-light)',
            }}>
              {product.images?.[imgIdx] ? (
                <img src={product.images[imgIdx]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 120 }}>{product.emoji || '💊'}</span>
              )}
            </div>
            {product.images?.length > 1 && (
              <div style={{ display: 'flex', gap: 8 }}>
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)} style={{
                    width: 64, height: 64, borderRadius: 'var(--radius)',
                    border: `2px solid ${i === imgIdx ? 'var(--sage)' : 'var(--border-light)'}`,
                    overflow: 'hidden', cursor: 'pointer', background: 'none', padding: 0,
                  }}>
                    <img src={img} alt='' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                <span className='badge badge-green'>{product.category}</span>
                {product.badge && <span className='badge badge-forest'>{product.badge}</span>}
                {discount > 0 && <span className='badge badge-amber'>-{discount}% OFF</span>}
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.5vw, 36px)', color: 'var(--forest-deep)', lineHeight: 1.2 }}>
                {product.emoji} {product.name}
              </h1>
            </div>

            {/* Rating */}
            {product.numReviews > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} style={{ fontSize: 18, color: s <= Math.round(product.rating) ? 'var(--amber)' : 'var(--border)' }}>★</span>
                  ))}
                </div>
                <span style={{ color: 'var(--forest)', fontWeight: 600 }}>{product.rating}</span>
                <span style={{ color: 'var(--muted)', fontSize: 14 }}>({product.numReviews} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--forest)', fontFamily: 'var(--font-display)' }}>
                ₦{product.price?.toLocaleString()}
              </span>
              {product.originalPrice > product.price && (
                <span style={{ fontSize: 18, color: 'var(--muted)', textDecoration: 'line-through' }}>
                  ₦{product.originalPrice?.toLocaleString()}
                </span>
              )}
            </div>

            <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{product.description}</p>

            {/* Benefits */}
            {product.benefits?.length > 0 && (
              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--forest-deep)', marginBottom: 8 }}>Key Benefits</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {product.benefits.map((b, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: 'var(--charcoal)' }}>
                      <span style={{ color: 'var(--sage)', marginTop: 2 }}>✓</span> {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: product.stock > 10 ? 'var(--success)' : product.stock > 0 ? 'var(--warning)' : 'var(--error)',
              }} />
              <span style={{ fontSize: 14, color: 'var(--muted)' }}>
                {product.stock === 0 ? 'Out of stock' : product.stock <= 10 ? `Only ${product.stock} left` : 'In stock'}
              </span>
            </div>

            {/* Qty + Cart */}
            {product.stock > 0 && (
              <div className='qty-cart-row' style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                <div className='qty-selector' style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 40, height: 44, fontSize: 18, cursor: 'pointer', background: 'none', border: 'none', color: 'var(--forest)' }}>−</button>
                  <span style={{ width: 40, textAlign: 'center', fontWeight: 600 }}>{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))} style={{ width: 40, height: 44, fontSize: 18, cursor: 'pointer', background: 'none', border: 'none', color: 'var(--forest)' }}>+</button>
                </div>
                <button className='btn btn-primary' style={{ flex: 1 }} onClick={handleAddToCart}>
                  Add to Cart — ₦{(product.price * qty)?.toLocaleString()}
                </button>
              </div>
            )}

            {/* Details */}
            {product.howToUse && (
              <details style={{ borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-4)' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--forest)', fontSize: 14 }}>How to Use</summary>
                <p style={{ marginTop: 8, fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{product.howToUse}</p>
              </details>
            )}
            {product.ingredients?.length > 0 && (
              <details style={{ borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-4)' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--forest)', fontSize: 14 }}>Ingredients</summary>
                <p style={{ marginTop: 8, fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{product.ingredients.join(', ')}</p>
              </details>
            )}
          </div>
        </div>

        {/* ── Reviews ─────────────────────────────────────────────── */}
        <div style={{ marginTop: 'var(--space-16)' }}>
          <div className='reviews-header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>
              Customer Reviews ({product.numReviews})
            </h2>
            {isAuthenticated && (
              <button className='btn btn-outline' onClick={() => setReviewOpen(!reviewOpen)}>
                {reviewOpen ? 'Cancel' : 'Write a Review'}
              </button>
            )}
          </div>

          {/* Write review form */}
          {reviewOpen && (
            <form onSubmit={handleSubmit(onReview)} className='card' style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)', animation: 'fadeUp 0.3s ease' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-4)' }}>Your Review</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div>
                  <label className='label'>Rating *</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1,2,3,4,5].map((s) => (
                      <label key={s} style={{ cursor: 'pointer', fontSize: 28 }}>
                        <input type='radio' value={s} {...register('rating', { required: true })} style={{ display: 'none' }} />
                        ⭐
                      </label>
                    ))}
                  </div>
                  <select className='input' style={{ marginTop: 8 }} {...register('rating', { required: 'Rating required', valueAsNumber: true })}>
                    <option value=''>Select rating</option>
                    {[5,4,3,2,1].map(s => <option key={s} value={s}>{s} Star{s !== 1 ? 's' : ''}</option>)}
                  </select>
                  {errors.rating && <span className='field-error'>{errors.rating.message}</span>}
                </div>
                <div>
                  <label className='label'>Title</label>
                  <input className='input' placeholder='Summary of your experience' {...register('title')} />
                </div>
                <div>
                  <label className='label'>Comment *</label>
                  <textarea
                    className='input'
                    rows={4}
                    placeholder='Share your experience with this product...'
                    style={{ resize: 'vertical' }}
                    {...register('comment', { required: 'Comment required', minLength: { value: 10, message: 'Minimum 10 characters' } })}
                  />
                  {errors.comment && <span className='field-error'>{errors.comment.message}</span>}
                </div>
                <button className='btn btn-primary' type='submit' disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          )}

          {/* Review list */}
          {product.reviews?.filter(r => !r.hidden).length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--muted)' }}>
              No reviews yet. Be the first!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {product.reviews?.filter(r => !r.hidden).map((r) => (
                <div key={r._id} className='card' style={{ padding: 'var(--space-5)' }}>
                  <div className='review-card-header' style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'var(--sage)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 14,
                      }}>{r.name?.[0]?.toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--forest-deep)', fontSize: 14 }}>{r.name}</div>
                        {r.verified && <span className='badge badge-green' style={{ fontSize: 10 }}>Verified Purchase</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 1 }}>
                      {[1,2,3,4,5].map((s) => (
                        <span key={s} style={{ color: s <= r.rating ? 'var(--amber)' : 'var(--border)', fontSize: 14 }}>★</span>
                      ))}
                    </div>
                  </div>
                  {r.title && <p style={{ fontWeight: 600, marginBottom: 4 }}>{r.title}</p>}
                  <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
