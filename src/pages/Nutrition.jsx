import { useState, useEffect } from 'react';
import { T } from '../theme';
import TopBar from '../components/TopBar';
import Ring from '../components/Ring';

const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const FOODS_DB = [
  { name: 'Chicken Breast (6oz)',    cal: 187, p: 35, c: 0,  f: 4  },
  { name: 'Brown Rice (1 cup)',       cal: 216, p: 5,  c: 45, f: 2  },
  { name: 'Eggs (3 large)',          cal: 210, p: 18, c: 1,  f: 14 },
  { name: 'Greek Yogurt (1 cup)',    cal: 130, p: 17, c: 9,  f: 2  },
  { name: 'Oats (1/2 cup dry)',      cal: 150, p: 5,  c: 27, f: 3  },
  { name: 'Sweet Potato (medium)',   cal: 103, p: 2,  c: 24, f: 0  },
  { name: 'Broccoli (1 cup)',        cal: 55,  p: 4,  c: 11, f: 1  },
  { name: 'Almonds (1oz)',           cal: 164, p: 6,  c: 6,  f: 14 },
  { name: 'Protein Shake',          cal: 130, p: 25, c: 6,  f: 2  },
  { name: 'Banana',                 cal: 105, p: 1,  c: 27, f: 0  },
  { name: 'Salmon (5oz)',           cal: 234, p: 32, c: 0,  f: 11 },
  { name: 'Cottage Cheese (1 cup)', cal: 163, p: 28, c: 6,  f: 2  },
];

const GOALS = { cal: 2400, p: 185, c: 240, f: 65 };

const EMPTY_LOG = { Breakfast: [], Lunch: [], Dinner: [], Snacks: [] };

function todayKey() {
  return 'kct_nutrition_' + new Date().toISOString().slice(0, 10);
}

function loadTodayLog() {
  try {
    const saved = localStorage.getItem(todayKey());
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

function saveTodayLog(log) {
  try { localStorage.setItem(todayKey(), JSON.stringify(log)); } catch {}
}

function loadWater() {
  try {
    const saved = localStorage.getItem('kct_water_' + new Date().toISOString().slice(0, 10));
    return saved !== null ? Number(saved) : 0;
  } catch { return 0; }
}

function saveWater(v) {
  try { localStorage.setItem('kct_water_' + new Date().toISOString().slice(0, 10), String(v)); } catch {}
}

export default function Nutrition() {
  const [log, setLog]     = useState(() => loadTodayLog() || EMPTY_LOG);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');
  const [water, setWater] = useState(() => loadWater());

  // Persist log whenever it changes
  useEffect(() => { saveTodayLog(log); }, [log]);
  // Persist water whenever it changes
  useEffect(() => { saveWater(water); }, [water]);

  const totals = Object.values(log).flat().reduce(
    (acc, f) => ({ cal: acc.cal + f.cal, p: acc.p + f.p, c: acc.c + f.c, f: acc.f + f.f }),
    { cal: 0, p: 0, c: 0, f: 0 }
  );

  const filtered = FOODS_DB.filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()));

  function addFood(meal, food) {
    setLog(l => ({ ...l, [meal]: [...l[meal], food] }));
    setModal(null);
    setSearch('');
  }

  function removeFood(meal, idx) {
    setLog(l => ({ ...l, [meal]: l[meal].filter((_, i) => i !== idx) }));
  }

  function adjustWater(delta) {
    setWater(w => Math.min(12, Math.max(0, w + delta)));
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      <TopBar />

      {/* Macro summary */}
      <div style={{ padding: '14px 18px 0' }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: T.whiteDim, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Today's Nutrition</div>

        <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 2, padding: '16px', marginBottom: 10 }}>
          {/* Calorie ring + macros */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
            <Ring pct={Math.round(totals.cal / GOALS.cal * 100)} size={88} color={T.gold}
              label={totals.cal} sub="CAL" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, fontSize: 13, marginBottom: 2 }}>Calories</div>
              <div style={{ fontSize: 10, color: T.whiteDim, marginBottom: 10 }}>{totals.cal} / {GOALS.cal} kcal</div>
              <div style={{ height: 3, background: T.line, borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${Math.min(totals.cal / GOALS.cal * 100, 100)}%`, background: totals.cal > GOALS.cal ? T.red : T.gold, borderRadius: 2 }} />
              </div>
            </div>
          </div>

          {/* Macros */}
          {[
            { l: 'Protein', v: totals.p, g: GOALS.p, c: T.blue   },
            { l: 'Carbs',   v: totals.c, g: GOALS.c, c: T.gold   },
            { l: 'Fat',     v: totals.f, g: GOALS.f, c: T.orange },
          ].map(m => (
            <div key={m.l} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 9, color: T.whiteDim, textTransform: 'uppercase', letterSpacing: 1 }}>{m.l}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: m.c }}>{m.v}g / {m.g}g</span>
              </div>
              <div style={{ height: 3, background: T.line, borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${Math.min(m.v / m.g * 100, 100)}%`, background: m.c, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Water tracker */}
        <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 2, padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 9, color: T.blue, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 2 }}>💧 Water</div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>{water} / 8 cups</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => adjustWater(-1)} style={{ width: 32, height: 32, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 2, color: T.white, fontFamily: 'inherit', fontWeight: 900, fontSize: 16, cursor: 'pointer' }}>−</button>
            <button onClick={() => adjustWater(1)}  style={{ width: 32, height: 32, background: T.blue, border: 'none', borderRadius: 2, color: '#fff', fontFamily: 'inherit', fontWeight: 900, fontSize: 16, cursor: 'pointer' }}>+</button>
          </div>
        </div>
      </div>

      {/* Meal logs */}
      {MEALS.map(meal => (
        <div key={meal} style={{ padding: '0 18px', marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: 0.5 }}>{meal}</div>
              <div style={{ fontSize: 9, color: T.whiteDim }}>
                {log[meal].reduce((s, f) => s + f.cal, 0)} kcal
              </div>
            </div>
            <button onClick={() => setModal(meal)}
              style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 2, color: T.white, fontFamily: 'inherit', fontWeight: 700, fontSize: 11, letterSpacing: 1, cursor: 'pointer', padding: '5px 10px', textTransform: 'uppercase' }}>
              + Add
            </button>
          </div>

          {log[meal].length === 0 ? (
            <div style={{ fontSize: 10, color: T.whiteDim, padding: '8px 0' }}>No foods logged yet</div>
          ) : (
            log[meal].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: `1px solid ${T.line}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{f.name}</div>
                  <div style={{ fontSize: 9, color: T.whiteDim }}>P: {f.p}g · C: {f.c}g · F: {f.f}g</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.gold }}>{f.cal} cal</span>
                <button onClick={() => removeFood(meal, i)}
                  style={{ background: 'none', border: 'none', color: T.whiteDim, cursor: 'pointer', fontSize: 14, padding: '2px 4px' }}>✕</button>
              </div>
            ))
          )}
        </div>
      ))}

      {/* Add food modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 200, display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ background: T.panel, borderBottom: `1px solid ${T.line}`, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 900, fontSize: 14, letterSpacing: 1 }}>ADD TO {modal.toUpperCase()}</div>
            <button onClick={() => { setModal(null); setSearch(''); }} style={{ background: 'none', border: 'none', color: T.whiteDim, fontSize: 20, cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ padding: '12px 18px' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search foods..."
              style={{ width: '100%', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 2, color: T.white, fontFamily: 'inherit', fontSize: 13, padding: '10px 12px', outline: 'none' }}
            />
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px' }}>
            {filtered.map((f, i) => (
              <div key={i} onClick={() => addFood(modal, f)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: `1px solid ${T.line}`, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = T.surface + '88'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{f.name}</div>
                  <div style={{ fontSize: 9, color: T.whiteDim }}>P: {f.p}g · C: {f.c}g · F: {f.f}g</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 12, color: T.gold }}>{f.cal} cal</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
