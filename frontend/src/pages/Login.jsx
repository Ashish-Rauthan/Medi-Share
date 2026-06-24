import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { HeartHandshake, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'admin' ? '/admin' : user.role === 'ngo' ? '/ngo' : '/donor');
    } catch (err) {
      const data = err.response?.data;
      if (data?.needsVerification) {
        toast('A new OTP has been sent to your email.', { icon: '📧' });
        navigate('/verify-otp', { state: { userId: data.userId, email: form.email } });
        return;
      }
      if (data?.pendingApproval) {
        setError('Your NGO account is pending admin approval. You will be notified by email.');
        return;
      }
      setError(data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><HeartHandshake size={24} color="#fff" /></div>
          <span className="auth-logo-text">MediShare</span>
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to continue donating or discovering medicines</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address <span>*</span></label>
            <div style={{ position: 'relative' }}>
              <input className="form-input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => set('email', e.target.value)}
                style={{ paddingLeft: '2.5rem' }} required />
              <Mail size={16} style={{ position: 'absolute', left: '.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password <span>*</span></label>
            <div style={{ position: 'relative' }}>
              <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                value={form.password} onChange={e => set('password', e.target.value)}
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} required />
              <Lock size={16} style={{ position: 'absolute', left: '.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <button type="button" onClick={() => setShowPw(p => !p)}
                style={{ position: 'absolute', right: '.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? <div className="spinner" /> : 'Sign in'}
          </button>
        </form>

        <div className="auth-footer">Don't have an account? <Link to="/register">Create one</Link></div>


      </div>
    </div>
  );
}