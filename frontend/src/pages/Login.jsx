import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import PublicLayout from '../components/common/PublicLayout';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => {
    setError(''); // clear error on any change
    setForm(p => ({ ...p, [k]: v }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic client-side validation before hitting server
    if (!form.email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!form.password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(form.email.trim().toLowerCase(), form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'admin' ? '/admin' : user.role === 'ngo' ? '/ngo' : '/donor');
    } catch (err) {
      const data = err.response?.data;
      const status = err.response?.status;

      if (data?.needsVerification) {
        // Backend already resent OTP; tell the user and redirect
        toast('A new OTP has been sent to your email.', { icon: '📧' });
        navigate('/verify-otp', {
          state: { userId: data.userId, email: form.email.trim().toLowerCase() },
        });
        return;
      }

      if (data?.pendingApproval) {
        setError(
          'Your NGO account is pending admin approval. You will be notified by email once reviewed.'
        );
        return;
      }

      // 401 = wrong credentials (most common case — make it clear to user)
      if (status === 401) {
        setError('Incorrect email or password. Please try again.');
        return;
      }

      // Everything else — show whatever the server says
      setError(data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = {
    width: '100%',
    padding: '.7rem .9rem .7rem 2.5rem',
    border: '1.5px solid var(--ds-outline-variant)',
    borderRadius: 8,
    fontSize: '.9rem',
    fontFamily: 'Inter, sans-serif',
    background: 'var(--ds-surface-container-low)',
    color: 'var(--ds-on-surface)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color .15s',
  };

  return (
    <PublicLayout>
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
        <div style={{
          width: '100%', maxWidth: 440,
          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.6)', borderRadius: 20,
          boxShadow: '0 12px 40px -4px rgba(30,41,59,.1)', padding: '2.5rem',
        }}>

          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--ds-primary)', marginBottom: '.4rem' }}>
              Welcome back
            </h1>
            <p style={{ color: 'var(--ds-on-surface-variant)', fontSize: '.95rem' }}>
              Sign in to continue your donation journey
            </p>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10,
              padding: '.875rem 1rem', marginBottom: '1.25rem',
              fontSize: '.875rem', color: '#7f1d1d',
              display: 'flex', gap: '.5rem', alignItems: 'flex-start',
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={{ marginBottom: '1.1rem' }}>
              <label style={{
                display: 'block', fontFamily: 'JetBrains Mono, monospace',
                fontSize: '.72rem', fontWeight: 500, color: 'var(--ds-on-surface-variant)',
                letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '.45rem',
              }}>
                Email Address <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ds-outline)' }} />
                <input
                  type="email" placeholder="you@example.com" required autoComplete="email"
                  value={form.email} onChange={e => set('email', e.target.value)}
                  style={inputBase}
                  onFocus={e => e.target.style.borderColor = 'var(--ds-secondary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--ds-outline-variant)'}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block', fontFamily: 'JetBrains Mono, monospace',
                fontSize: '.72rem', fontWeight: 500, color: 'var(--ds-on-surface-variant)',
                letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '.45rem',
              }}>
                Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ds-outline)' }} />
                <input
                  type={showPw ? 'text' : 'password'} placeholder="••••••••" required
                  autoComplete="current-password"
                  value={form.password} onChange={e => set('password', e.target.value)}
                  style={{ ...inputBase, paddingRight: '2.5rem' }}
                  onFocus={e => e.target.style.borderColor = 'var(--ds-secondary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--ds-outline-variant)'}
                />
                <button
                  type="button" onClick={() => setShowPw(p => !p)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  style={{ position: 'absolute', right: '.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ds-outline)', padding: 0 }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', background: 'var(--ds-primary)', color: '#fff', border: 'none',
                padding: '.85rem', borderRadius: 8, fontWeight: 600, fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                fontFamily: 'Inter, sans-serif', transition: 'background .15s',
              }}>
              {loading
                ? <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
                : 'Sign in'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '.875rem', color: 'var(--ds-on-surface-variant)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--ds-secondary)', fontWeight: 600, textDecoration: 'none' }}>
              Create one
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
