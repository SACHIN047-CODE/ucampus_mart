import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { categories } from '../../data/categories';
import SearchBar from '../SearchBar/SearchBar';
import Avatar from '../Avatar/Avatar';
import Button from '../Button/Button';
import ChitkaraLogo from '../ChitkaraLogo/ChitkaraLogo';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentCategory = searchParams.get('category');
  const isMarketplace = location.pathname === '/marketplace';

  const { theme, toggleTheme } = useTheme();
  const { wishlist, user, logout, notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
        {/* Left: Brand Logo & Campus Selector */}
        <div className="cm-nav__left">
          <Link to="/" className="cm-nav__logo" style={{ textDecoration: 'none' }}>
            <span className="cm-nav__brand-title">CampusMart</span>
          </Link>

          <div className="cm-nav__campus-pill">
            <select
              value={selectedCampus}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedCampus(val);
                localStorage.setItem('selected-campus', val);
                window.dispatchEvent(new Event('campusChanged'));
              }}
              className="cm-nav__campus-select"
            >
              <option value="Punjab Campus">📍 Punjab</option>
              <option value="Himachal Campus">📍 Himachal</option>
              <option value="Online Campus">📍 Online</option>
            </select>
          </div>
        </div>

        {/* Center: Clean Horizontal Navigation Links (Textbooks, Tech, Dorm Life, Cycles, Fashion) */}
        <nav className="cm-nav__center-links">
          <Link
            to="/marketplace?category=books"
            className={`cm-nav__link ${isMarketplace && currentCategory === 'books' ? 'active is-active' : ''}`}
          >
            Textbooks
          </Link>
          <Link
            to="/marketplace?category=electronics"
            className={`cm-nav__link ${isMarketplace && currentCategory === 'electronics' ? 'active is-active' : ''}`}
          >
            Tech
          </Link>
          <Link
            to="/marketplace?category=hostel"
            className={`cm-nav__link ${isMarketplace && currentCategory === 'hostel' ? 'active is-active' : ''}`}
          >
            Dorm Life
          </Link>
          <Link
            to="/marketplace?category=cycles"
            className={`cm-nav__link ${isMarketplace && currentCategory === 'cycles' ? 'active is-active' : ''}`}
          >
            Cycles
          </Link>
          <Link
            to="/marketplace?category=fashion"
            className={`cm-nav__link ${isMarketplace && currentCategory === 'fashion' ? 'active is-active' : ''}`}
          >
            Fashion
          </Link>
        </nav>

        {/* Right: Clean Minimalist Icons (Search, Profile, Wishlist, Cart, Theme, Sell) */}
        <div className="cm-nav__actions">
          {/* Search Trigger */}
          <button
            type="button"
            className={`cm-nav__icon-btn ${searchOpen ? 'active' : ''}`}
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
            title="Search products"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <circle cx="11" cy="11" r="7.5" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {/* User Account / Profile */}
          {user ? (
            <div className="cm-nav__profile" ref={profileRef}>
              <button onClick={() => setProfileOpen((v) => !v)} aria-label="Profile menu" className="cm-nav__profile-btn">
                <Avatar initials={user.initials || 'SS'} size={32} online />
              </button>
              {profileOpen && (
                <div className="cm-nav__profile-menu scale-in">
                  <div className="cm-nav__profile-header">
                    <span className="cm-nav__profile-name">{user.name || 'Student'}</span>
                    <span className="cm-nav__profile-email">{user.email || 'student@chitkara.edu.in'}</span>
                  </div>
                  <div className="cm-nav__profile-sep" />
                  <Link to="/profile" onClick={() => setProfileOpen(false)}>My Profile &amp; Listings</Link>
                  <Link to="/wishlist" onClick={() => setProfileOpen(false)}>Saved Items ({wishlist.length})</Link>
                  <Link to="/admin" onClick={() => setProfileOpen(false)}>Admin Panel</Link>
                  <div className="cm-nav__profile-sep" />
                  <button onClick={() => { logout(); setProfileOpen(false); }} className="cm-nav__profile-logout">
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="cm-nav__icon-btn" aria-label="Account" title="Sign in">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          )}

          {/* Chat & Messages Section */}
          <NavLink
            to="/messages"
            className={({ isActive }) => `cm-nav__icon-btn ${isActive ? 'active' : ''}`}
            aria-label="Campus Chat"
            title="Messages & Campus Chats"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            {notifications && notifications.filter(n => !n.read && n.type === 'message').length > 0 && (
              <span className="cm-nav__badge">
                {notifications.filter(n => !n.read && n.type === 'message').length}
              </span>
            )}
          </NavLink>

          {/* Wishlist Heart Icon */}
          <NavLink to="/wishlist" className="cm-nav__icon-btn" aria-label="Wishlist" title="Wishlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 21s-6.7-4.35-9.3-8.2C.8 9.7 1.8 5.9 5.1 4.7c2-.75 4.1.1 5.4 1.9 1.3-1.8 3.4-2.65 5.4-1.9 3.3 1.2 4.3 5 2.4 8.1C18.7 16.65 12 21 12 21z" />
            </svg>
            {wishlist.length > 0 && <span className="cm-nav__badge">{wishlist.length}</span>}
          </NavLink>

          {/* Shopping Bag / Cart Icon (Matching exact photo icon with count) */}
          <NavLink to="/marketplace" className="cm-nav__icon-btn" aria-label="Cart" title="Browse Bag">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span className="cm-nav__badge">0</span>
          </NavLink>

          {/* Theme Toggle (Sun / Moon) */}
          <button
            type="button"
            className="cm-nav__icon-btn cm-nav__theme"
            aria-label="Toggle dark mode"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="4.5" />
                <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
              </svg>
            ) : (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
              </svg>
            )}
          </button>

          {/* Sell Item Pill Button */}
          <Link to="/sell" className="cm-nav__sell-pill">
            <Button variant="primary" size="sm">Sell</Button>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="cm-nav__hamburger"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expandable Search Drawer */}
      {searchOpen && (
        <div className="cm-nav__search-drawer scale-in">
          <div className="container cm-nav__search-drawer-inner">
            <SearchBar size="lg" placeholder="Search across all textbooks, laptops, cycles, dorm essentials..." />
            <button
              type="button"
              className="cm-nav__search-close-btn"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      {mobileOpen && (
        <div className="cm-nav__mobile fade-in">
          <div className="cm-nav__mobile-top">
            <Link to="/" className="cm-nav__logo" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
              <span className="cm-nav__brand-title">CampusMart</span>
            </Link>
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          <SearchBar />
          <nav className="cm-nav__mobile-links">
            <Link to="/marketplace" className={isMarketplace && !currentCategory ? 'active' : ''} onClick={() => setMobileOpen(false)}>Marketplace</Link>
            <Link to="/marketplace?category=books" className={isMarketplace && currentCategory === 'books' ? 'active' : ''} onClick={() => setMobileOpen(false)}>Textbooks</Link>
            <Link to="/marketplace?category=electronics" className={isMarketplace && currentCategory === 'electronics' ? 'active' : ''} onClick={() => setMobileOpen(false)}>Tech</Link>
            <Link to="/marketplace?category=hostel" className={isMarketplace && currentCategory === 'hostel' ? 'active' : ''} onClick={() => setMobileOpen(false)}>Dorm Life</Link>
            <Link to="/marketplace?category=cycles" className={isMarketplace && currentCategory === 'cycles' ? 'active' : ''} onClick={() => setMobileOpen(false)}>Cycles</Link>
            <Link to="/marketplace?category=fashion" className={isMarketplace && currentCategory === 'fashion' ? 'active' : ''} onClick={() => setMobileOpen(false)}>Fashion</Link>
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
