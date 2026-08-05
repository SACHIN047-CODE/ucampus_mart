import { Link } from 'react-router-dom';
import Button from '../../components/Button/Button';

export default function NotFound() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
      <span style={{ fontSize: 64, marginBottom: 12 }}>🧭</span>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Page not found</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24, maxWidth: 380 }}>
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/"><Button>Back to Home</Button></Link>
    </div>
  );
}
