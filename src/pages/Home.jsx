import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { T } from '../theme';
import TopBar from '../components/TopBar';
import StatCard from '../components/StatCard';
import Tag from '../components/Tag';
import { getTodayWorkout, getWorkoutLogs } from '../api/workouts';
import { getStats } from '../api/progress';

export default function Home() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [todayW, setTodayW]     = useState(null);
  const [stats, setStats]       = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.allSettled([
      getTodayWorkout().then(setTodayW).catch(() => {}),
      getStats().then(setStats).catch(() => {}),
      getWorkoutLogs().then(logs => {
        if (Array.isArray(logs) && logs.length > 0) {
          setActivity(logs.slice(0, 3).map(l => ({
            d: new Date(l.completedAt || l.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            n: l.workoutName || l.name || 'Workout',
            cal: l.calories || l.cal || 0,
            dur: l.duration || l.dur || 0,
          })));
        }
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const s = stats || {};
  const xp = s.xp || 0;
  const xpPct = Math.round((xp % 1000) / 10);

  return (
    <div style={{ paddingBottom: 80 }}>
      <TopBar />

      {/* Welcome header */}
      <div style={{ padding: '16px 18px 14px', background: T.panel, borderBottom: `1px solid ${T.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 9, color: T.whiteDim, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 2 }}>Welcome back</div>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5 }}>{(user?.name || 'Athlete').toUpperCase()}</div>
          </div>
          <div style={{ display: 'flex', gap: 5, flexDirection: 'column', alignItems: 'flex-end' }}>
            {s.streak > 0 && <Tag color={T.green}>{s.streak}d 🔥</Tag>}
            {(s.level || user?.level) && <Tag color={T.gold}>Level {s.level || user?.level || 1}</Tag>}
          </div>
        </div>

        {/* XP Progress */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 8, color: T.whiteDim, letterSpacing: 2 }}>RANK PROGRESS</span>
          <span style={{ fontSize: 8, color: T.gold, fontWeight: 700 }}>{xp} / 1000 XP</span>
        </div>
        <div style={{ height: 3, background: T.line, borderRadius: 2 }}>
          <div style={{ height: '100%', width: `${xpPct}%`, background: `linear-gradient(90deg,${T.gold},${T.red})`, borderRadius: 2, transition: 'width 1s' }} />
        </div>
      </div>

      {/* TODAY'S WORKOUT */}
      <div style={{ padding: '16px 18px 0' }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: T.whiteDim, fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Today's Workout</div>
        {todayW ? (
          <div
            onClick={() => nav('/workout', {+ state: { workout: todayW } })}
            style={{ background: 'linear-gradient(135deg,#1c0000 0%,#2d0505 100%)', border: `1px solid ${T.red}`, borderRadius: 2, padding: 20, cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'border-color .15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#ff4444'}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.red}
          >
            <div style={{ position: 'absolute', right: -15, top: -15, opacity: .06, fontSize: 110, pointerEvents: 'none', userSelect: 'none' }}>⚔️</div>
            <div style={{ fontSize: 8, color: T.red, letterSpacing: 2, fontWeight: 700, marginBottom: 5 }}>KCT WARRIOR · {todayW.phase || 'WEEK 1–8'}</div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 0.5, marginBottom: 8 }}>{(todayW.name || 'WORKOUT').toUpperCase()}</div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
              {todayW.duration && <span style={{ fontSize: 10, color: T.whiteDim }}>⏱ {todayW.duration} MIN</span>}
              {todayW.exerciseCount && <span style={{ fontSize: 10, color: T.whiteDim }}>💪 {todayW.exerciseCount} EXERCISES</span>}
              {todayW.tag && <span style={{ fontSize: 10, color: T.red, fontWeight: 700, letterSpacing: 1 }}>{todayW.tag}</span>}
            </div>
            <div style={{ background: T.red, color: '#fff', textAlign: 'center', padding: '13px 0', borderRadius: 2, fontWeight: 900, fontSize: 12, letterSpacing: 3 }}>
              START WORKOUT →
            </div>
          </div>
        ) : (
          <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 2, padding: '28px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⚔️</div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>No workout scheduled today</div>
            <div style={{ fontSize: 11, color: T.whiteDim, marginBottom: 14 }}>Browse your training program to get started.</div>
            <div onClick={() => nav('/train')} style={{ background: T.red, color: '#fff', display: 'inline-block', padding: '10px 24px', borderRadius: 2, fontWeight: 900, fontSize: 11, letterSpacing: 2, cursor: 'pointer' }}>
              VIEW PROGRAM →
            </div>
          </div>
        )}
      </div>

      {/* Stats row — only show if we have real data */}
      {stats && (
        <div style={{ padding: '14px 18px 0', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          <StatCard label="Workouts"   value={s.totalWorkouts || 0}           icon="🏋️" />
          <StatCard label="Streak"     value={`${s.streak || 0}d`}            icon="🔥" color={T.green} />
          <StatCard label="Goals"      value={s.goalsCount || 0}              icon="🎯" />
          <StatCard label="Compliance" value={`${s.complianceRate || 0}%`}   icon="📊" color={T.gold} />
        </div>
      )}

      {/* Active Challenge — only if API returns one */}
      {s.challenge && (
        <div style={{ padding: '14px 18px 0' }}>
          <div
            onClick={() => nav('/leaderboard')}
            style={{ border: `1px solid ${T.gold}55`, borderRadius: 2, padding: 16, background: T.goldDim, cursor: 'pointer', transition: 'border-color .15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.gold}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.gold + '55'}
          >
            <div style={{ fontSize: 9, color: T.gold, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 3, fontWeight: 700 }}>⚡ ACTIVE CHALLENGE</div>
            <div style={{ fontWeight: 900, fontSize: 15, letterSpacing: 1, marginBottom: 3 }}>{s.challenge.name.toUpperCase()}</div>
            <div style={{ fontSize: 10, color: T.whiteDim, marginBottom: 8 }}>
              {s.challenge.current}/{s.challenge.total} days · {s.challenge.total - s.challenge.current} days left
            </div>
            <div style={{ height: 3, background: T.line, borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${Math.round(s.challenge.current / s.challenge.total * 100)}%`, background: T.gold, borderRadius: 2 }} />
            </div>
          </div>
        </div>
      )}

      {/* Quick Access */}
      <div style={{ padding: '14px 18px 0' }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: T.whiteDim, fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Quick Access</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { l: 'Full Program', icon: '📋', path: '/train' },
            { l: 'Kickboxing',   icon: '🥊', path: '/kickboxing' },
            { l: 'My Calendar',  icon: '📅', path: '/calendar' },
            { l: 'My Goals',n     icon: '🏯', path: '/goals' },
          ].map(({ l, icon, path }) => (
            <div key={l} onClick={() => nav(path)}
              style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 2, padding: '13px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'border-color .15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = T.whiteDim}
              onMouseLeave={e => e.currentTarget.style.borderColor = T.line}
            >
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ fontWeight: 700, fontSize: 11, letterSpacing: 0.5 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ padding: '14px 18px 0' }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: T.whiteDim, fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Recent Activity</div>
        {activity.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: T.whiteDim, fontSize: 11 }}>
            No workouts logged yet. Complete your first workout to see activity here.
          </div>
        ) : activity.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${T.line}` }}>
            <div style={{ width: 36, height: 36, background: T.redDim, border: `1px solid ${T.red}33`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>⚔️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 12, letterSpacing: 0.5 }}>{a.n}</div>
              <div style={{ fontSize: 9, color: T.whiteDim, letterSpacing: 1 }}>{a.d}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {a.cal > 0 && <div style={{ fontSize: 11, fontWeight: 700, color: T.gold }}>{a.cal} cal</div>}
              {a.dur > 0 && <div style={{ fontSize: 9, color: T.whiteDim }}>{a.dur} min</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
