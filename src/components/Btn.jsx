import { T } from '../theme';

const variants = {
  primary: () => ({ background: T.red,    color: '#fff',    border: 'none' }),
  gold:    () => ({ background: T.gold,   color: T.black,   border: 'none' }),
  ghost:   () => ({ background: 'transparent', color: T.white, border: `1px solid ${T.line}` }),
  danger:  () => ({ background: T.redDim, color: T.red,     border: `1px solid ${T.red}44` }),
  success: () => ({ background: T.greenDim, color: T.green, border: `1px solid ${T.green}44` }),
};

const sizes = {
  sm: { padding: '5px 12px', fontSize: 10, letterSpacing: 1 },
  md: { padding: '9px 18px', fontSize: 11, letterSpacing: 1.5 },
  lg: { padding: '13px 24px', fontSize: 13, letterSpacing: 2 },
};

export default function Btn({ children, onClick, v = 'primary', sz = 'md', disabled, full, sx = {} }) {
  const vStyle = variants[v]?.() ?? variants.primary();
  const sStyle = sizes[sz] ?? sizes.md;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...vStyle, ...sStyle,
        width: full ? '100%' : undefined,
        fontFamily: 'inherit',
        fontWeight: 900,
        textTransform: 'uppercase',
        borderRadius: 2,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'opacity .15s, border-color .15s',
        ...sx,
      }}
    >
      {children}
    </button>
  );
}
