import { Link } from 'react-router-dom';
import { ShieldCheck, Package, MapPin, ArrowRight, ChevronDown, ChevronUp, Mail, Phone, Building, Send, Heart, Twitter, Linkedin, Facebook } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const faqs = [
  { q: 'What medicines can I donate?', a: 'You can donate any unused, unexpired prescription or over-the-counter medicines. Medicines must have at least 30 days until expiry and be in their original, sealed packaging.' },
  { q: 'How are NGOs verified?', a: 'All NGOs go through a strict background check and licensing review by our admin team before being approved. Only verified NGOs can browse and request medicines on the platform.' },
  { q: 'Is the process secure?', a: 'Yes. Every donation goes through an admin verification workflow before it becomes visible to NGOs. We ensure safe handling, transparent tracking, and end-to-end acknowledgement.' },
  { q: 'How do I request medicine?', a: 'Register as an NGO, complete verification, and once approved you can browse available medicines and submit requests stating your purpose and required quantity.' },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(o => !o)} style={{ borderBottom: '1px solid var(--ds-outline-variant)', cursor: 'pointer', padding: '1.25rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
          <span style={{ color: 'var(--ds-secondary)', flexShrink: 0 }}>?</span>
          <span style={{ fontWeight: 600, color: 'var(--ds-on-surface)', fontFamily: 'Hanken Grotesk, sans-serif', fontSize: '1rem' }}>{q}</span>
        </div>
        {open ? <ChevronUp size={18} style={{ color: 'var(--ds-secondary)', flexShrink: 0 }} /> : <ChevronDown size={18} style={{ color: 'var(--ds-on-surface-variant)', flexShrink: 0 }} />}
      </div>
      {open && <p style={{ margin: '.75rem 0 0 1.75rem', color: 'var(--ds-on-surface-variant)', fontSize: '.95rem', lineHeight: 1.7 }}>{a}</p>}
    </div>
  );
}

export default function HomePage() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const set = (k, v) => setContactForm(p => ({ ...p, [k]: v }));

  const hasRecentSubmission = () => {
    if (typeof window === 'undefined') return false;
    const saved = window.sessionStorage.getItem('medishare_contact_submitted_at');
    if (!saved) return false;
    return Date.now() - Number(saved) < 60000;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage('');

    if (hasRecentSubmission()) {
      const message = 'Your message was already sent recently. Please wait a moment before sending another one.';
      setSubmitMessage(message);
      toast.error(message);
      return;
    }

    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.subject.trim() || !contactForm.message.trim()) {
      const message = 'Please fill in all fields before sending your message.';
      setSubmitMessage(message);
      toast.error(message);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/contact', contactForm);
      setContactForm({ name: '', email: '', subject: '', message: '' });
      window.sessionStorage.setItem('medishare_contact_submitted_at', Date.now().toString());
      const successMessage = 'Thanks! Your message has been sent successfully.';
      setSubmitMessage(successMessage);
      toast.success(successMessage);
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to send your message right now. Please try again later.';
      setSubmitMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: 'var(--ds-bg)', color: 'var(--ds-on-surface)', minHeight: '100vh' }}>

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(248,249,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--ds-outline-variant)', padding: '0 3rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link to="/" style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: 'var(--ds-primary)', textDecoration: 'none' }}>MediShare</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {[['Home', '/'], ['How It Works', '/about'], ['Donate', '/register?role=donor'], ['Request Medicines', '/register?role=ngo'], ['Contact', '#contact']].map(([label, href]) => (
              href.startsWith('#')
                ? <a key={label} href={href} style={{ fontSize: '.9rem', color: 'var(--ds-on-surface-variant)', textDecoration: 'none', fontWeight: 500 }}>{label}</a>
                : <Link key={label} to={href} style={{ fontSize: '.9rem', color: label === 'Home' ? 'var(--ds-secondary)' : 'var(--ds-on-surface-variant)', textDecoration: 'none', fontWeight: label === 'Home' ? 600 : 500, borderBottom: label === 'Home' ? '2px solid var(--ds-secondary)' : 'none', paddingBottom: 2 }}>{label}</Link>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
            <Link to="/login" style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--ds-primary)', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ background: 'var(--ds-primary)', color: '#fff', padding: '.5rem 1.25rem', borderRadius: 8, fontSize: '.9rem', fontWeight: 600, textDecoration: 'none' }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem 3rem 4rem', display: 'flex', alignItems: 'center', gap: '4rem' }}>
        <div style={{ flex: '1 1 480px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'var(--ds-surface-container-low)', border: '1px solid var(--ds-outline-variant)', borderRadius: 999, padding: '.3rem .9rem', marginBottom: '1.5rem', fontSize: '.8rem', color: 'var(--ds-secondary)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ds-secondary)', display: 'inline-block' }} />
            Verified NGOs • Secure Process • Transparent Tracking
          </div>
          <h1 style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 'clamp(2.2rem, 5vw, 3rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.04em', color: 'var(--ds-primary)', marginBottom: '1.25rem' }}>
            Turn Surplus Medicines<br /><span style={{ color: 'var(--ds-secondary)' }}>Into Hope.</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--ds-on-surface-variant)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 460 }}>
            Donate unused, unexpired medicines to verified organizations helping those in need. Join our transparent platform to reduce medical waste and save lives.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register?role=donor" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'var(--ds-secondary)', color: '#fff', padding: '.75rem 1.5rem', borderRadius: 8, fontWeight: 600, textDecoration: 'none', fontSize: '1rem', boxShadow: '0 4px 20px -2px rgba(0,106,97,.25)' }}>
              <Heart size={18} /> Donate Medicine
            </Link>
            <Link to="/register?role=ngo" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'var(--ds-surface-container)', color: 'var(--ds-primary)', padding: '.75rem 1.5rem', borderRadius: 8, fontWeight: 600, textDecoration: 'none', fontSize: '1rem', border: '1px solid var(--ds-outline-variant)' }}>
              Request Medicine
            </Link>
          </div>
        </div>
        <div style={{ flex: '0 1 480px', position: 'relative' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--ds-primary-container), var(--ds-secondary-container))', borderRadius: 24, overflow: 'hidden', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #091426ee, #006a6188)', borderRadius: 24 }} />
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '.5rem' }}>🏥</div>
              <div style={{ color: '#fff', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: '.25rem' }}>Community Action</div>
              <div style={{ color: 'rgba(255,255,255,.7)', fontSize: '.85rem' }}>Join 10,000+ donors making a difference today.</div>
            </div>
            <div style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 12, padding: '.75rem 1rem' }}>
              <div style={{ color: '#fff', fontSize: '.75rem', fontFamily: 'JetBrains Mono, monospace' }}>↑ 23% this month</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 3rem 5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: '.5rem' }}>Impact We Create</h2>
          <p style={{ color: 'var(--ds-on-surface-variant)' }}>Real numbers from our growing community of care.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
          {[
            { stat: '1M+', label: 'Medicines successfully redistributed to patients in need.' },
            { stat: '500+', label: 'Verified NGO partners actively participating in our network.' },
            { stat: '50+', label: 'Cities covered with secure end-to-end logistics tracking.' },
          ].map(({ stat, label }) => (
            <div key={stat} style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 16, padding: '2rem', boxShadow: '0 4px 20px -2px rgba(30,41,59,.05)' }}>
              <div style={{ width: 40, height: 40, background: 'var(--ds-secondary-container)', borderRadius: 10, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={18} style={{ color: 'var(--ds-secondary)' }} />
              </div>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--ds-primary)', marginBottom: '.5rem' }}>{stat}</div>
              <p style={{ fontSize: '.875rem', color: 'var(--ds-on-surface-variant)', lineHeight: 1.6, margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSION BANNER ── */}
      <section style={{ background: 'var(--ds-primary)', margin: '0', padding: '0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '4rem 3rem', display: 'flex', alignItems: 'center', gap: '4rem' }}>
          <div style={{ flex: '1 1 480px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'rgba(134,242,228,.15)', border: '1px solid rgba(134,242,228,.3)', borderRadius: 999, padding: '.3rem .9rem', marginBottom: '1.5rem', fontSize: '.8rem', color: 'var(--ds-secondary-container)', fontFamily: 'JetBrains Mono, monospace' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ds-secondary)', display: 'inline-block' }} />
              Our Mission
            </div>
            <h2 style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 600, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.2, marginBottom: '1.25rem' }}>
              Bridging the gap between<br />surplus and scarcity.
            </h2>
            <p style={{ color: 'rgba(255,255,255,.7)', lineHeight: 1.75, marginBottom: '2rem', maxWidth: 440, fontSize: '.95rem' }}>
              We believe that no usable medicine should go to waste while someone, somewhere, is struggling to afford it. By leveraging technology and community trust, we're building a sustainable ecosystem for healthcare equity.
            </p>
            <Link to="/about" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', color: 'var(--ds-secondary-container)', fontWeight: 600, textDecoration: 'none', fontSize: '.95rem' }}>
              Read our full story <ArrowRight size={16} />
            </Link>
          </div>
          <div style={{ flex: '0 1 420px', background: 'rgba(255,255,255,.06)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 20, overflow: 'hidden', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>👩‍⚕️👨‍⚕️</div>
              <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.875rem' }}>Healthcare professionals & donors working together</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SAFETY ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem 3rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: '.5rem' }}>Safety & Verification</h2>
        <p style={{ color: 'var(--ds-on-surface-variant)', marginBottom: '3rem' }}>A rigorous, multi-step process ensures every donation is handled with care and compliance.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
          {[
            { icon: ShieldCheck, title: 'Verified NGOs', desc: 'Strict licensing and background checks.' },
            { icon: Package, title: 'Safe Donations', desc: 'Quality checks on all received items.' },
            { icon: MapPin, title: 'Transparent Tracking', desc: 'End-to-end visibility of your impact.' },
            { icon: ShieldCheck, title: 'Easy Verification', desc: 'Simple receipt and acknowledgement.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 16, padding: '2rem 1.5rem', boxShadow: '0 4px 20px -2px rgba(30,41,59,.05)', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, background: 'var(--ds-secondary-container)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <Icon size={22} style={{ color: 'var(--ds-secondary)' }} />
              </div>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 600, fontSize: '.95rem', marginBottom: '.5rem', color: 'var(--ds-primary)' }}>{title}</div>
              <p style={{ fontSize: '.8rem', color: 'var(--ds-on-surface-variant)', margin: 0, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: 'var(--ds-surface-container-low)', padding: '5rem 3rem' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: '.5rem' }}>Frequently Asked Questions</h2>
          <p style={{ color: 'var(--ds-on-surface-variant)', marginBottom: '3rem' }}>Everything you need to know about donating and requesting medicines on MediShare.</p>
          <div style={{ textAlign: 'left' }}>
            {faqs.map(f => <FaqItem key={f.q} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem 3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: '.5rem' }}>Contact Us</h2>
          <p style={{ color: 'var(--ds-on-surface-variant)' }}>Have questions? We're here to help.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: Mail, title: 'Email Us', lines: ['support@medishare.org', 'info@medishare.org'] },
              { icon: Phone, title: 'Call Us', lines: ['+1 (555) 000-1234', 'Mon–Fri, 9am – 6pm EST'] },
              { icon: Building, title: 'Visit Us', lines: ['123 Health St, Medical City', 'Suite 400, NY 10001'] },
            ].map(({ icon: Icon, title, lines }) => (
              <div key={title} style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 16, padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', boxShadow: '0 4px 20px -2px rgba(30,41,59,.05)' }}>
                <div style={{ width: 40, height: 40, background: 'var(--ds-secondary-container)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} style={{ color: 'var(--ds-secondary)' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: '.25rem', color: 'var(--ds-primary)' }}>{title}</div>
                  {lines.map(l => <div key={l} style={{ fontSize: '.85rem', color: 'var(--ds-on-surface-variant)' }}>{l}</div>)}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 16, padding: '2rem', boxShadow: '0 4px 20px -2px rgba(30,41,59,.05)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              {[['name','Full Name','John Doe'],['email','Email Address','john@example.com']].map(([k, label, ph]) => (
                <div key={k}>
                  <label style={{ fontSize: '.75rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500, color: 'var(--ds-on-surface-variant)', display: 'block', marginBottom: '.4rem', letterSpacing: '.05em', textTransform: 'uppercase' }}>{label}</label>
                  <input value={contactForm[k]} onChange={e => set(k, e.target.value)} placeholder={ph}
                    style={{ width: '100%', padding: '.65rem .9rem', border: '1.5px solid var(--ds-outline-variant)', borderRadius: 8, fontSize: '.9rem', fontFamily: 'Inter, sans-serif', background: 'var(--ds-surface-container-low)', outline: 'none', boxSizing: 'border-box', color: 'var(--ds-on-surface)' }} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '.75rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500, color: 'var(--ds-on-surface-variant)', display: 'block', marginBottom: '.4rem', letterSpacing: '.05em', textTransform: 'uppercase' }}>Subject</label>
              <input value={contactForm.subject} onChange={e => set('subject', e.target.value)} placeholder="How can we help?"
                style={{ width: '100%', padding: '.65rem .9rem', border: '1.5px solid var(--ds-outline-variant)', borderRadius: 8, fontSize: '.9rem', fontFamily: 'Inter, sans-serif', background: 'var(--ds-surface-container-low)', outline: 'none', boxSizing: 'border-box', color: 'var(--ds-on-surface)' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '.75rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500, color: 'var(--ds-on-surface-variant)', display: 'block', marginBottom: '.4rem', letterSpacing: '.05em', textTransform: 'uppercase' }}>Message</label>
              <textarea value={contactForm.message} onChange={e => set('message', e.target.value)} placeholder="Your message here..." rows={4}
                style={{ width: '100%', padding: '.65rem .9rem', border: '1.5px solid var(--ds-outline-variant)', borderRadius: 8, fontSize: '.9rem', fontFamily: 'Inter, sans-serif', background: 'var(--ds-surface-container-low)', outline: 'none', boxSizing: 'border-box', resize: 'vertical', color: 'var(--ds-on-surface)' }} />
            </div>
            {submitMessage && (
              <div style={{ marginBottom: '1rem', fontSize: '.875rem', color: submitMessage.includes('successfully') ? '#166534' : '#7f1d1d' }}>{submitMessage}</div>
            )}
            <button type="submit" disabled={isSubmitting || hasRecentSubmission()} style={{ width: '100%', background: 'var(--ds-primary)', color: '#fff', border: 'none', padding: '.875rem', borderRadius: 8, fontWeight: 600, fontSize: '1rem', cursor: (isSubmitting || hasRecentSubmission()) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', fontFamily: 'Inter, sans-serif', opacity: (isSubmitting || hasRecentSubmission()) ? 0.7 : 1 }}>
              {isSubmitting ? 'Sending...' : <><Send size={18} /> Send Message</>}
            </button>
          </form>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'var(--ds-primary)', color: '#fff', padding: '3rem 3rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr', gap: '3rem', marginBottom: '3rem' }}>
            <div>
              <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: 700, fontSize: '1.2rem', marginBottom: '.75rem' }}>MediShare</div>
              <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.875rem', lineHeight: 1.7, marginBottom: '1.25rem', maxWidth: 240 }}>Healing through sharing. We connect surplus medicine with those who need it most.</p>
              <div style={{ display: 'flex', gap: '.75rem' }}>
                {[Twitter, Linkedin, Facebook].map((Icon, i) => (
                  <a key={i} href="#" style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.7)' }}><Icon size={16} /></a>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '.75rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: '1rem' }}>Quick Links</div>
              {[['Home','/'],['How It Works','/about'],['Donate','/register'],['Request Medicines','/register']].map(([l,h]) => (
                <Link key={l} to={h} style={{ display: 'block', color: 'rgba(255,255,255,.65)', fontSize: '.875rem', textDecoration: 'none', marginBottom: '.5rem' }}>{l}</Link>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '.75rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: '1rem' }}>Support</div>
              {[['Privacy Policy','#'],['Terms of Service','#'],['HIPAA Compliance','#'],['Contact Support','#contact']].map(([l,h]) => (
                <a key={l} href={h} style={{ display: 'block', color: 'rgba(255,255,255,.65)', fontSize: '.875rem', textDecoration: 'none', marginBottom: '.5rem' }}>{l}</a>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '.75rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: '1rem' }}>Contact Info</div>
              {[
                { icon: MapPin, text: '123 Health St, Medical City' },
                { icon: Phone, text: '+1 (555) 000-1234' },
                { icon: Mail, text: 'support@medishare.org' },
              ].map(({ icon: Icon, text }) => (
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
    </div>
  );
}