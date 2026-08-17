import { Link } from 'react-router-dom';
import './CategoryCard.css';

export default function CategoryCard({ category }) {
  return (
    <Link to={`/marketplace?category=${category.id}`} className="cm-catcard" style={{ '--cat-color': category.color }}>
      <div className="cm-catcard__top">
        <span className="cm-catcard__icon">{category.icon}</span>
        <span className="cm-catcard__arrow">→</span>
      </div>
      <span className="cm-catcard__name">{category.name}</span>
      <div className="cm-catcard__foot">
        <span className="cm-catcard__count">{category.count} listings</span>
        <span className="cm-catcard__status">Active</span>
      </div>
    </Link>
  );
}
