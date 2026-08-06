import { Link } from 'react-router-dom';
import ChitkaraLogo from '../ChitkaraLogo/ChitkaraLogo';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="cm-footer">
      <div className="container cm-footer__top">
        <div className="cm-footer__brand">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <ChitkaraLogo type="full" height={34} />
          </Link>
          <p style={{ marginTop: '12px' }}>The marketplace built for Chitkara University. Buy, sell, and exchange with verified students near you.</p>
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
        <span>© 2026 Chitkara CampusMart. Built for Chitkara students, by students.</span>
        <div className="cm-footer__legal">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Cookies</a>
        </div>
      </div>
    </footer>
  );
}
