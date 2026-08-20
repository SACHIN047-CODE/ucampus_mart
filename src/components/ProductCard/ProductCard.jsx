import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import ProductImage from '../ProductImage/ProductImage';
import './ProductCard.css';

export default function ProductCard({ product, style, onQuickView }) {
  const { toggleWishlist, isWishlisted } = useApp();
  const navigate = useNavigate();
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const wished = isWishlisted(product.id);
  
  const discount = product.originalPrice > product.price && product.price > 0
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const savings = product.originalPrice > product.price ? product.originalPrice - product.price : 0;

  const getCondClass = (cond) => {
    const c = (cond || '').toLowerCase();
    if (c.includes('like new') || c.includes('new') || c.includes('brand new')) return 'cond-new';
    if (c.includes('good')) return 'cond-good';
    return 'cond-fair';
  };

  const getCatIcon = (cat) => {
    switch (cat) {
      case 'books': return '📚';
      case 'electronics': return '💻';
      case 'cycles': return '🚲';
      case 'lab': return '🥼';
      case 'hostel': return '🛏️';
      case 'furniture': return '🪑';
      case 'fashion': return '👕';
      case 'sports': return '🏸';
      case 'calculators': return '🧮';
      default: return '🏷️';
    }
  };

  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : [];
  const currentImgSrc = images[activeImgIdx] || images[0];

  return (
    <article className="cm-pcard scale-in" style={style}>
      {/* Corner HUD accent ticks */}
      <div className="cm-pcard__hud-tl" />
      <div className="cm-pcard__hud-tr" />
      <div className="cm-pcard__hud-bl" />
      <div className="cm-pcard__hud-br" />

      {/* Top Specular Sheen */}
      <div className="cm-pcard__glow-bar" />

      {/* MEDIA AREA */}
      <div className="cm-pcard__media">
        <Link to={`/product/${product.id}`} className="cm-pcard__img-link">
          <ProductImage
            src={currentImgSrc}
            alt={product.title}
            product={product}
            loading="lazy"
          />
          <div className="cm-pcard__media-scrim" />
        </Link>

        {/* Top Badges */}
        <div className="cm-pcard__top-badges">
          {product.free ? (
            <span className="cm-pill cm-pill--free">🎁 FREE ITEM</span>
          ) : product.wanted ? (
            <span className="cm-pill cm-pill--wanted">🔍 WANTED</span>
          ) : discount > 0 ? (
            <span className="cm-pill cm-pill--discount">⚡ -{discount}% OFF</span>
          ) : (
            <span className="cm-pill cm-pill--cat">{getCatIcon(product.category)} {(product.category || '').toUpperCase()}</span>
          )}

          {product.negotiable && !product.free && !product.wanted && (
            <span className="cm-pill cm-pill--nego">NEGOTIABLE</span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          className={`cm-pcard__wish ${wished ? 'is-active' : ''}`}
          aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2">
            <path d="M12 21s-6.7-4.35-9.3-8.2C.8 9.7 1.8 5.9 5.1 4.7c2-.75 4.1.1 5.4 1.9 1.3-1.8 3.4-2.65 5.4-1.9 3.3 1.2 4.3 5 2.4 8.1C18.7 16.65 12 21 12 21z" />
          </svg>
        </button>

        {/* Bottom Media Bar (Condition & Views) */}
        <div className="cm-pcard__media-bottom">
          <span className={`cm-cond-tag ${getCondClass(product.condition)}`}>
            <span className="cond-dot" />
            {product.condition ? product.condition.toUpperCase() : 'VERIFIED'}
          </span>
          <span className="cm-views-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {product.views || 128}
          </span>
        </div>

        {/* Multi-image indicators if present */}
        {images.length > 1 && (
          <div className="cm-pcard__dots">
            {images.map((_, i) => (
              <span
                key={i}
                className={`pcard-dot ${i === activeImgIdx ? 'active' : ''}`}
                onMouseEnter={() => setActiveImgIdx(i)}
              />
            ))}
          </div>
        )}

        {/* Hover Quick Action Drawer */}
        <div className="cm-pcard__drawer">
          {onQuickView && (
            <button
              type="button"
              className="cm-drawer-btn cm-drawer-btn--primary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              <span>Quick View</span>
            </button>
          )}
          <button
            type="button"
            className="cm-drawer-btn cm-drawer-btn--sec"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/messages?product=${product.id}`);
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            <span>Chat</span>
          </button>
        </div>
      </div>

      {/* BODY AREA */}
      <div className="cm-pcard__body">
        {/* Price Row */}
        <div className="cm-pcard__top">
          <div className="cm-pcard__price-wrap">
            <span className="cm-pcard__price">
              {product.free ? 'Free' : product.wanted ? 'Looking to buy' : `₹${(product.price || 0).toLocaleString('en-IN')}`}
            </span>
            {!product.free && !product.wanted && product.originalPrice > product.price && (
              <span className="cm-pcard__strike">₹{product.originalPrice.toLocaleString('en-IN')}</span>
            )}
          </div>
          {savings > 0 && !product.free && !product.wanted && (
            <span className="cm-pcard__save-tag">SAVE ₹{savings.toLocaleString('en-IN')}</span>
          )}
        </div>

        {/* Title */}
        <Link to={`/product/${product.id}`} className="cm-pcard__title" title={product.title}>
          {product.title}
        </Link>

        {/* Location & Hostel */}
        <div className="cm-pcard__location-row">
          <span className="cm-loc-icon">📍</span>
          <span className="cm-loc-text">{product.location || 'Campus Center'} {product.hostel ? `· ${product.hostel}` : ''}</span>
        </div>

        {/* Footer: Seller Avatar, Name, Verified Student Badge, Time */}
        <div className="cm-pcard__footer">
          <div className="cm-pcard__seller-group">
            <span className="cm-seller-avatar">
              {product.sellerAvatar || (product.seller ? product.seller.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SS')}
            </span>
            <div className="cm-seller-details">
              <span className="cm-seller-name">@{product.seller ? product.seller.split(' ')[0].toLowerCase() : 'peer'}</span>
              <span className="cm-verified-badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#16a34a" stroke="none"><circle cx="12" cy="12" r="10" /><polygon points="9 12 11 14 15 10" fill="#fff" /></svg>
                Verified
              </span>
            </div>
          </div>
          <span className="cm-pcard__time">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            {product.postedAt || 'Recently'}
          </span>
        </div>
      </div>
    </article>
  );
}
