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
import './Home.css';

export default function Home() {
  const { products } = useApp();
  const featured = products.slice(0, 4);
  const latest = [...products].reverse().slice(0, 8);
  const trending = products.filter((p) => p.views > 150).slice(0, 4);
  const free = products.filter((p) => p.free).slice(0, 3);
  const wanted = products.filter((p) => p.wanted).slice(0, 3);

  return (
    <div className="cm-home">
      {/* ---------- HERO ---------- */}
      <section className="cm-hero">
        <div className="cm-hero__glow" />
        <div className="container cm-hero__inner">
          <div className="cm-hero__copy slide-up">
            <span className="cm-hero__eyebrow">Verified students only · Zero listing fees</span>
            <h1>Buy &amp; Sell<br />Within Your <span>Campus</span></h1>
            <p>Find affordable second-hand books, electronics, hostel essentials, cycles, lab equipment, and more from verified students.</p>
            <div className="cm-hero__cta">
              <Link to="/marketplace"><Button size="lg">Browse Marketplace</Button></Link>
              <Link to="/sell"><Button size="lg" variant="secondary">Sell an Item</Button></Link>
            </div>
            <div className="cm-hero__search"><SearchBar size="lg" /></div>
          </div>

          <div className="cm-hero__art slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="cm-hero__card cm-hero__card--main">
              <img src={products[1].images[0]} alt="" />
              <div className="cm-hero__card-tag">🔥 Trending</div>
              <div className="cm-hero__card-info">
                <span>{products[1].title}</span>
                <strong>₹{products[1].price.toLocaleString('en-IN')}</strong>
              </div>
            </div>
            <div className="cm-hero__card cm-hero__card--float1">
              <img src={products[2].images[0]} alt="" />
              <div className="cm-hero__card-info cm-hero__card-info--sm">
                <span>{products[2].title.slice(0, 22)}…</span>
                <strong>₹{products[2].price.toLocaleString('en-IN')}</strong>
              </div>
            </div>
            <div className="cm-hero__pulse">
              <span className="cm-hero__pulse-dot" />
              New listing near <b>North Campus</b> · 2 min ago
            </div>
          </div>
        </div>
      </section>

      {/* ---------- STATS ---------- */}
      <section className="cm-stats-strip">
        <div className="container cm-stats-strip__grid">
          {stats.map((s) => <StatsCard key={s.id} value={s.value} suffix={s.suffix} label={s.label} />)}
        </div>
      </section>

      {/* ---------- CATEGORIES ---------- */}
      <section className="cm-section">
        <div className="container">
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
            {featured.map((p, i) => <ProductCard key={p.id} product={p} style={{ animationDelay: `${i * 0.06}s` }} />)}
          </div>
        </div>
      </section>

      {/* ---------- LATEST ---------- */}
      <section className="cm-section">
        <div className="container">
          <div className="cm-section__head">
            <div>
              <span className="cm-section__eyebrow">Just In</span>
              <h2>Latest Listings</h2>
            </div>
            <Link to="/marketplace" className="cm-section__link">View all →</Link>
          </div>
          <div className="cm-product-grid cm-product-grid--4">
            {latest.map((p, i) => <ProductCard key={p.id} product={p} style={{ animationDelay: `${i * 0.05}s` }} />)}
          </div>
        </div>
      </section>

      {/* ---------- TRENDING ---------- */}
      <section className="cm-section cm-section--tint">
        <div className="container">
          <div className="cm-section__head">
            <div>
              <span className="cm-section__eyebrow">Most viewed</span>
              <h2>Trending Products</h2>
            </div>
            <Link to="/marketplace" className="cm-section__link">View all →</Link>
          </div>
          <div className="cm-product-grid cm-product-grid--4">
            {trending.map((p, i) => <ProductCard key={p.id} product={p} style={{ animationDelay: `${i * 0.06}s` }} />)}
          </div>
        </div>
      </section>

      {/* ---------- FREE + WANTED ---------- */}
      <section className="cm-section">
        <div className="container cm-split">
          <div className="cm-split__col">
            <div className="cm-section__head cm-section__head--tight">
              <div>
                <span className="cm-section__eyebrow" style={{ color: 'var(--success)' }}>Pay it forward</span>
                <h2>Free Items</h2>
              </div>
            </div>
            <div className="cm-product-grid cm-product-grid--3">
              {free.map((p) => <ProductCard key={p.id} product={p} />)}
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
              {wanted.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- REVIEWS ---------- */}
      <section className="cm-section cm-section--tint">
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
            <h2>Got something gathering dust?</h2>
            <p>List it in under 2 minutes and reach thousands of students on your campus.</p>
          </div>
          <Link to="/sell"><Button size="lg" variant="outline-light">Sell an Item</Button></Link>
        </div>
      </section>
    </div>
  );
}
