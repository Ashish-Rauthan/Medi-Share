import { Link } from 'react-router-dom';
import { Heart, Eye, Twitter, Linkedin, Facebook, MapPin, Phone, Mail } from 'lucide-react';

const values = ['Compassion', 'Transparency', 'Accessibility', 'Responsibility'];

export default function AboutPage() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: 'var(--ds-bg)', color: 'var(--ds-on-surface)', minHeight: '100vh' }}>

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(248,249,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--ds-outline-variant)', padding: '0 3rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link to="/" style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: 'var(--ds-primary)', textDecoration: 'none' }}>MediShare</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {[['Home','/'],['How It Works','/about'],['Donate','/login'],['Request Medicines','/login'],['Contact','/#contact']].map(([label, href]) => (
              <Link key={label} to={href} style={{ fontSize: '.9rem', color: label === 'How It Works' ? 'var(--ds-secondary)' : 'var(--ds-on-surface-variant)', textDecoration: 'none', fontWeight: label === 'How It Works' ? 600 : 500, borderBottom: label === 'How It Works' ? '2px solid var(--ds-secondary)' : 'none', paddingBottom: 2 }}>{label}</Link>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
            <Link to="/login" style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--ds-primary)', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ background: 'var(--ds-primary)', color: '#fff', padding: '.5rem 1.25rem', borderRadius: 8, fontSize: '.9rem', fontWeight: 600, textDecoration: 'none' }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem 3rem 4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'var(--ds-secondary-container)', borderRadius: 999, padding: '.3rem .9rem', marginBottom: '1.5rem', fontSize: '.8rem', color: 'var(--ds-on-secondary-container)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ds-secondary)', display: 'inline-block' }} />
            Mission Driven Healthcare
          </div>
          <h1 style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 'clamp(2rem, 4.5vw, 2.75rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.04em', color: 'var(--ds-primary)', marginBottom: '1.25rem' }}>
            Turning Unused Medicines<br />Into Hope
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--ds-on-surface-variant)', lineHeight: 1.75 }}>
            At MediShare, we believe that no medicine should go to waste while someone else struggles to access basic healthcare. Our platform bridges the gap between surplus and scarcity, one donation at a time.
          </p>
        </div>
        <div style={{ background: 'linear-gradient(135deg, var(--ds-secondary-container), var(--ds-surface-container-high))', borderRadius: 24, aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '5rem', marginBottom: '.75rem' }}>💊📦</div>
            <p style={{ color: 'var(--ds-on-surface-variant)', fontSize: '.875rem' }}>MediShare platform in action</p>
          </div>
        </div>
      </section>

      {/* ── STORY ── */}
      <section style={{ background: 'var(--ds-surface-container-low)', padding: '5rem 3rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--ds-surface-container), var(--ds-surface-container-high))', borderRadius: 20, aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '5rem', marginBottom: '.75rem' }}>👩‍💻👨‍⚕️</div>
              <p style={{ color: 'var(--ds-on-surface-variant)', fontSize: '.875rem' }}>Our founding team at work</p>
            </div>
          </div>
          <div>
            <h2 style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: '1.25rem', color: 'var(--ds-primary)' }}>The Story Behind MediShare</h2>
            <p style={{ color: 'var(--ds-on-surface-variant)', lineHeight: 1.8, marginBottom: '1rem', fontSize: '.95rem' }}>
              The idea for MediShare came from a simple observation: households across the country discard thousands of usable, unexpired medicines every year, while NGOs and healthcare workers in underserved communities struggle to obtain even basic medication.
            </p>
            <p style={{ color: 'var(--ds-on-surface-variant)', lineHeight: 1.8, fontSize: '.95rem' }}>
              We built MediShare as a transparent, technology-driven bridge — giving donors a simple way to list surplus medicines and giving verified organizations a trusted channel to find what their patients need.
            </p>
          </div>
        </div>
      </section>

      {/* ── MISSION & VISION ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem 3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {[
            {
              icon: Heart, color: 'var(--ds-secondary)',
              title: 'Our Mission',
              text: 'To create a reliable platform that encourages responsible medicine donation, reduces medicine wastage, and improves access to healthcare resources for underserved communities.',
            },
            {
              icon: Eye, color: 'var(--ds-secondary)',
              title: 'Our Vision',
              text: 'We envision a future where surplus medicines are managed more efficiently, waste is minimized, and communities can support one another through accessible healthcare resources.',
            },
          ].map(({ icon: Icon, color, title, text }) => (
            <div key={title} style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 20, padding: '2.5rem', boxShadow: '0 4px 20px -2px rgba(30,41,59,.05)' }}>
              <div style={{ width: 48, height: 48, background: 'var(--ds-secondary-container)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Icon size={22} style={{ color }} />
              </div>
              <h3 style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: '1.2rem', fontWeight: 600, marginBottom: '.75rem', color: 'var(--ds-primary)' }}>{title}</h3>
              <p style={{ color: 'var(--ds-on-surface-variant)', lineHeight: 1.75, margin: 0, fontSize: '.95rem' }}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHAT WE DO ── */}
      <section style={{ background: 'var(--ds-surface-container-low)', padding: '5rem 3rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: '.75rem', color: 'var(--ds-primary)' }}>What We Do</h2>
          <p style={{ color: 'var(--ds-on-surface-variant)', marginBottom: '3rem', fontSize: '.95rem' }}>A seamless process to ensure medicines reach those who need them most.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
            {[
              { num: '1', label: 'Donors Upload', desc: 'List surplus unexpired medicines.' },
              { num: '2', label: 'Admin Verifies', desc: 'Quality and safety checks performed.' },
              { num: '3', label: 'NGOs Browse', desc: 'Verified partners select needed items.' },
              { num: '4', label: 'Requests Tracked', desc: 'End-to-end transparent tracking.' },
            ].map(({ num, label, desc }) => (
              <div key={num} style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 16, padding: '2rem 1.5rem', boxShadow: '0 4px 20px -2px rgba(30,41,59,.05)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: num === '2' ? 'var(--ds-secondary)' : 'var(--ds-surface-container-high)', color: num === '2' ? '#fff' : 'var(--ds-on-surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: '1.1rem', margin: '0 auto 1.25rem' }}>{num}</div>
                <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: '.95rem', marginBottom: '.4rem', color: 'var(--ds-primary)' }}>{label}</div>
                <p style={{ fontSize: '.8rem', color: 'var(--ds-on-surface-variant)', margin: 0, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CORE VALUES ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem 3rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: '2.5rem', color: 'var(--ds-primary)' }}>Our Core Values</h2>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {values.map(v => (
            <div key={v} style={{ background: 'var(--ds-surface-container)', border: '1px solid var(--ds-outline-variant)', borderRadius: 12, padding: '.75rem 1.5rem', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: '1rem', color: 'var(--ds-primary)' }}>{v}</div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'var(--ds-primary)', color: '#fff', padding: '2rem 3rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: '.25rem' }}>MediShare</div>
            <div style={{ color: 'rgba(255,255,255,.4)', fontSize: '.8rem' }}>© 2024 MediShare Health Systems. All rights reserved.</div>
          </div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {[['Privacy Policy','#'],['Terms of Service','#'],['HIPAA Compliance','#'],['Contact Support','/#contact']].map(([l,h]) => (
              <a key={l} href={h} style={{ color: 'rgba(255,255,255,.6)', fontSize: '.875rem', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}