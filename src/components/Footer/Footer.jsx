import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="cm-footer">
      <div className="container cm-footer__top">
        <div className="cm-footer__brand">
          <div className="cm-nav__logo">
            <span className="cm-nav__logo-mark">CM</span>
            <span className="cm-nav__logo-text" style={{ color: '#fff' }}>Campus<em>Mart</em></span>
          </div>
          <p>The marketplace built for your campus. Buy, sell, and exchange with verified students near you.</p>
          <div className="cm-footer__social">
            <a href="#" aria-label="Instagram">IG</a>
            <a href="#" aria-label="Twitter">X</a>
            <a href="#" aria-label="LinkedIn">in</a>
          </div>
        </div>

        <div className="cm-footer__col">
          <h4>Marketplace</h4>
          <Link to="/marketplace">Browse All</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/sell">Sell an Item</Link>
          <Link to="/marketplace?free=true">Free Items</Link>
        </div>

        <div className="cm-footer__col">
          <h4>Account</h4>
          <Link to="/profile">Dashboard</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/messages">Messages</Link>
          <Link to="/login">Login</Link>
        </div>

        <div className="cm-footer__col">
          <h4>Support</h4>
          <a href="#">Help Center</a>
          <a href="#">Safety Tips</a>
          <a href="#">Report a Listing</a>
          <a href="#">Contact Us</a>
        </div>
      </div>

      <div className="container cm-footer__bottom">
        <span>© 2025 CampusMart. Built for students, by students.</span>
        <div className="cm-footer__legal">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Cookies</a>
        </div>
      </div>
    </footer>
  );
}
