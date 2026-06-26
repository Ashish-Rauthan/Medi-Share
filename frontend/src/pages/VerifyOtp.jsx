import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import PublicLayout from '../components/common/PublicLayout';
import { useAuth } from '../context/AuthContext';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { finalizeLogin } = useAuth();
  const { userId, role, email } = location.state || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verified, setVerified] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [error, setError] = useState('');
  const inputs = useRef([]);

  // Guard: if no userId in state, redirect to register
  useEffect(() => {
    if (!userId) navigate('/register', { replace: true });
  }, [userId, navigate]);

  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldown]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    setError('');
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { userId, otp: code });

      if (res.data.pendingApproval) {
        setPendingApproval(true);
        return;
      }

      // Donor: token is returned — hydrate auth context properly
      finalizeLogin(res.data.token, res.data.user);
      setVerified(true);
      toast.success('Email verified!');
      setTimeout(() => navigate('/donor', { replace: true }), 1500);
    } catch (err) {
      const message = err.response?.data?.message || 'Verification failed. Please try again.';
      setError(message);
      // Clear OTP inputs and refocus on error
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      await api.post('/auth/resend-otp', { userId });
      toast.success('New OTP sent to your email');
      setCooldown(60);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputs.current[0]?.focus(), 50);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to resend OTP. Please try again.';
      setError(message);
    } finally {
      setResending(false);
    }
  };

  const boxStyle = (filled) => ({
    width: 52, height: 60, textAlign: 'center', fontSize: '1.5rem', fontWeight: 700,
    border: `2px solid ${filled ? 'var(--ds-secondary)' : 'var(--ds-outline-variant)'}`,
    borderRadius: 10, outline: 'none', fontFamily: 'Hanken Grotesk, sans-serif',
    color: 'var(--ds-primary)', background: filled ? 'rgba(134,242,228,.12)' : 'var(--ds-surface-container-low)',
    transition: 'all .15s', cursor: 'text',
  });

  const card = (
    <div style={{ width: '100%', maxWidth: 440, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 20, boxShadow: '0 12px 40px -4px rgba(30,41,59,.1)', padding: '2.5rem' }}>

      {pendingApproval ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(134,242,228,.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle size={30} style={{ color: 'var(--ds-secondary)' }} />
          </div>
          <h2 style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ds-primary)', marginBottom: '.5rem' }}>Email Verified!</h2>
          <p style={{ color: 'var(--ds-on-surface-variant)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
            Your NGO account is <strong>pending admin approval</strong>. You'll receive an email notification once reviewed.
          </p>
          <div style={{ background: 'rgba(134,242,228,.12)', border: '1px solid rgba(0,106,97,.2)', borderRadius: 10, padding: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            <p style={{ fontSize: '.85rem', color: 'var(--ds-secondary)', margin: 0, lineHeight: 1.7 }}>
              <strong>What's next?</strong><br />Our admin team will review your NGO details and approve your account. This usually takes 1–2 business days.
            </p>
          </div>
          <Link to="/login" style={{ display: 'block', background: 'var(--ds-primary)', color: '#fff', padding: '.85rem', borderRadius: 8, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
            Back to Login
          </Link>
        </div>

      ) : verified ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(134,242,228,.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle size={30} style={{ color: 'var(--ds-secondary)' }} />
          </div>
          <h2 style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ds-primary)', marginBottom: '.5rem' }}>All verified!</h2>
          <p style={{ color: 'var(--ds-on-surface-variant)' }}>Redirecting you to your dashboard…</p>
        </div>

      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.75rem', background: 'var(--ds-surface-container-low)', border: '1px solid var(--ds-outline-variant)', borderRadius: 10, padding: '1rem', marginBottom: '1.75rem' }}>
            <Mail size={18} style={{ color: 'var(--ds-secondary)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '.875rem', color: 'var(--ds-primary)', marginBottom: '.15rem' }}>Check your email</div>
              <div style={{ fontSize: '.8rem', color: 'var(--ds-on-surface-variant)' }}>
                We sent a 6-digit code to <strong>{email || 'your email'}</strong>
              </div>
            </div>
          </div>

          <h2 style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ds-primary)', marginBottom: '.4rem' }}>
            Enter verification code
          </h2>
          <p style={{ color: 'var(--ds-on-surface-variant)', fontSize: '.875rem', marginBottom: '1.75rem' }}>
            The OTP expires in 10 minutes.
          </p>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '.75rem 1rem', marginBottom: '1.25rem', fontSize: '.875rem', color: '#7f1d1d', display: 'flex', gap: '.5rem', alignItems: 'flex-start' }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'center', marginBottom: '1.75rem' }} onPaste={handlePaste}>
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={el => inputs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  style={boxStyle(!!d)}
                  aria-label={`OTP digit ${i + 1}`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length < 6}
              style={{
                width: '100%', background: 'var(--ds-primary)', color: '#fff', border: 'none',
                padding: '.85rem', borderRadius: 8, fontWeight: 600, fontSize: '1rem',
                cursor: (loading || otp.join('').length < 6) ? 'not-allowed' : 'pointer',
                opacity: (loading || otp.join('').length < 6) ? .6 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                fontFamily: 'Inter, sans-serif',
              }}>
              {loading
                ? <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
                : 'Verify Email'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '.875rem', color: 'var(--ds-on-surface-variant)' }}>
            Didn't receive it?{' '}
            {cooldown > 0
              ? <span style={{ color: 'var(--ds-outline)' }}>Resend in {cooldown}s</span>
              : (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  style={{ background: 'none', border: 'none', color: 'var(--ds-secondary)', fontWeight: 600, cursor: resending ? 'not-allowed' : 'pointer', fontSize: '.875rem', padding: 0 }}>
                  {resending ? 'Sending…' : 'Resend OTP'}
                </button>
              )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <PublicLayout>
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
        {card}
      </div>
    </PublicLayout>
  );
}
