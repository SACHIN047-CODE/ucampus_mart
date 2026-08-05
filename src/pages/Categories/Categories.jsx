import { categories } from '../../data/categories';
import CategoryCard from '../../components/CategoryCard/CategoryCard';
import './Categories.css';

export default function Categories() {
  return (
    <div className="cm-catpage">
      <div className="cm-catpage__hero">
        <div className="container">
          <span className="cm-section__eyebrow">Browse by category</span>
          <h1>Everything a student needs</h1>
          <p>From last semester's textbooks to a cycle for the new one — ten categories, all listed by students on your campus.</p>
        </div>
      </div>
      <div className="container">
        <div className="cm-catpage__grid">
          {categories.map((c, i) => (
            <div key={c.id} className="slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <CategoryCard category={c} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
