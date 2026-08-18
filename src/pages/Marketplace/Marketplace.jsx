import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { categories } from '../../data/categories';
import ProductCard from '../../components/ProductCard/ProductCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import Button from '../../components/Button/Button';
import './Marketplace.css';

const PAGE_SIZE = 8;
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

export default function Marketplace() {
  const { products } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [condition, setCondition] = useState('all');
  const [maxPrice, setMaxPrice] = useState(50000);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setCategory(searchParams.get('category') || 'all');
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (query && !p.title.toLowerCase().includes(query.toLowerCase())) return false;
      if (category !== 'all' && p.category !== category) return false;
      if (condition !== 'all' && p.condition !== condition) return false;
      if (p.price > maxPrice) return false;
      return true;
    });
    if (sort === 'price-low') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-high') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'popular') list = [...list].sort((a, b) => (b.views || 0) - (a.views || 0));
    if (sort === 'newest') {
      // products array is ordered newest first
      list = [...list];
    }
    return list;
  }, [products, query, category, condition, maxPrice, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [query, category, condition, maxPrice, sort]);

  const activeCategory = categories.find((c) => c.id === category);

  return (
    <div className="cm-market">
      <div className="cm-market__hero container">
        <h1>{activeCategory ? activeCategory.name : 'Marketplace'}</h1>
        <p>{filtered.length} listings {query && <>for "<b>{query}</b>"</>}</p>
      </div>

      <div className="container cm-market__layout">
        <button className="cm-market__filter-toggle" onClick={() => setFiltersOpen((v) => !v)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="12" y1="18" x2="20" y2="18" /><circle cx="6" cy="12" r="2" /><circle cx="10" cy="18" r="2" /></svg>
          Filters
        </button>

        <aside className={`cm-market__filters ${filtersOpen ? 'is-open' : ''}`}>
          <div className="cm-filter-group">
            <h4>Category</h4>
            <div className="cm-filter-list">
              <button className={category === 'all' ? 'is-active' : ''} onClick={() => { setCategory('all'); setSearchParams({}); }}>All Categories</button>
              {categories.map((c) => (
                <button key={c.id} className={category === c.id ? 'is-active' : ''} onClick={() => { setCategory(c.id); setSearchParams({ category: c.id }); }}>
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="cm-filter-group">
            <h4>Condition</h4>
            <div className="cm-filter-list">
              <button className={condition === 'all' ? 'is-active' : ''} onClick={() => setCondition('all')}>Any Condition</button>
              {CONDITIONS.map((c) => (
                <button key={c} className={condition === c ? 'is-active' : ''} onClick={() => setCondition(c)}>{c}</button>
              ))}
            </div>
          </div>

          <div className="cm-filter-group">
            <h4>Max Price: ₹{maxPrice.toLocaleString('en-IN')}</h4>
            <input
              type="range" min="0" max="50000" step="500"
              value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="cm-range"
            />
          </div>

          <Button variant="secondary" size="sm" fullWidth onClick={() => { setCategory('all'); setCondition('all'); setMaxPrice(50000); setQuery(''); setSearchParams({}); }}>
            Reset Filters
          </Button>
        </aside>

        <div className="cm-market__results">
          <div className="cm-market__toolbar">
            <input
              type="text"
              className="cm-market__search"
              placeholder="Search within results…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="cm-market__sort">
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {paginated.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No listings match your filters"
              subtitle="Try widening your price range or clearing a filter to see more results."
              action={<Button variant="secondary" onClick={() => { setCategory('all'); setCondition('all'); setMaxPrice(50000); setQuery(''); }}>Clear Filters</Button>}
            />
          ) : (
            <>
              <div className="cm-product-grid cm-product-grid--4">
                {paginated.map((p, i) => <ProductCard key={p.id} product={p} style={{ animationDelay: `${i * 0.04}s` }} />)}
              </div>

              {totalPages > 1 && (
                <div className="cm-pagination">
                  <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button key={i} className={page === i + 1 ? 'is-active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>
                  ))}
                  <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
