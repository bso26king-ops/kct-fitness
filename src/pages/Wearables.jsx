import { useState, useEffect, useCallback } from 'react';
import { T } from '../theme';
import TopBar from '../components/TopBar';
import Tag from '../components/Tag';
import Btn from '../components/Btn';
import {
  IS_IOS,
  IS_ANDROID,
  isHealthAvailable,
  healthPlatformName,
  requestHealthPermissions,
  fetchTodaySummary,
  fetchRecentWorkouts,
} from '../api/health';

// ─── Storage helpers ──────────────────────────────────────────────────────────

const CONN_KEY = 'kct_wearables_connected';

function loadConnected() {
  try { return JSON.parse(localStorage.getItem(CONN_KEY) || '{}'); } catch { return {}; }
}
function saveConnected(state) {
  try { localStorage.setItem(CONN_KEY, JSON.stringify(state)); } catch {}
}

// ─── Third-party integrations config ─────────────────────────────────────────
// OAuth-based services — Connect opens their app/web for authorization.
// Swap in real client_id values once your backend OAuth endpoints are live.

const THIRD_PARTY = [
  {
    id: 'garmin',
    name: 'Garmin Connect',
    icon: '⌚',
    color: '#00B7C3',
    desc: 'GPS, training load & recovery metrics',
    oauthUrl: 'https://connect.garmin.com/',
    appScheme: 'garmin-connect://',
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    icon: '💙',
    color: '#00B0B9',
    desc: 'Steps, sleep, heart rate & HR zones',
    oauthUrl: 'https://www.fitbit.com/oauth2/authorize',
    appScheme: 'fitbit://',
  },
  {
    id: 'strava',
    name: 'Strava',
    icon: '🏃',
    color: '#FC4C02',
    desc: 'Running, cycling & activity segments',
    oauthUrl: 'https://www.strava.com/oauth/authorize',
    appScheme: 'strava://',
  },
  {
    id: 'wahoo',
    name: 'Wahoo ELEMNT',
    icon: '🔴',
    color: '#E31E24',
    desc: 'Cycling power, cadence & cardio data',
    oauthUrl: 'https://api.wahooligan.com/oauth/authorize',
    appScheme: 'wahoo-fitness-companion://',
  },
  {
    id: 'samsung',
    name: 'Samsung Health',
    icon: '🔵',
    color: '#1259C3',
    desc: 'Steps, stress, body composition & ECG',
    oauthUrl: 'https://shealth.samsung.com/',
    appScheme: 'shealth://',
    androidOnly: true,
  },
  {
    id: 'polar',
    name: 'Polar Flow',
    icon: '❄️',
    color: '#D90026',
    desc: 'HR, training load & recovery status',
    oauthUrl: 'https://flow.polar.com/',
    appScheme: 'polarflow://',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatPill({ icon, label, value, color }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 2, padding: '10px 12px', textAlign: 'center', flex: 1 }}>
      <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 900, color: color || T.white, marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 8, color: T.whiteDim, letterSpacing: 1.5, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

function WorkoutRow({ workout }) {
  const ICONS = {
    walking: '🚶', running: '🏃', cycling: '🚴', swimming: '🏊',
    yoga: '🧘', strength: '🏋️', hiit: '⚡', kickboxing: '🥊',
    workout: '⚔️', HKWorkoutActivityTypeTraditionalStrengthTraining: '🏋️',
    HKWorkoutActivityTypeRunning: '🏃', HKWorkoutActivityTypeCycling: '🚴',
    HKWorkoutActivityTypeYoga: '🧘', HKWorkoutActivityTypeMixedCardio: '⚡',
  };
  const icon = ICONS[workout.type] || ICONS[workout.name?.toLowerCase()] || '⚔️';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${T.line}` }}>
      <div style={{ width: 36, height: 36, background: T.redDim, border: `1px solid ${T.red}33`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 12, letterSpacing: 0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {workout.name.replace(/HKWorkoutActivityType/g, '').replace(/([A-Z])/g, ' $1').trim()}
        </div>
        <div style={{ fontSize: 9, color: T.whiteDim, marginTop: 1 }}>{workout.date}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {workout.calories > 0 && <div style={{ fontSize: 11, fontWeight: 700, color: T.gold }}>{workout.calories} cal</div>}
        {workout.duration > 0 && <div style={{ fontSize: 9, color: T.whiteDim }}>{workout.duration} min</div>}
      </div>
    </div>
  );
}

// ─── Native Health Card (Apple / Google) ──────────────────────────────────────

function NativeHealthCard({ connected, onConnect, onDisconnect, summary, workouts, loading, error }) {
  const platformName  = healthPlatformName();
  const platformIcon  = IS_IOS ? '🍎' : '💚';
  const platformColor = IS_IOS ? T.white : T.green;

  if (!isHealthAvailable()) {
    return (
      <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 2, padding: '16px', marginBottom: 10, opacity: 0.7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>📱</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: 0.5 }}>Apple Health / Health Connect</div>
            <div style={{ fontSize: 10, color: T.whiteDim }}>Open this app on your iPhone or Android device</div>
          </div>
        </div>
        <div style={{ fontSize: 10, color: T.whiteDim, background: T.surface, borderRadius: 2, padding: '8px 10px' }}>
          Native health sync is only available in the installed app — not in a web browser.
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: T.panel, border: `1px solid ${connected ? platformColor : T.line}`, borderRadius: 2, padding: '16px', marginBottom: 10, transition: 'border-color .2s' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: connected ? 16 : 0 }}>
        <div style={{ width: 44, height: 44, background: T.surface, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
          {platformIcon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: 0.5, marginBottom: 2 }}>{platformName}</div>
          <div style={{ fontSize: 10, color: T.whiteDim }}>
            {IS_IOS ? 'Workouts, steps, heart rate & calories' : 'Steps, exercise, heart rate & calories'}
          </div>
        </div>
        {connected ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <Tag color={T.green}>Connected ✓</Tag>
            <button onClick={onDisconnect}
              style={{ background: 'none', border: 'none', color: T.whiteDim, fontFamily: 'inherit', fontSize: 9, letterSpacing: 1, cursor: 'pointer', textDecoration: 'underline' }}>
              Disconnect
            </button>
          </div>
        ) : (
          <Btn v="primary" sz="sm" onClick={onConnect} disabled={loading}>
            {loading ? '…' : 'Connect'}
          </Btn>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: T.redDim, border: `1px solid ${T.red}33`, borderRadius: 2, padding: '8px 12px', fontSize: 10, color: T.red, marginBottom: 10 }}>
          {error}
        </div>
      )}

      {/* Connected data */}
      {connected && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 10, color: T.whiteDim, letterSpacing: 2 }}>
              SYNCING…
            </div>
          ) : (
            <>
              {/* Today summary */}
              {summary && (
                <>
                  <div style={{ fontSize: 8, color: T.whiteDim, letterSpacing: 3, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Today</div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                    <StatPill icon="👟" label="Steps"    value={summary.steps?.toLocaleString() || '—'}    color={T.blue} />
                    <StatPill icon="🔥" label="Cal"      value={summary.calories > 0 ? `${summary.calories}` : '—'} color={T.orange} />
                    <StatPill icon="❤️" label="HR"       value={summary.heartRate > 0 ? `${summary.heartRate}` : '—'} color={T.red} />
                  </div>
                </>
              )}

              {/* Recent workouts */}
              {workouts?.length > 0 && (
                <>
                  <div style={{ fontSize: 8, color: T.whiteDim, letterSpacing: 3, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Recent from Health</div>
                  {workouts.map((w, i) => <WorkoutRow key={i} workout={w} />)}
                </>
              )}

              {(!summary && !workouts?.length) && (
                <div style={{ fontSize: 11, color: T.whiteDim, textAlign: 'center', padding: '12px 0' }}>
                  No recent health data found. Complete a workout to see it here.
                </div>
              )}

              {/* Last sync note */}
              <div style={{ marginTop: 10, fontSize: 9, color: T.whiteDim, letterSpacing: 1, textAlign: 'right' }}>
                Synced just now
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Third-party integration card ────────────────────────────────────────────

function ThirdPartyCard({ integration, connected, onToggle }) {
  function handleConnect() {
    if (connected) {
      onToggle(integration.id, false);
    } else {
      // Try to open the native app first; fall back to web OAuth page.
      // In production, replace with your backend's OAuth initiation endpoint.
      try {
        window.open(integration.appScheme, '_system');
      } catch {}
      setTimeout(() => {
        window.open(integration.oauthUrl, '_system');
      }, 500);
      onToggle(integration.id, true);
    }
  }

  // Hide Samsung Health on iOS
  if (integration.androidOnly && IS_IOS) return null;

  return (
    <div style={{ background: T.panel, border: `1px solid ${connected ? integration.color : T.line}`, borderRadius: 2, padding: '14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 14, transition: 'border-color .2s' }}>
      <div style={{ width: 44, height: 44, background: `${integration.color}18`, border: `1px solid ${integration.color}33`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
        {integration.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: 0.5, marginBottom: 2 }}>{integration.name}</div>
        <div style={{ fontSize: 10, color: T.whiteDim }}>{integration.desc}</div>
      </div>
      <Btn v={connected ? 'success' : 'ghost'} sz="sm" onClick={handleConnect}>
        {connected ? 'Connected ✓' : 'Connect'}
      </Btn>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Wearables() {
  const [connected, setConnected]   = useState(() => loadConnected());
  const [nativeLoading, setNativeLoading] = useState(false);
  const [nativeError, setNativeError]     = useState('');
  const [summary, setSummary]     = useState(null);
  const [workouts, setWorkouts]   = useState(null);
  const [toast, setToast]         = useState(null);

  const nativeKey = IS_IOS ? 'appleHealth' : 'healthConnect';
  const nativeConnected = !!connected[nativeKey];

  // When native platform is already connected on mount, sync data
  useEffect(() => {
    if (nativeConnected) syncNativeData();
  }, []); // eslint-disable-line

  const syncNativeData = useCallback(async () => {
    setNativeLoading(true);
    setNativeError('');
    const [sumRes, workRes] = await Promise.all([
      fetchTodaySummary(),
      fetchRecentWorkouts(5),
    ]);
    if (sumRes.ok)  setSummary(sumRes.data);
    if (workRes.ok) setWorkouts(workRes.data);
    if (!sumRes.ok && !workRes.ok) setNativeError(sumRes.error || 'Could not load health data.');
    setNativeLoading(false);
  }, []);

  async function handleNativeConnect() {
    setNativeLoading(true);
    setNativeError('');
    const res = await requestHealthPermissions();
    if (res.ok) {
      const next = { ...connected, [nativeKey]: true };
      setConnected(next);
      saveConnected(next);
      showToast(`${healthPlatformName()} connected`);
      await syncNativeData();
    } else {
      setNativeError(res.error || 'Permission denied. Please allow access in Settings.');
      setNativeLoading(false);
    }
  }

  function handleNativeDisconnect() {
    const next = { ...connected, [nativeKey]: false };
    setConnected(next);
    saveConnected(next);
    setSummary(null);
    setWorkouts(null);
    showToast(`${healthPlatformName()} disconnected`);
  }

  function handleThirdPartyToggle(id, value) {
    const next = { ...connected, [id]: value };
    setConnected(next);
    saveConnected(next);
    const integration = THIRD_PARTY.find(i => i.id === id);
    showToast(value ? `${integration.name} connected` : `${integration.name} disconnected`);
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  const connectedCount = Object.values(connected).filter(Boolean).length;

  return (
    <div style={{ paddingBottom: 80 }}>
      <TopBar title="Wearables" backTo="/more" />

      <div style={{ padding: '14px 18px 0' }}>

        {/* Connected summary banner */}
        {connectedCount > 0 && (
          <div style={{ background: T.greenDim, border: `1px solid ${T.green}44`, borderRadius: 2, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 9, color: T.green, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>Active Connections</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{connectedCount} device{connectedCount > 1 ? 's' : ''} connected</div>
            </div>
            <span style={{ fontSize: 22 }}>✅</span>
          </div>
        )}

        {/* Native health platform */}
        <div style={{ fontSize: 9, letterSpacing: 3, color: T.whiteDim, fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>
          Native Health Platform
        </div>

        <NativeHealthCard
          connected={nativeConnected}
          onConnect={handleNativeConnect}
          onDisconnect={handleNativeDisconnect}
          summary={summary}
          workouts={workouts}
          loading={nativeLoading}
          error={nativeError}
        />

        {/* Third-party apps */}
        <div style={{ fontSize: 9, letterSpacing: 3, color: T.whiteDim, fontWeight: 700, textTransform: 'uppercase', marginBottom: 10, marginTop: 8 }}>
          Connected Apps
        </div>

        {THIRD_PARTY.map(integration => (
          <ThirdPartyCard
            key={integration.id}
            integration={integration}
            connected={!!connected[integration.id]}
            onToggle={handleThirdPartyToggle}
          />
        ))}

        {/* Info box */}
        <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 2, padding: '14px 16px', marginTop: 8 }}>
          <div style={{ fontSize: 9, color: T.blue, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>How syncing works</div>
          <div style={{ fontSize: 11, color: T.whiteDim, lineHeight: 1.7 }}>
            {IS_IOS
              ? 'Apple Health reads workouts, steps, heart rate and calories directly from the Health app on your iPhone. Tap Connect and approve access when prompted.'
              : IS_ANDROID
              ? 'Google Health Connect aggregates data from all your Android health and fitness apps — including Samsung Health — in one place.'
              : 'Install the KCT Fitness app on your iPhone or Android device to enable health platform sync.'
            }
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 88, left: '50%', transform: 'translateX(-50%)', background: T.surface, border: `1px solid ${T.lineHi}`, borderRadius: 2, padding: '8px 18px', fontSize: 10, fontWeight: 700, letterSpacing: 1, color: T.white, zIndex: 9999, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
