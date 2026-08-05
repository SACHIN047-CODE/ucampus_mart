import { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { categories } from '../../data/categories';
import SearchBar from '../SearchBar/SearchBar';
import Avatar from '../Avatar/Avatar';
import Button from '../Button/Button';
import './Navbar.css';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { wishlist } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const catRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className={`cm-nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="cm-nav__inner container">
        <div className="cm-nav__left">
          <Link to="/" className="cm-nav__logo">
            <span className="cm-nav__logo-mark">CM</span>
            <span className="cm-nav__logo-text">Campus<em>Mart</em></span>
          </Link>

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

          <button className="cm-nav__icon-btn" aria-label="Notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="cm-nav__badge">3</span>
          </button>

          <button className="cm-nav__icon-btn cm-nav__theme" aria-label="Toggle dark mode" onClick={toggleTheme}>
            {theme === 'dark' ? (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></svg>
            ) : (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" /></svg>
            )}
          </button>

          <Link to="/sell" className="cm-nav__sell">
            <Button variant="primary" size="sm" icon="+">Sell Item</Button>
          </Link>

          <div className="cm-nav__profile" ref={profileRef}>
            <button onClick={() => setProfileOpen((v) => !v)} aria-label="Profile menu">
              <Avatar initials="YO" size={38} online />
            </button>
            {profileOpen && (
              <div className="cm-nav__profile-menu scale-in">
                <Link to="/profile" onClick={() => setProfileOpen(false)}>My Dashboard</Link>
                <Link to="/profile?tab=listings" onClick={() => setProfileOpen(false)}>My Listings</Link>
                <Link to="/wishlist" onClick={() => setProfileOpen(false)}>Wishlist</Link>
                <Link to="/admin" onClick={() => setProfileOpen(false)}>Admin Panel</Link>
                <div className="cm-nav__profile-sep" />
                <Link to="/login" onClick={() => setProfileOpen(false)}>Log out</Link>
              </div>
            )}
          </div>

          <button className="cm-nav__burger" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" /></svg>
          </button>
        </nav>
      </div>

      {mobileOpen && (
        <div className="cm-nav__mobile fade-in">
          <div className="cm-nav__mobile-top">
            <Link to="/" className="cm-nav__logo" onClick={() => setMobileOpen(false)}>
              <span className="cm-nav__logo-mark">CM</span>
              <span className="cm-nav__logo-text">Campus<em>Mart</em></span>
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
            <Link to="/profile" onClick={() => setMobileOpen(false)}>My Dashboard</Link>
            <Link to="/admin" onClick={() => setMobileOpen(false)}>Admin Panel</Link>
            <Link to="/login" onClick={() => setMobileOpen(false)}>Login</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
