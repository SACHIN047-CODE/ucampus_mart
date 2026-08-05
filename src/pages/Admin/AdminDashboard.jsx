import { useState } from 'react';
import Avatar from '../../components/Avatar/Avatar';
import Badge from '../../components/Badge/Badge';
import { useApp } from '../../context/AppContext';
import { categories } from '../../data/categories';
import './Admin.css';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'users', label: 'Manage Users', icon: '👥' },
  { id: 'listings', label: 'Listings', icon: '📦' },
  { id: 'reports', label: 'Reports', icon: '⚑' },
  { id: 'categories', label: 'Categories', icon: '🗂️' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
];

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
  const { products } = useApp();
  const [tab, setTab] = useState('dashboard');
  const pending = products.slice(0, 4);

  return (
    <div className="cm-admin">
      <aside className="cm-admin__sidebar">
        <div className="cm-admin__brand">
          <span className="cm-nav__logo-mark">CM</span>
          <span>Admin Panel</span>
        </div>
        <nav>
          {NAV.map((n) => (
            <button key={n.id} className={tab === n.id ? 'is-active' : ''} onClick={() => setTab(n.id)}>
              <span>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
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
                      <td className="cm-admin__td-item"><img src={p.images[0]} alt="" />{p.title}</td>
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
                    <td className="cm-admin__td-item"><img src={p.images[0]} alt="" />{p.title}</td>
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
      </div>
    </div>
  );
}
