import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Badge from '../Badge/Badge';
import './ProductCard.css';

export default function ProductCard({ product, style }) {
  const { toggleWishlist, isWishlisted } = useApp();
  const wished = isWishlisted(product.id);
  const discount = product.originalPrice > product.price && product.price > 0
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <article className="cm-pcard scale-in" style={style}>
      <div className="cm-pcard__media">
        <Link to={`/product/${product.id}`}>
          <img src={product.images[0]} alt={product.title} loading="lazy" />
        </Link>
        <button
          className={`cm-pcard__wish ${wished ? 'is-active' : ''}`}
          aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
          onClick={() => toggleWishlist(product.id)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M12 21s-6.7-4.35-9.3-8.2C.8 9.7 1.8 5.9 5.1 4.7c2-.75 4.1.1 5.4 1.9 1.3-1.8 3.4-2.65 5.4-1.9 3.3 1.2 4.3 5 2.4 8.1C18.7 16.65 12 21 12 21z" />
          </svg>
        </button>
        <div className="cm-pcard__tags">
          {product.free && <Badge variant="free">Free</Badge>}
          {product.wanted && <Badge variant="wanted">Wanted</Badge>}
          {!product.free && !product.wanted && discount > 0 && <Badge variant="danger">-{discount}%</Badge>}
        </div>
      </div>

      <div className="cm-pcard__body">
        <div className="cm-pcard__top">
          <span className="cm-pcard__price">
            {product.free ? 'Free' : product.wanted ? 'Looking to buy' : `₹${product.price.toLocaleString('en-IN')}`}
          </span>
          {!product.free && !product.wanted && product.originalPrice > product.price && (
            <span className="cm-pcard__strike">₹{product.originalPrice.toLocaleString('en-IN')}</span>
          )}
        </div>

        <Link to={`/product/${product.id}`} className="cm-pcard__title">{product.title}</Link>

        <div className="cm-pcard__meta">
          <span>{product.condition}</span>
          <span className="cm-dot" />
          <span>{product.location}</span>
        </div>

        <div className="cm-pcard__footer">
          <span className="cm-pcard__seller">{product.seller.split(' ')[0]}</span>
          <span className="cm-pcard__time">{product.postedAt}</span>
        </div>
      </div>
    </article>
  );
}
