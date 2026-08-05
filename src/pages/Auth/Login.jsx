import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Button from '../../components/Button/Button';
import AuthArt from './AuthArt';
import './Auth.css';

export default function Login() {
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      showToast('Welcome back! Logged in successfully.');
      navigate('/profile');
    }
  };

  return (
    <div className="cm-auth">
      <AuthArt />
      <div className="cm-auth__form-side">
        <form className="cm-auth__box" onSubmit={submit} noValidate>
          <h1>Welcome back</h1>
          <p>Log in to continue buying and selling on your campus.</p>

          <div className="cm-auth__social">
            <button type="button" onClick={() => showToast('Google sign-in coming soon')}>Google</button>
            <button type="button" onClick={() => showToast('Campus SSO coming soon')}>Campus SSO</button>
          </div>
          <div className="cm-auth__divider">or continue with email</div>

          <div className={`cm-auth__field ${errors.email ? 'has-error' : ''}`}>
            <label htmlFor="email">Campus Email</label>
            <input id="email" type="email" placeholder="you@university.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {errors.email && <span className="cm-field-error">{errors.email}</span>}
          </div>

          <div className={`cm-auth__field ${errors.password ? 'has-error' : ''}`}>
            <label htmlFor="password">Password</label>
            <div className="cm-auth__pw-wrap">
              <input id="password" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <button type="button" className="cm-auth__pw-toggle" onClick={() => setShowPw((v) => !v)} aria-label="Toggle password visibility">
                {showPw ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.6 21.6 0 0 1 5.06-6.06M9.9 4.24A10.6 10.6 0 0 1 12 4c7 0 11 8 11 8a21.6 21.6 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
            {errors.password && <span className="cm-field-error">{errors.password}</span>}
          </div>

          <div className="cm-auth__row">
            <label><input type="checkbox" /> Remember me</label>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <Button type="submit" size="lg" fullWidth>Log In</Button>

          <p className="cm-auth__foot">New to CampusMart? <Link to="/register">Create an account</Link></p>
        </form>
      </div>
    </div>
  );
}
