import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Button from '../../components/Button/Button';
import AuthArt from './AuthArt';
import { apiLogin, apiGoogleAuth } from '../../utils/api';
import { GoogleLogin } from '@react-oauth/google';
import './Auth.css';

export default function Login() {
  const { showToast, login } = useApp();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid campus email address';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);

    if (Object.keys(errs).length === 0) {
      setIsLoading(true);
      try {
        const response = await apiLogin(form.email.trim(), form.password);

        if (response.requiresOtp) {
          sessionStorage.setItem('campusmart-pending-email', form.email.trim());
          if (response.devVerificationCode) {
            sessionStorage.setItem('campusmart-dev-otp', response.devVerificationCode);
          }
          showToast('Verification code sent to your email! Please enter your OTP.');
          navigate('/verify-otp');
          return;
        }

        if (response.success && response.user) {
          // Store token in localStorage for cross-check alongside HTTP-only cookie
          if (response.token) {
            localStorage.setItem('campusmart-token', response.token);
          }

          login(response.user);
          showToast(`Welcome back, ${response.user.name}! Logged in successfully.`);
          navigate('/profile');
        }
      } catch (err) {
        setErrors({ general: err.message || 'Login failed. Please check your credentials.' });
        showToast(err.message || 'Login failed', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setErrors({});
    try {
      const response = await apiGoogleAuth(credentialResponse.credential, 'login');
      if (response.success && response.user) {
        if (response.token) {
          localStorage.setItem('campusmart-token', response.token);
        }
        login(response.user);
        showToast(`Welcome back, ${response.user.name}! Logged in with Google.`);
        navigate('/profile');
      }
    } catch (err) {
      const errMsg = err.message || 'Google sign in failed';
      setErrors({ general: errMsg });
      showToast(errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cm-auth">
      <AuthArt />
      <div className="cm-auth__form-side">
        <form className="cm-auth__box" onSubmit={submit} noValidate>
          <h1>Welcome back</h1>
          <p>Log in with your real Google account or campus credentials.</p>

          {errors.general && (
            <div className="cm-field-error" style={{ marginBottom: '1rem', padding: '0.6rem 0.8rem', background: '#fee2e2', borderRadius: '6px', color: '#dc2626' }}>
              {errors.general}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '1rem' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                showToast('Google Sign In was cancelled or failed.', 'error');
              }}
              shape="rectangular"
              theme="outline"
              size="large"
              width="100%"
              text="signin_with"
            />
          </div>

          <div className="cm-auth__divider">or continue with email</div>

          <div className={`cm-auth__field ${errors.email ? 'has-error' : ''}`}>
            <label htmlFor="email">Campus Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@university.edu"
              value={form.email}
              disabled={isLoading}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <span className="cm-field-error">{errors.email}</span>}
          </div>

          <div className={`cm-auth__field ${errors.password ? 'has-error' : ''}`}>
            <label htmlFor="password">Password</label>
            <div className="cm-auth__pw-wrap">
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                disabled={isLoading}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                className="cm-auth__pw-toggle"
                onClick={() => setShowPw((v) => !v)}
                aria-label="Toggle password visibility"
              >
                {showPw ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.6 21.6 0 0 1 5.06-6.06M9.9 4.24A10.6 10.6 0 0 1 12 4c7 0 11 8 11 8a21.6 21.6 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <span className="cm-field-error">{errors.password}</span>}
          </div>

          <div className="cm-auth__row">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <Button type="submit" size="lg" fullWidth disabled={isLoading}>
            {isLoading ? 'Logging In...' : 'Log In'}
          </Button>

          <p className="cm-auth__foot">
            New to CampusMart? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
