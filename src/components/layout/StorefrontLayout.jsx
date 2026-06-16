import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/context/authStore';
import useCartStore from '@/context/cartStore';
import toast from 'react-hot-toast';

export default function StorefrontLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const count = useCartStore((s) => s.count);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: scrolled ? 'rgba(248,244,238,0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border-light)' : '1px solid transparent',
          transition: 'all 0.3s ease',
        }}
      >
        <div className='container' style={{ display: 'flex', alignItems: 'center', height: 68, gap: 'var(--space-8)' }}>
          {/* Logo */}
          <Link to='/' style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24 }}>🌿</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--forest-deep)', letterSpacing: '-0.02em' }}>
              VitaCore
            </span>
          </Link>

          {/* Nav links */}
          <nav className='nav-links' style={{ display: 'flex', gap: 'var(--space-6)', marginLeft: 'auto', alignItems: 'center' }}>
            <NavLink to='/products'>Shop</NavLink>
            {isAuthenticated && <NavLink to='/orders'>Orders</NavLink>}
            {isAuthenticated && <NavLink to='/wishlist'>Wishlist</NavLink>}
            {user?.role === 'admin' && (
              <Link to='/admin/dashboard' style={{ fontSize: 13, color: 'var(--amber)', fontWeight: 600 }}>
                Admin ↗
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginLeft: 'auto' }}>
            {/* Cart */}
            <Link to='/cart' style={{ position: 'relative', padding: 8 }}>
              <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='var(--forest)' strokeWidth='1.8'>
                <path d='M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z'/>
                <line x1='3' y1='6' x2='21' y2='6'/>
                <path d='M16 10a4 4 0 01-8 0'/>
              </svg>
              {count > 0 && (
                <span style={{
                  position: 'absolute', top: 2, right: 2,
                  background: 'var(--amber)', color: 'white',
                  borderRadius: '50%', width: 16, height: 16,
                  fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>

            {/* Auth — desktop only, hidden on mobile via .nav-actions-auth */}
            {isAuthenticated ? (
              <div className='nav-actions-auth' style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link to='/profile'>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'var(--sage)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 600,
                  }}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                </Link>
                <button className='btn btn-ghost btn-sm' onClick={handleLogout}>
                  Sign out
                </button>
              </div>
            ) : (
              <div className='nav-actions-auth' style={{ display: 'flex', gap: 8 }}>
                <Link to='/login' className='btn btn-outline btn-sm'>Login</Link>
                <Link to='/register' className='btn btn-primary btn-sm'>Sign up</Link>
              </div>
            )}

            {/* Hamburger — mobile only */}
            <button
              className='mobile-menu-btn'
              onClick={() => setMenuOpen((o) => !o)}
              aria-label='Toggle menu'
              style={{
                display: 'none', // overridden to flex on mobile via CSS
                width: 38, height: 38,
                alignItems: 'center', justifyContent: 'center',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--forest-deep)', padding: 0,
              }}
            >
              {menuOpen ? (
                <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                  <line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/>
                </svg>
              ) : (
                <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                  <line x1='3' y1='6' x2='21' y2='6'/><line x1='3' y1='12' x2='21' y2='12'/><line x1='3' y1='18' x2='21' y2='18'/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile menu panel ──────────────────────────────────── */}
        {menuOpen && (
          <div
            className='mobile-menu-panel'
            style={{
              display: 'none', // overridden to flex on mobile via CSS
              flexDirection: 'column',
              background: 'var(--cream)',
              borderTop: '1px solid var(--border-light)',
              borderBottom: '1px solid var(--border-light)',
              padding: 'var(--space-4) var(--space-4) var(--space-6)',
              gap: 2,
              animation: 'fadeIn 0.2s ease',
            }}
          >
            {[
              { to: '/products', label: '🛍️ Shop' },
              ...(isAuthenticated ? [
                { to: '/orders', label: '📦 My Orders' },
                { to: '/wishlist', label: '🤍 Wishlist' },
                { to: '/profile', label: '👤 My Profile' },
              ] : []),
              ...(user?.role === 'admin' ? [{ to: '/admin/dashboard', label: '⚙️ Admin Dashboard' }] : []),
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  padding: '12px 8px', fontSize: 15, fontWeight: 500,
                  color: 'var(--forest-deep)', borderRadius: 'var(--radius)',
                  textDecoration: 'none',
                }}
              >
                {item.label}
              </Link>
            ))}

            <div style={{ borderTop: '1px solid var(--border-light)', marginTop: 8, paddingTop: 12 }}>
              {isAuthenticated ? (
                <button
                  className='btn btn-outline btn-full'
                  onClick={handleLogout}
                >
                  Sign out
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 10 }}>
                  <Link to='/login' className='btn btn-outline' style={{ flex: 1, justifyContent: 'center' }}>Login</Link>
                  <Link to='/register' className='btn btn-primary' style={{ flex: 1, justifyContent: 'center' }}>Sign up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Page content ───────────────────────────────────────── */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer style={{
        background: 'var(--forest-deep)', color: 'var(--cream)',
        padding: 'var(--space-16) 0 var(--space-8)',
        marginTop: 'var(--space-20)',
      }}>
        <div className='container'>
          <div className='footer-grid' style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 'var(--space-10)', marginBottom: 'var(--space-12)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 24 }}>🌿</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>VitaCore</span>
              </div>
              <p style={{ color: 'var(--sage-light)', fontSize: 14, lineHeight: 1.7, maxWidth: 280 }}>
                Premium health supplements crafted for modern Nigerian wellness. Quality you can trust, results you can feel.
              </p>
            </div>
            <div>
              <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: 16, fontSize: 16 }}>Shop</h4>
              <FooterLinks links={[
                { to: '/products?category=immunity', label: 'Immunity' },
                { to: '/products?category=energy', label: 'Energy' },
                { to: '/products?category=vitamins', label: 'Vitamins' },
                { to: '/products?category=beauty', label: 'Beauty' },
              ]} />
            </div>
            <div>
              <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: 16, fontSize: 16 }}>Account</h4>
              <FooterLinks links={[
                { to: '/profile', label: 'My Profile' },
                { to: '/orders', label: 'Orders' },
                { to: '/wishlist', label: 'Wishlist' },
                { to: '/register', label: 'Create Account' },
              ]} />
            </div>
            <div>
              <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: 16, fontSize: 16 }}>Support</h4>
              <FooterLinks links={[
                { to: '#', label: 'FAQ' },
                { to: '#', label: 'Shipping Policy' },
                { to: '#', label: 'Returns' },
                { to: '#', label: 'Contact Us' },
              ]} />
            </div>
          </div>
          <div className='footer-bottom' style={{
            borderTop: '1px solid rgba(122,158,126,0.2)',
            paddingTop: 'var(--space-6)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: 13, color: 'var(--sage-light)',
          }}>
            <span>© {new Date().getFullYear()} VitaCore Health. All rights reserved.</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ to, children }) {
  const location = useLocation();
  const active = location.pathname.startsWith(to);
  return (
    <Link to={to} style={{
      fontSize: 14, fontWeight: 500,
      color: active ? 'var(--forest)' : 'var(--muted)',
      borderBottom: active ? '2px solid var(--sage)' : '2px solid transparent',
      paddingBottom: 2,
      transition: 'all 0.2s',
    }}>
      {children}
    </Link>
  );
}

function FooterLinks({ links }) {
  return (
    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {links.map((l) => (
        <li key={l.to}>
          <Link to={l.to} style={{ color: 'var(--sage-light)', fontSize: 14, transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--cream)'}
            onMouseLeave={e => e.target.style.color = 'var(--sage-light)'}
          >{l.label}</Link>
        </li>
      ))}
    </ul>
  );
}
