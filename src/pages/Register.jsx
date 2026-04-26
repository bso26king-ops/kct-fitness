import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { T, FONT_IMPORT } from '../theme';
import KCTMark from '../components/KCTMark';
import Btn from '../components/Btn';

function Inp({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 9, letterSpacing: 2, color: T.whiteDim, textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '11px 13px', background: T.surface,
          border: `1px solid ${T.line}`, borderRadius: 2, color: T.white,
          fontFamily: 'inherit', fontSize: 13, outline: 'none',
        }}
      />
    </div>
  );
}

export default function Register() {
  const { register, loading } = useAuth();
  const nav = useNavigate();
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [error, setError]         = useState('');

  async function handleSubmit(e) {
    e?.preventDefault();
    setError('');
    if (!name.trim())     return setError('Enter your name.');
    if (!email.trim())    return setError('Enter your email.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    const res = await register(name.trim(), email.trim(), password);
    if (res.ok) nav('/');
    else setError(res.error || 'Registration failed. Please try again.');
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

        {/* Card */}
        <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 2, padding: 28 }}>
          <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Create Account</div>
          <div style={{ fontSize: 11, color: T.whiteDim, marginBottom: 22 }}>Join KCT and start your warrior journey.</div>

          {error && (
            <div style={{ background: T.redDim, border: `1px solid ${T.red}44`, borderRadius: 2, padding: '8px 12px', marginBottom: 14, fontSize: 11, color: T.red }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Inp label="Full Name"  value={name}  onChange={setName}  type="text"  placeholder="Your name" />
            <Inp label="Email"      value={email} onChange={setEmail} type="email" placeholder="your@email.com" />

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: T.whiteDim, textTransform: 'uppercase', marginBottom: 5 }}>Password</div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  style={{ width: '100%', padding: '11px 40px 11px 13px', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 2, color: T.white, fontFamily: 'inherit', fontSize: 13, outline: 'none' }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: T.whiteDim }}>
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <Inp label="Confirm Password" value={confirm} onChange={setConfirm} type="password" placeholder="Re-enter password" />

            {/* Password strength hint */}
            {password.length > 0 && (
              <div style={{ marginBottom: 14, display: 'flex', gap: 4 }}>
                {[
                  password.length >= 8,
                  /[A-Z]/.test(password),
                  /[0-9]/.test(password),
                  /[^A-Za-z0-9]/.test(password),
                ].map((met, i) => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: met ? T.green : T.line, transition: 'background .2s' }} />
                ))}
              </div>
            )}

            <Btn v="primary" sz="lg" full disabled={loading} sx={{ marginBottom: 0 }}>
              {loading ? 'CREATING ACCOUNT…' : 'CREATE ACCOUNT →'}
            </Btn>
          </form>
        </div>

        {/* Sign in link */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <span style={{ fontSize: 11, color: T.whiteDim }}>Already have an account? </span>
          <button onClick={() => nav('/login')}
            style={{ background: 'none', border: 'none', color: T.red, fontFamily: 'inherit', fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.5 }}>
            Sign In
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <div style={{ fontSize: 9, color: T.whiteDim, letterSpacing: 2 }}>KING'S COMBAT TRAINING · v1.0</div>
        </div>
      </div>
    </div>
  );
}
