import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Button from '../../components/Button/Button';
import AuthArt from './AuthArt';
import { apiVerifyEmail, apiFetch } from '../../utils/api';
import './Auth.css';

export default function VerifyOtp() {
  const { showToast, login } = useApp();
  const navigate = useNavigate();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');
  const refs = useRef([]);

  useEffect(() => {
    const pendingEmail = sessionStorage.getItem('campusmart-pending-email') || '';
    setEmail(pendingEmail);

    // Auto-fill dev OTP if available in development mode
    const devOtp = sessionStorage.getItem('campusmart-dev-otp');
    if (devOtp && devOtp.length === 6) {
      setDigits(devOtp.split(''));
    }
  }, []);

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

  const submit = async (e) => {
    e.preventDefault();
    if (digits.some((d) => d === '')) {
      showToast('Enter the full 6-digit code', 'danger');
      return;
    }

    if (!email) {
      showToast('No pending email found. Please log in or register first.', 'error');
      navigate('/login');
      return;
    }

    const code = digits.join('');

    setIsLoading(true);
    try {
      const response = await apiVerifyEmail(email, code);

      if (response.success && response.user) {
        if (response.token) {
          localStorage.setItem('campusmart-token', response.token);
        }
        login(response.user);
        sessionStorage.removeItem('campusmart-pending-email');
        sessionStorage.removeItem('campusmart-dev-otp');
        showToast('Verified successfully! Welcome to CampusMart.');
        navigate('/profile');
      }
    } catch (err) {
      showToast(err.message || 'Verification failed. Please check the code.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    if (!email) {
      showToast('No email found to resend code to.', 'error');
      return;
    }
    setIsResending(true);
    try {
      const response = await apiFetch('/auth/resend-code', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      if (response.data?.devVerificationCode) {
        setDigits(response.data.devVerificationCode.split(''));
      }
      showToast('A new 6-digit code has been sent to your email.');
    } catch (err) {
      showToast(err.message || 'Failed to resend verification code.', 'error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="cm-auth">
      <AuthArt />
      <div className="cm-auth__form-side">
        <form className="cm-auth__box" onSubmit={submit} noValidate>
          <div className="cm-auth__eyebrow">
            <span className="cm-auth__eyebrow-dot" /> Account setup <span>02 / 02</span>
          </div>
          <div className="cm-auth__icon" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </div>
          <h1>Verify your email</h1>
          {!email ? (
            <div className="cm-auth__field" style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
              <label htmlFor="otp-email" style={{ fontSize: '0.85rem', color: '#64748b' }}>Enter the campus email you registered with:</label>
              <input
                id="otp-email"
                type="email"
                placeholder="you@university.edu"
                value={email}
                autoFocus
                onChange={(e) => {
                  setEmail(e.target.value);
                  sessionStorage.setItem('campusmart-pending-email', e.target.value.trim());
                }}
              />
            </div>
          ) : (
            <p style={{ marginBottom: '1.25rem' }}>
              We sent a 6-digit code to <strong>{email}</strong>.{' '}
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem', padding: 0 }}
                onClick={() => setEmail('')}
              >
                (Change email)
              </button>
            </p>
          )}

          <div className="cm-auth__otp">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (refs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                disabled={isLoading}
                aria-label={`Verification code digit ${i + 1}`}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
              />
            ))}
          </div>

          <Button type="submit" size="lg" fullWidth disabled={isLoading}>
            {isLoading ? 'Verifying Code...' : 'Verify & Continue'}
          </Button>

          <p className="cm-auth__foot">
            Didn't receive the email?{' '}
            <button
              type="button"
              className="cm-auth__resend"
              disabled={isResending}
              onClick={resendCode}
            >
              {isResending ? 'Sending...' : 'Click to resend'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
