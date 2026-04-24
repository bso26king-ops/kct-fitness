import { useState } from 'react';
import { T } from '../theme';
import TopBar from '../components/TopBar';
import Btn from '../components/Btn';

export default function Shop() {
  const [email, setEmail]       = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]       = useState('');

  function handleNotify(e) {
    e?.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    // Store locally so we don't ask twice
    try {
      const existing = JSON.parse(localStorage.getItem('kct_shop_notify') || '[]');
      localStorage.setItem('kct_shop_notify', JSON.stringify([...existing, email.trim()]));
    } catch {}
    setSubmitted(true);
    setError('');
  }

  const COMING = [
    { icon: '👕', label: 'KCT Apparel',      desc: 'Warrior tees, shorts, compression' },
    { icon: '🥊', label: 'Training Gear',     desc: 'Boxing gloves, jump ropes, bands' },
    { icon: '💊', label: 'Supplements',       desc: 'Pre-workout, protein, creatine' },
    { icon: '📋', label: 'Digital Programs',  desc: '90-day plans, nutrition guides' },
  ];

  return (
    <div style={{ paddingBottom: 80 }}>
      <TopBar title="Shop" backTo="/more" />

      {/* Hero */}
      <div style={{ padding: '32px 24px 28px', textAlign: 'center', borderBottom: `1px solid ${T.line}` }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🛒</div>
        <div style={{ fontSize: 9, color: T.red, letterSpacing: 4, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
          Coming Soon
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 1, marginBottom: 10 }}>
          KCT GEAR & SUPPLEMENTS
        </div>
        <div style={{ fontSize: 12, color: T.whiteDim, lineHeight: 1.6, maxWidth: 300, margin: '0 auto' }}>
          Our full shop is launching soon. Get notified the moment it goes live and be first to grab the new KCT collection.
        </div>
      </div>

      {/* What's coming */}
      <div style={{ padding: '20px 18px 0' }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: T.whiteDim, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>
          What's Coming
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {COMING.map(c => (
            <div key={c.label}
              style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 2, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 28 }}>{c.icon}</span>
              <div style={{ fontWeight: 700, fontSize: 12, letterSpacing: 0.5 }}>{c.label}</div>
              <div style={{ fontSize: 10, color: T.whiteDim, lineHeight: 1.4 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Notify form */}
      <div style={{ padding: '20px 18px 0' }}>
        <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 2, padding: '20px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>✅</div>
              <div style={{ fontWeight: 900, fontSize: 15, letterSpacing: 1, marginBottom: 6 }}>YOU'RE ON THE LIST</div>
              <div style={{ fontSize: 11, color: T.whiteDim }}>We'll email you the moment the shop goes live.</div>
            </div>
          ) : (
            <form onSubmit={handleNotify}>
              <div style={{ fontWeight: 900, fontSize: 15, letterSpacing: 1, marginBottom: 4 }}>GET NOTIFIED</div>
              <div style={{ fontSize: 11, color: T.whiteDim, marginBottom: 14 }}>
                Be first to know when the shop launches.
              </div>
              {error && (
                <div style={{ background: T.redDim, border: `1px solid ${T.red}44`, borderRadius: 2, padding: '8px 12px', marginBottom: 10, fontSize: 11, color: T.red }}>
                  {error}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={{
                    flex: 1, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 2,
                    color: T.white, fontFamily: 'inherit', fontSize: 12, padding: '10px 12px', outline: 'none',
                  }}
                />
                <Btn v="primary" sz="md" onClick={handleNotify}>NOTIFY ME</Btn>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer note */}
      <div style={{ padding: '16px 18px', textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: T.whiteDim }}>
          Questions? Reach us at{' '}
          <span style={{ color: T.blue }}>support@kctfitness.com</span>
        </div>
      </div>
    </div>
  );
}
