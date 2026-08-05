import './Badge.css';

export default function Badge({ children, variant = 'default' }) {
  return <span className={`cm-badge cm-badge--${variant}`}>{children}</span>;
}
