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
      <input type={type} value={value} onChange={(_e) => onChange(_e.target.value)} placeholder={placeholder} style={{ width: '100%', padding: '11px 13px', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 2, color: T.white, fontFamily: 'inherit', fontSize: 13, outline: 'none' }} />
    </div>
  );
}

export default function Login() {
  const { login, loading } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  async function handleSubmit(e) {
    e?.preventDefault();
    if (!email.trim() || !password.trim()) { setError('Enter your email and password.'); return; }
    setError('');
    const res = await login(email.trim(), password);
    if (res.ok) nav('/');
    else setError(res.error || 'Login failed.');
  }
  return (
    <div style={{ minHeight: '100vh', background: T.black, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Barlow Condensed', Barlow, sans-serif" }}>
      <style>{`${FONT_IMPORT}*[box-sizing:border-box;margin:0;padding:0]input::placeholder{color:${T.whiteDim}!important}`}</style>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <KCTMark size={120} />
          <div style={{ fontSize: 10, color: T.whiteDim, letterSpacing: 4, textTransform: 'uppercase', marginTop: 4 }}>King's Combat Training</div>
        </div>
        <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 2, padding: 28 }}>
          <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Client Login</div>
          {error && <div style={{ background:T.redDim, border:`1px solid ${T.red}44`,borderRadius:2,padding:'8px 12px',marginBottom:14,fontSize:11,color:T.red}}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <Inp label="Email" value={email} onChange={setEmail} type="email" placeholder="your@email.com" />
            <Inp label="Password" value={password} onChange={setPassword} type="password" placeholder="••••••••" />
            <Btn v="primary" sz="lg" full disabled={loading} sx={{ marginBottom: 14 }}>{loading ? 'SIGNING IN…' : 'SIGN IN →'}</Btn>
            <div style={{ textAlign: 'center' }}><button type="button" onClick={() => nav('/forgot-password')} style={{ background:'none',border:'none',color:T.whiteDim,fontFamily:'inherit',fontSize:11,cursor:'pointer' }}>Forgot password?</button></div>
          </form>
        </div>
        <div style={{ textAlign: 'center', marginTop: 16 }}><span style={{ fontSize: 11, color: T.whiteDim }}>New to KCT? </span><button onClick={() => nav('/register')} style={{ background:'none',border:'none',color:T.red,fontFamily:'inherit',fontSize:11,fontWeight:700,cursor:'pointer' }}>Create Account</button></div>
      </div>
    </div>
  );
}
