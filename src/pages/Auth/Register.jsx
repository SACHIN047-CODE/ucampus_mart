import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Button from '../../components/Button/Button';
import AuthArt from './AuthArt';
import './Auth.css';

export default function Register() {
  const { showToast, login } = useApp();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      const initials = form.name.trim().split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'SS';
      login({
        name: form.name.trim(),
        email: form.email,
        initials,
      });
      showToast('Account created! Please verify your email.');
      navigate('/verify-otp');
    }
  };

  return (
    <div className="cm-auth">
      <AuthArt />
      <div className="cm-auth__form-side">
        <form className="cm-auth__box" onSubmit={submit} noValidate>
          <h1>Create your account</h1>
          <p>Sign up with your campus email to get a verified badge.</p>

          <div className={`cm-auth__field ${errors.name ? 'has-error' : ''}`}>
            <label htmlFor="name">Full Name</label>
            <input id="name" type="text" placeholder="Ananya Sharma" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            {errors.name && <span className="cm-field-error">{errors.name}</span>}
          </div>

          <div className={`cm-auth__field ${errors.email ? 'has-error' : ''}`}>
            <label htmlFor="email">Campus Email</label>
            <input id="email" type="email" placeholder="you@university.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {errors.email && <span className="cm-field-error">{errors.email}</span>}
          </div>

          <div className={`cm-auth__field ${errors.password ? 'has-error' : ''}`}>
            <label htmlFor="password">Password</label>
            <div className="cm-auth__pw-wrap">
              <input id="password" type={showPw ? 'text' : 'password'} placeholder="At least 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
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
            <label><input type="checkbox" required /> I agree to the Terms &amp; Privacy Policy</label>
          </div>

          <Button type="submit" size="lg" fullWidth>Create Account</Button>

          <p className="cm-auth__foot">Already have an account? <Link to="/login">Log in</Link></p>
        </form>
      </div>
    </div>
  );
}
