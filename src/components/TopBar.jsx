import KCTMark from './KCTMark';
import Btn from './Btn';
import { T } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ title, backTo, right }) {
  const { logout } = useAuth();
  const nav = useNavigate();

  return (
    <div style={{
      background: T.panel, borderBottom: `1px solid ${T.line}`,
      padding: '11px 18px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, flexShrink: 0,
    }}>
      {/* Left: logo or back */}
      {backTo ? (
        <button onClick={() => nav(backTo)} style={{
          background: 'none', border: 'none', color: T.whiteMid, cursor: 'pointer',
          fontFamily: 'inherit', fontWeight: 700, fontSize: 11, letterSpacing: 1,
          textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          ‹ Back
        </button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <KCTMark size={26} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: 3, lineHeight: 1 }}>KCT</div>
            <div style={{ fontSize: 7, color: T.whiteDim, letterSpacing: 2, textTransform: 'uppercase' }}>FITNESS</div>
          </div>
        </div>
      )}

      {/* Center title */}
      {title && (
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontSize: 12, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase' }}>
          {title}
        </div>
      )}

      {/* Right slot */}
      <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
        {right}
        <Btn v="ghost" sz="sm" onClick={logout}>Out</Btn>
      </div>
    </div>
  );
}
