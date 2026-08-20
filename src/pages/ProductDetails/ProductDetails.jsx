import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { getProductById } from '../../data/products';
import { useApp } from '../../context/AppContext';
import { resolveProductImages } from '../../utils/imageUtils';
import ProductImage from '../../components/ProductImage/ProductImage';
import Avatar from '../../components/Avatar/Avatar';
import Badge from '../../components/Badge/Badge';
import Button from '../../components/Button/Button';
import ProductCard from '../../components/ProductCard/ProductCard';
import './ProductDetails.css';

export default function ProductDetails() {
  const { id } = useParams();
  const { products, toggleWishlist, isWishlisted, showToast, addNotification } = useApp();
  const product = products.find((p) => String(p.id) === String(id)) || getProductById(id);
  const [activeImg, setActiveImg] = useState(0);

  if (!product) return <Navigate to="/marketplace" replace />;

  const images = resolveProductImages(product);
  const safeActiveImgIdx = activeImg < images.length ? activeImg : 0;
  const related = products.filter((p) => p.category === product.category && String(p.id) !== String(product.id)).slice(0, 4);
  const wished = isWishlisted(product.id);

  const handleChatSeller = () => {
    showToast(`Opening chat with ${product.seller}…`);
    addNotification(`You started a inquiry chat with ${product.seller} regarding "${product.title}".`, 'message');

    // Simulate someone showing interest in one of user's active listings
    const myOwn = products.filter((p) => p.isMine);
    if (myOwn.length > 0) {
      const targetItem = myOwn[Math.floor(Math.random() * myOwn.length)];
      setTimeout(() => {
        addNotification(`A buyer sent an inquiry about your listing "${targetItem.title}".`, 'interest');
      }, 3000);
    }
  };

  return (
    <div className="cm-pd container">
      <nav className="cm-pd__crumbs">
        <Link to="/">Home</Link> / <Link to="/marketplace">Marketplace</Link> / <Link to={`/marketplace?category=${product.category}`}>{product.category}</Link>
      </nav>

      <div className="cm-pd__grid">
        <div className="cm-pd__gallery">
          <div className="cm-pd__main-img">
            <ProductImage src={images[safeActiveImgIdx]} alt={product.title} product={product} />
            {product.free && <Badge variant="free">Free</Badge>}
          </div>
          {images.length > 1 && (
            <div className="cm-pd__thumbs">
              {images.map((img, i) => (
                <button key={i} className={i === safeActiveImgIdx ? 'is-active' : ''} onClick={() => setActiveImg(i)}>
                  <ProductImage src={img} alt={`${product.title} preview ${i + 1}`} product={product} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="cm-pd__info">
          <div className="cm-pd__badges">
            <Badge variant="primary">{product.category}</Badge>
            <Badge>{product.condition}</Badge>
            {product.negotiable && <Badge variant="success">Negotiable</Badge>}
          </div>

          <h1>{product.title}</h1>

          <div className="cm-pd__price">
            {product.free ? 'Free' : product.wanted ? 'Looking to buy' : `₹${(product.price || 0).toLocaleString('en-IN')}`}
            {!product.free && !product.wanted && product.originalPrice > product.price && (
              <span>₹{product.originalPrice.toLocaleString('en-IN')}</span>
            )}
          </div>

          <div className="cm-pd__meta">
            <span>📍 {product.location} · {product.hostel}</span>
            <span>🕒 Posted {product.postedAt}</span>
            <span>👁 {product.views} views</span>
          </div>

          <div className="cm-pd__actions">
            <Button size="lg" onClick={handleChatSeller}>Chat with Seller</Button>
            <Button size="lg" variant="secondary" onClick={() => toggleWishlist(product.id)}>
              {wished ? '♥ Saved' : '♡ Save to Wishlist'}
            </Button>
          </div>

          <div className="cm-pd__row-actions">
            <button onClick={() => showToast('Link copied to clipboard')}>🔗 Share</button>
            <button onClick={() => showToast('Listing reported. Our team will review it.', 'danger')}>⚑ Report Listing</button>
          </div>

          <div className="cm-pd__seller">
            <Avatar initials={product.sellerAvatar} size={48} online />
            <div>
              <div className="cm-pd__seller-name">{product.seller}</div>
              <div className="cm-pd__seller-sub">Verified Student · Usually replies within an hour</div>
            </div>
            <Link to="/messages" className="cm-pd__seller-btn">Message</Link>
          </div>

          <div className="cm-pd__desc">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="cm-pd__related">
          <h2>Related Products</h2>
          <div className="cm-product-grid cm-product-grid--4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
