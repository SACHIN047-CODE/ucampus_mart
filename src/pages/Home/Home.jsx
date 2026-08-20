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
import ProductImage from '../../components/ProductImage/ProductImage';
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
      {/* ---------- LIVE ACTIVITY & TELEMETRY TICKER ---------- */}
      <div className="cm-live-ticker">
        <div className="cm-live-ticker__inner">
          <div className="cm-live-ticker__badge">READY ▍</div>
          <div className="cm-live-ticker__mono-tag">CHITKARA · EDGE P2P</div>
          <div className="cm-live-ticker__marquee-wrap">
            <div className="cm-live-ticker__marquee">
              <span onClick={() => openProductById('p4')} className="ticker-item">
                &gt; Priya N. listed <b>Lab Coat + Safety Goggles</b> for ₹180 near Chemistry Block
              </span>
              <span onClick={() => openProductById('p7')} className="ticker-item">
                &gt; Aditya R. listed <b>Casio FX-991CW Calculator</b> for ₹550 at Engineering Block
              </span>
              <span onClick={() => openProductById('p2')} className="ticker-item">
                &gt; Rohan M. listed <b>MacBook Air M1</b> at Einstein Block C
              </span>
              <span onClick={() => openProductById('p5')} className="ticker-item">
                &gt; Karan S. saved <b>Foldable Study Table</b> near Socrates Hostel
              </span>
              <span onClick={() => openProductById('p22')} className="ticker-item">
                &gt; Harsh V. listed <b>Drafting Kit (Civil Lab)</b> for ₹220 at Nehru Hostel
              </span>
              {/* Duplicate for seamless infinite loop */}
              <span onClick={() => openProductById('p4')} className="ticker-item">
                &gt; Priya N. listed <b>Lab Coat + Safety Goggles</b> for ₹180 near Chemistry Block
              </span>
              <span onClick={() => openProductById('p7')} className="ticker-item">
                &gt; Aditya R. listed <b>Casio FX-991CW Calculator</b> for ₹550 at Engineering Block
              </span>
            </div>
          </div>
          <div className="cm-live-ticker__right-tag">MMXXVI</div>
        </div>
      </div>

      {/* ---------- HERO ---------- */}
      <section className="cm-hero">
        <div className="cm-hero__ambient-glow" />
        <div className="container cm-hero__inner">
          <div className="cm-hero__copy slide-up">
            <div className="cm-hero__telemetry-header">
              <span className="mono-badge">HSB · CHITKARA P2P</span>
              <span className="mono-badge mono-badge--status">STATUS: ONLINE</span>
            </div>
            
            <h1 className="cm-hero__title">
              Alright. Let’s fly.
            </h1>
            <p className="cm-hero__subtitle">
              Buy, sell, and exchange books, electronics, cycles, and hostel gear directly with verified peers across Chitkara University. Zero middleman fees.
            </p>

            {/* Micro-Telemetry Console */}
            <div className="cm-hero__console">
              <div className="cm-console-line">&gt; waking edge node <span>online</span></div>
              <div className="cm-console-line">&gt; indexing campus catalog <span>095 active listings</span></div>
              <div className="cm-console-line">&gt; verified student network <span>4,800+ peers</span></div>
              <div className="cm-console-line">&gt; trade protocol <span>100% direct handover</span></div>
            </div>
            
            {/* Campus Selector Buttons */}
            <div className="cm-hero__campus-picker">
              <button 
                className={`campus-btn ${activeCampus === 'Punjab Campus' ? 'active' : ''}`}
                onClick={() => changeCampus('Punjab Campus')}
              >
                PUNJAB CAMPUS (RAJPURA)
              </button>
              <button 
                className={`campus-btn ${activeCampus === 'Himachal Campus' ? 'active' : ''}`}
                onClick={() => changeCampus('Himachal Campus')}
              >
                HIMACHAL CAMPUS (BADDI)
              </button>
              <button 
                className={`campus-btn ${activeCampus === 'Online Campus' ? 'active' : ''}`}
                onClick={() => changeCampus('Online Campus')}
              >
                ONLINE CAMPUS
              </button>
            </div>

            <div className="cm-hero__cta">
              <Link to="/marketplace"><Button size="lg" variant="primary">Browse Marketplace</Button></Link>
              <Link to="/sell"><Button size="lg" variant="secondary">Sell an Item</Button></Link>
            </div>
            <div className="cm-hero__search"><SearchBar size="lg" /></div>
          </div>

          <div className="cm-hero__art slide-up" style={{ animationDelay: '0.1s' }}>
            {/* Large Tech Numeral from Reference Screenshot 1 */}
            <div className="cm-hero__giant-number">
              <span className="giant-num">095</span>
              <span className="giant-num-label">LIVE CAMPUS DEALS</span>
            </div>

            {/* Featured Product Floating Card */}
            <div className="cm-hero__card cm-hero__card--main" onClick={() => openProductById('p2')}>
              <div className="cm-pcard__glow-bar" />
              <div className="hero-card-media">
                <ProductImage src={products[1]?.images?.[0]} alt={products[1]?.title} product={products[1]} />
                <div className="cm-hero__card-tag">⚡ 01 · HOT DEAL OF THE DAY</div>
                <div className="hero-card-views">👁 512 views</div>
              </div>
              <div className="cm-hero__card-info">
                <div className="hero-card-top-row">
                  <span className="card-cat">{products[1].category.toUpperCase()}</span>
                  <span className="hero-save-badge">SAVE ₹28,900</span>
                </div>
                <strong>{products[1].title}</strong>
                <div className="card-bottom">
                  <div className="price-stack">
                    <span className="card-price">₹{products[1].price.toLocaleString('en-IN')}</span>
                    <span className="card-strike">₹{products[1].originalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <span className="card-loc">📍 {products[1].location}</span>
                </div>
                <div className="hero-card-action">
                  <span>Click to Quick View →</span>
                </div>
              </div>
            </div>

            <div className="cm-hero__pulse">
              <span className="cm-hero__pulse-dot" />
              <span>Active hub: <b>{activeCampus === 'Punjab Campus' ? 'Galileo Block' : activeCampus === 'Himachal Campus' ? 'Baddi Gate 3' : 'CIET Hub'}</b> · verified just now</span>
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
              <span className="cm-section__eyebrow">01 · Explore</span>
              <h2>popular.</h2>
            </div>
            <Link to="/categories" className="cm-section__link">View all categories →</Link>
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
              <span className="est-eyebrow">02 · Valuation Terminal</span>
              <h3>Chitkara Resell Estimator</h3>
              <p>Calculate realistic second-hand pricing based on real campus exchange history and current student demand.</p>
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
              <Button type="submit" variant="primary">Calculate Estimate</Button>
            </form>
            
            {estimatedPrice && (
              <div className="estimate-result scale-in">
                <span>Recommended Listing Range:</span>
                <h3>₹{estimatedPrice.min.toLocaleString('en-IN')} — ₹{estimatedPrice.max.toLocaleString('en-IN')}</h3>
                <p>Based on successful sales across the {activeCampus} peer network.</p>
                <Link to="/sell">
                  <Button size="sm" variant="secondary">List This Item Now</Button>
                </Link>
              </div>
            )}
          </div>

          {/* RIGHT: Dynamic Highlights */}
          <div className="cm-campus-highlight">
            <div className="highlight-tag">ZONE RADAR · ACTIVE</div>
            <h3>Active Handover Hotspots</h3>
            <p>Monitored meetup spots on the <strong>{activeCampus}</strong> map with high trade traffic.</p>
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
              <span>&gt; Protocol: Meet in open daylight campus zones for seamless physical handovers.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- INTERACTIVE LATEST CATALOG (WITH CATEGORY TABS) ---------- */}
      <section className="cm-section">
        <div className="container">
          <div className="cm-section__head flex-col items-start gap-12">
            <div>
              <span className="cm-section__eyebrow">03 · Live Feed ({activeCampus.toUpperCase()})</span>
              <h2>catalog.</h2>
            </div>
            {/* Category Ribbon Tabs */}
            <div className="cm-category-tabs">
              <button 
                className={`tab-btn ${selectedCategoryTab === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategoryTab('all')}
              >
                ALL ITEMS
              </button>
              {categories.slice(0, 7).map(cat => (
                <button
                  key={cat.id}
                  className={`tab-btn ${selectedCategoryTab === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategoryTab(cat.id)}
                >
                  {cat.icon} {cat.name.toUpperCase()}
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
              <span className="cm-section__eyebrow">04 · Verified Quality</span>
              <h2>handpicked.</h2>
            </div>
            <Link to="/marketplace" className="cm-section__link">Explore all listings →</Link>
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
              <span className="cm-section__eyebrow">05 · High Velocity</span>
              <h2>trending.</h2>
            </div>
            <Link to="/marketplace" className="cm-section__link">Explore all listings →</Link>
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
                <span className="cm-section__eyebrow" style={{ color: 'var(--success)' }}>06 · Giveaways</span>
                <h2>free items.</h2>
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
                <span className="cm-section__eyebrow" style={{ color: 'var(--warning)' }}>07 · Requests</span>
                <h2>wanted items.</h2>
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
              <span className="cm-section__eyebrow">08 · Verified Peer Feedback</span>
              <h2>reviews.</h2>
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
            <span className="cta-mono-tag">JOIN 4,800+ STUDENTS</span>
            <h2>Got study gear gathering dust in your hostel room?</h2>
            <p>List it in under 2 minutes and connect directly with fellow Chitkara students.</p>
          </div>
          <Link to="/sell"><Button size="lg" variant="outline-light">Sell an Item Now</Button></Link>
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
