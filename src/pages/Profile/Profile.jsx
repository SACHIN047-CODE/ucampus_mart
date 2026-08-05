import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Avatar from '../../components/Avatar/Avatar';
import Badge from '../../components/Badge/Badge';
import Button from '../../components/Button/Button';
import EmptyState from '../../components/EmptyState/EmptyState';
import './Profile.css';

const TABS = [
  { id: 'listings', label: 'My Listings', icon: '📦' },
  { id: 'wishlist', label: 'Wishlist', icon: '🤍' },
  { id: 'messages', label: 'Messages', icon: '💬' },
  { id: 'history', label: 'Purchase History', icon: '🧾' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function Profile() {
  const { products, wishlist } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'listings');
  const myListings = products.slice(0, 5);
  const saved = products.filter((p) => wishlist.includes(p.id));

  const changeTab = (id) => { setTab(id); setSearchParams({ tab: id }); };

  return (
    <div className="cm-profile container">
      <aside className="cm-profile__sidebar">
        <div className="cm-profile__card">
          <Avatar initials="YO" size={64} online />
          <h3>Sachin Sharma</h3>
          <p>B.Tech CSE, 2nd Year</p>
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

        {tab === 'listings' && (
          <section>
            <h2>My Listings</h2>
            <div className="cm-profile__table">
              {myListings.map((p) => (
                <div className="cm-profile__row" key={p.id}>
                  <img src={p.images[0]} alt="" />
                  <div className="cm-profile__row-info">
                    <strong>{p.title}</strong>
                    <span>{p.free ? 'Free' : `₹${p.price.toLocaleString('en-IN')}`} · {p.views} views</span>
                  </div>
                  <Badge variant="success">Active</Badge>
                  <div className="cm-profile__row-actions">
                    <button>Edit</button>
                    <button className="danger">Delete</button>
                  </div>
                </div>
              ))}
            </div>
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
                    <img src={p.images[0]} alt="" />
                    <div className="cm-profile__row-info">
                      <strong>{p.title}</strong>
                      <span>{p.free ? 'Free' : `₹${p.price.toLocaleString('en-IN')}`}</span>
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
                  <img src={p.images[0]} alt="" />
                  <div className="cm-profile__row-info">
                    <strong>{p.title}</strong>
                    <span>Purchased for {p.free ? 'Free' : `₹${p.price.toLocaleString('en-IN')}`}</span>
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
              <div className="cm-sell__field"><label>Full Name</label><input type="text" defaultValue="Yash Oberoi" /></div>
              <div className="cm-sell__field"><label>Campus Email</label><input type="email" defaultValue="yash.oberoi@university.edu" /></div>
              <div className="cm-sell__field"><label>Hostel / Block</label><input type="text" defaultValue="CS Dept Hostel" /></div>
              <div className="cm-sell__field"><label>Phone Number</label><input type="tel" defaultValue="+91 98XXX XXXXX" /></div>
              <Button>Save Changes</Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
