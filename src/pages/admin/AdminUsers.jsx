import React, { useState, useEffect, useCallback } from 'react';
import { admin as adminApi } from '@/api/client';
import { Pagination, Modal } from '@/components/ui';
import { ROLES } from '../../constants/roles';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'; // ✅ Added import

export default function AdminUsers() {
  const navigate = useNavigate();
  const [items, setItems]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [pages, setPages]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole]     = useState('');
  const [selected, setSelected] = useState(null);
  

  const fetch = useCallback(() => {
    setLoading(true);
    adminApi.allUsers({ page, limit: 15, search: search || undefined, role: role || undefined })
      .then(({ data }) => {
        setItems(data.users || []);
        setTotal(data.pagination?.total || 0);
        setPages(data.pagination?.pages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, role]);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleStatus = async (user) => {
    const action = user.isActive ? 'deactivate' : 'activate';
    if (!confirm(`${action} user "${user.name}"?`)) return;
    try {
      await adminApi.toggleUserStatus(user._id);
      toast.success(`User ${action}d`);
      fetch();
      if (selected?._id === user._id) {
        setSelected((u) => ({ ...u, isActive: !u.isActive }));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Action failed');
    }
  };

  // Helper function to get role display name
  const getRoleDisplayName = (roleValue) => {
    const roleMap = {
      [ROLES.SUPER_ADMIN]: 'Super Admin',
      [ROLES.PRODUCT_MANAGER]: 'Product Manager',
      [ROLES.ORDER_MANAGER]: 'Order Manager',
      [ROLES.SUPPORT]: 'Support Agent',
      'customer': 'Customer', // Assuming 'customer' is a valid role
    };
    return roleMap[roleValue] || roleValue;
  };

  // Helper function to get role badge color
  const getRoleBadgeStyle = (roleValue) => {
    const styles = {
      [ROLES.SUPER_ADMIN]: { background: 'rgba(200,133,74,0.15)', color: '#c8854a' },
      [ROLES.PRODUCT_MANAGER]: { background: 'rgba(74,133,200,0.15)', color: '#4a85c8' },
      [ROLES.ORDER_MANAGER]: { background: 'rgba(74,200,133,0.15)', color: '#4ac885' },
      [ROLES.SUPPORT]: { background: 'rgba(200,74,133,0.15)', color: '#c84a85' },
      'customer': { background: 'rgba(122,158,126,0.1)', color: '#7a9e7e' },
    };
    return styles[roleValue] || styles['customer'];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--admin-text)', marginBottom: 4 }}>Users</h1>
        <p style={{ color: 'var(--admin-muted)', fontSize: 14 }}>{total} registered users</p>
      </div>

      {/* Filters */}
      <div className='admin-card' style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-4)', flexWrap: 'wrap' }}>
        <input
          className='admin-input'
          placeholder='Search by name or email...'
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ flex: '1 1 220px' }}
        />
        <select
          className='admin-input'
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1); }}
          style={{ flex: '0 1 140px' }}
        >
          <option value=''>All Roles</option>
          <option value='customer'>Customer</option>
          <option value={ROLES.SUPER_ADMIN}>Super Admin</option>
          <option value={ROLES.PRODUCT_MANAGER}>Product Manager</option>
          <option value={ROLES.ORDER_MANAGER}>Order Manager</option>
          <option value={ROLES.SUPPORT}>Support Agent</option>
        </select>
      </div>

      {/* Table */}
      <div className='admin-card' style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className='admin-table'>
            <thead>
              <tr>
                <th>User</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Last Login</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--admin-muted)' }}>Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--admin-muted)' }}>No users found</td></tr>
              ) : items.map((u) => {
                const roleStyle = getRoleBadgeStyle(u.role);
                const isAdmin = [ROLES.SUPER_ADMIN, ROLES.PRODUCT_MANAGER, ROLES.ORDER_MANAGER, ROLES.SUPPORT].includes(u.role);
                
                return (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: isAdmin ? 'rgba(200,133,74,0.25)' : 'rgba(122,158,126,0.2)',
                          color: isAdmin ? '#c8854a' : '#7a9e7e',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 14, flexShrink: 0,
                        }}>
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--admin-text)' }}>{u.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--admin-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--admin-muted)', fontSize: 13 }}>{u.phone || '—'}</td>
                    <td>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                        fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                        ...roleStyle,
                      }}>
                        {getRoleDisplayName(u.role)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                          background: u.isEmailVerified ? '#7a9e7e' : '#fbbf24',
                        }} />
                        <span style={{ fontSize: 12, color: 'var(--admin-muted)' }}>
                          {u.isEmailVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--admin-muted)', fontSize: 13 }}>
                      {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '—'}
                    </td>
                    <td style={{ color: 'var(--admin-muted)', fontSize: 13 }}>
                      {u.lastLogin ? format(new Date(u.lastLogin), 'MMM d') : 'Never'}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                        fontSize: 11, fontWeight: 600,
                        background: u.isActive ? 'rgba(122,158,126,0.15)' : 'rgba(248,113,113,0.15)',
                        color: u.isActive ? '#7a9e7e' : '#f87171',
                      }}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => setSelected(u)}
                          style={{ padding: '3px 8px', background: 'rgba(122,158,126,0.1)', color: '#7a9e7e', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => toggleStatus(u)}
                          style={{
                            padding: '3px 8px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12,
                            background: u.isActive ? 'rgba(248,113,113,0.1)' : 'rgba(122,158,126,0.1)',
                            color: u.isActive ? '#f87171' : '#7a9e7e',
                          }}
                        >
                          {u.isActive ? 'Disable' : 'Enable'}
                        </button>

                          {/* 👇  EDIT ROLE BUTTON */}
    <button
      onClick={() => navigate(`/admin/users/${u._id}/role`, { state: { user: u } })}
      style={{
        padding: '3px 8px',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
        fontSize: 12,
        background: 'rgba(74,133,200,0.1)',
        color: '#4a85c8',
      }}
    >
      Edit Role
    </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--admin-border)' }}>
          <Pagination page={page} pages={pages} onPage={setPage} />
        </div>
      </div>

      {/* User detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name} maxWidth={480}>
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'var(--sage)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 700,
              }}>
                {selected.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 18, color: 'var(--forest-deep)' }}>{selected.name}</div>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>{selected.email}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <span className={`badge ${selected.isActive ? 'badge-green' : 'badge-red'}`}>{selected.isActive ? 'Active' : 'Inactive'}</span>
                  <span className={`badge ${selected.role === ROLES.SUPER_ADMIN ? 'badge-amber' : 'badge-gray'}`}>
                    {getRoleDisplayName(selected.role)}
                  </span>
                  {selected.isEmailVerified && <span className='badge badge-green'>Verified</span>}
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { l: 'Phone', v: selected.phone || '—' },
                { l: 'Newsletter', v: selected.newsletterSubscribed ? 'Subscribed' : 'No' },
                { l: 'Joined', v: selected.createdAt ? format(new Date(selected.createdAt), 'MMM d, yyyy') : '—' },
                { l: 'Last Login', v: selected.lastLogin ? format(new Date(selected.lastLogin), 'MMM d, yyyy') : 'Never' },
                { l: 'Saved Addresses', v: selected.addresses?.length || 0 },
                { l: 'Wishlist Items', v: selected.wishlist?.length || 0 },
              ].map((r) => (
                <div key={r.l} style={{ background: 'var(--cream)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 2 }}>{r.l}</div>
                  <div style={{ fontWeight: 600, color: 'var(--forest-deep)', fontSize: 14 }}>{r.v}</div>
                </div>
              ))}
            </div>

            <button
              className='btn btn-full'
              style={{
                background: selected.isActive ? 'rgba(184,92,56,0.1)' : 'rgba(122,158,126,0.1)',
                color: selected.isActive ? 'var(--rust)' : 'var(--sage-dark)',
                border: `1px solid ${selected.isActive ? 'rgba(184,92,56,0.3)' : 'rgba(122,158,126,0.3)'}`,
              }}
              onClick={() => toggleStatus(selected)}
            >
              {selected.isActive ? 'Deactivate User' : 'Activate User'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}