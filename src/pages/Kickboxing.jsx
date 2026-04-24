import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { T } from '../theme';
import TopBar from '../components/TopBar';
import Btn from '../components/Btn';
import Tag from '../components/Tag';

const COMBOS = [
  { id: 1, name: 'Jab-Cross',            code: '1-2',          level: 'beginner',     cue: 'Sharp extension. Retract fast.' },
  { id: 2, name: 'Jab-Cross-Hook',       code: '1-2-3',        level: 'beginner',     cue: 'Pivot on the hook. Hip rotation.' },
  { id: 3, name: 'Jab-Cross-Lead Hook',  code: '1-2-3',        level: 'intermediate', cue: 'Stay tight. No wind-up.' },
  { id: 4, name: '4-Combo + Body',       code: '1-2-3-2-b',    level: 'intermediate', cue: 'Drop level on the body shot.' },
  { id: 5, name: '6-Punch Combo',        code: '1-2-1-2-3-2',  level: 'advanced',     cue: 'Speed over power. Stay loose.' },
  { id: 6, name: 'Slip & Counter',       code: 'slip-1-2',     level: 'advanced',     cue: 'Move head first. Counter on exit.' },
];

const ROUNDS = [
  { id: 'r1', name: '3-Round Basics',    rounds: 3, duration: 120, rest: 60, style: 'Beginner shadow boxing' },
  { id: 'r2', name: '5-Round Warrior',   rounds: 5, duration: 180, rest: 60, style: 'Intermediate combo work' },
  { id: 'r3', name: 'Championship 12',   rounds: 12, duration: 180, rest: 60, style: 'Advanced full session' },
];

const LEVEL_COLOR = { beginner: T.green, intermediate: T.gold, advanced: T.red };

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function Kickboxing() {
  const nav = useNavigate();
  const [view, setView]       = useState('home'); // home | timer | combos
  const [selectedRound, setSelectedRound] = useState(ROUNDS[0]);
  const [phase, setPhase]     = useState('idle'); // idle | work | rest | done
  const [roundNum, setRound]  = useState(1);
  const [timeLeft, setTime]   = useState(0);
  const [comboFilter, setFilter] = useState('all');
  const timerRef = useRef(null);

  useEffect(() => {
    if (phase === 'idle' || phase === 'done') return;
    timerRef.current = setInterval(() => {
      setTime(t => {
        if (t <= 1) {
          if (phase === 'work') {
            if (roundNum >= selectedRound.rounds) { setPhase('done'); clearInterval(timerRef.current); return 0; }
            setPhase('rest');
            return selectedRound.rest;
          } else {
            setRound(r => r + 1);
            setPhase('work');
            return selectedRound.duration;
          }
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, roundNum]);

  function startSession() {
    setRound(1);
    setPhase('work');
    setTime(selectedRound.duration);
    setView('timer');
  }

  function stopSession() {
    clearInterval(timerRef.current);
    setPhase('idle');
    setView('home');
  }

  // ── HOME ──
  if (view === 'home') {
    return (
      <div style={{ paddingBottom: 80 }}>
        <TopBar title="Kickboxing" backTo="/more" />
        <div style={{ padding: '14px 18px 0' }}>
          {/* Round programs */}
          <div style={{ fontSize: 9, letterSpacing: 3, color: T.whiteDim, fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Select Session</div>
          {ROUNDS.map(r => (
            <div key={r.id} onClick={() => setSelectedRound(r)}
              style={{ background: selectedRound.id === r.id ? T.redDim : T.panel, border: `1px solid ${selectedRound.id === r.id ? T.red : T.line}`, borderRadius: 2, padding: '14px', cursor: 'pointer', marginBottom: 8, transition: 'all .15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ fontWeight: 900, fontSize: 14, letterSpacing: 0.5 }}>{r.name}</div>
                <Tag color={T.red}>{r.rounds} rds</Tag>
              </div>
              <div style={{ fontSize: 10, color: T.whiteDim }}>{r.style} · {fmt(r.duration)}/round · {r.rest}s rest</div>
            </div>
          ))}

          <Btn v="primary" sz="lg" full onClick={startSession} sx={{ marginTop: 6, marginBottom: 14 }}>
            🥊 START SESSION →
          </Btn>

          {/* Combos */}
          <div style={{ fontSize: 9, letterSpacing: 3, color: T.whiteDim, fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Combo Reference</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto', paddingBottom: 4 }}>
            {['all', 'beginner', 'intermediate', 'advanced'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ background: comboFilter === f ? T.red : T.surface, border: `1px solid ${comboFilter === f ? T.red : T.line}`, borderRadius: 2, color: T.white, fontFamily: 'inherit', fontWeight: 700, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', padding: '5px 10px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {f}
              </button>
            ))}
          </div>
          {COMBOS.filter(c => comboFilter === 'all' || c.level === comboFilter).map(c => (
            <div key={c.id} style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 2, padding: '12px 14px', marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</div>
                <Tag color={LEVEL_COLOR[c.level]}>{c.level}</Tag>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 14, color: T.red, fontWeight: 700, marginBottom: 4, letterSpacing: 2 }}>{c.code.toUpperCase()}</div>
              <div style={{ fontSize: 10, color: T.whiteDim }}>{c.cue}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── TIMER ──
  const isWork = phase === 'work';
  const isDone = phase === 'done';
  const pct = phase === 'work'
    ? Math.round((1 - timeLeft / selectedRound.duration) * 100)
    : Math.round((1 - timeLeft / selectedRound.rest) * 100);

  return (
    <div style={{ minHeight: '100vh', background: T.black, color: T.white, fontFamily: "'Barlow Condensed', Barlow, sans-serif", maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {isDone ? (
        <>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🏆</div>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 1, marginBottom: 8 }}>SESSION COMPLETE</div>
          <div style={{ fontSize: 12, color: T.whiteDim, marginBottom: 32 }}>{selectedRound.rounds} rounds · {selectedRound.name}</div>
          <Btn v="primary" sz="lg" onClick={stopSession}>Back to Kickboxing</Btn>
        </>
      ) : (
        <>
          <div style={{ fontSize: 9, color: isWork ? T.red : T.green, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>
            {isWork ? `Round ${roundNum} / ${selectedRound.rounds}` : 'Rest'}
          </div>
          <div style={{ fontSize: 96, fontWeight: 900, color: isWork ? T.white : T.green, lineHeight: 1, marginBottom: 6 }}>{fmt(timeLeft)}</div>
          <div style={{ fontSize: 11, color: T.whiteDim, marginBottom: 36 }}>
            {isWork ? selectedRound.style : `Next: Round ${roundNum + 1}`}
          </div>
          {/* Progress bar */}
          <div style={{ width: '100%', height: 4, background: T.line, borderRadius: 2, marginBottom: 36 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: isWork ? T.red : T.green, borderRadius: 2, transition: 'width 1s linear' }} />
          </div>
          <Btn v="ghost" sz="lg" onClick={stopSession}>End Session</Btn>
        </>
      )}
    </div>
  );
}
