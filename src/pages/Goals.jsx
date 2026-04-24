import { useState, useEffect } from 'react';
import { T } from '../theme';
import TopBar from '../components/TopBar';
import Btn from '../components/Btn';
import Ring from '../components/Ring';

const TYPE_ICONS = { program: '📋', body: '⚖️', strength: '💪', habit: '🔁' };

function loadGoals() {
  try {
    const saved = localStorage.getItem('kct_goals');
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

function saveGoals(goals) {
  try { localStorage.setItem('kct_goals', JSON.stringify(goals)); } catch {}
}

export default function Goals() {
  const [goals, setGoals]   = useState(() => loadGoals() || []);
  const [adding, setAdding] = useState(false);
  const [form, setForm]     = useState({ title: '', type: 'habit', target: '', current: '', unit: '' });

  // Persist whenever goals change
  useEffect(() => { saveGoals(goals); }, [goals]);

  function addGoal() {
    if (!form.title || !form.target) return;
    setGoals(g => [...g, {
      id: Date.now(),
      ...form,
      target: +form.target,
      current: +form.current || 0,
      color: T.blue,
    }]);
    setForm({ title: '', type: 'habit', target: '', current: '', unit: '' });
    setAdding(false);
  }

  function removeGoal(id) { setGoals(g => g.filter(x => x.id !== id)); }

  function updateProgress(id, delta) {
    setGoals(g => g.map(x =>
      x.id === id ? { ...x, current: Math.min(x.target, Math.max(0, x.current + delta)) } : x
    ));
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      <TopBar title="Goals" backTo="/more" />

      <div style={{ padding: '14px 18px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: T.whiteDim, fontWeight: 700, textTransform: 'uppercase' }}>Active Goals</div>
          <Btn v="primary" sz="sm" onClick={() => setAdding(true)}>+ New Goal</Btn>
        </div>

        {goals.length === 0 && !adding && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🎯</div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>No goals yet</div>
            <div style={{ fontSize: 11, color: T.whiteDim, marginBottom: 16 }}>Set your first goal to start tracking progress.</div>
            <Btn v="primary" sz="md" onClick={() => setAdding(true)}>+ Add First Goal</Btn>
          </div>
        )}

        {goals.map(g => {
          const pct = Math.round(g.current / g.target * 100);
          const done = pct >= 100;
          return (
            <div key={g.id} style={{ background: T.panel, border: `1px solid ${done ? T.green : T.line}`, borderRadius: 2, padding: '14px 16px', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <Ring pct={pct} size={56} color={done ? T.green : g.color} label={`${pct}%`} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, letterSpacing: 0.5 }}>{g.title}</div>
                    <span style={{ fontSize: 14 }}>{TYPE_ICONS[g.type] || '🎯'}</span>
                  </div>
                  <div style={{ fontSize: 10, color: T.whiteDim, marginBottom: 8 }}>
                    {g.current} / {g.target} {g.unit} {done ? '✅' : ''}
                  </div>
                  <div style={{ height: 3, background: T.line, borderRadius: 2, marginBottom: 10 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: done ? T.green : g.color, borderRadius: 2, transition: 'width .5s' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => updateProgress(g.id, -1)}
                      style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 2, color: T.white, fontFamily: 'inherit', fontWeight: 900, padding: '3px 10px', cursor: 'pointer', fontSize: 14 }}>−</button>
                    <button onClick={() => updateProgress(g.id, 1)}
                      style={{ background: g.color, border: 'none', borderRadius: 2, color: '#fff', fontFamily: 'inherit', fontWeight: 900, padding: '3px 10px', cursor: 'pointer', fontSize: 14 }}>+</button>
                    <button onClick={() => removeGoal(g.id)}
                      style={{ background: 'none', border: 'none', color: T.whiteDim, cursor: 'pointer', marginLeft: 'auto', fontSize: 13 }}>✕</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add goal form */}
        {adding && (
          <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 2, padding: '16px', marginTop: 10 }}>
            <div style={{ fontWeight: 900, fontSize: 14, letterSpacing: 1, marginBottom: 14 }}>NEW GOAL</div>
            {[
              { l: 'Goal Title', k: 'title',   t: 'text',   ph: 'e.g. Run 5K under 25min' },
              { l: 'Target',     k: 'target',  t: 'number', ph: '100' },
              { l: 'Current',    k: 'current', t: 'number', ph: '0' },
              { l: 'Unit',       k: 'unit',    t: 'text',   ph: 'lbs, reps, days…' },
            ].map(f => (
              <div key={f.k} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 8, letterSpacing: 2, color: T.whiteDim, textTransform: 'uppercase', marginBottom: 4 }}>{f.l}</div>
                <input type={f.t} value={form[f.k]} onChange={e => setForm(x => ({ ...x, [f.k]: e.target.value }))}
                  placeholder={f.ph}
                  style={{ width: '100%', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 2, color: T.white, fontFamily: 'inherit', fontSize: 13, padding: '9px 12px', outline: 'none' }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn v="primary" sz="md" onClick={addGoal} full>Save Goal</Btn>
              <Btn v="ghost" sz="md" onClick={() => setAdding(false)} full>Cancel</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
