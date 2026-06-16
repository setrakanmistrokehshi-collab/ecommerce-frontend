// src/components/admin/AdminLayout.jsx
import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import '../../pages/admin/Admin.css';

const NAV = [
  { section: 'Main' },
  { to: '/admin',           icon: '📊', label: 'Dashboard',       end: true  },
  { to: '/admin/orders',    icon: '🛒', label: 'Orders',          badge: '7' },
  { to: '/admin/customers', icon: '👥', label: 'Customers'                   },
  { to: '/admin/reports',   icon: '📈', label: 'Reports'                     },
  { section: 'Product' },
  { to: '/admin/products/add', icon: '➕', label: 'Add Product'               },
  { to: '/admin/products',     icon: '📦', label: 'Product List'              },
  { to: '/admin/reviews',      icon: '⭐', label: 'Reviews',       badge: '3' },
  { to: '/admin/categories',   icon: '🏷️', label: 'Categories'               },
  { section: 'Admin' },
  { to: '/admin/roles',     icon: '🔐', label: 'Admin Roles'                 },
  { to: '/admin/settings',  icon: '⚙️', label: 'Settings'                   },
];

const NOTIFICATIONS = [
  { color: 'var(--danger)',  text: '⚠️ SlimBalance is low on stock (12 units)',   time: '2 min ago'  },
  { color: 'var(--warn)',    text: '🛒 7 orders are pending fulfillment',          time: '18 min ago' },
  { color: 'var(--accent2)', text: '⭐ 3 new reviews awaiting approval',          time: '1 hour ago' },
  { color: 'var(--accent)',  text: '💰 Payment ₦85,000 confirmed — #VC-10241',    time: '3 hours ago'},
  { color: 'var(--danger)',  text: '🔄 Refund request for order #VC-10198',        time: 'Yesterday'  },
];

export default function AdminLayout() {
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [search,       setSearch]       = useState('');
  const navigate    = useNavigate();
  const notifRef    = useRef(null);

  // Close notif panel on outside click
  useEffect(() => {
    function handle(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (search.trim()) navigate(`/admin/orders?search=${encodeURIComponent(search)}`);
  }

  function handleLogout() {
    localStorage.removeItem('vitacore_token');
    navigate('/login');
  }

  // Get admin name from token
  let adminName = 'Admin';
  try {
    const token = localStorage.getItem('vitacore_token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      adminName = payload.name ?? 'Admin';
    }
  } catch { /* ignore */ }

  return (
    <div className="admin-shell">

      {/* ── SIDEBAR ── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-mark">🌿</div>
          <div className="logo-text">Winners<span>Admin</span></div>
        </div>

        <nav>
          {NAV.map((item, i) => {
            if (item.section) {
              return <div key={i} className="sidebar-section">{item.section}</div>;
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
            <span className="nav-icon">🚪</span> Logout
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px 0' }}>
            <div className="avatar" style={{ fontSize: 13 }}>{adminName[0]}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{adminName}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Super Admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="admin-main">

        {/* HEADER */}
        <header className="admin-header">
          <button className="menu-toggle" onClick={() => setSidebarOpen(o => !o)}>☰</button>

          <form onSubmit={handleSearch} className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search orders, products, customers…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </form>

          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => navigate('/admin/products/add')}>
              + Add Product
            </button>

            {/* Notifications */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <div className="icon-btn" onClick={() => setNotifOpen(o => !o)}>
                🔔
                <div className="notif-dot" />
              </div>

              {notifOpen && (
                <div className="notif-panel" style={{ position: 'absolute', top: '44px', right: 0 }}>
                  <div className="notif-header">
                    Notifications
                    <span style={{ color: 'var(--accent)', fontSize: 12, cursor: 'pointer' }}>
                      Mark all read
                    </span>
                  </div>
                  {NOTIFICATIONS.map((n, i) => (
                    <div key={i} className="notif-item">
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.color, flexShrink: 0, marginTop: 4 }} />
                      <div>
                        <div className="notif-text">{n.text}</div>
                        <div className="notif-time">{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="icon-btn" onClick={() => navigate('/admin/settings')}>⚙️</div>
            <div className="avatar" style={{ width: 34, height: 34, fontSize: 13, cursor: 'pointer' }}>
              {adminName[0]}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT — rendered by child routes */}
        <main className="admin-content">
          <Outlet />
        </main>

        {/* FOOTER */}
        <footer className="admin-footer">
          <div>Winners Admin v2.0.0 · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          <div className="footer-links">
            <a href="#">Help Center</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </footer>
      </div>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 99 }}
        />
      )}
    </div>
  );
}
