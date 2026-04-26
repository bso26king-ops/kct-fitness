import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../api/auth';
import { T, FONT_IMPORT } from '../theme';
import KCTMark from '../components/KCTMark';
import Btn from '../components/Btn';

export default function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState('');

  async function handleSubmit(e) {
    e?.preventDefault();
    setError('');
    if (!email.trim() || !email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      // Even if the API errors, show success to avoid email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: T.black, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Barlow Condensed', Barlow, sans-serif" }}>
      <style>{`${FONT_IMPORT}*{box-sizing:border-box;margin:0;padding:0;}input::placeholder{color:${T.whiteDim}!important;}`}</style>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <KCTMark size={100} />
          <div style={{ fontSize: 10, color: T.whiteDim, letterSpacing: 4, textTransform: 'uppercase', marginTop: 4 }}>King's Combat Training</div>
        </div>

        <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 2, padding: 28 }}>
          {sent ? (
            /* ── Success state ── */
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
              <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Check Your Email</div>
              <div style={{ fontSize: 12, color: T.whiteDim, lineHeight: 1.7, marginBottom: 24 }}>
                If an account exists for <strong style={{ color: T.white }}>{email}</strong>, you'll receive a password reset link shortly.
              </div>
              <div style={{ fontSize: 11, color: T.whiteDim, marginBottom: 20 }}>
                Didn't get it? Check your spam folder, or try again in a few minutes.
              </div>
              <Btn v="ghost" sz="md" full onClick={() => setSent(false)}>
                Try a Different Email
              </Btn>
            </div>
          ) : (
            /* ── Email entry state ── */
            <>
              <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Reset Password</div>
              <div style={{ fontSize: 11, color: T.whiteDim, marginBottom: 22 }}>
                Enter your email and we'll send you a link to reset your password.
              </div>

              {error && (
                <div style={{ background: T.redDim, border: `1px solid ${T.red}44`, borderRadius: 2, padding: '8px 12px', marginBottom: 14, fontSize: 11, color: T.red }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 9, letterSpacing: 2, color: T.whiteDim, textTransform: 'uppercase', marginBottom: 5 }}>Email Address</div>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com" autoFocus
                    style={{ width: '100%', padding: '11px 13px', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 2, color: T.white, fontFamily: 'inherit', fontSize: 13, outline: 'none' }}
                  />
                </div>
                <Btn v="primary" sz="lg" full disabled={loading}>
                  {loading ? 'SENDING…' : 'SEND RESET LINK →'}
                </Btn>
              </form>
            </>
          )}
        </div>

        {/* Back to login */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={() => nav('/login')}
            style={{ background: 'none', border: 'none', color: T.whiteDim, fontFamily: 'inherit', fontSize: 11, cursor: 'pointer', letterSpacing: 0.5 }}>
            ← Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
