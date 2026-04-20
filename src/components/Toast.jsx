import { useEffect } from 'react';
import { T } from '../theme';

export default function Toast({ msg, onDone, duration = 2800 }) {
  useEffect(() => {
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [msg]);

  return (
    <div style={{
      position: 'fixed', bottom: 88, left: '50%', transform: 'translateX(-50%)',
      background: T.surface, border: `1px solid ${T.lineHi}`,
      borderRadius: 2, padding: '10px 20px', fontSize: 11, fontWeight: 700,
      letterSpacing: 1.5, textTransform: 'uppercase', color: T.white,
      zIndex: 9999, pointerEvents: 'none', whiteSpace: 'nowrap',
      boxShadow: '0 4px 20px rgba(0,0,0,.6)',
    }}>
      {msg}
    </div>
  );
}
