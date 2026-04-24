import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { T, FONT_IMPORT } from '../theme';
import Btn from '../components/Btn';
import Tag from '../components/Tag';
import { logWorkout } from '../api/workouts';

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

// ─── Default workout if no state passed ─────────────────────────────────────
const DEFAULT_WORKOUT = {
  _id: 'w1',
  name: 'KCT Warrior — Max Out',
  style: 'warrior',
  duration: 45,
  warmup: [
    { exercise: 'High Knees', duration: '2 min', cue: 'Drive knees to hip height, stay light on feet' },
    { exercise: 'Arm Circles', duration: '1 min', cue: 'Full range — backward and forward' },
    { exercise: 'Hip Circles', duration: '1 min', cue: 'Wide circles, loosen the hip flexors' },
  ],
  main: [
    { exercise: 'Barbell Back Squat', sets: 4, reps: '6-8', rest: 120, cue: 'Drive through heels. Chest up. Break parallel.' },
    { exercise: 'Barbell Bench Press', sets: 4, reps: '6-8', rest: 90, cue: 'Retract scapula. Bar to nipple line.' },
    { exercise: 'Barbell Row', sets: 3, reps: '8-10', rest: 90, cue: 'Pull to lower chest. Squeeze at the top.' },
    { exercise: 'Overhead Press', sets: 3, reps: '8-10', rest: 90, cue: 'Brace core hard. Lock out overhead.' },
    { exercise: 'Romanian Deadlift', sets: 3, reps: '8-10', rest: 90, cue: 'Hinge at hips. Feel the hamstrings stretch.' },
  ],
  cooldown: [
    { exercise: 'Hip Flexor Stretch', duration: '60s each', cue: 'Deep lunge. Breathe into the stretch.' },
    { exercise: 'Pigeon Pose', duration: '90s each', cue: 'Let gravity work. Stay relaxed.' },
    { exercise: 'Child\'s Pose', duration: '60s', cue: 'Arms extended. Full spinal decompression.' },
  ],
  coachNote: 'Every rep with purpose. That\'s what separates warriors from the rest.',
};

// Flatten workout sections into exercise queue
function buildQueue(workout) {
  const q = [];
  (workout.warmup || []).forEach((e, i) => q.push({ ...e, section: 'warmup', idx: i }));
  (workout.main || []).forEach((e, i) => {
    for (let s = 1; s <= (e.sets || 1); s++) {
      q.push({ ...e, section: 'main', idx: i, setNum: s, totalSets: e.sets || 1 });
    }
  });
  (workout.cooldown || []).forEach((e, i) => q.push({ ...e, section: 'cooldown', idx: i }));
  return q;
}

const SECTION_COLOR = { warmup: T.blue, main: T.red, cooldown: T.green };
const SECTION_LABEL = { warmup: 'WARM UP', main: 'MAIN BLOCK', cooldown: 'COOL DOWN' };

export default function WorkoutPlayer() {
  const nav = useNavigate();
  const { state } = useLocation();
  const workout = state?.workout || DEFAULT_WORKOUT;
  const queue   = buildQueue(workout);
  const totalExercises = queue.length;

  // ─── State ──────────────────────────────────────────────────────────────
  const [phase,    setPhase]    = useState('preview'); // preview | active | rest | done
  const [qIdx,     setQIdx]     = useState(0);
  const [elapsed,  setElapsed]  = useState(0);
  const [restLeft, setRestLeft] = useState(0);
  const [running,  setRunning]  = useState(false);
  const [setsDone, setSetsDone] = useState({});  // { 'exName-setNum': reps }
  const [notes,    setNotes]    = useState('');
  const [saved,    setSaved]    = useState(false);
  const timerRef = useRef(null);

  const current = queue[qIdx] || queue[queue.length - 1];

  // ─── Total elapsed timer ─────────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'active' && running) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase, running]);

  // ─── Rest countdown ──────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'rest') return;
    if (restLeft <= 0) { setPhase('active'); return; }
    const t = setTimeout(() => setRestLeft(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, restLeft]);

  // ─── Controls ────────────────────────────────────────────────────────────
  function startWorkout() { setPhase('active'); setRunning(true); }
  function togglePause()  { setRunning(r => !r); }

  function completeSet() {
    const key = `${current.exercise}-${current.setNum}`;
    setSetsDone(d => ({ ...d, [key]: current.reps || current.duration || '✓' }));

    if (qIdx + 1 >= queue.length) {
      setRunning(false);
      setPhase('done');
      return;
    }

    const next = queue[qIdx + 1];
    if (current.section === 'main' && current.rest) {
      setRestLeft(current.rest);
      setPhase('rest');
    } else {
      setQIdx(q => q + 1);
    }
  }

  function skipRest() { setRestLeft(0); setPhase('active'); setQIdx(q => q + 1); }

  function nextExercise() {
    if (qIdx + 1 < queue.length) setQIdx(q => q + 1);
    setPhase('active');
  }

  async function saveWorkout() {
    setSaved(true);
    try {
      await logWorkout(workout._id, {
        duration: elapsed,
        exercises: Object.keys(setsDone).length,
        notes,
        completedAt: new Date().toISOString(),
      });
    } catch {}
    setTimeout(() => nav('/'), 1200);
  }

  const pct = Math.round((qIdx / Math.max(totalExercises - 1, 1)) * 100);

  // ────────────────────────────────────────────────────────────────────────
  // PHASE: PREVIEW
  // ────────────────────────────────────────────────────────────────────────
  if (phase === 'preview') {
    return (
      <div style={{ minHeight: '100vh', background: T.black, color: T.white, fontFamily: "'Barlow Condensed', Barlow, sans-serif", maxWidth: 480, margin: '0 auto' }}>
        <style>{FONT_IMPORT}</style>

        {/* Header */}
        <div style={{ background: 'linear-gradient(180deg,#1c0000,#0d0000)', borderBottom: `1px solid ${T.red}55`, padding: '20px 18px 24px' }}>
          <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: T.whiteMid, fontFamily: 'inherit', fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', textTransform: 'uppercase', marginBottom: 14 }}>‹ Back</button>
          <Tag color={T.red}>{workout.style?.toUpperCase() || 'WARRIOR'}</Tag>
          <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 0.5, marginTop: 8, marginBottom: 6 }}>{(workout.name || 'WORKOUT').toUpperCase()}</div>
          <div style={{ display: 'flex', gap: 18 }}>
            <span style={{ fontSize: 10, color: T.whiteDim }}>⏱ {workout.duration || 45} MIN</span>
            <span style={{ fontSize: 10, color: T.whiteDim }}>💪 {(workout.main || []).length} EXERCISES</span>
            <span style={{ fontSize: 10, color: T.whiteDim }}>🔥 ~{Math.round((workout.duration || 45) * 7.5)} CAL</span>
          </div>
        </div>

        {/* Coach note */}
        {workout.coachNote && (
          <div style={{ margin: '16px 18px 0', background: T.goldDim, border: `1px solid ${T.gold}44`, borderRadius: 2, padding: '12px 16px' }}>
            <div style={{ fontSize: 8, color: T.gold, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 }}>Coach King</div>
            <div style={{ fontSize: 12, color: T.white, fontStyle: 'italic' }}>"{workout.coachNote}"</div>
          </div>
        )}

        {/* Sections */}
        {[
          { label: 'Warm Up', color: T.blue, items: workout.warmup, type: 'timed' },
          { label: 'Main Block', color: T.red, items: workout.main, type: 'sets' },
          { label: 'Cool Down', color: T.green, items: workout.cooldown, type: 'timed' },
        ].map(({ label, color, items, type }) => items?.length ? (
          <div key={label} style={{ padding: '16px 18px 0' }}>
            <div style={{ fontSize: 8, letterSpacing: 2, color, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ height: 2, width: 20, background: color }} /> {label}
            </div>
            {items.map((ex, i) => (
              <div key={i} style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 2, padding: '11px 14px', marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: 0.5 }}>{ex.exercise}</div>
                  <div style={{ fontSize: 10, color, fontWeight: 700 }}>
                    {type === 'sets' ? `${ex.sets}×${ex.reps}` : ex.duration}
                  </div>
                </div>
                <div style={{ fontSize: 10, color: T.whiteDim, lineHeight: 1.5 }}>{ex.cue}</div>
                {type === 'sets' && ex.rest && (
                  <div style={{ fontSize: 9, color: T.whiteDim, marginTop: 4 }}>Rest: {ex.rest}s</div>
                )}
              </div>
            ))}
          </div>
        ) : null)}

        {/* Start button */}
        <div style={{ padding: '20px 18px 100px' }}>
          <Btn v="primary" sz="lg" full onClick={startWorkout}>LET'S GO — START WORKOUT →</Btn>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // PHASE: REST
  // ────────────────────────────────────────────────────────────────────────
  if (phase === 'rest') {
    return (
      <div style={{ minHeight: '100vh', background: T.black, color: T.white, fontFamily: "'Barlow Condensed', Barlow, sans-serif", maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <style>{FONT_IMPORT}</style>
        <div style={{ fontSize: 10, color: T.green, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>Rest</div>
        <div style={{ fontSize: 80, fontWeight: 900, color: restLeft <= 10 ? T.red : T.green, lineHeight: 1, marginBottom: 8 }}>{fmt(restLeft)}</div>
        <div style={{ fontSize: 11, color: T.whiteDim, marginBottom: 32 }}>
          Next: <strong style={{ color: T.white }}>{queue[qIdx + 1]?.exercise || 'Done'}</strong>
        </div>
        <Btn v="ghost" sz="md" onClick={skipRest}>Skip Rest →</Btn>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // PHASE: DONE
  // ────────────────────────────────────────────────────────────────────────
  if (phase === 'done') {
    const cals = Math.round(elapsed / 60 * 7.5);
    return (
      <div style={{ minHeight: '100vh', background: T.black, color: T.white, fontFamily: "'Barlow Condensed', Barlow, sans-serif", maxWidth: 480, margin: '0 auto', padding: '40px 18px 80px', textAlign: 'center' }}>
        <style>{FONT_IMPORT}</style>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
        <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 1, marginBottom: 6 }}>WORKOUT COMPLETE</div>
        <div style={{ fontSize: 12, color: T.whiteDim, marginBottom: 32 }}>{workout.name}</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 28 }}>
          {[
            { l: 'Duration', v: fmt(elapsed), icon: '⏱' },
            { l: 'Exercises', v: Object.keys(setsDone).length, icon: '💪' },
            { l: 'Calories', v: cals, icon: '🔥' },
          ].map(x => (
            <div key={x.l} style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 2, padding: '14px 8px' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{x.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{x.v}</div>
              <div style={{ fontSize: 7, color: T.whiteDim, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 }}>{x.l}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'left', marginBottom: 18 }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: T.whiteDim, textTransform: 'uppercase', marginBottom: 6 }}>Workout Notes (optional)</div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="How did it feel? Any PRs today?"
            style={{ width: '100%', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 2, color: T.white, fontFamily: 'inherit', fontSize: 12, padding: '10px 12px', resize: 'vertical', minHeight: 80, outline: 'none' }}
          />
        </div>

        <Btn v="primary" sz="lg" full onClick={saveWorkout} disabled={saved} sx={{ marginBottom: 10 }}>
          {saved ? 'SAVED ✓' : 'SAVE WORKOUT →'}
        </Btn>
        <Btn v="ghost" sz="md" full onClick={() => nav('/')}>Back to Home</Btn>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // PHASE: ACTIVE
  // ────────────────────────────────────────────────────────────────────────
  const sColor = SECTION_COLOR[current.section] || T.white;

  return (
    <div style={{ minHeight: '100vh', background: T.black, color: T.white, fontFamily: "'Barlow Condensed', Barlow, sans-serif", maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      <style>{FONT_IMPORT}</style>

      {/* Top bar */}
      <div style={{ background: T.panel, borderBottom: `1px solid ${T.line}`, padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => { setRunning(false); setPhase('preview'); }} style={{ background: 'none', border: 'none', color: T.whiteMid, fontFamily: 'inherit', fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', textTransform: 'uppercase' }}>✕ End</button>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.gold }}>⏱ {fmt(elapsed)}</span>
          <button onClick={togglePause} style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 2, color: T.white, fontFamily: 'inherit', fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', padding: '5px 12px', textTransform: 'uppercase' }}>
            {running ? '⏸' : '▶'}{running ? ' Pause' : ' Resume'}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: T.line }}>
        <div style={{ height: '100%', width: `${pct}%`, background: T.red, transition: 'width .4s' }} />
      </div>

      {/* Exercise display */}
      <div style={{ flex: 1, padding: '24px 18px', display: 'flex', flexDirection: 'column' }}>
        {/* Section label */}
        <div style={{ fontSize: 8, letterSpacing: 3, color: sColor, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ height: 2, width: 16, background: sColor }} />
          {SECTION_LABEL[current.section]}
          <span style={{ color: T.whiteDim, fontWeight: 400 }}>· {qIdx + 1} / {totalExercises}</span>
        </div>

        {/* Exercise name */}
        <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: 0.5, marginBottom: 6, lineHeight: 1 }}>{current.exercise.toUpperCase()}</div>

        {/* Set / duration */}
        <div style={{ fontSize: 16, color: sColor, fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>
          {current.section === 'main'
            ? `Set ${current.setNum} / ${current.totalSets}  ·  ${current.reps} reps`
            : current.duration}
        </div>

        {/* Coach cue card */}
        <div style={{ background: T.panel, border: `1px solid ${sColor}33`, borderRadius: 2, padding: '14px 16px', marginBottom: 24 }}>
          <div style={{ fontSize: 8, letterSpacing: 2, color: sColor, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>Coach Cue</div>
          <div style={{ fontSize: 14, color: T.white, lineHeight: 1.6 }}>{current.cue}</div>
        </div>

        {/* Up next */}
        {qIdx + 1 < queue.length && (
          <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 2, padding: '10px 14px', marginBottom: 24 }}>
            <div style={{ fontSize: 8, letterSpacing: 2, color: T.whiteDim, textTransform: 'uppercase', marginBottom: 3 }}>Up Next</div>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{queue[qIdx + 1].exercise}</div>
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div style={{ padding: '0 18px 24px' }}>
        <Btn v="primary" sz="lg" full onClick={completeSet}>
          {qIdx + 1 >= queue.length ? 'FINISH WORKOUT ✓' : current.section === 'main' ? `DONE — ${current.reps} REPS ✓` : 'DONE ✓  →'}
        </Btn>
      </div>
    </div>
  );
}
