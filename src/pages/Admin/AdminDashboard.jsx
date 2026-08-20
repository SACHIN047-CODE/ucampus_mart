import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../../components/Avatar/Avatar';
import Badge from '../../components/Badge/Badge';
import Button from '../../components/Button/Button';
import ProductImage from '../../components/ProductImage/ProductImage';
import { useApp } from '../../context/AppContext';
import { categories } from '../../data/categories';
import '../Auth/Auth.css';
import './Admin.css';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'users', label: 'Manage Users', icon: '👥' },
  { id: 'listings', label: 'Listings', icon: '📦' },
  { id: 'reports', label: 'Reports', icon: '⚑' },
  { id: 'categories', label: 'Categories', icon: '🗂️' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
  { id: 'change-password', label: 'Change Password', icon: '🔑' },
];

const DEFAULT_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'; // hash of 'admin123'

async function sha256(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function AdminAuthGate({ onVerify, navigate }) {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    try {
      const enteredHash = await sha256(password);
      const storedHash = localStorage.getItem('campusmart-admin-password-hash') || DEFAULT_HASH;

      if (enteredHash === storedHash) {
        onVerify();
      } else {
        setError('Incorrect admin password.');
      }
    } catch (err) {
      setError('An error occurred during verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="cm-admin-auth-container">
      <div className="cm-admin-auth-card">
        <div className="cm-admin-auth-card__header">
          <div className="cm-admin-auth-card__icon">🔒</div>
          <h2>Admin Panel</h2>
          <p>Please enter the administrator password to access the panel.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className={`cm-auth__field ${error ? 'has-error' : ''}`}>
            <label htmlFor="adminPassword">Enter Admin Password</label>
            <div className="cm-auth__pw-wrap">
              <input
                id="adminPassword"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
              <button
                type="button"
                className="cm-auth__pw-toggle"
                onClick={() => setShowPw((v) => !v)}
                aria-label="Toggle password visibility"
              >
                {showPw ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.6 21.6 0 0 1 5.06-6.06M9.9 4.24A10.6 10.6 0 0 1 12 4c7 0 11 8 11 8a21.6 21.6 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {error && <span className="cm-field-error">{error}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <Button type="submit" fullWidth disabled={isVerifying}>
              {isVerifying ? 'Verifying...' : 'Access Admin Panel'}
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => navigate('/profile')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ChangePasswordTab({ showToast }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsUpdating(true);

    try {
      // 1. Verify current password
      const currentHash = await sha256(currentPassword);
      const storedHash = localStorage.getItem('campusmart-admin-password-hash') || DEFAULT_HASH;

      if (currentHash !== storedHash) {
        setError('Current admin password is incorrect.');
        setIsUpdating(false);
        return;
      }

      // 2. Verify new password match
      if (newPassword !== confirmPassword) {
        setError('New passwords do not match.');
        setIsUpdating(false);
        return;
      }

      // 3. Update hash
      const newHash = await sha256(newPassword);
      localStorage.setItem('campusmart-admin-password-hash', newHash);
      setSuccess('Admin password changed successfully.');
      showToast('Admin password changed successfully.', 'success');

      // Clear form fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('An error occurred while updating the password.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="cm-admin__panel" style={{ maxWidth: '500px' }}>
      <h3>Change Admin Password</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }} noValidate>
        <div className={`cm-auth__field ${error === 'Current admin password is incorrect.' ? 'has-error' : ''}`}>
          <label htmlFor="currentPassword">Current Admin Password</label>
          <div className="cm-auth__pw-wrap">
            <input
              id="currentPassword"
              type={showCurrentPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="cm-auth__pw-toggle"
              onClick={() => setShowCurrentPw((v) => !v)}
              aria-label="Toggle current password visibility"
            >
              {showCurrentPw ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.6 21.6 0 0 1 5.06-6.06M9.9 4.24A10.6 10.6 0 0 1 12 4c7 0 11 8 11 8a21.6 21.6 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              )}
            </button>
          </div>
        </div>

        <div className={`cm-auth__field ${error === 'New passwords do not match.' ? 'has-error' : ''}`}>
          <label htmlFor="newPassword">New Admin Password</label>
          <div className="cm-auth__pw-wrap">
            <input
              id="newPassword"
              type={showNewPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="cm-auth__pw-toggle"
              onClick={() => setShowNewPw((v) => !v)}
              aria-label="Toggle new password visibility"
            >
              {showNewPw ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.6 21.6 0 0 1 5.06-6.06M9.9 4.24A10.6 10.6 0 0 1 12 4c7 0 11 8 11 8a21.6 21.6 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              )}
            </button>
          </div>
        </div>

        <div className={`cm-auth__field ${error === 'New passwords do not match.' ? 'has-error' : ''}`}>
          <label htmlFor="confirmPassword">Confirm New Admin Password</label>
          <div className="cm-auth__pw-wrap">
            <input
              id="confirmPassword"
              type={showConfirmPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="cm-auth__pw-toggle"
              onClick={() => setShowConfirmPw((v) => !v)}
              aria-label="Toggle confirm password visibility"
            >
              {showConfirmPw ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.6 21.6 0 0 1 5.06-6.06M9.9 4.24A10.6 10.6 0 0 1 12 4c7 0 11 8 11 8a21.6 21.6 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              )}
            </button>
          </div>
        </div>

        {error && <span className="cm-field-error" style={{ display: 'block', color: 'var(--danger)' }}>{error}</span>}
        {success && <span className="cm-admin__success-msg">{success}</span>}

        <Button type="submit" disabled={isUpdating}>
          {isUpdating ? 'Updating...' : 'Update Password'}
        </Button>
      </form>
    </div>
  );
}

const USERS = [
  { name: 'Ananya Sharma', email: 'ananya.s@university.edu', joined: 'Jan 2025', status: 'Active' },
  { name: 'Rohan Mehta', email: 'rohan.m@university.edu', joined: 'Feb 2025', status: 'Active' },
  { name: 'Ishaan Verma', email: 'ishaan.v@university.edu', joined: 'Mar 2025', status: 'Suspended' },
  { name: 'Priya Nair', email: 'priya.n@university.edu', joined: 'Mar 2025', status: 'Active' },
];

const REPORTS = [
  { item: 'iPhone 12, 128GB', reason: 'Suspected duplicate listing', by: 'Sanya K.', status: 'Pending' },
  { item: 'MacBook Air M1', reason: 'Price seems too high for condition', by: 'Rohan M.', status: 'Reviewed' },
  { item: 'Free NCERT Set', reason: 'Seller unresponsive', by: 'Divya P.', status: 'Pending' },
];

const ACTIVITY = [
  '🆕 Ananya Sharma listed "Engineering Mathematics — B.S. Grewal"',
  '✅ Admin approved "MacBook Air M1 2020"',
  '⚑ New report filed on "iPhone 12, 128GB"',
  '💰 Rohan Mehta marked "JBL Go 2 Speaker" as sold',
  '👤 New student verified: Kavya Reddy',
];

export default function AdminDashboard() {
  const { products, user, showToast } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    if (!user) return false;
    return sessionStorage.getItem(`campusmart-admin-auth-${user.email}`) === 'true';
  });

  const pending = products.slice(0, 4);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      const isAuth = sessionStorage.getItem(`campusmart-admin-auth-${user.email}`) === 'true';
      setIsAdminAuthenticated(isAuth);
    } else {
      setIsAdminAuthenticated(false);
    }
  }, [user]);

  const handleLock = () => {
    if (user) {
      sessionStorage.removeItem(`campusmart-admin-auth-${user.email}`);
    }
    setIsAdminAuthenticated(false);
    showToast('Admin Panel locked.', 'default');
  };

  if (!user) {
    return null;
  }

  if (!isAdminAuthenticated) {
    return (
      <AdminAuthGate
        onVerify={() => {
          sessionStorage.setItem(`campusmart-admin-auth-${user.email}`, 'true');
          setIsAdminAuthenticated(true);
          showToast('Authenticated as administrator.');
        }}
        navigate={navigate}
      />
    );
  }

  return (
    <div className="cm-admin">
      <aside className="cm-admin__sidebar">
        <div className="cm-admin__brand">
          <span className="cm-nav__logo-mark">CM</span>
          <span>Admin Panel</span>
        </div>
        <nav style={{ flex: 1 }}>
          {NAV.map((n) => (
            <button key={n.id} className={tab === n.id ? 'is-active' : ''} onClick={() => setTab(n.id)}>
              <span>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div className="cm-admin__sidebar-footer" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '12px' }}>
          <button className="cm-admin__lock-btn" onClick={handleLock}>
            <span>🔒</span>Lock Panel
          </button>
        </div>
      </aside>

      <div className="cm-admin__main">
        <header className="cm-admin__topbar">
          <h1>{NAV.find((n) => n.id === tab)?.label}</h1>
          <Avatar initials="AD" size={38} />
        </header>

        {tab === 'dashboard' && (
          <>
            <div className="cm-admin__cards">
              <div className="cm-admin__card"><span>Total Users</span><strong>1,042</strong><em>+38 this week</em></div>
              <div className="cm-admin__card"><span>Active Listings</span><strong>{products.length}</strong><em>+12 this week</em></div>
              <div className="cm-admin__card"><span>Open Reports</span><strong>{REPORTS.filter((r) => r.status === 'Pending').length}</strong><em>Needs review</em></div>
              <div className="cm-admin__card"><span>Categories</span><strong>{categories.length}</strong><em>All active</em></div>
            </div>

            <div className="cm-admin__grid">
              <div className="cm-admin__panel">
                <h3>Listings Overview (dummy chart)</h3>
                <div className="cm-admin__bars">
                  {categories.map((c) => (
                    <div key={c.id} className="cm-admin__bar-row">
                      <span>{c.name}</span>
                      <div className="cm-admin__bar-track"><div className="cm-admin__bar-fill" style={{ width: `${Math.min(100, c.count / 2.2)}%`, background: c.color }} /></div>
                      <b>{c.count}</b>
                    </div>
                  ))}
                </div>
              </div>

              <div className="cm-admin__panel">
                <h3>Recent Activity</h3>
                <ul className="cm-admin__activity">
                  {ACTIVITY.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            </div>

            <div className="cm-admin__panel">
              <h3>Pending Listings</h3>
              <table className="cm-admin__table">
                <thead><tr><th>Item</th><th>Seller</th><th>Price</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {pending.map((p) => (
                    <tr key={p.id}>
                      <td className="cm-admin__td-item"><ProductImage src={p.images?.[0]} alt={p.title} product={p} />{p.title}</td>
                      <td>{p.seller}</td>
                      <td>{p.free ? 'Free' : `₹${p.price.toLocaleString('en-IN')}`}</td>
                      <td><Badge variant="warning">Pending</Badge></td>
                      <td className="cm-admin__td-actions"><button className="approve">Approve</button><button className="reject">Reject</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'users' && (
          <div className="cm-admin__panel">
            <h3>Manage Users</h3>
            <table className="cm-admin__table">
              <thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {USERS.map((u) => (
                  <tr key={u.email}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.joined}</td>
                    <td><Badge variant={u.status === 'Active' ? 'success' : 'danger'}>{u.status}</Badge></td>
                    <td className="cm-admin__td-actions"><button className="reject">{u.status === 'Active' ? 'Suspend' : 'Reinstate'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'listings' && (
          <div className="cm-admin__panel">
            <h3>All Listings</h3>
            <table className="cm-admin__table">
              <thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Views</th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="cm-admin__td-item"><ProductImage src={p.images?.[0]} alt={p.title} product={p} />{p.title}</td>
                    <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                    <td>{p.free ? 'Free' : `₹${p.price.toLocaleString('en-IN')}`}</td>
                    <td>{p.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'reports' && (
          <div className="cm-admin__panel">
            <h3>Reported Listings</h3>
            <table className="cm-admin__table">
              <thead><tr><th>Item</th><th>Reason</th><th>Reported By</th><th>Status</th></tr></thead>
              <tbody>
                {REPORTS.map((r, i) => (
                  <tr key={i}>
                    <td>{r.item}</td>
                    <td>{r.reason}</td>
                    <td>{r.by}</td>
                    <td><Badge variant={r.status === 'Pending' ? 'warning' : 'success'}>{r.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'categories' && (
          <div className="cm-admin__panel">
            <h3>Categories</h3>
            <table className="cm-admin__table">
              <thead><tr><th>Category</th><th>Listings</th></tr></thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}><td>{c.icon} {c.name}</td><td>{c.count}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'analytics' && (
          <div className="cm-admin__panel">
            <h3>Analytics (dummy UI)</h3>
            <div className="cm-admin__bars">
              {categories.map((c) => (
                <div key={c.id} className="cm-admin__bar-row">
                  <span>{c.name}</span>
                  <div className="cm-admin__bar-track"><div className="cm-admin__bar-fill" style={{ width: `${Math.min(100, c.count / 2.2)}%`, background: c.color }} /></div>
                  <b>{c.count}</b>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'change-password' && (
          <ChangePasswordTab showToast={showToast} />
        )}
      </div>
    </div>
  );
}
