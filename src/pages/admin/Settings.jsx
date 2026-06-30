// src/pages/admin/Settings.jsx
import { useState } from 'react';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'store',         icon: '🏪', label: 'Store'         },
  { id: 'payments',      icon: '💳', label: 'Payments'      },
  { id: 'shipping',      icon: '🚚', label: 'Shipping'      },
  { id: 'email',         icon: '📧', label: 'Email'         },
  { id: 'notifications', icon: '🔔', label: 'Notifications' },
  { id: 'security',      icon: '🔐', label: 'Security'      },
];

export default function Settings() {

  const [tab, setTab]       = useState('store');
  const [saving, setSaving] = useState(false);
  const [form, setForm]     = useState({

    storeName:   'winners Health',
    storeEmail:  'admin@winnershealth.ng',
    storePhone:  '+234 800 000 0000',
    storeAddress:'Lagos, Nigeria',
    currency:    'NGN (₦)',
    nafdac:      '',
    cac:         '',
    nombaKey:    '',
    webhookSecret:'',
    smtpHost:    '',
    smtpPort:    '587',
    smtpUser:    '',
    lowStockThreshold: '30',
  });

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      toast.success('Settings saved');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <div className="page-header">
        <div><h1>Settings</h1><p>Configure your store preferences</p></div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, alignItems: 'start' }}>

        {/* Tab nav */}
        <div className="card" style={{ padding: 8 }}>
          {TABS.map(t => (
            <div
              key={t.id}
              className={`nav-item ${tab === t.id ? 'active' : ''}`}
              style={{ margin: '1px 0' }}
              onClick={() => setTab(t.id)}
            >
              <span className="nav-icon">{t.icon}</span> {t.label}
            </div>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {tab === 'store' && (
            <>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 16 }}>Store Information</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <F label="Store Name"    value={form.storeName}    onChange={v => set('storeName', v)}    placeholder="Winners Health"/>
                  <F label="Store Email"   value={form.storeEmail}   onChange={v => set('storeEmail', v)}   type="email" placeholder="admin@winnershealth.ng"/>
                  <F label="Support Phone" value={form.storePhone}   onChange={v => set('storePhone', v)}   placeholder="+234 800 000 0000"/>
                  <F label="Store Address" value={form.storeAddress} onChange={v => set('storeAddress', v)} placeholder="Lagos, Nigeria"/>
                  <F label="Currency"      value={form.currency}     onChange={v => set('currency', v)}     placeholder="NGN (₦)"/>
                </div>
              </div>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 16 }}>NAFDAC & Compliance</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <F label="NAFDAC Number"      value={form.nafdac} onChange={v => set('nafdac', v)} placeholder="NAFDAC/FD-001"/>
                  <F label="CAC Business Number" value={form.cac}    onChange={v => set('cac', v)}    placeholder="RC-1234567"/>
                </div>
              </div>
            </>
          )}

          {tab === 'payments' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>Nomba Payment Gateway</div>
              <div style={{ padding: '12px 16px', background: 'rgba(0,200,150,.06)', border: '1px solid rgba(0,200,150,.2)', borderRadius: 8, marginBottom: 16, fontSize: 13, color: 'var(--muted)' }}>
                ℹ️ Your backend already handles Nomba webhook verification via HMAC-SHA512. Enter keys from your Nomba dashboard.
              </div>
              <F label="Nomba Public Key"   value={form.nombaKey}      onChange={v => set('nombaKey', v)}      placeholder="pk_live_…" type="password"/>
              <F label="Webhook Secret"     value={form.webhookSecret} onChange={v => set('webhookSecret', v)} placeholder="whsec_…"   type="password"/>
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Webhook URL (copy this to your Nomba dashboard)</div>
                <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--accent)' }}>
                  {window.location.origin}/webhooks/nomba
                </div>
              </div>
            </div>
          )}

          {tab === 'email' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>Email (SMTP / Nodemailer)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <F label="SMTP Host" value={form.smtpHost} onChange={v => set('smtpHost', v)} placeholder="smtp.gmail.com"/>
                <F label="SMTP Port" value={form.smtpPort} onChange={v => set('smtpPort', v)} type="number"/>
                <F label="SMTP User" value={form.smtpUser} onChange={v => set('smtpUser', v)} placeholder="you@gmail.com"/>
                <F label="SMTP Pass" value=""              onChange={() => {}}                  type="password" placeholder="App password"/>
              </div>
              <div style={{ marginTop: 12 }}>
                <button className="btn btn-ghost" style={{ fontSize: 12 }}>Send Test Email</button>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>Notification Preferences</div>
              {[
                ['Low stock alerts',      'low_stock'],
                ['New order placed',      'new_order'],
                ['Order status update',   'order_status'],
                ['New customer signup',   'new_customer'],
                ['Payment received',      'payment'],
                ['Review submitted',      'review'],
              ].map(([label, key]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13 }}>{label}</span>
                  <Toggle checked onChange={() => {}}/>
                </div>
              ))}
              <div className="form-field" style={{ marginTop: 16 }}>
                <label>Low Stock Threshold</label>
                <input type="number" value={form.lowStockThreshold} onChange={e => set('lowStockThreshold', e.target.value)}
                  style={{ width: 100 }}/>
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>Security Settings</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  ['Two-factor authentication',  '2fa'],
                  ['Login email alerts',          'loginAlert'],
                  ['Force HTTPS',                 'https'],
                ].map(([label, key]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 13 }}>{label}</span>
                    <Toggle checked={key === 'https'} onChange={() => {}}/>
                  </div>
                ))}
                <div style={{ marginTop: 8 }}>
                  <div className="card-title" style={{ marginBottom: 12 }}>Change Admin Password</div>
                  <F label="Current Password" value="" onChange={() => {}} type="password" placeholder="••••••••"/>
                  <F label="New Password"     value="" onChange={() => {}} type="password" placeholder="Min 12 characters"/>
                  <F label="Confirm Password" value="" onChange={() => {}} type="password" placeholder="Repeat new password"/>
                  <button className="btn btn-ghost" style={{ marginTop: 4 }}>Update Password</button>
                </div>
              </div>
            </div>
          )}

          {tab === 'shipping' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>Shipping Configuration</div>
              {[
                ['Lagos (within)',        '1,500'],
                ['Lagos (outside island)','2,000'],
                ['South-West Nigeria',    '2,500'],
                ['South-East / South-South','3,000'],
                ['North Nigeria',         '3,500'],
                ['Express (same day)',    '5,000'],
              ].map(([zone, price]) => (
                <div key={zone} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13 }}>{zone}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: 'var(--muted)', fontSize: 12 }}>₦</span>
                    <input type="number" defaultValue={price.replace(',','')}
                      style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 13, padding: '5px 8px', outline: 'none', width: 80, textAlign: 'right' }}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function F({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div className="form-field">
      <label>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}/>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  const [on, setOn] = useState(checked);
  return (
    <div onClick={() => { setOn(v => !v); onChange(!on); }}
      style={{ width:36, height:20, background:on?'var(--accent)':'var(--surface2)', border:'1px solid var(--border)', borderRadius:20, position:'relative', transition:'background .2s', cursor:'pointer', flexShrink:0 }}>
      <div style={{ position:'absolute', top:2, left:on?18:2, width:14, height:14, background:'#fff', borderRadius:'50%', transition:'left .2s' }}/>
    </div>
  );
}
