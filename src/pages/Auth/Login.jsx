import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Button from '../../components/Button/Button';
import AuthArt from './AuthArt';
import { apiLogin, apiGoogleAuth, isNetworkError } from '../../utils/api';
import { isChitkaraEmail } from '../../utils/userUtils';
import { GoogleLogin } from '@react-oauth/google';
import './Auth.css';

export default function Login() {
  const { showToast, login } = useApp();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const trimmedEmail = form.email.trim();
  const isChitkara = isChitkaraEmail(trimmedEmail);
  const isFormatValid = /^\S+@\S+\.\S+$/.test(trimmedEmail);
  const isGeneralEmail = isFormatValid && !isChitkara;

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) errs.email = 'Enter a valid campus email address';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);

    if (Object.keys(errs).length === 0) {
      setIsLoading(true);
      try {
        const response = await apiLogin(trimmedEmail, form.password);

        if (response.requiresOtp) {
          localStorage.setItem('campusmart-pending-email', trimmedEmail);
          if (response.devVerificationCode) {
            localStorage.setItem('campusmart-dev-otp', response.devVerificationCode);
          }
          showToast('Verification code sent to your email! Please enter your OTP.');
          navigate('/verify-otp');
          return;
        }

        if (response.success && response.user) {
          if (response.token) {
            localStorage.setItem('campusmart-token', response.token);
          }

          const resolvedUser = {
            ...response.user,
            isVerified: isChitkara,
          };
          login(resolvedUser);
          showToast(
            isChitkara
              ? `Welcome back, ${resolvedUser.name}! Verified Chitkara student account (Green Tick active).`
              : `Welcome back, ${resolvedUser.name}! Logged in with standard account (Normal status).`,
            isChitkara ? 'success' : 'default'
          );
          navigate('/profile');
        }
      } catch (err) {
        if (isNetworkError(err)) {
          console.warn('Backend login unavailable, using local session:', err);
          const namePart = trimmedEmail.split('@')[0];
          const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1).replace(/[._]/g, ' ');
          const fallbackUser = {
            id: 'user-' + Date.now(),
            name: formattedName || (isChitkara ? 'Chitkara Student' : 'Student'),
            email: trimmedEmail.toLowerCase(),
            role: 'STUDENT',
            department: isChitkara ? 'B.Tech CSE, Chitkara University' : 'General Student',
            hostel: isChitkara ? 'Chitkara Hostel Block B' : 'Off-Campus',
            isVerified: isChitkara,
          };

          login(fallbackUser);
          showToast(
            isChitkara
              ? `Welcome, ${fallbackUser.name}! Verified Chitkara student account with Green Tick.`
              : `Welcome, ${fallbackUser.name}! Logged in as standard user (no green tick).`,
            isChitkara ? 'success' : 'default'
          );
          navigate('/profile');
        } else {
          const errMsg = err.message || 'Login failed';
          setErrors({ general: errMsg });
          showToast(errMsg, 'error');
        }
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
        const userIsChitkara = isChitkaraEmail(response.user.email);
        const user = {
          ...response.user,
          isVerified: userIsChitkara,
        };
        login(user);
        showToast(
          userIsChitkara
            ? `Welcome back, ${user.name}! Verified Chitkara student account (Green Tick active).`
            : `Welcome back, ${user.name}! Logged in with Google standard account.`,
          userIsChitkara ? 'success' : 'default'
        );
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
          <p>Log in with your Chitkara University ID or personal email.</p>

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
            <div className="cm-auth__field-head">
              <label htmlFor="email">Campus / Student Email</label>
              {isChitkara && (
                <span className="cm-auth__domain-badge is-verified">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#16a34a">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="9 12 11 14 15 10" fill="#fff" />
                  </svg>
                  Chitkara Verified
                </span>
              )}
              {isGeneralEmail && (
                <span className="cm-auth__domain-badge is-normal">
                  Standard Account
                </span>
              )}
            </div>

            <div className="cm-auth__input-wrap">
              <input
                id="email"
                type="email"
                placeholder="e.g. rollnumber@chitkara.edu.in"
                value={form.email}
                disabled={isLoading}
                className={isChitkara ? 'input--chitkara-verified' : ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {isChitkara && (
                <span className="cm-auth__input-tick" title="Official Chitkara email: Verified Green Tick active">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#16a34a">
                    <circle cx="12" cy="12" r="12" fill="#16a34a" />
                    <path d="M7 12.5l3.5 3.5 7-7" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </span>
              )}
            </div>
            {errors.email && <span className="cm-field-error">{errors.email}</span>}

            {/* Real-time Dynamic Feedback Box */}
            {isChitkara && (
              <div className="cm-auth__hint-box is-chitkara-active">
                <div className="cm-auth__hint-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#16a34a">
                    <circle cx="12" cy="12" r="12" fill="#16a34a" />
                    <path d="M7 12.5l3.5 3.5 7-7" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </div>
                <div className="cm-auth__hint-text">
                  <strong>Official Chitkara Email Verified</strong>
                  <span>Logging in with this email grants the <em>Official Green Tick</em> on your student profile.</span>
                </div>
              </div>
            )}

            {isGeneralEmail && (
              <div className="cm-auth__hint-box is-normal-active">
                <div className="cm-auth__hint-icon">ℹ️</div>
                <div className="cm-auth__hint-text">
                  <strong>Standard Student Email</strong>
                  <span>Normal profile access. No green tick will be displayed (requires <em>@chitkara.edu.in</em>).</span>
                </div>
              </div>
            )}
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
            {isLoading ? 'Logging In...' : (isChitkara ? 'Log In as Verified Student ✓' : 'Log In')}
          </Button>

          <p className="cm-auth__foot">
            New to CampusMart? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
