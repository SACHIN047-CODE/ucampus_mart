import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import Button from '../../components/Button/Button';
import './Wishlist.css';

export default function Wishlist() {
  const { products, wishlist } = useApp();
  const saved = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="cm-wishlist container">
      <div className="cm-wishlist__head">
        <span className="cm-section__eyebrow">Saved for later</span>
        <h1>My Wishlist</h1>
        <p>{saved.length} item{saved.length !== 1 ? 's' : ''} saved</p>
      </div>

      {saved.length === 0 ? (
        <EmptyState
          icon="🤍"
          title="Your wishlist is empty"
          subtitle="Tap the heart icon on any listing to save it here and come back to it later."
          action={<Link to="/marketplace"><Button>Browse Marketplace</Button></Link>}
        />
      ) : (
        <div className="cm-product-grid cm-product-grid--4">
          {saved.map((p, i) => <ProductCard key={p.id} product={p} style={{ animationDelay: `${i * 0.05}s` }} />)}
        </div>
      )}
    </div>
  );
}
