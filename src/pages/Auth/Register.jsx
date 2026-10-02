import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Button from '../../components/Button/Button';
import AuthArt from './AuthArt';
import { apiRegister, apiGoogleAuth, isNetworkError } from '../../utils/api';
import { isChitkaraEmail } from '../../utils/userUtils';
import { GoogleLogin } from '@react-oauth/google';
import './Auth.css';

export default function Register() {
  const { showToast, login } = useApp();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', hostel: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid campus email address';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);

    if (Object.keys(errs).length === 0) {
      setIsLoading(true);
      try {
        const response = await apiRegister({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          department: form.department || undefined,
          hostel: form.hostel || undefined,
          phone: form.phone || undefined,
        });

        if (response.success) {
          // Store email temporarily so VerifyOtp screen knows where to send verification code
          localStorage.setItem('campusmart-pending-email', form.email.trim());
          if (response.data?.devVerificationCode) {
            localStorage.setItem('campusmart-dev-otp', response.data.devVerificationCode);
          }

          showToast('Account created! Verification code sent to your campus email.');
          navigate('/verify-otp');
        }
      } catch (err) {
        if (err.message?.includes('Unable to connect') || err.message?.includes('fetch') || isNetworkError(err)) {
          const isChitkara = isChitkaraEmail(form.email.trim());
          const newUser = {
            id: 'user-' + Date.now(),
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            department: form.department || (isChitkara ? 'Chitkara University (CSE)' : 'Student'),
            hostel: form.hostel || '',
            phone: form.phone || '',
            isVerified: isChitkara,
          };
          login(newUser);
          showToast(
            isChitkara
              ? 'Account created! Verified Chitkara student status with Green Tick.'
              : 'Account created with standard status (normal account).'
          );
          navigate('/profile');
          return;
        }
        setErrors({ general: err.message || 'Registration failed' });
        showToast(err.message || 'Registration failed', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setErrors({});
    try {
      const response = await apiGoogleAuth(credentialResponse.credential, 'register');
      if (response.success && response.user) {
        if (response.token) {
          localStorage.setItem('campusmart-token', response.token);
        }
        const userIsChitkara = isChitkaraEmail(response.user.email);
        login({
          ...response.user,
          isVerified: userIsChitkara,
        });
        showToast(
          userIsChitkara
            ? `Welcome to CampusMart, ${response.user.name}! Verified Chitkara student (green tick).`
            : `Welcome to CampusMart, ${response.user.name}! Standard account created.`
        );
        navigate('/profile');
      }
    } catch (err) {
      const errMsg = err.message || 'Google registration failed';
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
          <h1>Create your account</h1>
          <p>Sign up instantly with your Google account or email.</p>

          {errors.general && (
            <div className="cm-field-error" style={{ marginBottom: '1rem', padding: '0.6rem 0.8rem', background: '#fee2e2', borderRadius: '6px', color: '#dc2626' }}>
              {errors.general}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '1rem' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                showToast('Google Sign Up was cancelled or failed.', 'error');
              }}
              shape="rectangular"
              theme="outline"
              size="large"
              width="100%"
              text="signup_with"
            />
          </div>

          <div className="cm-auth__divider">or register with campus email</div>

          <div className={`cm-auth__field ${errors.name ? 'has-error' : ''}`}>
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="Ananya Sharma"
              value={form.name}
              disabled={isLoading}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <span className="cm-field-error">{errors.name}</span>}
          </div>

          <div className={`cm-auth__field ${errors.email ? 'has-error' : ''}`}>
            <div className="cm-auth__field-head">
              <label htmlFor="email">Campus / Student Email</label>
              {isChitkaraEmail(form.email) && (
                <span className="cm-auth__domain-badge is-verified">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#16a34a">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="9 12 11 14 15 10" fill="#fff" />
                  </svg>
                  Chitkara Verified
                </span>
              )}
              {form.email.includes('@') && !isChitkaraEmail(form.email) && /^\S+@\S+\.\S+$/.test(form.email.trim()) && (
                <span className="cm-auth__domain-badge is-normal">
                  Standard Account
                </span>
              )}
            </div>
            <div className="cm-auth__input-wrap">
              <input
                id="email"
                type="email"
                placeholder="you@chitkara.edu.in"
                value={form.email}
                disabled={isLoading}
                className={isChitkaraEmail(form.email) ? 'input--chitkara-verified' : ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {isChitkaraEmail(form.email) && (
                <span className="cm-auth__input-tick" title="Official Chitkara email">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#16a34a">
                    <circle cx="12" cy="12" r="12" fill="#16a34a" />
                    <path d="M7 12.5l3.5 3.5 7-7" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </span>
              )}
            </div>
            {errors.email && <span className="cm-field-error">{errors.email}</span>}
            {isChitkaraEmail(form.email) ? (
              <small style={{ color: '#16a34a', fontSize: '11px', marginTop: '3px', display: 'block' }}>
                ✓ Chitkara University email: Verified status and green tick will be granted.
              </small>
            ) : form.email.includes('@') ? (
              <small style={{ color: 'var(--text-soft)', fontSize: '11px', marginTop: '3px', display: 'block' }}>
                ℹ️ Standard email: Normal account without green tick (use @chitkara.edu.in for verified tick).
              </small>
            ) : null}
          </div>

          <div className={`cm-auth__field ${errors.password ? 'has-error' : ''}`}>
            <label htmlFor="password">Password</label>
            <div className="cm-auth__pw-wrap">
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                placeholder="At least 6 characters"
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

          <Button type="submit" size="lg" fullWidth disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Continue to Verification'}
          </Button>

          <p className="cm-auth__foot">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
