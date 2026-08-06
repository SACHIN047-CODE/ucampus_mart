import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { categories } from '../../data/categories';
import { reviews, stats } from '../../data/reviews';
import SearchBar from '../../components/SearchBar/SearchBar';
import CategoryCard from '../../components/CategoryCard/CategoryCard';
import ProductCard from '../../components/ProductCard/ProductCard';
import ReviewCard from '../../components/ReviewCard/ReviewCard';
import StatsCard from '../../components/StatsCard/StatsCard';
import Button from '../../components/Button/Button';
import ChitkaraLogo from '../../components/ChitkaraLogo/ChitkaraLogo';
import QuickViewModal from '../../components/QuickViewModal/QuickViewModal';
import './Home.css';

export default function Home() {
  const { products, showToast } = useApp();
  
  // Interactive States
  const [activeCampus, setActiveCampus] = useState(
    localStorage.getItem('selected-campus') || 'Punjab Campus'
  );
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('all');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  
  // Estimator States
  const [estItemType, setEstItemType] = useState('books');
  const [estCondition, setEstCondition] = useState('good');
  const [estimatedPrice, setEstimatedPrice] = useState(null);

  // Sync Campus selector with Navbar
  useEffect(() => {
    const handleCampusChange = () => {
      setActiveCampus(localStorage.getItem('selected-campus') || 'Punjab Campus');
    };
    window.addEventListener('campusChanged', handleCampusChange);
    return () => window.removeEventListener('campusChanged', handleCampusChange);
  }, []);

  const changeCampus = (campusName) => {
    localStorage.setItem('selected-campus', campusName);
    setActiveCampus(campusName);
    window.dispatchEvent(new Event('campusChanged'));
    showToast(`Switched catalog view to ${campusName}`, 'success');
  };

  // Helper: Filter listings by campus
  const getProductsForCampus = (items) => {
    if (activeCampus === 'Punjab Campus') {
      // Exclude a few southern/suburban elements to simulate local search
      return items.filter(
        (p) => !['South Campus', 'PG Block 4', 'Sports Complex', 'Gate No. 2 Parking'].includes(p.location)
      );
    } else if (activeCampus === 'Himachal Campus') {
      // Simulating HP Baddi campus items
      return items.filter(
        (p) => ['South Campus', 'PG Block 4', 'Sports Complex', 'Gate No. 2 Parking', 'West Campus'].includes(p.location)
      );
    } else {
      // Simulated online course list items
      return items.filter(
        (p) => ['East Campus', 'Gate No. 1 Parking', 'Ganga Hostel', 'Meera Hostel', 'Tech Park'].includes(p.location)
      );
    }
  };

  // Live filtered catalogs
  const campusProducts = getProductsForCampus(products);
  
  const featured = campusProducts.slice(0, 4);
  const latest = [...campusProducts].reverse();
  const trending = campusProducts.filter((p) => p.views > 100).slice(0, 4);
  const free = campusProducts.filter((p) => p.free).slice(0, 3);
  const wanted = campusProducts.filter((p) => p.wanted).slice(0, 3);

  // Dynamic filter for "Latest" tabbed section
  const filteredLatest = selectedCategoryTab === 'all'
    ? latest.slice(0, 8)
    : latest.filter(p => p.category === selectedCategoryTab).slice(0, 8);

  // Estimate pricing logic
  const handleEstimateValue = (e) => {
    e.preventDefault();
    let base = 250;
    if (estItemType === 'books') base = 300;
    else if (estItemType === 'electronics') base = 3500;
    else if (estItemType === 'cycles') base = 2800;
    else if (estItemType === 'lab') base = 200;
    else if (estItemType === 'hostel') base = 450;
    else if (estItemType === 'furniture') base = 1200;

    let multiplier = 1.0;
    if (estCondition === 'new') multiplier = 1.35;
    else if (estCondition === 'fair') multiplier = 0.65;

    const min = Math.round(base * multiplier * 0.9);
    const max = Math.round(base * multiplier * 1.1);

    setEstimatedPrice({ min, max });
    showToast('Value estimation calculated!', 'success');
  };

  // Click handler from Ticker search
  const openProductById = (id) => {
    const found = products.find(p => p.id === id);
    if (found) {
      setQuickViewProduct(found);
    } else {
      showToast('Activity product details loaded.', 'default');
    }
  };

  return (
    <div className="cm-home">
      {/* ---------- LIVE ACTIVITY TICKER ---------- */}
      <div className="cm-live-ticker">
        <div className="cm-live-ticker__inner">
          <div className="cm-live-ticker__badge">⚡ Chitkara Live</div>
          <div className="cm-live-ticker__marquee-wrap">
            <div className="cm-live-ticker__marquee">
              <span onClick={() => openProductById('p4')} className="ticker-item">
                🥼 Priya N. listed <b>Lab Coat + Safety Goggles</b> for ₹180 near Chemistry Block
              </span>
              <span onClick={() => openProductById('p7')} className="ticker-item">
                🖩 Aditya R. listed <b>Casio FX- scientific calculator</b> for ₹550 at Engineering Block
              </span>
              <span onClick={() => openProductById('p2')} className="ticker-item">
                💻 Rohan M. sold <b>MacBook Air M1</b> to a senior in Einstein Block C
              </span>
              <span onClick={() => openProductById('p5')} className="ticker-item">
                🪑 Karan S. saved <b>Foldable Study Table</b> in girls hostel parking
              </span>
              <span onClick={() => openProductById('p22')} className="ticker-item">
                🧪 Harsh V. listed <b>Drafting Kit (Civil Lab)</b> for ₹220 at Nehru Hostel
              </span>
              {/* Duplicate for infinite loop speed */}
              <span onClick={() => openProductById('p4')} className="ticker-item">
                🥼 Priya N. listed <b>Lab Coat + Safety Goggles</b> for ₹180 near Chemistry Block
              </span>
              <span onClick={() => openProductById('p7')} className="ticker-item">
                🖩 Aditya R. listed <b>Casio FX- scientific calculator</b> for ₹550 at Engineering Block
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- HERO ---------- */}
      <section className="cm-hero">
        <div className="cm-hero__glow" />
        <div className="container cm-hero__inner">
          <div className="cm-hero__copy slide-up">
            <div className="cm-hero__brand-header">
              <ChitkaraLogo type="mark" height={28} />
              <span className="brand-pill">Explore Potential</span>
            </div>
            <span className="cm-hero__eyebrow">Verified Students Only · Zero Listing Fees</span>
            <h1>Buy &amp; Sell<br />Within <span>Chitkara Campus</span></h1>
            <p>Find affordable second-hand books, electronics, hostel essentials, cycles, lab equipment, and more from verified students near you.</p>
            
            {/* Campus Selector Buttons inside Hero */}
            <div className="cm-hero__campus-picker">
              <button 
                className={`campus-btn ${activeCampus === 'Punjab Campus' ? 'active' : ''}`}
                onClick={() => changeCampus('Punjab Campus')}
              >
                Punjab Campus (Rajpura)
              </button>
              <button 
                className={`campus-btn ${activeCampus === 'Himachal Campus' ? 'active' : ''}`}
                onClick={() => changeCampus('Himachal Campus')}
              >
                Himachal Campus (Baddi)
              </button>
              <button 
                className={`campus-btn ${activeCampus === 'Online Campus' ? 'active' : ''}`}
                onClick={() => changeCampus('Online Campus')}
              >
                Online Learning Center
              </button>
            </div>

            <div className="cm-hero__cta">
              <Link to="/marketplace"><Button size="lg">Browse Marketplace</Button></Link>
              <Link to="/sell"><Button size="lg" variant="secondary">Sell an Item</Button></Link>
            </div>
            <div className="cm-hero__search"><SearchBar size="lg" /></div>
          </div>

          <div className="cm-hero__art slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="cm-hero__card cm-hero__card--main" onClick={() => openProductById('p2')}>
              <img src={products[1].images[0]} alt="" />
              <div className="cm-hero__card-tag">🔥 Trending Deal</div>
              <div className="cm-hero__card-info">
                <span>{products[1].title}</span>
                <strong>₹{products[1].price.toLocaleString('en-IN')}</strong>
              </div>
            </div>
            <div className="cm-hero__card cm-hero__card--float1" onClick={() => openProductById('p3')}>
              <img src={products[2].images[0]} alt="" />
              <div className="cm-hero__card-info cm-hero__card-info--sm">
                <span>{products[2].title.slice(0, 20)}…</span>
                <strong>₹{products[2].price.toLocaleString('en-IN')}</strong>
              </div>
            </div>
            <div className="cm-hero__pulse">
              <span className="cm-hero__pulse-dot" />
              Active deals near <b>{activeCampus === 'Punjab Campus' ? 'Galileo Block' : activeCampus === 'Himachal Campus' ? 'Baddi Gate 3' : 'CIET building'}</b> · just now
            </div>
          </div>
        </div>
      </section>

      {/* ---------- STATS ---------- */}
      <section className="cm-stats-strip">
        <div className="container cm-stats-strip__grid">
          {stats.map((s) => <StatsCard key={s.id} value={s.value} suffix={s.suffix} label={`${s.label} (${activeCampus === 'Punjab Campus' ? 'Punjab' : 'Other'})`} />)}
        </div>
      </section>

      {/* ---------- CATEGORIES ---------- */}
      <section className="cm-section">
        <div className="container overflow-visible">
          <div className="cm-section__head">
            <div>
              <span className="cm-section__eyebrow">Explore</span>
              <h2>Popular Categories</h2>
            </div>
            <Link to="/categories" className="cm-section__link">View all →</Link>
          </div>
          <div className="cm-cat-grid">
            {categories.slice(0, 10).map((c) => <CategoryCard key={c.id} category={c} />)}
          </div>
        </div>
      </section>

      {/* ---------- INTERACTIVE ESTIMATOR & DYNAMIC FILTER BLOCK ---------- */}
      <section className="cm-section cm-section--tint">
        <div className="container grid-two-cols">
          {/* LEFT: Chitkara Value Estimator */}
          <div className="cm-estimator-card">
            <div className="estimator-header">
              <span className="est-eyebrow">Smart Calculator</span>
              <h3>Chitkara Resell Estimator</h3>
              <p>Wondering how much to list your study gear for? Get an instant valuation based on current campus demand.</p>
            </div>
            <form onSubmit={handleEstimateValue} className="estimator-form">
              <div className="form-row justify-between">
                <div className="form-group flex-1">
                  <label htmlFor="estItemType">Select Item Type</label>
                  <select 
                    id="estItemType"
                    value={estItemType} 
                    onChange={(e) => setEstItemType(e.target.value)}
                  >
                    <option value="books">📚 Semester Textbooks</option>
                    <option value="electronics">💻 Lab/Hostel Electronics</option>
                    <option value="cycles">🚲 Campus Bicycles</option>
                    <option value="lab">🧪 Lab Coat & Safety Equipment</option>
                    <option value="hostel">🛏️ Hostel Essentials</option>
                    <option value="furniture">🪑 Folding Study Desk/Chair</option>
                  </select>
                </div>
                <div className="form-group flex-1">
                  <label htmlFor="estCondition">Item Condition</label>
                  <select 
                    id="estCondition"
                    value={estCondition} 
                    onChange={(e) => setEstCondition(e.target.value)}
                  >
                    <option value="new">🌟 Almost Brand New</option>
                    <option value="good">👍 Gently Worn / Good Condition</option>
                    <option value="fair">🔧 Well Used / Functional</option>
                  </select>
                </div>
              </div>
              <Button type="submit" variant="primary">Estimate Value</Button>
            </form>
            
            {estimatedPrice && (
              <div className="estimate-result scale-in">
                <span>Recommended Listing Range:</span>
                <h3>₹{estimatedPrice.min.toLocaleString('en-IN')} - ₹{estimatedPrice.max.toLocaleString('en-IN')}</h3>
                <p>Based on successful sales under the {activeCampus} catalog.</p>
                <Link to="/sell">
                  <Button size="sm" variant="outline">List This Item Now</Button>
                </Link>
              </div>
            )}
          </div>

          {/* RIGHT: Dynamic Highlights */}
          <div className="cm-campus-highlight">
            <div className="highlight-tag">🔥 Campus Spotlights</div>
            <h3>Active Trading Zones</h3>
            <p>Hotspots on the <strong>{activeCampus}</strong> map with high buying activity this week.</p>
            <div className="hotspot-list">
              <div className="hotspot-item">
                <span className="location-pin">📍</span>
                <div>
                  <strong>{activeCampus === 'Punjab Campus' ? 'Galileo Block Cafeteria' : activeCampus === 'Himachal Campus' ? 'Main Administration Block' : 'CIET Tech Hub'}</strong>
                  <span>14 exchanges completed today</span>
                </div>
              </div>
              <div className="hotspot-item">
                <span className="location-pin">📍</span>
                <div>
                  <strong>{activeCampus === 'Punjab Campus' ? 'Socrates Hostel Block parking' : activeCampus === 'Himachal Campus' ? 'Boys Hostel 2 Parking' : 'Online Student Lounge'}</strong>
                  <span>8 cycles and beds listed this morning</span>
                </div>
              </div>
              <div className="hotspot-item">
                <span className="location-pin">📍</span>
                <div>
                  <strong>{activeCampus === 'Punjab Campus' ? 'Newton Block Plaza' : activeCampus === 'Himachal Campus' ? 'Sports Hall Grounds' : 'Study Resource Center'}</strong>
                  <span>Popular meetup zone for book exchanges</span>
                </div>
              </div>
            </div>
            <div className="campus-notice">
              <span>💡 Safety reminder: Meet in daylight at one of our active campus hotspots during trade handovers.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- INTERACTIVE LATEST CATALOG (WITH CATEGORY TABS) ---------- */}
      <section className="cm-section">
        <div className="container">
          <div className="cm-section__head flex-col items-start gap-12">
            <div>
              <span className="cm-section__eyebrow">Just In ({activeCampus})</span>
              <h2>Latest Campus Listings</h2>
            </div>
            {/* Category Ribbon Tabs */}
            <div className="cm-category-tabs">
              <button 
                className={`tab-btn ${selectedCategoryTab === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategoryTab('all')}
              >
                All Items
              </button>
              {categories.slice(0, 7).map(cat => (
                <button
                  key={cat.id}
                  className={`tab-btn ${selectedCategoryTab === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategoryTab(cat.id)}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          {filteredLatest.length > 0 ? (
            <div className="cm-product-grid cm-product-grid--4 scale-in" key={`${selectedCategoryTab}-${activeCampus}`}>
              {filteredLatest.map((p, i) => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  style={{ animationDelay: `${i * 0.04}s` }} 
                  onQuickView={(prod) => setQuickViewProduct(prod)}
                />
              ))}
            </div>
          ) : (
            <div className="no-listings-card">
              <span>📦</span>
              <h3>No items listed under this category recently</h3>
              <p>Be the first one on the {activeCampus} to sell under this category!</p>
              <Link to="/sell"><Button size="sm">Sell an Item</Button></Link>
            </div>
          )}
        </div>
      </section>

      {/* ---------- FEATURED ---------- */}
      <section className="cm-section cm-section--tint">
        <div className="container">
          <div className="cm-section__head">
            <div>
              <span className="cm-section__eyebrow">Handpicked</span>
              <h2>Featured Products</h2>
            </div>
            <Link to="/marketplace" className="cm-section__link">View all →</Link>
          </div>
          <div className="cm-product-grid cm-product-grid--4">
            {featured.map((p, i) => (
              <ProductCard 
                key={p.id} 
                product={p} 
                style={{ animationDelay: `${i * 0.05}s` }} 
                onQuickView={(prod) => setQuickViewProduct(prod)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- TRENDING ---------- */}
      <section className="cm-section">
        <div className="container">
          <div className="cm-section__head">
            <div>
              <span className="cm-section__eyebrow">Most viewed</span>
              <h2>Trending Products</h2>
            </div>
            <Link to="/marketplace" className="cm-section__link">View all →</Link>
          </div>
          <div className="cm-product-grid cm-product-grid--4">
            {trending.map((p, i) => (
              <ProductCard 
                key={p.id} 
                product={p} 
                style={{ animationDelay: `${i * 0.05}s` }} 
                onQuickView={(prod) => setQuickViewProduct(prod)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FREE + WANTED ---------- */}
      <section className="cm-section cm-section--tint">
        <div className="container cm-split">
          <div className="cm-split__col">
            <div className="cm-section__head cm-section__head--tight">
              <div>
                <span className="cm-section__eyebrow" style={{ color: 'var(--success)' }}>Pay it forward</span>
                <h2>Free Items</h2>
              </div>
            </div>
            <div className="cm-product-grid cm-product-grid--3">
              {free.map((p) => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  onQuickView={(prod) => setQuickViewProduct(prod)}
                />
              ))}
            </div>
          </div>
          <div className="cm-split__col">
            <div className="cm-section__head cm-section__head--tight">
              <div>
                <span className="cm-section__eyebrow" style={{ color: 'var(--warning)' }}>Help a peer out</span>
                <h2>Wanted Items</h2>
              </div>
            </div>
            <div className="cm-product-grid cm-product-grid--3">
              {wanted.map((p) => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  onQuickView={(prod) => setQuickViewProduct(prod)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- REVIEWS ---------- */}
      <section className="cm-section">
        <div className="container">
          <div className="cm-section__head">
            <div>
              <span className="cm-section__eyebrow">Word around campus</span>
              <h2>What Students Say</h2>
            </div>
          </div>
          <div className="cm-review-grid">
            {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
          </div>
        </div>
      </section>

      {/* ---------- CTA BAND ---------- */}
      <section className="cm-cta-band">
        <div className="container cm-cta-band__inner">
          <div>
            <h2>Got something gathering dust in your hostel room?</h2>
            <p>List it in under 2 minutes and reach thousands of students across Chitkara University.</p>
          </div>
          <Link to="/sell"><Button size="lg" variant="outline-light">Sell an Item</Button></Link>
        </div>
      </section>

      {/* ---------- QUICK VIEW MODAL OVERLAY ---------- */}
      {quickViewProduct && (
        <QuickViewModal 
          product={quickViewProduct} 
          onClose={() => setQuickViewProduct(null)} 
        />
      )}
    </div>
  );
}
