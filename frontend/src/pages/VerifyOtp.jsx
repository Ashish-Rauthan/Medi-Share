import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { HeartHandshake, Mail, CheckCircle } from 'lucide-react';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const { userId, role, email } = location.state || {};
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verified, setVerified] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [error, setError] = useState('');
  const inputs = useRef([]);

  useEffect(() => {
    if (!userId) navigate('/register');
  }, [userId]);

  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldown]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Enter all 6 digits'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { userId, otp: code });

      if (res.data.pendingApproval) {
        setPendingApproval(true);
        return;
      }

      // Donor — token returned, set in context
      localStorage.setItem('ms_token', res.data.token);
      localStorage.setItem('ms_user', JSON.stringify(res.data.user));
      setVerified(true);
      toast.success('Email verified!');
      setTimeout(() => navigate('/donor'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { userId });
      toast.success('New OTP sent to your email');
      setCooldown(60);
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally { setResending(false); }
  };

  if (pendingApproval) return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, background: 'var(--amber-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle size={32} style={{ color: 'var(--amber-500)' }} />
        </div>
        <h1 style={{ fontSize: '1.4rem', marginBottom: '.5rem' }}>Email Verified!</h1>
        <p style={{ marginBottom: '1.5rem' }}>Your NGO account is now <strong>pending admin approval</strong>. You'll receive an email once your account is reviewed.</p>
        <div className="alert alert-warning" style={{ textAlign: 'left' }}>
          <strong>What happens next?</strong><br />
          Our admin team will review your NGO details and approve your account. This usually takes 1–2 business days.
        </div>
        <Link to="/login" className="btn btn-primary btn-full" style={{ marginTop: '1rem' }}>Back to Login</Link>
      </div>
    </div>
  );

  if (verified) return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, background: 'var(--green-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle size={32} style={{ color: 'var(--green-500)' }} />
        </div>
        <h1 style={{ fontSize: '1.4rem', marginBottom: '.5rem' }}>All verified!</h1>
        <p>Redirecting you to your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><HeartHandshake size={24} color="#fff" /></div>
          <span className="auth-logo-text">MediShare</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '1rem', background: 'var(--brand-50)', borderRadius: 'var(--radius)', marginBottom: '1.5rem', border: '1px solid var(--brand-100)' }}>
          <Mail size={20} style={{ color: 'var(--brand-600)', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '.875rem', color: 'var(--brand-800)' }}>Check your email</div>
            <div style={{ fontSize: '.8rem', color: 'var(--brand-600)' }}>We sent a 6-digit OTP to <strong>{email || 'your email'}</strong></div>
          </div>
        </div>

        <h1 className="auth-title" style={{ fontSize: '1.4rem' }}>Enter verification code</h1>
        <p className="auth-subtitle">The OTP expires in 10 minutes.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'center', marginBottom: '1.5rem' }} onPaste={handlePaste}>
            {otp.map((d, i) => (
              <input
                key={i}
                ref={el => inputs.current[i] = el}
                type="text" inputMode="numeric" maxLength={1}
                value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                style={{
                  width: 48, height: 56, textAlign: 'center', fontSize: '1.5rem', fontWeight: 700,
                  border: `2px solid ${d ? 'var(--brand-400)' : 'var(--gray-200)'}`,
                  borderRadius: 'var(--radius)', outline: 'none', fontFamily: 'var(--font-display)',
                  color: 'var(--gray-900)', background: d ? 'var(--brand-50)' : '#fff',
                  transition: 'all .15s',
                }}
              />
            ))}
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading || otp.join('').length < 6}>
            {loading ? <div className="spinner" /> : 'Verify Email'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '.875rem', color: 'var(--gray-500)' }}>
          Didn't receive it?{' '}
          {cooldown > 0
            ? <span style={{ color: 'var(--gray-400)' }}>Resend in {cooldown}s</span>
            : <button onClick={handleResend} disabled={resending} style={{ background: 'none', border: 'none', color: 'var(--brand-600)', fontWeight: 600, cursor: 'pointer', fontSize: '.875rem' }}>
                {resending ? 'Sending...' : 'Resend OTP'}
              </button>
          }
        </div>
      </div>
    </div>
  );
}