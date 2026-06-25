import { Link, useLocation } from 'react-router-dom';
import { Heart, Twitter, Linkedin, Facebook, MapPin, Phone, Mail } from 'lucide-react';

function PublicNav() {
  const { pathname } = useLocation();
  const links = [
    ['Home', '/'],
    ['How It Works', '/about'],
    ['Donate', '/register?role=donor'],
    ['Request Medicines', '/register?role=ngo'],
    ['Contact', '/#contact'],
  ];
  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(248,249,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--ds-outline-variant)', padding: '0 3rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link to="/" style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: 'var(--ds-primary)', textDecoration: 'none' }}>
          MediShare
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {links.map(([label, href]) => {
            const isExact = href === '/' ? pathname === '/' : pathname === href.split('?')[0];
            return href.startsWith('/#') ? (
              <a key={label} href={href} style={{ fontSize: '.9rem', color: 'var(--ds-on-surface-variant)', textDecoration: 'none', fontWeight: 500 }}>{label}</a>
            ) : (
              <Link key={label} to={href} style={{ fontSize: '.9rem', color: isExact ? 'var(--ds-secondary)' : 'var(--ds-on-surface-variant)', textDecoration: 'none', fontWeight: isExact ? 600 : 500, borderBottom: isExact ? '2px solid var(--ds-secondary)' : 'none', paddingBottom: 2 }}>{label}</Link>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
          <Link to="/login" style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--ds-primary)', textDecoration: 'none' }}>Login</Link>
          <Link to="/register" style={{ background: 'var(--ds-primary)', color: '#fff', padding: '.5rem 1.25rem', borderRadius: 8, fontSize: '.9rem', fontWeight: 600, textDecoration: 'none' }}>Get Started</Link>
        </div>
      </div>
    </nav>
  );
}

function PublicFooter() {
  return (
    <footer style={{ background: 'var(--ds-primary)', color: '#fff', padding: '3rem 3rem 1.5rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr', gap: '3rem', marginBottom: '3rem' }}>
          <div>
            <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: '1.2rem', marginBottom: '.75rem' }}>MediShare</div>
            <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.875rem', lineHeight: 1.7, marginBottom: '1.25rem', maxWidth: 240 }}>
              Healing through sharing. We connect surplus medicine with those who need it most.
            </p>
            <div style={{ display: 'flex', gap: '.75rem' }}>
              {[Twitter, Linkedin, Facebook].map((Icon, i) => (
                <a key={i} href="#" style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.7)' }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '.75rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: '1rem' }}>Quick Links</div>
            {[['Home', '/'], ['How It Works', '/about'], ['Donate', '/register?role=donor'], ['Request Medicines', '/register?role=ngo']].map(([l, h]) => (
              <Link key={l} to={h} style={{ display: 'block', color: 'rgba(255,255,255,.65)', fontSize: '.875rem', textDecoration: 'none', marginBottom: '.5rem' }}>{l}</Link>
            ))}
          </div>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '.75rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: '1rem' }}>Support</div>
            {[['Privacy Policy', '#'], ['Terms of Service', '#'], ['HIPAA Compliance', '#'], ['Contact Support', '/#contact']].map(([l, h]) => (
              <a key={l} href={h} style={{ display: 'block', color: 'rgba(255,255,255,.65)', fontSize: '.875rem', textDecoration: 'none', marginBottom: '.5rem' }}>{l}</a>
            ))}
          </div>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '.75rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: '1rem' }}>Contact Info</div>
            {[
              { Icon: MapPin, text: '123 Health St, Medical City' },
              { Icon: Phone, text: '+1 (555) 000-1234' },
              { Icon: Mail, text: 'support@medishare.org' },
            ].map(({ Icon, text }) => (
              <div key={text} style={{ display: 'flex', gap: '.6rem', alignItems: 'center', color: 'rgba(255,255,255,.65)', fontSize: '.875rem', marginBottom: '.6rem' }}>
                <Icon size={14} style={{ flexShrink: 0, color: 'rgba(255,255,255,.4)' }} />{text}
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,.4)', fontSize: '.8rem' }}>
          © 2024 MediShare Health Systems. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout({ children }) {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: 'var(--ds-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNav />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}