import Avatar from '../Avatar/Avatar';
import './ReviewCard.css';

export default function ReviewCard({ review }) {
  return (
    <div className="cm-review">
      <div className="cm-review__stars" aria-label={`${review.rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill={i < review.rating ? '#F59E0B' : 'none'} stroke="#F59E0B" strokeWidth="1.5">
            <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" />
          </svg>
        ))}
      </div>
      <p className="cm-review__text">"{review.text}"</p>
      <div className="cm-review__person">
        <Avatar initials={review.initials} size={42} />
        <div>
          <div className="cm-review__name">{review.name}</div>
          <div className="cm-review__course">{review.course}</div>
        </div>
      </div>
    </div>
  );
}
