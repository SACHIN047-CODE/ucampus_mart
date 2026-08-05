import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Button from '../../components/Button/Button';
import AuthArt from './AuthArt';
import './Auth.css';

export default function ForgotPassword() {
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    showToast('Reset code sent to your email');
    navigate('/verify-otp');
  };

  return (
    <div className="cm-auth">
      <AuthArt />
      <div className="cm-auth__form-side">
        <form className="cm-auth__box" onSubmit={submit} noValidate>
          <h1>Forgot your password?</h1>
          <p>Enter your campus email and we'll send you a code to reset it.</p>

          <div className={`cm-auth__field ${error ? 'has-error' : ''}`}>
            <label htmlFor="email">Campus Email</label>
            <input id="email" type="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
            {error && <span className="cm-field-error">{error}</span>}
          </div>

          <Button type="submit" size="lg" fullWidth>Send Reset Code</Button>

          <p className="cm-auth__foot">Remembered it? <Link to="/login">Back to login</Link></p>
        </form>
      </div>
    </div>
  );
}
