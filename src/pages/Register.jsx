import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { T, FONT_IMPORT } from '../theme';
import KCTMark from '../components/KCTMark';
import Btn from '../components/Btn';

export default function Register() {
  const { register, loading } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  async function handleSubmit(e) {
    e?.preventDefault(); setError('');
    if (!name.trim()) return setError('Enter your name.');
    if (!email.trim()) return setError('Enter your email.');
    if (password.length < 8) return setError('Password must be at least 8 chars.');
    if (password !== confirm) return setError('Passwords do not match.');
    const res = await register(name.trim(), email.trim(), password);
    if (res.ok) nav('/');
    else setError(res.error || 'Registration failed.');
  }
  return (
    <div style={{ minHeight: '100vh', background: T.black, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Barlow Condensed', Barlow, sans-serif" }}>
      <style>{`${FONT_IMPORT}*{[box-sizing:border-box;margin:0;padding:0]input::placeholder{color:${T.whiteDim}!important}`}</style>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <KCTMark size={100} />
          <div style={{ fontSize: 10, color: T.whiteDim, letterSpacing: 4, textTransform: 'uppercase' }}>King's Combat Training</div>
        </div>
        <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 2, padding: 28 }}>
          <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Create Account</div>
          {error && <div style={{ background:T.redDim,border:`1px solid ${T.red}44`,borderRadius:2,padding:'8px 12px',marginBottom:14,fontSize:11,color:T.red}}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{marginBottom:14}}><div style={{fontSize:9,letterSpacing:2,color:T.whiteDim,textTransform:'uppercase',marginBottom:5}}>Full Name</div><input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" style={{width:'100%',padding:'11px 13px',background:T.surface,border:`1px solid ${T.line}`,borderRadius:2,color:T.white,fontFamily:'inherit',fontSize:13,outline:'none'}}/></div>
            <div style={{marginBottom:14}}><div style={{fontSize:9,letterSpacing:2,color:T.whiteDim,textTransform:'uppercase',marginBottom:5}}>Email</div><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" style={{width:'100%',padding:'11px 13px',background:T.surface,border:`1px solid ${T.line}`,borderRadius:2,color:T.white,fontFamily:'inherit',fontSize:13,outline:'none'}}/></div>
            <div style={{marginBottom:14}}><div style={{fontSize:9,letterSpacing:2,color:T.whiteDim,textTransform:'uppercase',marginBottom:5}}>Password</div><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min 8 characters" style={{width:'100%',padding:'11px 13px',background:T.surface,border:`1px solid ${T.line}`,borderRadius:2,color:T.white,fontFamily:'inherit',fontSize:13,outline:'none'}}/></div>
            <div style={{marginBottom:14}}><div style={{fontSize:9,letterSpacing:2,color:T.whiteDim,textTransform:'uppercase',marginBottom:5}}>Confirm Password</div><input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Re-enter password" style={{width:'100%',padding:'11px 13px',background:T.surface,border:`1px solid ${T.line}`,borderRadius:2,color:T.white,fontFamily:'inherit',fontSize:13,outline:'none'}}/></div>
            <Btn v="primary" sz="lg" full>{Registering ? 'CREATING...' : 'CREATE ACCOUNT →'}</Btn>
          </form>
        </div>
        <div style={{ textAlign: 'center', marginTop: 16 }}><span style={{ fontSize: 11, color: T.whiteDim }}>Already have an account? </span><button onClick={() => nav('/login')} style={{ background:'none',border:'none',color:T.red,fontFamily:'inherit',fontSize:11,fontWeight:700,cursor:'pointer' }}>Sign In</button></div>
      </div>
    </div>
  );
}
