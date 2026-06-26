import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production you'd send this to a logging service (Sentry, Datadog, etc.)
    console.error('[ErrorBoundary] Unhandled render error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '2rem',
        background: 'var(--ds-bg, #f8f9ff)', fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{
          maxWidth: 480, width: '100%', textAlign: 'center',
          background: '#fff', borderRadius: 20,
          border: '1px solid var(--gray-200, #e2e8f0)',
          boxShadow: '0 10px 40px -4px rgba(30,41,59,.1)',
          padding: '3rem 2rem',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: '#fef2f2', display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
          }}>
            <AlertTriangle size={30} style={{ color: '#ef4444' }} />
          </div>

          <h1 style={{
            fontFamily: 'Hanken Grotesk, sans-serif', fontSize: '1.5rem',
            fontWeight: 700, color: '#0f172a', marginBottom: '.5rem',
          }}>
            Something went wrong
          </h1>

          <p style={{ color: '#64748b', fontSize: '.95rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            An unexpected error occurred. Your data is safe — this is a display issue.
            Try refreshing the page or go back to the home page.
          </p>

          {/* Only show error detail in dev */}
          {import.meta.env.DEV && this.state.error && (
            <pre style={{
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: 8, padding: '1rem', marginBottom: '1.5rem',
              fontSize: '.75rem', color: '#ef4444', textAlign: 'left',
              overflowX: 'auto', whiteSpace: 'pre-wrap',
            }}>
              {this.state.error.message}
            </pre>
          )}

          <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '.4rem',
                background: '#091426', color: '#fff', border: 'none',
                padding: '.65rem 1.25rem', borderRadius: 8, fontWeight: 600,
                fontSize: '.9rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              <RefreshCw size={15} /> Refresh page
            </button>
            <button
              onClick={() => { window.location.href = '/'; }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '.4rem',
                background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0',
                padding: '.65rem 1.25rem', borderRadius: 8, fontWeight: 600,
                fontSize: '.9rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              <Home size={15} /> Go home
            </button>
          </div>
        </div>
      </div>
    );
  }
}
