import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import ProductImage from '../../components/ProductImage/ProductImage';
import Avatar from '../../components/Avatar/Avatar';
import Badge from '../../components/Badge/Badge';
import Button from '../../components/Button/Button';
import EmptyState from '../../components/EmptyState/EmptyState';
import './Profile.css';

const TABS = [
  { id: 'dashboard', label: 'My Dashboard', icon: '📊' },
  { id: 'wishlist', label: 'Wishlist', icon: '🤍' },
  { id: 'messages', label: 'Messages', icon: '💬' },
  { id: 'history', label: 'Purchase History', icon: '🧾' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function Profile() {
  const { products, wishlist, user, deleteProduct, showToast, addNotification, updateUser } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'dashboard');
  const [settings, setSettings] = useState({
    name: user?.name || 'Sachin Sharma',
    email: user?.email || 'sachin.sharma@chitkara.edu.in',
    hostel: user?.hostel || 'CS Dept Hostel',
    phone: user?.phone || '+91 98765 43210',
  });
  
  const myListings = products.filter((p) => 
    p.isMine || p.seller === (user?.name || 'Sachin Sharma') || (user && p.sellerEmail === user.email)
  );
  const saved = products.filter((p) => wishlist.includes(p.id));

  const changeTab = (id) => { setTab(id); setSearchParams({ tab: id }); };

  const handleDeleteListing = (productId, title) => {
    if (window.confirm(`Are you sure you want to remove "${title}"?`)) {
      deleteProduct(productId);
    }
  };

  const handleEditListing = (p) => {
    showToast('Edit modal opened for ' + p.title);
    addNotification(`Your listing "${p.title}" was edited/updated successfully.`, 'system');
  };

  const updateSetting = (field, value) => setSettings((s) => ({ ...s, [field]: value }));

  const handleSaveSettings = () => {
    if (!settings.name.trim()) {
      showToast('Full Name cannot be empty', 'danger');
      return;
    }
    if (!settings.email.trim()) {
      showToast('Campus Email cannot be empty', 'danger');
      return;
    }
    updateUser(settings);
  };

  return (
    <div className="cm-profile container">
      <aside className="cm-profile__sidebar">
        <div className="cm-profile__card">
          <Avatar initials={user?.initials || 'SS'} size={64} online />
          <h3>{user?.name || 'Sachin Sharma'}</h3>
          <p>{user?.department || 'B.Tech CSE, 2nd Year'}</p>
          <Badge variant="success">✓ Verified Student</Badge>
        </div>
        <nav className="cm-profile__nav">
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? 'is-active' : ''} onClick={() => changeTab(t.id)}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="cm-profile__main">
        <div className="cm-profile__stats">
          <div className="cm-profile__stat"><strong>8</strong><span>Sold Items</span></div>
          <div className="cm-profile__stat"><strong>{myListings.length}</strong><span>Active Listings</span></div>
          <div className="cm-profile__stat"><strong>1,204</strong><span>Total Views</span></div>
          <div className="cm-profile__stat"><strong>{saved.length}</strong><span>Wishlist Items</span></div>
        </div>

        {tab === 'dashboard' && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>My Dashboard</h2>
              <Button size="sm" as="a" onClick={() => (window.location.href = '/sell')}>+ List New Item</Button>
            </div>
            {myListings.length === 0 ? (
              <EmptyState 
                icon="📦" 
                title="No active listings yet" 
                subtitle="Got items or study material to sell? List them in under 2 minutes." 
                action={<Button as="a" onClick={() => (window.location.href = '/sell')}>Sell an Item</Button>} 
              />
            ) : (
              <div className="cm-profile__table">
                {myListings.map((p) => (
                  <div className="cm-profile__row" key={p.id}>
                    <ProductImage src={p.images?.[0]} alt={p.title} product={p} />
                    <div className="cm-profile__row-info">
                      <strong>{p.title}</strong>
                      <span>{p.free ? 'Free' : `₹${(p.price || 0).toLocaleString('en-IN')}`} · {p.views || 1} views</span>
                    </div>
                    <Badge variant="success">Active</Badge>
                    <div className="cm-profile__row-actions">
                      <button onClick={() => handleEditListing(p)}>Edit</button>
                      <button className="danger" onClick={() => handleDeleteListing(p.id, p.title)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === 'wishlist' && (
          <section>
            <h2>Wishlist</h2>
            {saved.length === 0 ? (
              <EmptyState icon="🤍" title="Nothing saved yet" subtitle="Items you save will show up here." />
            ) : (
              <div className="cm-profile__table">
                {saved.map((p) => (
                  <div className="cm-profile__row" key={p.id}>
                    <ProductImage src={p.images?.[0]} alt={p.title} product={p} />
                    <div className="cm-profile__row-info">
                      <strong>{p.title}</strong>
                      <span>{p.free ? 'Free' : `₹${(p.price || 0).toLocaleString('en-IN')}`}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === 'messages' && (
          <section>
            <h2>Messages</h2>
            <EmptyState icon="💬" title="Head to Messages" subtitle="View and reply to your conversations in the dedicated Messages tab." action={<Button as="a" onClick={() => (window.location.href = '/messages')}>Open Messages</Button>} />
          </section>
        )}

        {tab === 'history' && (
          <section>
            <h2>Purchase History</h2>
            <div className="cm-profile__table">
              {products.slice(5, 8).map((p) => (
                <div className="cm-profile__row" key={p.id}>
                  <ProductImage src={p.images?.[0]} alt={p.title} product={p} />
                  <div className="cm-profile__row-info">
                    <strong>{p.title}</strong>
                    <span>Purchased for {p.free ? 'Free' : `₹${(p.price || 0).toLocaleString('en-IN')}`}</span>
                  </div>
                  <Badge>Completed</Badge>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === 'settings' && (
          <section className="cm-profile__settings">
            <h2>Profile Settings</h2>
            <div className="cm-profile__form">
              <div className="cm-sell__field"><label>Full Name</label><input type="text" value={settings.name} onChange={(e) => updateSetting('name', e.target.value)} /></div>
              <div className="cm-sell__field"><label>Campus Email</label><input type="email" value={settings.email} onChange={(e) => updateSetting('email', e.target.value)} /></div>
              <div className="cm-sell__field"><label>Hostel / Block</label><input type="text" value={settings.hostel} onChange={(e) => updateSetting('hostel', e.target.value)} /></div>
              <div className="cm-sell__field"><label>Phone Number</label><input type="tel" value={settings.phone} onChange={(e) => updateSetting('phone', e.target.value)} /></div>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
