import './Avatar.css';

const COLORS = ['#2563EB', '#F59E0B', '#22C55E', '#EF4444', '#1E40AF', '#3B82F6'];

function hashColor(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function Avatar({ initials = '?', size = 40, online = false }) {
  return (
    <span className="cm-avatar" style={{ width: size, height: size, background: hashColor(initials), fontSize: size * 0.38 }}>
      {initials}
      {online && <span className="cm-avatar__dot" />}
    </span>
  );
}
