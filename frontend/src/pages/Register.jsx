import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { HeartHandshake, Heart, Building2 } from 'lucide-react';

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
      navigate('/verify-otp', {
        state: { userId: res.data.userId, role: res.data.role, email: form.email }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 500 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon"><HeartHandshake size={24} color="#fff" /></div>
          <span className="auth-logo-text">MediShare</span>
        </div>
        <h1 className="auth-title">Create an account</h1>
        <p className="auth-subtitle">Join the medicine donation network</p>

        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ marginBottom: '1.25rem' }}>
          <label className="form-label" style={{ marginBottom: '.6rem', display: 'block' }}>I am a <span style={{ color: 'var(--red-500)' }}>*</span></label>
          <div className="role-selector">
            {[
              { value: 'donor', icon: <Heart size={22} />, label: 'Donor', desc: 'I have medicines to donate' },
              { value: 'ngo', icon: <Building2 size={22} />, label: 'NGO', desc: 'We need medicines for communities' },
            ].map(r => (
              <div key={r.value} className={`role-option${form.role === r.value ? ' selected' : ''}`} onClick={() => set('role', r.value)}>
                <div className="role-option-icon">{r.icon}</div>
                <div className="role-option-label">{r.label}</div>
                <div className="role-option-desc">{r.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {form.role === 'ngo' && (
          <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
            NGO accounts require <strong>email verification</strong> and <strong>admin approval</strong> before access is granted.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{form.role === 'ngo' ? 'Contact Person Name' : 'Full Name'} <span>*</span></label>
            <input className="form-input" type="text" placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>

          {form.role === 'ngo' && (
            <div className="form-group">
              <label className="form-label">Organization Name <span>*</span></label>
              <input className="form-input" type="text" placeholder="NGO or organization name" value={form.organizationName} onChange={e => set('organizationName', e.target.value)} required />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email <span>*</span></label>
              <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input className="form-input" type="text" placeholder="City, State" value={form.address} onChange={e => set('address', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Password <span>*</span></label>
            <input className="form-input" type="password" placeholder="Minimum 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
          </div>

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? <div className="spinner" /> : 'Create account & send OTP'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}