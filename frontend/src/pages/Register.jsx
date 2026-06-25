import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import PublicLayout from '../components/common/PublicLayout';
import { Heart, Building2 } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'donor', organizationName: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.role === 'ngo' && !form.organizationName) { setError('Organization name is required'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      toast.success('Account created! Check your email for the OTP.');
      navigate('/verify-otp', { state: { userId: res.data.userId, role: res.data.role, email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const inputStyle = { width: '100%', padding: '.7rem .9rem', border: '1.5px solid var(--ds-outline-variant)', borderRadius: 8, fontSize: '.9rem', fontFamily: 'Inter, sans-serif', background: 'var(--ds-surface-container-low)', color: 'var(--ds-on-surface)', outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s' };
  const labelStyle = { display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: '.72rem', fontWeight: 500, color: 'var(--ds-on-surface-variant)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '.45rem' };

  return (
    <PublicLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: 500, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 20, boxShadow: '0 12px 40px -4px rgba(30,41,59,.1)', padding: '2.5rem' }}>

          <div style={{ marginBottom: '1.75rem' }}>
            <h1 style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--ds-primary)', marginBottom: '.4rem' }}>Create an account</h1>
            <p style={{ color: 'var(--ds-on-surface-variant)', fontSize: '.95rem' }}>Join the medicine donation network</p>
          </div>

          {/* Role selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={labelStyle}>I am a <span style={{ color: '#ef4444' }}>*</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
              {[
                { value: 'donor', Icon: Heart, label: 'Donor', desc: 'I have medicines to donate' },
                { value: 'ngo', Icon: Building2, label: 'NGO', desc: 'We need medicines for communities' },
              ].map(({ value, Icon, label, desc }) => (
                <div key={value} onClick={() => set('role', value)}
                  style={{ border: `2px solid ${form.role === value ? 'var(--ds-secondary)' : 'var(--ds-outline-variant)'}`, borderRadius: 12, padding: '1rem', cursor: 'pointer', background: form.role === value ? 'rgba(134,242,228,.12)' : '#fff', transition: 'all .15s', textAlign: 'center' }}>
                  <div style={{ width: 36, height: 36, background: form.role === value ? 'var(--ds-secondary-container)' : 'var(--ds-surface-container)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto .6rem' }}>
                    <Icon size={18} style={{ color: form.role === value ? 'var(--ds-secondary)' : 'var(--ds-on-surface-variant)' }} />
                  </div>
                  <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: '.9rem', color: form.role === value ? 'var(--ds-secondary)' : 'var(--ds-primary)', marginBottom: '.2rem' }}>{label}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--ds-on-surface-variant)' }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {form.role === 'ngo' && (
            <div style={{ background: 'rgba(134,242,228,.12)', border: '1px solid rgba(0,106,97,.2)', borderRadius: 8, padding: '.75rem 1rem', marginBottom: '1.25rem', fontSize: '.825rem', color: 'var(--ds-secondary)' }}>
              NGO accounts require <strong>email verification</strong> and <strong>admin approval</strong> before access is granted.
            </div>
          )}

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '.875rem 1rem', marginBottom: '1.25rem', fontSize: '.875rem', color: '#7f1d1d' }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>{form.role === 'ngo' ? 'Contact Person Name' : 'Full Name'} <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={inputStyle} type="text" placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} required
                onFocus={e => e.target.style.borderColor = 'var(--ds-secondary)'} onBlur={e => e.target.style.borderColor = 'var(--ds-outline-variant)'} />
            </div>

            {form.role === 'ngo' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Organization Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input style={inputStyle} type="text" placeholder="NGO or organization name" value={form.organizationName} onChange={e => set('organizationName', e.target.value)} required
                  onFocus={e => e.target.style.borderColor = 'var(--ds-secondary)'} onBlur={e => e.target.style.borderColor = 'var(--ds-outline-variant)'} />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Email <span style={{ color: '#ef4444' }}>*</span></label>
                <input style={inputStyle} type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required
                  onFocus={e => e.target.style.borderColor = 'var(--ds-secondary)'} onBlur={e => e.target.style.borderColor = 'var(--ds-outline-variant)'} />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input style={inputStyle} type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'var(--ds-secondary)'} onBlur={e => e.target.style.borderColor = 'var(--ds-outline-variant)'} />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Address</label>
              <input style={inputStyle} type="text" placeholder="City, State" value={form.address} onChange={e => set('address', e.target.value)}
                onFocus={e => e.target.style.borderColor = 'var(--ds-secondary)'} onBlur={e => e.target.style.borderColor = 'var(--ds-outline-variant)'} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Password <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={inputStyle} type="password" placeholder="Minimum 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6}
                onFocus={e => e.target.style.borderColor = 'var(--ds-secondary)'} onBlur={e => e.target.style.borderColor = 'var(--ds-outline-variant)'} />
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', background: 'var(--ds-primary)', color: '#fff', border: 'none', padding: '.85rem', borderRadius: 8, fontWeight: 600, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', fontFamily: 'Inter, sans-serif' }}>
              {loading
                ? <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
                : 'Create account & send OTP'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '.875rem', color: 'var(--ds-on-surface-variant)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--ds-secondary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}