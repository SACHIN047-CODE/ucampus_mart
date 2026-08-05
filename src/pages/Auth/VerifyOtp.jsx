import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Button from '../../components/Button/Button';
import AuthArt from './AuthArt';
import './Auth.css';

export default function VerifyOtp() {
  const { showToast } = useApp();
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
    showToast('Email verified! Welcome to CampusMart.');
    navigate('/profile');
  };

  return (
    <div className="cm-auth">
      <AuthArt />
      <div className="cm-auth__form-side">
        <form className="cm-auth__box" onSubmit={submit} noValidate>
          <h1>Verify your email</h1>
          <p>We sent a 6-digit code to your campus email. Enter it below.</p>

          <div className="cm-auth__otp">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (refs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
              />
            ))}
          </div>

          <Button type="submit" size="lg" fullWidth>Verify Account</Button>

          <p className="cm-auth__foot">Didn't get a code? <Link to="#" onClick={(e) => { e.preventDefault(); showToast('Code resent'); }}>Resend</Link></p>
        </form>
      </div>
    </div>
  );
}
