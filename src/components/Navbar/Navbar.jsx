import { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { categories } from '../../data/categories';
import SearchBar from '../SearchBar/SearchBar';
import Avatar from '../Avatar/Avatar';
import Button from '../Button/Button';
import ChitkaraLogo from '../ChitkaraLogo/ChitkaraLogo';
import './Navbar.css';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { wishlist, user, logout, notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState(
    localStorage.getItem('selected-campus') || 'Punjab Campus'
  );
  const catRef = useRef(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    // Listen for campus updates triggered elsewhere (e.g. from Hero panel)
    const handleCampusChange = () => {
      setSelectedCampus(localStorage.getItem('selected-campus') || 'Punjab Campus');
    };
    window.addEventListener('campusChanged', handleCampusChange);
    return () => window.removeEventListener('campusChanged', handleCampusChange);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const formatNotifTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      if (isNaN(diffMs) || diffMs < 0) return 'Just now';
      
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch {
      return 'Just now';
    }
  };

  return (
    <header className={`cm-nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="cm-nav__inner container">
        <div className="cm-nav__left">
          <Link to="/" className="cm-nav__logo" style={{ textDecoration: 'none' }}>
            <ChitkaraLogo type="full" height={36} />
          </Link>

          <div className="cm-nav__campus-pill" style={{ marginLeft: '4px' }}>
            <select
              value={selectedCampus}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedCampus(val);
                localStorage.setItem('selected-campus', val);
                window.dispatchEvent(new Event('campusChanged'));
              }}
              style={{
                background: 'rgba(226, 26, 34, 0.06)',
                border: '1px solid rgba(226, 26, 34, 0.15)',
                borderRadius: '20px',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: '700',
                color: 'var(--primary)',
                cursor: 'pointer',
                outline: 'none',
                height: '30px',
                transition: 'all 0.2s var(--ease)',
              }}
            >
              <option value="Punjab Campus">📍 Punjab Campus</option>
              <option value="Himachal Campus">📍 Himachal Campus</option>
              <option value="Online Campus">📍 Online Campus</option>
            </select>
          </div>

          <div className="cm-nav__cat" ref={catRef}>
            <button className="cm-nav__cat-btn" onClick={() => setCatOpen((v) => !v)}>
              Categories
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            {catOpen && (
              <div className="cm-nav__cat-menu scale-in">
                {categories.map((c) => (
                  <Link key={c.id} to={`/marketplace?category=${c.id}`} onClick={() => setCatOpen(false)}>
                    <span>{c.icon}</span>{c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="cm-nav__search">
          <SearchBar size="sm" />
        </div>

        <nav className="cm-nav__actions">
          <NavLink to="/wishlist" className="cm-nav__icon-btn" aria-label="Wishlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 21s-6.7-4.35-9.3-8.2C.8 9.7 1.8 5.9 5.1 4.7c2-.75 4.1.1 5.4 1.9 1.3-1.8 3.4-2.65 5.4-1.9 3.3 1.2 4.3 5 2.4 8.1C18.7 16.65 12 21 12 21z" />
            </svg>
            {wishlist.length > 0 && <span className="cm-nav__badge">{wishlist.length}</span>}
          </NavLink>

          <NavLink to="/messages" className="cm-nav__icon-btn" aria-label="Messages">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </NavLink>

          <div className="cm-nav__notif" ref={notifRef}>
            <button
              className={`cm-nav__icon-btn cm-nav__notif-btn ${notifOpen ? 'active' : ''}`}
              aria-label="Notifications"
              onClick={() => setNotifOpen((v) => !v)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && <span className="cm-nav__badge">{unreadCount}</span>}
            </button>

            {notifOpen && (
              <div className="cm-nav__notif-menu scale-in">
                <div className="cm-nav__notif-header">
                  <h3>Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllNotificationsRead} className="cm-nav__notif-clear">
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="cm-nav__notif-sep" />
                <div className="cm-nav__notif-list">
                  {notifications.length === 0 ? (
                    <div className="cm-nav__notif-empty">
                      <span style={{ fontSize: '24px' }}>🔔</span>
                      <p>No new notifications</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`cm-nav__notif-item ${!n.read ? 'is-unread' : ''}`}
                        onClick={() => markNotificationRead(n.id)}
                      >
                        <div className="cm-nav__notif-item-body">
                          <p>{n.message}</p>
                          <span>{formatNotifTime(n.createdAt)}</span>
                        </div>
                        {!n.read && <span className="cm-nav__notif-dot" />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button className="cm-nav__icon-btn cm-nav__theme" aria-label="Toggle dark mode" onClick={toggleTheme}>
            {theme === 'dark' ? (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></svg>
            ) : (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" /></svg>
            )}
          </button>

          {!user ? (
            <Link to="/login" className="cm-nav__login">
              <Button
                variant="secondary"
                size="sm"
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                }
              >
                Login
              </Button>
            </Link>
          ) : null}

          <Link to="/sell" className="cm-nav__sell">
            <Button variant="primary" size="sm" icon="+">Sell Item</Button>
          </Link>

          {user ? (
            <div className="cm-nav__profile" ref={profileRef}>
              <button onClick={() => setProfileOpen((v) => !v)} aria-label="Profile menu" className="cm-nav__profile-btn">
                <Avatar initials={user.initials || 'SS'} size={38} online />
              </button>
              {profileOpen && (
                <div className="cm-nav__profile-menu scale-in">
                  <div className="cm-nav__profile-header">
                    <span className="cm-nav__profile-name">{user.name || 'Sachin Sharma'}</span>
                    <span className="cm-nav__profile-email">{user.email || 'sachin.sharma@chitkara.edu.in'}</span>
                  </div>
                  <div className="cm-nav__profile-sep" />
                  <Link to="/profile" onClick={() => setProfileOpen(false)}>My Dashboard</Link>
                  <Link to="/wishlist" onClick={() => setProfileOpen(false)}>Wishlist</Link>
                  <Link to="/admin" onClick={() => setProfileOpen(false)}>Admin Panel</Link>
                  <div className="cm-nav__profile-sep" />
                  <button
                    type="button"
                    className="cm-nav__profile-logout"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : null}

          <button className="cm-nav__burger" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" /></svg>
          </button>
        </nav>
      </div>

      {mobileOpen && (
        <div className="cm-nav__mobile fade-in">
          <div className="cm-nav__mobile-top">
            <Link to="/" className="cm-nav__logo" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
              <ChitkaraLogo type="full" height={36} />
            </Link>
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          <SearchBar />
          <nav className="cm-nav__mobile-links">
            <Link to="/marketplace" onClick={() => setMobileOpen(false)}>Marketplace</Link>
            <Link to="/categories" onClick={() => setMobileOpen(false)}>Categories</Link>
            <Link to="/sell" onClick={() => setMobileOpen(false)}>Sell an Item</Link>
            <Link to="/wishlist" onClick={() => setMobileOpen(false)}>Wishlist</Link>
            <Link to="/messages" onClick={() => setMobileOpen(false)}>Messages</Link>
            {user ? (
              <>
                <Link to="/profile" onClick={() => setMobileOpen(false)}>My Dashboard ({user.name})</Link>
                <Link to="/admin" onClick={() => setMobileOpen(false)}>Admin Panel</Link>
                <button
                  type="button"
                  className="cm-nav__mobile-logout"
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)}>Login / Sign In</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
