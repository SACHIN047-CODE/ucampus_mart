import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Button from '../../components/Button/Button';
import AuthArt from './AuthArt';
import './Auth.css';

export default function VerifyOtp() {
  const { showToast, user, login } = useApp();
  const navigate = useNavigate();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const refs = useRef([]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const submit = (e) => {
    e.preventDefault();
    if (digits.some((d) => d === '')) {
      showToast('Enter the full 6-digit code', 'danger');
      return;
    }
    if (!user) {
      login({ name: 'Sachin Sharma', email: 'sachin.sharma@chitkara.edu.in', initials: 'SS' });
    }
    showToast('Email verified! Welcome to CampusMart.');
    navigate('/profile');
  };

  return (
    <div className="cm-auth">
      <AuthArt />
      <div className="cm-auth__form-side">
        <form className="cm-auth__box" onSubmit={submit} noValidate>
          <div className="cm-auth__eyebrow"><span className="cm-auth__eyebrow-dot" /> Account setup <span>02 / 02</span></div>
          <div className="cm-auth__icon" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
          </div>
          <h1>Verify your email</h1>
          <p>We sent a 6-digit code to your campus email. Enter it below to finish setting up your account.</p>

          <div className="cm-auth__otp">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (refs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                aria-label={`Verification code digit ${i + 1}`}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
              />
            ))}
          </div>

          <div className="cm-auth__hint"><span>●</span> Code expires in 10 minutes</div>

          <Button type="submit" size="lg" fullWidth>Verify Account</Button>

          <p className="cm-auth__foot">Didn't get a code? <Link to="#" onClick={(e) => { e.preventDefault(); showToast('Code resent'); }}>Resend</Link></p>
        </form>
      </div>
    </div>
  );
}
