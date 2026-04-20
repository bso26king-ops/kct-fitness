import { T } from '../theme';

export default function Tag({ children, color }) {
  const c = color || T.whiteDim;
  return (
    <span style={{
      fontSize: 8, fontWeight: 700, letterSpacing: 1.5,
      textTransform: 'uppercase', color: c,
      background: c + '18', border: `1px solid ${c}44`,
      borderRadius: 2, padding: '2px 7px',
    }}>
      {children}
    </span>
  );
}
