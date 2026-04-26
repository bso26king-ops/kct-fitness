import { T } from '../theme';

export default function Ring({ pct = 0, size = 80, color, label, sub }) {
  const c = color || T.red;
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(pct / 100, 1);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.line} strokeWidth={5} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={5}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      {label && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: size * 0.2, fontWeight: 900, color: T.white, lineHeight: 1 }}>{label}</div>
          {sub && <div style={{ fontSize: size * 0.1, color: T.whiteDim, letterSpacing: 1 }}>{sub}</div>}
        </div>
      )}
    </div>
  );
}
