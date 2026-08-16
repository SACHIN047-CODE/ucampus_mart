import './Avatar.css';

const GRADIENTS = [
  'linear-gradient(135deg, #e21a22, #ff4d55)',
  'linear-gradient(135deg, #2563eb, #38bdf8)',
  'linear-gradient(135deg, #7c3aed, #c084fc)',
  'linear-gradient(135deg, #059669, #34d399)',
  'linear-gradient(135deg, #ea580c, #fb923c)',
];

function hashGradient(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export default function Avatar({ initials = 'SS', size = 40, online = false }) {
  return (
    <span
      className="cm-avatar"
      style={{
        width: size,
        height: size,
        background: hashGradient(initials),
        fontSize: size * 0.38,
      }}
    >
      {initials}
      {online && <span className="cm-avatar__dot" />}
    </span>
  );
}
