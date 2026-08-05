import './EmptyState.css';

export default function EmptyState({ icon = '📦', title, subtitle, action }) {
  return (
    <div className="cm-empty fade-in">
      <div className="cm-empty__icon">{icon}</div>
      <h3 className="cm-empty__title">{title}</h3>
      {subtitle && <p className="cm-empty__subtitle">{subtitle}</p>}
      {action && <div className="cm-empty__action">{action}</div>}
    </div>
  );
}
