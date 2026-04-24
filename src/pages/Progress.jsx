import { useState, useEffect } from 'react';
import { T } from '../theme';
import TopBar from '../components/TopBar';
import StatCard from '../components/StatCard';
import Ring from '../components/Ring';
import { getStats } from '../api/progress';
import { getWorkoutLogs } from '../api/workouts';

// ─── Body weight persistence ──────────────────────────────────────────────────
const BW_KEY = 'kct_bodyweight';
function loadBW() {
  try { const s = localStorage.getItem(BW_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}
function saveBW(bw) { try { localStorage.setItem(BW_KEY, JSON.stringify(bw)); } catch {} }

const STYLE_ICON = { warrior: '⚔️', cardio: '🏃', weights: '🏋️', hiit: '⚡', kickboxing: '🥊' };

// ─── Build week chart from logs ───────────────────────────────────────────────
function buildWeekChart(logs) {
  const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const counts = [0, 0, 0, 0, 0, 0, 0];
  const today = new Date();
  logs.forEach(l => {
    const d = new Date(l.completedAt || l.date || l.createdAt);
    const diff = Math.round((today - d) / 86400000);
    if (diff >= 0 && diff < 7) {
      const dayIdx = (today.getDay() - diff + 7) % 7;
      counts[dayIdx]++;
    }
  });
  // Rotate so Monday is first
  const mon = 1;
  return Array.from({ length: 7 }, (_, i) => ({
    l: DAY_LABELS[(mon + i) % 7],
    v: counts[(mon + i) % 7],
  }));
}

// ─── Build 6-month chart from logs ───────────────────────────────────────────
function buildMonthChart(logs) {
  const counts = {};
  logs.forEach(l => {
    const d = new Date(l.completedAt || l.date || l.createdAt);
    const key = d.toLocaleDateString('en-US', { month: 'short' });
    counts[key] = (counts[key] || 0) + 1;
  });
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    months.push({ l: label, v: counts[label] || 0 });
  }
  return months;
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────
function BarChart({ data, color, label }) {
  const max = Math.max(...data.map(d => d.v), 1);
  return (
    <div>
      <div style={{ fontSize: 8, letterSpacing: 2, color: T.whiteDim, textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{ width: '100%', background: color || T.red, borderRadius: '2px 2px 0 0', height: `${Math.round(d.v / max * 100)}%`, minHeight: d.v > 0 ? 3 : 0, transition: 'height .6s' }} />
            <div style={{ fontSize: 7, color: T.whiteDim }}>{d.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Empty chart placeholders (7-day and 6-month) ────────────────────────────
function emptyWeekChart() {
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return labels.map(l => ({ l, v: 0 }));
}
function emptyMonthChart() {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({ l: d.toLocaleDateString('en-US', { month: 'short' }), v: 0 });
  }
  return months;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Progress() {
  const [tab, setTab]       = useState('overview');
  const [stats, setStats]   = useState(null);
  const [history, setHistory] = useState([]);
  const [weeks, setWeeks]   = useState(emptyWeekChart);
  const [months, setMonths] = useState(emptyMonthChart);
  const [bw, setBw]         = useState(() => loadBW() || []);

  useEffect(() => {
    // Fetch stats
    getStats().then(setStats).catch(() => {});

    // Fetch workout logs and derive charts + history
    getWorkoutLogs().then(logs => {
      if (!Array.isArray(logs) || logs.length === 0) return;

      // History list
      const mapped = logs.slice(0, 20).map(l => ({
        date:  new Date(l.completedAt || l.date || l.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        name:  l.workoutName || l.name || 'Workout',
        dur:   l.duration  || l.dur  || 0,
        cal:   l.calories  || l.cal  || 0,
        style: l.style || 'warrior',
      }));
      setHistory(mapped);

      // Charts
      setWeeks(buildWeekChart(logs));
      setMonths(buildMonthChart(logs));
    }).catch(() => {});
  }, []);

  useEffect(() => { saveBW(bw); }, [bw]);

  const s = stats || {};

  return (
    <div style={{ paddingBottom: 80 }}>
      <TopBar />

      {/* Tab bar */}
      <div style={{ display: 'flex', background: T.surfaceHi, padding: 3, margin: '14px 18px 0', borderRadius: 2, border: `1px solid ${T.line}` }}>
        {[{ id: 'overview', l: 'Overview' }, { id: 'history', l: 'History' }, { id: 'body', l: 'Body' }].map(t => (
          <div key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: '8px', textAlign: 'center', cursor: 'pointer', borderRadius: 2, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', transition: 'all .15s', background: tab === t.id ? T.white : 'transparent', color: tab === t.id ? T.black : T.whiteDim }}>
            {t.l}
          </div>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div>
          <div style={{ padding: '14px 18px 0', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            <StatCard label="Total Workouts" value={s.totalWorkouts || 0}                                   icon="🏋️" />
            <StatCard label="Streak"         value={`${s.streak || 0}d`}                                   icon="🔥" color={T.green} />
            <StatCard label="Compliance"     value={`${s.complianceRate || 0}%`}                           icon="📊" color={T.gold} />
            <StatCard label="Total Calories" value={(s.totalCalories || 0).toLocaleString()}               icon="🔥" color={T.orange} />
            <StatCard label="Avg Duration"   value={`${s.avgDuration || 0}m`}                              icon="⏱" />
            <StatCard label="Total Hours"    value={`${Math.round((s.totalMinutes || 0) / 60)}h`}          icon="⏰" color={T.blue} />
          </div>

          <div style={{ margin: '14px 18px 0', background: T.panel, border: `1px solid ${T.line}`, borderRadius: 2, padding: '14px 16px' }}>
            <BarChart data={weeks} color={T.red} label="This Week — Workouts" />
          </div>

          <div style={{ margin: '10px 18px 0', background: T.panel, border: `1px solid ${T.line}`, borderRadius: 2, padding: '14px 16px' }}>
            <BarChart data={months} color={T.gold} label="Monthly Workout Volume" />
          </div>

          <div style={{ margin: '10px 18px 0', background: T.panel, border: `1px solid ${T.line}`, borderRadius: 2, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 20 }}>
            <Ring pct={s.complianceRate || 0} size={80} color={T.gold} label={`${s.complianceRate || 0}%`} sub="RATE" />
            <div>
              <div style={{ fontWeight: 900, fontSize: 15, letterSpacing: 0.5, marginBottom: 4 }}>Compliance Rate</div>
              <div style={{ fontSize: 11, color: T.whiteDim, lineHeight: 1.6 }}>
                {s.complianceRate > 0
                  ? <>You've completed {s.complianceRate >= 75 ? 'the majority of' : 'some of'} your scheduled workouts this month.{s.complianceRate >= 80 ? ' Outstanding consistency.' : ' Keep pushing.'}</>
                  : 'Complete scheduled workouts to build your compliance rate.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORY ── */}
      {tab === 'history' && (
        <div style={{ padding: '14px 18px 0' }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: T.whiteDim, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Recent Workouts</div>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: T.whiteDim, fontSize: 12 }}>
              No workouts logged yet. Complete your first workout to see your history here.
            </div>
          ) : history.map((w, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${T.line}` }}>
              <div style={{ width: 40, height: 40, background: T.redDim, border: `1px solid ${T.red}33`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {STYLE_ICON[w.style] || '🏋️'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 12, letterSpacing: 0.5, marginBottom: 2 }}>{w.name}</div>
                <div style={{ fontSize: 9, color: T.whiteDim }}>{w.date}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {w.cal > 0 && <div style={{ fontSize: 11, fontWeight: 700, color: T.gold }}>{w.cal} cal</div>}
                {w.dur > 0 && <div style={{ fontSize: 9, color: T.whiteDim }}>{w.dur} min</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── BODY ── */}
      {tab === 'body' && (
        <div style={{ padding: '14px 18px 0' }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: T.whiteDim, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Body Weight Trend</div>

          {bw.length === 0 ? (
            <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 2, padding: '28px 20px', marginBottom: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>⚖️</div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>No weight logs yet</div>
              <div style={{ fontSize: 11, color: T.whiteDim }}>Log your first weight below to start tracking your trend.</div>
            </div>
          ) : (
          <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 2, padding: '16px', marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 80, marginBottom: 8 }}>
              {bw.map((p, i) => {
                const min = Math.min(...bw.map(b => b.v));
                const max = Math.max(...bw.map(b => b.v));
                const range = max - min || 1;
                const h = Math.round(((p.v - min) / range) * 60) + 10;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ fontSize: 8, color: T.white }}>{p.v}</div>
                    <div style={{ width: '60%', height: h, background: T.blue, borderRadius: '2px 2px 0 0' }} />
                    <div style={{ fontSize: 7, color: T.whiteDim }}>{p.d}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: `1px solid ${T.line}` }}>
              <span style={{ fontSize: 10, color: T.whiteDim }}>Start: {bw[0]?.v} lbs</span>
              <span style={{ fontSize: 10, color: bw[0]?.v >= bw[bw.length-1]?.v ? T.green : T.red, fontWeight: 700 }}>
                {bw[0]?.v > bw[bw.length-1]?.v ? '▼' : '▲'} {Math.abs(bw[0]?.v - bw[bw.length-1]?.v)} lbs
              </span>
              <span style={{ fontSize: 10, color: T.whiteDim }}>Now: {bw[bw.length-1]?.v} lbs</span>
            </div>
          </div>
          )}

          <LogWeight onLog={(v) => {
            const label = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            setBw(prev => {
              const next = [...prev, { d: label, v }];
              return next.length > 8 ? next.slice(next.length - 8) : next;
            });
          }} />
        </div>
      )}
    </div>
  );
}

function LogWeight({ onLog }) {
  const [val, setVal] = useState('');
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 2, padding: '14px 16px' }}>
      <div style={{ fontSize: 9, letterSpacing: 2, color: T.whiteDim, textTransform: 'uppercase', marginBottom: 10 }}>Log Today's Weight</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="number" value={val} onChange={e => setVal(e.target.value)}
          placeholder="lbs"
          style={{ flex: 1, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 2, color: T.white, fontFamily: 'inherit', fontSize: 14, fontWeight: 700, padding: '9px 12px', outline: 'none' }}
        />
        <button onClick={() => { if (val) { onLog(Number(val)); setVal(''); } }}
          style={{ background: T.red, border: 'none', borderRadius: 2, color: '#fff', fontFamily: 'inherit', fontWeight: 900, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', padding: '0 18px', cursor: 'pointer' }}>
          LOG
        </button>
      </div>
    </div>
  );
}
