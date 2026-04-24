import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { T } from '../theme';
import TopBar from '../components/TopBar';
import Tag from '../components/Tag';
import { getSchedule } from '../api/workouts';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const STYLE_ICON  = { warrior: '⚔️', cardio: '🏃', weights: '🏋️', hiit: '⚡', kickboxing: '🥊' };
const STYLE_COLOR = { warrior: T.red, cardio: T.blue, weights: T.gold, hiit: T.orange };

// Convert API schedule array → offset-keyed map
function buildScheduleMap(items) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const map = {};
  items.forEach(item => {
    const d = new Date(item.scheduledAt || item.date || item.scheduledDate);
    if (isNaN(d)) return;
    d.setHours(0, 0, 0, 0);
    const offset = Math.round((d - today) / 86400000);
    map[offset.toString()] = {
      name:  item.workoutName || item.name || 'Workout',
      dur:   item.duration    || item.dur  || 0,
      done:  item.completed   || item.done || false,
      style: item.style || 'warrior',
      id:    item.workoutId   || item.id,
    };
  });
  return map;
}

export default function CalendarPage() {
  const nav = useNavigate();
  const today = new Date();
  const [monthOffset, setMonthOffset] = useState(0);
  const [schedule, setSchedule] = useState({});

  useEffect(() => {
    getSchedule().then(data => {
      const items = Array.isArray(data) ? data : data?.items || data?.schedule || [];
      if (items.length > 0) setSchedule(buildScheduleMap(items));
    }).catch(() => {});
  }, []);

  const displayDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const monthName   = displayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const firstDay    = displayDate.getDay();
  const daysInMonth = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0).getDate();

  function hasWorkout(day) {
    const diff = new Date(displayDate.getFullYear(), displayDate.getMonth(), day) - new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const offset = Math.round(diff / 86400000);
    return schedule[offset.toString()];
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      <TopBar title="Calendar" backTo="/more" />

      {/* Month nav */}
      <div style={{ padding: '14px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <button onClick={() => setMonthOffset(m => m - 1)} style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 2, color: T.white, fontFamily: 'inherit', fontWeight: 900, padding: '6px 12px', cursor: 'pointer', fontSize: 14 }}>‹</button>
        <div style={{ fontWeight: 900, fontSize: 14, letterSpacing: 1 }}>{monthName.toUpperCase()}</div>
        <button onClick={() => setMonthOffset(m => m + 1)} style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 2, color: T.white, fontFamily: 'inherit', fontWeight: 900, padding: '6px 12px', cursor: 'pointer', fontSize: 14 }}>›</button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '0 18px', marginBottom: 6 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 8, color: T.whiteDim, letterSpacing: 1, fontWeight: 700, padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '0 18px', gap: 3 }}>
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = monthOffset === 0 && day === today.getDate();
          const workout = hasWorkout(day);
          return (
            <div key={day}
              style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 2, cursor: workout ? 'pointer' : 'default', background: isToday ? T.red : T.surface, border: `1px solid ${isToday ? T.red : T.line}`, position: 'relative', transition: 'border-color .1s' }}
              onClick={() => workout && nav('/workout', { state: { workout } })}
            >
              <div style={{ fontSize: 11, fontWeight: isToday ? 900 : 400, color: isToday ? '#fff' : T.white }}>{day}</div>
              {workout && (
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: workout.done ? T.green : T.gold, position: 'absolute', bottom: 3 }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Upcoming workouts list */}
      <div style={{ padding: '18px 18px 0' }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: T.whiteDim, fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Upcoming</div>
        {Object.keys(schedule).filter(k => parseInt(k) >= 0).length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: T.whiteDim, fontSize: 11 }}>
            No upcoming workouts scheduled. Your program will appear here once it's set up.
          </div>
        )}
        {Object.entries(schedule)
          .filter(([k]) => parseInt(k) >= 0)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .slice(0, 6)
          .map(([offset, w]) => {
            const d = new Date(today);
            d.setDate(d.getDate() + parseInt(offset));
            const label = parseInt(offset) === 0 ? 'Today' : parseInt(offset) === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            return (
              <div key={offset} onClick={() => nav('/workout', { state: { workout: w } })}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: `1px solid ${T.line}`, cursor: 'pointer' }}>
                <div style={{ width: 38, height: 38, background: (STYLE_COLOR[w.style] || T.red) + '18', border: `1px solid ${(STYLE_COLOR[w.style] || T.red) + '44'}`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  {STYLE_ICON[w.style] || '🏋️'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, letterSpacing: 0.5, marginBottom: 2 }}>{w.name}</div>
                  <div style={{ fontSize: 9, color: T.whiteDim }}>{label} · {w.dur} min</div>
                </div>
                {parseInt(offset) === 0 && <Tag color={T.red}>TODAY</Tag>}
              </div>
            );
          })}
      </div>
    </div>
  );
}
