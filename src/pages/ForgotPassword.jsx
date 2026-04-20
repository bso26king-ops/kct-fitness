import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../api/auth';
import { T, FONT_IMPORT } from '../theme';
import KCTMark from '../components/KCTMark';
import Btn from '../components/Btn';

export default function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  async function handleSubmit(e) {
    e?.preventDefault(); setError('');
    if (!email.trim() || !email.includes('@')) { setError('Enter a valid email address.'); return; }
    setLoading(true);
    try { await forgotPassword(email.trim()); setSent(true); }
    catch { setSent(true); }
    finally { setLoading(false); }
  }
  return (
    <div style={{ minHeight: '100vh', background: T.black, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Barlow Condensed', Barlow, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}><KCTMark size={100} /></div>
        <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 2, padding: 28 }}>
          {sent ? (<div style={{textAlign:'center'}}><div style={{fontSize:48,marginBottom:16}}>📧</div><div style={{fontWeight:900,fontSize:18,letterSpacing:2,textTransform:'uppercase',marginBottom:8}}>Check Your Email</div><Btn v="ghost" sz="md" full onClick={()=>setSent(false)}>Try Different Email</Btn></div>) : (<form onSubmit={handleSubmit}><div style={{fontWeight:900,textTransform:'uppercase',marginBottom:4}}>Reset Password</div>{error&&<div style={{color:T.red,marginBottom:14}}>{error}</div>}<div style={{marginBottom:14}}><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" style={{width:'100%',padding:'11px 13px',background:T.surface,border:`1px solid ${T.line}`,borderRadius:2,color:T.white,fontFamily:'inherit',fontSize:13,outline:'none'}}/></div><Btn v="primary" sz="lg" full disabled={loading}>{loading?'SENDING…':'SENE RESET LINK →'}</Btn></form>)}
        </div>
        <div style={{ textAlign: 'center', marginTop: 16 }}><button onClick={() => nav('/login')} style={{ background:'none',border:'none',color:T.whiteDim,fontFamily:'inherit',fontSize:11,cursor:'pointer' }}>← Back to Sign In</button></div>
      </div>
    </div>
  );
}
