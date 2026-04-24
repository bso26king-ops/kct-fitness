import { useNavigate } from 'react-router-dom';
import { T } from '../theme';
import TopBar from '../components/TopBar';
import { useAuth } from '../context/AuthContext';
import Tag from '../components/Tag';

const ITEMS = [
  { path: '/goals',       icon: '🎯', label: 'Goals & Habits',    desc: 'Track your fitness goals' },
  { path: '/leaderboard', icon: '🏆', label: 'Leaderboard',       desc: 'See how you rank' },
  { path: '/kickboxing',  icon: '🥊', label: 'Kickboxing Coach',  desc: 'Shadow boxing & combos' },
  { path: '/calendar',    icon: '📅', label: 'My Calendar',       desc: 'Scheduled workouts' },
  { path: '/ai-builder',  icon: '🤖', label: 'AI Workout Builder', desc: 'Generate workouts with Claude AI' },
  { path: '/wearables',   icon: '⌚', label: 'Wearables',         desc: 'Device integrations — coming soon' },
  { path: '/shop',        icon: '🛒', label: 'Shop',              desc: 'KCT gear & supplements — coming soon' },
];

export default function More() {
  const nav = useNavigate();
  const { user, logout, deleteAccount } = useAuth();

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Delete your account?\n\nThis will permanently erase all your workouts, progress, nutrition logs, and goals. This cannot be undone.'
    );
    if (!confirmed) return;
    const reconfirmed = window.confirm('Are you absolutely sure? All your data will be gone forever.');
    if (!reconfirmed) return;
    await deleteAccount();
    nav('/login', { replace: true });
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      <TopBar />

      {/* Profile card */}
      <div style={{ padding: '16px 18px', background: T.panel, borderBottom: `1px solid ${T.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, background: T.red, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: 0.5 }}>{(user?.name || 'Athlete').toUpperCase()}</div>
            <div style={{ fontSize: 10, color: T.whiteDim }}>{user?.email || ''}</div>
          </div>
          <Tag color={T.gold}>Level {user?.level || 1}</Tag>
        </div>
      </div>

      {/* Menu items */}
      <div style={{ padding: '10px 18px 0' }}>
        {ITEMS.map(item => (
          <div key={item.path} onClick={() => nav(item.path)}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px', background: T.panel, border: `1px solid ${T.line}`, borderRadius: 2, cursor: 'pointer', marginBottom: 8, transition: 'border-color .15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.whiteDim}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.line}
          >
            <div style={{ width: 42, height: 42, background: T.surface, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{item.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: 0.5, marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 10, color: T.whiteDim }}>{item.desc}</div>
            </div>
            <span style={{ color: T.whiteDim, fontSize: 20 }}>›</span>
          </div>
        ))}
      </div>

      {/* Sign out */}
      <div style={{ padding: '6px 18px 0' }}>
        <button onClick={logout}
          style={{ width: '100%', background: T.redDim, border: `1px solid ${T.red}44`, borderRadius: 2, color: T.red, fontFamily: 'inherit', fontWeight: 900, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', padding: '12px', cursor: 'pointer' }}>
          Sign Out
        </button>
      </div>

      {/* Delete account */}
      <div style={{ padding: '6px 18px 0' }}>
        <button onClick={handleDeleteAccount}
          style={{ width: '100%', background: 'transparent', border: `1px solid #444`, borderRadius: 2, color: '#666', fontFamily: 'inherit', fontWeight: 700, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', padding: '10px', cursor: 'pointer' }}>
          Delete Account
        </button>
      </div>

      {/* Legal */}
      <div style={{ padding: '4px 18px 0', display: 'flex', justifyContent: 'center', gap: 20 }}>
        <button onClick={() => nav('/privacy')}
          style={{ background: 'none', border: 'none', color: T.whiteDim, fontFamily: 'inherit', fontSize: 9, letterSpacing: 1, cursor: 'pointer', textDecoration: 'underline' }}>
          Privacy Policy
        </button>
      </div>

      {/* Version */}
      <div style={{ padding: '10px 18px 14px', textAlign: 'center' }}>
        <div style={{ fontSize: 8, color: T.whiteDim, letterSpacing: 2 }}>KCT FITNESS v1.0 · KING'S COMBAT TRAINING</div>
      </div>
    </div>
  );
}
