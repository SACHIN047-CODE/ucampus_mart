import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { categories } from '../../data/categories';
import { reviews } from '../../data/reviews';
import SearchBar from '../../components/SearchBar/SearchBar';
import CategoryCard from '../../components/CategoryCard/CategoryCard';
import ProductCard from '../../components/ProductCard/ProductCard';
import ReviewCard from '../../components/ReviewCard/ReviewCard';
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

  // Editorial Reference Carousel State
  const [heroSlideIdx, setHeroSlideIdx] = useState(0);
  const [isSlidePlaying, setIsSlidePlaying] = useState(true);

  const heroSlides = [
    {
      id: 'slide-1',
      tag: 'CHITKARA · STUDENT COMMERCE',
      headline: 'Gear That Defines Your Campus Life',
      sub: 'Trade laptops, course books, bicycles and dorm essentials directly with campus peers with zero platform fees.',
      ctaText: 'Explore Now',
      ctaLink: '/marketplace',
      secondaryCta: 'Sell an Item',
      secondaryLink: '/sell',
      imgSrc: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop',
      alt: 'Campus Student Lifestyle',
      badge: 'CAMPUS TRENDING',
    },
    {
      id: 'slide-2',
      tag: 'ACADEMIC ESSENTIALS',
      headline: 'Books That Elevate Your Semester Grades',
      sub: 'Save up to 80% on verified engineering, medical, and management textbooks with notes from seniors.',
      ctaText: 'Browse Textbooks',
      ctaLink: '/marketplace?category=books',
      secondaryCta: 'List Your Notes',
      secondaryLink: '/sell',
      imgSrc: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop',
      alt: 'University Study Essentials',
      badge: 'SAVE UP TO 80%',
    },
    {
      id: 'slide-3',
      tag: 'CAMPUS MOBILITY',
      headline: 'Rides That Beat The Morning Lecture Rush',
      sub: 'Verified bicycles, calculators, and lab equipment ready for instant physical hostel handovers.',
      ctaText: 'View Bicycles',
      ctaLink: '/marketplace?category=cycles',
      secondaryCta: 'List a Cycle',
      secondaryLink: '/sell',
      imgSrc: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=1200&auto=format&fit=crop',
      alt: 'Campus Mobility',
      badge: 'COMMUTE READY',
    },
  ];

  useEffect(() => {
    if (!isSlidePlaying) return;
    const interval = setInterval(() => {
      setHeroSlideIdx((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isSlidePlaying, heroSlides.length]);

  const currentSlide = heroSlides[heroSlideIdx];

  const handlePrevSlide = () => {
    setHeroSlideIdx((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleNextSlide = () => {
    setHeroSlideIdx((prev) => (prev + 1) % heroSlides.length);
  };

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

  const heroProduct = products.find(p => p.id === 'p1') || products[0];

  return (
    <div className="cm-home">
      {/* ---------- EDITORIAL HERO (REFERENCE DESIGN ARCHITECTURE) ---------- */}
      <section className="cm-hero-editorial">
        <div className="container">
          <div className="cm-hero-banner">
            <div className="cm-hero-banner__bg-art" />

            <div className="cm-hero-banner__inner">
              {/* Left Copy Column */}
              <div className="cm-hero-banner__copy slide-up" key={currentSlide.id}>
                <div className="cm-hero-banner__telemetry">
                  <span className="editorial-mono-badge">
                    <span className="editorial-dot" />
                    {currentSlide.tag}
                  </span>
                  <span className="editorial-slide-num">
                    0{heroSlideIdx + 1} / 0{heroSlides.length}
                  </span>
                </div>

                <h1 className="cm-hero-banner__headline">
                  {currentSlide.headline}
                </h1>

                <p className="cm-hero-banner__sub">
                  {currentSlide.sub}
                </p>

                {/* Pill-shaped CTA Buttons matching reference photo */}
                <div className="cm-hero-banner__actions">
                  <Link to={currentSlide.ctaLink} className="editorial-pill-btn editorial-pill-btn--primary">
                    <span>{currentSlide.ctaText}</span>
                    <span className="editorial-pill-arrow">→</span>
                  </Link>
                  <Link to={currentSlide.secondaryLink} className="editorial-pill-btn editorial-pill-btn--secondary">
                    <span>{currentSlide.secondaryCta}</span>
                    <span className="editorial-pill-plus">＋</span>
                  </Link>
                </div>

                {/* Integrated Search Bar */}
                <div className="cm-hero-banner__search">
                  <SearchBar size="lg" />
                </div>

                {/* Metrics & Campus Radar */}
                <div className="cm-hero-banner__metrics">
                  <div className="banner-metric">
                    <strong>{products.length}</strong>
                    <span>Campus Listings</span>
                  </div>
                  <div className="banner-metric">
                    <strong>100%</strong>
                    <span>Direct Meetup</span>
                  </div>
                  <div className="banner-metric">
                    <strong>0%</strong>
                    <span>Middleman Fee</span>
                  </div>
                </div>

                <div className="cm-hero-banner__status">
                  <span className="status-ping" />
                  <span>
                    Active Hub: <b>{activeCampus}</b> · Direct peer handovers
                  </span>
                </div>
              </div>

              {/* Right Media / Lifestyle Image Column */}
              <div className="cm-hero-banner__media slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="cm-hero-banner__img-wrapper">
                  <img
                    src={currentSlide.imgSrc}
                    alt={currentSlide.alt}
                    className="cm-hero-banner__img"
                    key={`hero-img-${currentSlide.id}`}
                  />
                  <div className="cm-hero-banner__img-scrim" />

                  {/* Floating Deal Card */}
                  {heroProduct && (
                    <div 
                      className="cm-hero-banner__featured-pill"
                      onClick={() => openProductById(heroProduct.id)}
                    >
                      <div className="hero-pill-badge">{currentSlide.badge}</div>
                      <div className="hero-pill-info">
                        <strong>{heroProduct.title}</strong>
                        <span>₹{heroProduct.price?.toLocaleString('en-IN')} · {heroProduct.location}</span>
                      </div>
                      <div className="hero-pill-arrow">→</div>
                    </div>
                  )}
                </div>

                {/* Circular Slider Controls (Exact match to reference bottom-right buttons) */}
                <div className="cm-hero-banner__controls" aria-label="Carousel navigation">
                  <button
                    type="button"
                    className={`cm-ctrl-circle ${isSlidePlaying ? 'is-active' : ''}`}
                    onClick={() => setIsSlidePlaying(!isSlidePlaying)}
                    title={isSlidePlaying ? 'Pause slide rotation' : 'Resume slide rotation'}
                  >
                    {isSlidePlaying ? (
                      <span className="ctrl-pause-icon">❚❚</span>
                    ) : (
                      <span className="ctrl-play-icon">▶</span>
                    )}
                  </button>
                  <button
                    type="button"
                    className="cm-ctrl-circle"
                    onClick={handlePrevSlide}
                    title="Previous slide"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="cm-ctrl-circle"
                    onClick={handleNextSlide}
                    title="Next slide"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ---------- 3 SPOTLIGHT SHOWCASE CARDS (MATCHING REFERENCE CARDS ROW) ---------- */}
          <div className="cm-spotlight-row">
            <Link to="/marketplace?category=electronics" className="cm-spotlight-card">
              <div className="cm-spotlight-card__top">
                <span className="cm-spotlight-card__badge">Minimilist Badge</span>
              </div>
              <div className="cm-spotlight-card__body">
                <h3 className="cm-spotlight-card__title">Apple<br />MacBooks</h3>
                <div className="cm-spotlight-card__visual">
                  <img
                    src="https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&auto=format&fit=crop"
                    alt="Apple MacBooks"
                    loading="lazy"
                  />
                </div>
              </div>
            </Link>

            <Link to="/marketplace?category=books" className="cm-spotlight-card">
              <div className="cm-spotlight-card__top">
                <span className="cm-spotlight-card__badge">Academic Books</span>
              </div>
              <div className="cm-spotlight-card__body">
                <h3 className="cm-spotlight-card__title">Academic<br />Books</h3>
                <div className="cm-spotlight-card__visual">
                  <img
                    src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop"
                    alt="Academic Books"
                    loading="lazy"
                  />
                </div>
              </div>
            </Link>

            <Link to="/marketplace?category=cycles" className="cm-spotlight-card">
              <div className="cm-spotlight-card__top">
                <span className="cm-spotlight-card__badge">Minimalist City Bike</span>
              </div>
              <div className="cm-spotlight-card__body">
                <h3 className="cm-spotlight-card__title">Minimalist<br />City Bike</h3>
                <div className="cm-spotlight-card__visual">
                  <img
                    src="https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop"
                    alt="Minimalist City Bike"
                    loading="lazy"
                  />
                </div>
              </div>
            </Link>
          </div>
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
