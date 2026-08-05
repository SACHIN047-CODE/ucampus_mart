import './Button.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
}) {
  const handleClick = (e) => {
    const btn = e.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - btn.getBoundingClientRect().left - diameter / 2}px`;
    circle.style.top = `${e.clientY - btn.getBoundingClientRect().top - diameter / 2}px`;
    circle.classList.add('cm-ripple');
    const existing = btn.getElementsByClassName('cm-ripple')[0];
    if (existing) existing.remove();
    btn.appendChild(circle);
    if (onClick) onClick(e);
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={`cm-btn cm-btn--${variant} cm-btn--${size} ${fullWidth ? 'cm-btn--full' : ''} ${className}`}
    >
      {icon && iconPosition === 'left' && <span className="cm-btn__icon">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="cm-btn__icon">{icon}</span>}
    </button>
  );
}
