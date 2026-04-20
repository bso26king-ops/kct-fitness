import { useNavigate, useLocation } from 'react-router-dom';
import { T } from '../theme';

const TABS = [
  { path: '/',           icon: '🏠', label: 'Home' },
  { path: '/train',      icon: '⚔️', label: 'Train' },
  { path: '/nutrition',  icon: '🥗', label: 'Nutrition' },
  { path: '/progress',   icon: '📊', label: 'Progress' },
  { path: '/more',       icon: '☰',  label: 'More' },
];
const TRAIN_PATHS = ['/train', '/workout'];
export default function BottomNav() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: T.panel, borderTop: `1px solid ${T.line}`, display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom, 0)', maxWidth: 480, margin: '0 auto' }}>
      {TABS.map((t) => {
        const active = t.path === '/' ? pathname === '/' : t.path === '/train' ? TRAIN_PATHS.some((p) => pathname.startsWith(p)) : pathname.startsWith(t.path);
        return (<div key={t.path} onClick={() => nav(t.path)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 0 10px', cursor: 'pointer', color: active ? T.white : T.whiteDim }}><span style={{ fontSize: 20 }}>{t.icon}</span><span style={{ fontSize: 8, letterSpacing: 1.5, fontWeight: 700, textTransform: 'uppercase' }}>{t.label}</span></div> );
      })}
    </div>
  );
}
