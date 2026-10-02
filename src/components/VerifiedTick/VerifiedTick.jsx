import './VerifiedTick.css';

export default function VerifiedTick({
  size = 18,
  title = 'Verified Chitkara University student',
  className = '',
}) {
  return (
    <span
      className={`cm-verified-tick ${className}`.trim()}
      title={title}
      aria-label={title}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="12" fill="#16a34a" />
        <path
          d="M7 12.5l3.5 3.5 7-7"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
