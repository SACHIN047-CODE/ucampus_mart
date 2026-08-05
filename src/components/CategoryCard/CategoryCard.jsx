import { Link } from 'react-router-dom';
import './CategoryCard.css';

export default function CategoryCard({ category }) {
  return (
    <Link to={`/marketplace?category=${category.id}`} className="cm-catcard" style={{ '--cat-color': category.color }}>
      <span className="cm-catcard__icon">{category.icon}</span>
      <span className="cm-catcard__name">{category.name}</span>
      <span className="cm-catcard__count">{category.count} listings</span>
    </Link>
  );
}
