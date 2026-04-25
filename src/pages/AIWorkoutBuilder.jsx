import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { T } from '../theme';
import TopBar from '../components/TopBar';
import Btn from '../components/Btn';
import Tag from '../components/Tag';

// ─── Claude API ──────────────────────────────────────────────────────────────
const CLAUDE_API = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-opus-4-6';

async function callClaude(apiKey, systemPrompt, userPrompt) {
  const res = await fetch(CLAUDE_API, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${res.status}`);
  }
  const data = await res.json();
  const text = data.content?.[0]?.text || '';
  // Extract JSON from the response
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (!jsonMatch) throw new Error('No valid JSON found in response');
  return JSON.parse(jsonMatch[1] || jsonMatch[0]);
}

// ─── System prompts per mode ──────────────────────────────────────────────────
const SYSTEM_PROMPTS = {
  workout: `You are an elite fitness coach for KCT (King's Combat Training) Fitness. Generate professional, detailed workout plans in strict JSON format.

Return ONLY a JSON code block with this exact structure:
\`\`\`json
{
  "_id": "generated-id",
  "name": "Workout Name",
  "style": "warrior|weights|cardio|hiit|recovery",
  "duration": 45,
  "tag": "STRENGTH|CARDIO|HIIT|FULL BODY|RECOVERY|PUSH|PULL|LEGS",
  "difficulty": "easy|moderate|hard|very hard",
  "coachNote": "Motivational note from the coach",
  "warmup": [
    { "exercise": "Exercise Name", "duration": "2 min", "cue": "Form cue for the athlete" }
  ],
  "main": [
    { "exercise": "Exercise Name", "sets": 3, "reps": "8-10", "rest": 90, "cue": "Form cue" }
  ],
  "cooldown": [
    { "exercise": "Stretch Name", "duration": "60s", "cue": "Stretch cue" }
  ]
}
\`\`\`

Rules:
- warmup: 3-5 exercises, duration-based
- main: 5-10 exercises, sets/reps/rest-based (rest in seconds)
- cooldown: 3-4 stretches, duration-based
- Make cues specific, actionable, and motivating
- Match difficulty and style to the request`,

  program: `You are an elite fitness program designer for KCT (King's Combat Training) Fitness. Generate complete training programs in strict JSON format.

Return ONLY a JSON code block with this exact structure:
\`\`\`json
{
  "id": "program-id",
  "name": "Program Name",
  "description": "Short program description",
  "style": "warrior|weights|cardio|hiit",
  "totalWeeks": 8,
  "phases": [
    {
      "name": "Phase Name",
      "weeks": "Weeks 1-4",
      "color": "#hex",
      "workouts": [
        {
          "id": "w1",
          "name": "Workout Name",
          "dur": 45,
          "exCount": 8,
          "tag": "STRENGTH",
          "difficulty": "hard",
          "description": "Brief description of the workout focus"
        }
      ]
    }
  ]
}
\`\`\`

Rules:
- Create 2-4 meaningful phases with clear progression
- Each phase should have 3-6 workouts
- Phase colors: use #3B9EFF (blue), #2ECC6A (green), #FF6B2B (orange), #C8A44A (gold), #C82828 (red)
- Workouts should progress in difficulty across phases
- Include at least one recovery workout per phase`,

  schedule: `You are an elite fitness coach for KCT (King's Combat Training) Fitness. Generate weekly training schedules in strict JSON format.

Return ONLY a JSON code block with this exact structure:
\`\`\`json
{
  "name": "Schedule Name",
  "description": "Who this schedule is designed for",
  "weeklyVolume": "X sessions/week",
  "days": [
    {
      "day": "Monday",
      "type": "training|rest|active-recovery",
      "workout": {
        "name": "Workout Name",
        "duration": 45,
        "focus": "STRENGTH",
        "difficulty": "hard",
        "keyExercises": ["Exercise 1", "Exercise 2", "Exercise 3"],
        "notes": "Any specific notes for this session"
      }
    }
  ],
  "weeklyNotes": "Overall coaching notes for the week",
  "progressionTips": ["Tip 1", "Tip 2", "Tip 3"]
}
\`\`\`

Rules:
- Include all 7 days (Monday through Sunday)
- Rest days should have type "rest" and no workout
- Active recovery days have type "active-recovery" with light activity
- Balance training and recovery appropriately
- keyExercises: list 3-5 main exercises for training days`,

  exercises: `You are an elite fitness coach for KCT (King's Combat Training) Fitness. Generate an exercise library in strict JSON format.

Return ONLY a JSON code block with this exact structure:
\`\`\`json
{
  "category": "Category Name",
  "exercises": [
    {
      "id": "ex-1",
      "name": "Exercise Name",
      "muscleGroup": "Primary muscle group",
      "secondaryMuscles": ["Secondary 1", "Secondary 2"],
      "equipment": ["Equipment 1"],
      "difficulty": "beginner|intermediate|advanced",
      "type": "strength|cardio|mobility|plyometric",
      "sets": "3-4",
      "reps": "8-12",
      "rest": 90,
      "formCues": ["Cue 1", "Cue 2", "Cue 3"],
      "variations": ["Variation 1", "Variation 2"],
      "kctTip": "KCT-specific coaching tip"
    }
  ]
}
\`\`\`

Rules:
- Generate 8-15 exercises per request
- Include detailed form cues (3-4 per exercise)
- Provide practical variations for scaling
- kctTip should be motivating and specific to KCT training style`,
};

// ─── Mode config ──────────────────────────────────────────────────────────────
const MODES = [
  { id: 'workout',   icon: '⚡', label: 'Workout',        color: T.red },
  { id: 'program',   icon: '📋', label: 'Program',        color: T.blue },
  { id: 'schedule',  icon: '📅', label: 'Schedule',       color: T.green },
  { id: 'exercises', icon: '💪', label: 'Exercise Library', color: T.gold },
];

const QUICK_PROMPTS = {
  workout: [
    '45-min full body strength',
    'HIIT kickboxing circuit',
    '30-min upper body push',
    'Active recovery flow',
    'Lower body power day',
    'Combat conditioning',
  ],
  program: [
    '8-week strength builder',
    '12-week fat loss program',
    '6-week kickboxing conditioning',
    '4-week beginner foundation',
    '16-week warrior program',
  ],
  schedule: [
    '5-day warrior split',
    '3-day full body beginner',
    '4-day push/pull/legs',
    '6-day advanced athlete',
    'Combat athlete weekly plan',
  ],
  exercises: [
    'Compound leg exercises',
    'Kickboxing conditioning drills',
    'Upper body pulling movements',
    'Core stability exercises',
    'Explosive power exercises',
    'Mobility & flexibility',
  ],
};

const EQUIPMENT_OPTIONS = ['Barbell', 'Dumbbells', 'Kettlebell', 'Bodyweight', 'Cables', 'Machines', 'Bands', 'Box'];
const FOCUS_OPTIONS = ['Full Body', 'Upper Body', 'Lower Body', 'Push', 'Pull', 'Core', 'Cardio', 'Kickboxing'];

// ─── Workout result card ──────────────────────────────────────────────────────
function WorkoutResult({ data, onPreview }) {
  const DIFF_COLOR = { easy: T.green, moderate: T.blue, hard: T.orange, 'very hard': T.red };
  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 1, marginBottom: 4 }}>{data.name?.toUpperCase()}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Tag color={DIFF_COLOR[data.difficulty] || T.whiteMid}>{data.difficulty?.toUpperCase()}</Tag>
            <Tag color={T.whiteMid}>{data.tag}</Tag>
            <Tag color={T.whiteDim}>{data.duration} MIN</Tag>
          </div>
        </div>
        <Btn v="primary" sz="sm" onClick={() => onPreview(data)}>▶ Preview</Btn>
      </div>

      {/* Coach note */}
      {data.coachNote && (
        <div style={{ background: T.redDim, border: `1px solid ${T.red}33`, borderRadius: 4, padding: '10px 14px', marginBottom: 14, fontSize: 11, color: T.red, fontStyle: 'italic', letterSpacing: 0.3 }}>
          "{data.coachNote}"
        </div>
      )}

      {/* Sections */}
      {[
        { key: 'warmup', label: 'WARM UP', color: T.blue },
        { key: 'main', label: 'MAIN BLOCK', color: T.red },
        { key: 'cooldown', label: 'COOL DOWN', color: T.green },
      ].map(({ key, label, color }) => (
        data[key]?.length > 0 && (
          <div key={key} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 3, color, marginBottom: 6 }}>{label}</div>
            {data[key].map((ex, i) => (
              <div key={i} style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 3, padding: '8px 12px', marginBottom: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: 12 }}>{ex.exercise}</span>
                  <span style={{ fontSize: 10, color: T.whiteMid }}>
                    {ex.sets ? `${ex.sets}×${ex.reps}` : ex.duration}
                    {ex.rest ? ` · ${ex.rest}s rest` : ''}
                  </span>
                </div>
                {ex.cue && <div style={{ fontSize: 10, color: T.whiteDim, lineHeight: 1.4 }}>{ex.cue}</div>}
              </div>
            ))}
          </div>
        )
      ))}
    </div>
  );
}

// ─── Program result card ──────────────────────────────────────────────────────
function ProgramResult({ data }) {
  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 1, marginBottom: 4 }}>{data.name?.toUpperCase()}</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <Tag color={T.whiteMid}>{data.totalWeeks} WEEKS</Tag>
          <Tag color={T.whiteDim}>{data.style?.toUpperCase()}</Tag>
        </div>
        <div style={{ fontSize: 11, color: T.whiteDim, lineHeight: 1.5 }}>{data.description}</div>
      </div>
      {data.phases?.map((phase, pi) => (
        <div key={pi} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 3, height: 18, background: phase.color || T.red, borderRadius: 2 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1 }}>{phase.name?.toUpperCase()}</div>
              <div style={{ fontSize: 9, color: T.whiteDim, letterSpacing: 1 }}>{phase.weeks}</div>
            </div>
          </div>
          {phase.workouts?.map((w, wi) => (
            <div key={wi} style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 3, padding: '8px 12px', marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 2 }}>{w.name}</div>
                {w.description && <div style={{ fontSize: 10, color: T.whiteDim }}>{w.description}</div>}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                <Tag color={T.whiteMid} sx={{ fontSize: 8 }}>{w.tag}</Tag>
                <div style={{ fontSize: 9, color: T.whiteDim, marginTop: 3 }}>{w.dur} min · {w.exCount} ex</div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Schedule result card ─────────────────────────────────────────────────────
function ScheduleResult({ data }) {
  const TYPE_COLOR = { training: T.red, rest: T.whiteDim, 'active-recovery': T.green };
  const TYPE_LABEL = { training: 'TRAIN', rest: 'REST', 'active-recovery': 'RECOVERY' };
  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 1, marginBottom: 4 }}>{data.name?.toUpperCase()}</div>
        <div style={{ fontSize: 11, color: T.whiteDim, marginBottom: 8 }}>{data.description}</div>
        <Tag color={T.blue}>{data.weeklyVolume}</Tag>
      </div>
      {data.days?.map((d, i) => (
        <div key={i} style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 3, padding: '10px 12px', marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: d.workout ? 8 : 0 }}>
            <div style={{ fontWeight: 900, fontSize: 13, letterSpacing: 1 }}>{d.day?.toUpperCase()}</div>
            <Tag color={TYPE_COLOR[d.type] || T.whiteDim}>{TYPE_LABEL[d.type] || d.type?.toUpperCase()}</Tag>
          </div>
          {d.workout && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>{d.workout.name}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                <Tag color={T.whiteDim}>{d.workout.duration} MIN</Tag>
                <Tag color={T.whiteDim}>{d.workout.focus}</Tag>
                <Tag color={T.whiteDim}>{d.workout.difficulty?.toUpperCase()}</Tag>
              </div>
              {d.workout.keyExercises?.length > 0 && (
                <div style={{ fontSize: 10, color: T.whiteDim }}>
                  Key: {d.workout.keyExercises.join(' · ')}
                </div>
              )}
              {d.workout.notes && (
                <div style={{ fontSize: 10, color: T.whiteMid, marginTop: 4, fontStyle: 'italic' }}>{d.workout.notes}</div>
              )}
            </div>
          )}
        </div>
      ))}
      {data.weeklyNotes && (
        <div style={{ background: T.blueDim, border: `1px solid ${T.blue}33`, borderRadius: 4, padding: '10px 14px', marginTop: 8, fontSize: 11, color: T.blue, lineHeight: 1.5 }}>
          {data.weeklyNotes}
        </div>
      )}
      {data.progressionTips?.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 3, color: T.gold, marginBottom: 8 }}>PROGRESSION TIPS</div>
          {data.progressionTips.map((tip, i) => (
            <div key={i} style={{ fontSize: 11, color: T.whiteDim, marginBottom: 4, paddingLeft: 12, borderLeft: `2px solid ${T.gold}55` }}>
              {tip}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Exercise library result card ─────────────────────────────────────────────
function ExercisesResult({ data }) {
  const DIFF_COLOR = { beginner: T.green, intermediate: T.blue, advanced: T.red };
  const [expanded, setExpanded] = useState(null);
  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 1, marginBottom: 4 }}>{data.category?.toUpperCase()}</div>
        <Tag color={T.whiteMid}>{data.exercises?.length} EXERCISES</Tag>
      </div>
      {data.exercises?.map((ex, i) => (
        <div key={i} style={{ background: T.surface, border: `1px solid ${expanded === i ? T.whiteMid : T.line}`, borderRadius: 3, padding: '10px 12px', marginBottom: 6, cursor: 'pointer', transition: 'border-color .15s' }}
          onClick={() => setExpanded(expanded === i ? null : i)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 3 }}>{ex.name}</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                <Tag color={DIFF_COLOR[ex.difficulty] || T.whiteDim}>{ex.difficulty?.toUpperCase()}</Tag>
                <Tag color={T.whiteDim}>{ex.muscleGroup}</Tag>
                <Tag color={T.whiteDim}>{ex.type?.toUpperCase()}</Tag>
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 900 }}>{ex.sets} × {ex.reps}</div>
              <div style={{ fontSize: 9, color: T.whiteDim }}>{ex.rest}s rest</div>
            </div>
          </div>

          {expanded === i && (
            <div style={{ marginTop: 10, borderTop: `1px solid ${T.line}`, paddingTop: 10 }}>
              {ex.equipment?.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 8, color: T.whiteDim, letterSpacing: 2, marginBottom: 4 }}>EQUIPMENT</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {ex.equipment.map((eq, j) => <Tag key={j} color={T.whiteDim}>{eq}</Tag>)}
                  </div>
                </div>
              )}
              {ex.secondaryMuscles?.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 8, color: T.whiteDim, letterSpacing: 2, marginBottom: 4 }}>SECONDARY MUSCLES</div>
                  <div style={{ fontSize: 10, color: T.whiteMid }}>{ex.secondaryMuscles.join(', ')}</div>
                </div>
              )}
              {ex.formCues?.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 8, color: T.whiteDim, letterSpacing: 2, marginBottom: 4 }}>FORM CUES</div>
                  {ex.formCues.map((cue, j) => (
                    <div key={j} style={{ fontSize: 10, color: T.whiteDim, marginBottom: 3, paddingLeft: 10, borderLeft: `2px solid ${T.blue}55` }}>{cue}</div>
                  ))}
                </div>
              )}
              {ex.variations?.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 8, color: T.whiteDim, letterSpacing: 2, marginBottom: 4 }}>VARIATIONS</div>
                  <div style={{ fontSize: 10, color: T.whiteMid }}>{ex.variations.join(' · ')}</div>
                </div>
              )}
              {ex.kctTip && (
                <div style={{ background: T.redDim, border: `1px solid ${T.red}33`, borderRadius: 3, padding: '7px 10px', fontSize: 10, color: T.red, fontStyle: 'italic' }}>
                  KCT Tip: {ex.kctTip}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AIWorkoutBuilder() {
  const nav = useNavigate();

  // API key state (stored in localStorage so it persists between sessions)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('kct_claude_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(!localStorage.getItem('kct_claude_key'));

  // Builder state
  const [mode, setMode] = useState('workout');
  const [prompt, setPrompt] = useState('');
  const [equipment, setEquipment] = useState([]);
  const [focus, setFocus] = useState('');
  const [duration, setDuration] = useState('45');
  const [difficulty, setDifficulty] = useState('moderate');

  // Generation state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const currentMode = MODES.find(m => m.id === mode);

  function saveKey(k) {
    localStorage.setItem('kct_claude_key', k);
    setApiKey(k);
    setShowKeyInput(false);
  }

  function clearKey() {
    localStorage.removeItem('kct_claude_key');
    setApiKey('');
    setShowKeyInput(true);
  }

  function buildUserPrompt() {
    const parts = [prompt || `Generate a ${mode}`];
    if (mode === 'workout') {
      if (duration) parts.push(`Duration: ${duration} minutes`);
      if (difficulty) parts.push(`Difficulty: ${difficulty}`);
      if (focus) parts.push(`Focus: ${focus}`);
      if (equipment.length) parts.push(`Equipment available: ${equipment.join(', ')}`);
    } else if (mode === 'program') {
      if (difficulty) parts.push(`Target difficulty level: ${difficulty}`);
      if (focus) parts.push(`Primary focus: ${focus}`);
    } else if (mode === 'schedule') {
      if (difficulty) parts.push(`Athlete level: ${difficulty}`);
      if (focus) parts.push(`Training emphasis: ${focus}`);
    } else if (mode === 'exercises') {
      if (equipment.length) parts.push(`Equipment: ${equipment.join(', ')}`);
      if (difficulty) parts.push(`Difficulty level: ${difficulty}`);
      if (focus) parts.push(`Muscle focus: ${focus}`);
    }
    return parts.join('\n');
  }

  async function generate() {
    if (!apiKey) { setShowKeyInput(true); return; }
    if (!prompt && mode === 'workout') {
      setError('Please enter a workout description or select a quick prompt.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const userPrompt = buildUserPrompt();
      const data = await callClaude(apiKey, SYSTEM_PROMPTS[mode], userPrompt);
      setResult(data);
      setHistory(prev => [{ mode, prompt: userPrompt, data, time: new Date() }, ...prev].slice(0, 10));
    } catch (err) {
      setError(err.message || 'Generation failed. Check your API key and try again.');
    } finally {
      setLoading(false);
    }
  }

  function copyJSON() {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function previewWorkout(workout) {
    nav('/workout', { state: { workout } });
  }

  function loadHistory(item) {
    setMode(item.mode);
    setPrompt(item.prompt.split('\n')[0]);
    setResult(item.data);
  }

  // ─── API Key setup screen ────────────────────────────────────────────────
  if (showKeyInput) {
    return (
      <div style={{ minHeight: '100vh', background: T.black, color: T.white, fontFamily: "'Barlow Condensed', Barlow, sans-serif" }}>
        <TopBar title="AI BUILDER" backTo="/train" />
        <div style={{ padding: '40px 24px', maxWidth: 400, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 2, marginBottom: 8 }}>CONNECT CLAUDE AI</div>
            <div style={{ fontSize: 11, color: T.whiteDim, lineHeight: 1.6 }}>
              Enter your Anthropic API key to enable AI workout generation. Your key is saved on this device — you only need to enter it once.
            </div>
          </div>
          <KeySetup onSave={saveKey} />
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <button onClick={() => nav('/train')} style={{ background: 'none', border: 'none', color: T.whiteDim, fontFamily: 'inherit', fontSize: 10, letterSpacing: 1, cursor: 'pointer' }}>
              ← BACK TO TRAIN
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: T.black, color: T.white, fontFamily: "'Barlow Condensed', Barlow, sans-serif", display: 'flex', flexDirection: 'column' }}>
      <TopBar title="AI BUILDER" backTo="/train" right={
        <button onClick={clearKey} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }} title="Change API key">🔑</button>
      } />

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 24 }}>

        {/* ─── Mode tabs ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${T.line}`, background: T.panel }}>
          {MODES.map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setResult(null); setError(''); }}
              style={{
                flex: 1, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                padding: '12px 4px 10px', fontWeight: 900, fontSize: 9, letterSpacing: 1,
                color: mode === m.id ? m.color : T.whiteDim,
                borderBottom: mode === m.id ? `2px solid ${m.color}` : '2px solid transparent',
                transition: 'color .15s, border-color .15s',
              }}
            >
              <div style={{ fontSize: 16, marginBottom: 3 }}>{m.icon}</div>
              {m.label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ─── Build panel ───────────────────────────────────────── */}
        <div style={{ padding: '16px 18px' }}>

          {/* Quick prompts */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 8, color: T.whiteDim, letterSpacing: 2, marginBottom: 8 }}>QUICK PROMPTS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {QUICK_PROMPTS[mode].map(qp => (
                <button key={qp} onClick={() => setPrompt(qp)}
                  style={{
                    background: prompt === qp ? T.red : T.surface,
                    border: `1px solid ${prompt === qp ? T.red : T.line}`,
                    borderRadius: 2, color: prompt === qp ? '#fff' : T.whiteMid,
                    fontFamily: 'inherit', fontSize: 9, letterSpacing: 0.5, fontWeight: 700,
                    padding: '5px 10px', cursor: 'pointer', transition: 'all .15s',
                  }}
                >
                  {qp.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt textarea */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 8, color: T.whiteDim, letterSpacing: 2, marginBottom: 6 }}>DESCRIBE WHAT YOU WANT</div>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={`e.g. "A brutal 45-minute leg day for advanced athletes using barbells and dumbbells"`}
              rows={3}
              style={{
                width: '100%', background: T.surface, border: `1px solid ${T.line}`,
                borderRadius: 3, color: T.white, fontFamily: 'inherit', fontSize: 12,
                padding: '10px 12px', resize: 'vertical', outline: 'none',
                lineHeight: 1.5,
              }}
            />
          </div>

          {/* Parameters row */}
          {(mode === 'workout' || mode === 'exercises') && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 8, color: T.whiteDim, letterSpacing: 2, marginBottom: 8 }}>PARAMETERS</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {mode === 'workout' && (
                  <div style={{ flex: 1, minWidth: 80 }}>
                    <div style={{ fontSize: 8, color: T.whiteDim, letterSpacing: 1, marginBottom: 4 }}>DURATION</div>
                    <select value={duration} onChange={e => setDuration(e.target.value)}
                      style={{ width: '100%', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 3, color: T.white, fontFamily: 'inherit', fontSize: 11, fontWeight: 700, padding: '7px 10px', outline: 'none' }}>
                      {['20', '30', '45', '60', '75', '90'].map(d => <option key={d} value={d}>{d} min</option>)}
                    </select>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 100 }}>
                  <div style={{ fontSize: 8, color: T.whiteDim, letterSpacing: 1, marginBottom: 4 }}>DIFFICULTY</div>
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                    style={{ width: '100%', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 3, color: T.white, fontFamily: 'inherit', fontSize: 11, fontWeight: 700, padding: '7px 10px', outline: 'none' }}>
                    {['easy', 'moderate', 'hard', 'very hard'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div style={{ flex: 2, minWidth: 120 }}>
                  <div style={{ fontSize: 8, color: T.whiteDim, letterSpacing: 1, marginBottom: 4 }}>FOCUS</div>
                  <select value={focus} onChange={e => setFocus(e.target.value)}
                    style={{ width: '100%', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 3, color: T.white, fontFamily: 'inherit', fontSize: 11, fontWeight: 700, padding: '7px 10px', outline: 'none' }}>
                    <option value="">Any</option>
                    {FOCUS_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              {/* Equipment */}
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 8, color: T.whiteDim, letterSpacing: 1, marginBottom: 6 }}>EQUIPMENT (SELECT ALL THAT APPLY)</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {EQUIPMENT_OPTIONS.map(eq => (
                    <button key={eq} onClick={() => setEquipment(prev => prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq])}
                      style={{
                        background: equipment.includes(eq) ? T.blue : T.surface,
                        border: `1px solid ${equipment.includes(eq) ? T.blue : T.line}`,
                        borderRadius: 2, color: equipment.includes(eq) ? '#fff' : T.whiteMid,
                        fontFamily: 'inherit', fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
                        padding: '4px 9px', cursor: 'pointer', transition: 'all .15s',
                      }}
                    >{eq.toUpperCase()}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Program/Schedule parameters */}
          {(mode === 'program' || mode === 'schedule') && (
            <div style={{ marginBottom: 14, display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 8, color: T.whiteDim, letterSpacing: 1, marginBottom: 4 }}>ATHLETE LEVEL</div>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                  style={{ width: '100%', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 3, color: T.white, fontFamily: 'inherit', fontSize: 11, fontWeight: 700, padding: '7px 10px', outline: 'none' }}>
                  {['easy', 'moderate', 'hard', 'very hard'].map(d => <option key={d} value={d}>{d === 'easy' ? 'Beginner' : d === 'moderate' ? 'Intermediate' : d === 'hard' ? 'Advanced' : 'Elite'}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 8, color: T.whiteDim, letterSpacing: 1, marginBottom: 4 }}>EMPHASIS</div>
                <select value={focus} onChange={e => setFocus(e.target.value)}
                  style={{ width: '100%', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 3, color: T.white, fontFamily: 'inherit', fontSize: 11, fontWeight: 700, padding: '7px 10px', outline: 'none' }}>
                  <option value="">Any</option>
                  {FOCUS_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: T.redDim, border: `1px solid ${T.red}44`, borderRadius: 3, padding: '10px 14px', marginBottom: 14, fontSize: 11, color: T.red }}>
              ⚠ {error}
            </div>
          )}

          {/* Generate button */}
          <Btn v="primary" sz="lg" full onClick={generate} disabled={loading}>
            {loading ? '⟳ GENERATING…' : `✦ GENERATE ${currentMode?.label.toUpperCase()}`}
          </Btn>

          {/* Loading animation */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: 10, color: T.whiteDim, letterSpacing: 2, animation: 'pulse 1.5s infinite' }}>
                CLAUDE IS BUILDING YOUR {currentMode?.label.toUpperCase()}…
              </div>
              <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }`}</style>
            </div>
          )}
        </div>

        {/* ─── Result ────────────────────────────────────────────── */}
        {result && !loading && (
          <div style={{ padding: '0 18px 18px' }}>
            <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 20, marginBottom: 4 }}>
              {/* Result header bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: 3, color: currentMode?.color }}>
                  ✦ AI GENERATED {currentMode?.label.toUpperCase()}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn v="ghost" sz="sm" onClick={copyJSON}>{copied ? '✓ COPIED' : 'COPY JSON'}</Btn>
                  <Btn v="ghost" sz="sm" onClick={() => { setResult(null); setPrompt(''); }}>CLEAR</Btn>
                </div>
              </div>

              {/* Result card */}
              <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 4, padding: '16px 16px' }}>
                {mode === 'workout'   && <WorkoutResult   data={result} onPreview={previewWorkout} />}
                {mode === 'program'   && <ProgramResult   data={result} />}
                {mode === 'schedule'  && <ScheduleResult  data={result} />}
                {mode === 'exercises' && <ExercisesResult data={result} />}
              </div>

              {/* Regenerate */}
              <div style={{ marginTop: 12, textAlign: 'center' }}>
                <button onClick={generate}
                  style={{ background: 'none', border: 'none', color: T.whiteDim, fontFamily: 'inherit', fontSize: 9, letterSpacing: 2, cursor: 'pointer', textDecoration: 'underline' }}>
                  NOT QUITE RIGHT? REGENERATE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── History ───────────────────────────────────────────── */}
        {history.length > 1 && !result && (
          <div style={{ padding: '0 18px 18px' }}>
            <div style={{ fontSize: 8, color: T.whiteDim, letterSpacing: 3, marginBottom: 10 }}>RECENT GENERATIONS</div>
            {history.slice(1, 5).map((h, i) => (
              <div key={i} onClick={() => loadHistory(h)}
                style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 3, padding: '10px 12px', marginBottom: 6, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = T.whiteDim}
                onMouseLeave={e => e.currentTarget.style.borderColor = T.line}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700 }}>{h.data?.name || h.data?.category || 'Generated ' + h.mode}</span>
                  <Tag color={T.whiteDim}>{h.mode.toUpperCase()}</Tag>
                </div>
                <div style={{ fontSize: 9, color: T.whiteDim, marginTop: 3 }}>{h.prompt.split('\n')[0].slice(0, 60)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── API Key Setup sub-component ──────────────────────────────────────────────
function KeySetup({ onSave }) {
  const [key, setKey] = useState('');
  const [show, setShow] = useState(false);

  return (
    <div>
      <div style={{ fontSize: 8, color: T.whiteDim, letterSpacing: 2, marginBottom: 6 }}>ANTHROPIC API KEY</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          type={show ? 'text' : 'password'}
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder="sk-ant-..."
          style={{
            flex: 1, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 3,
            color: T.white, fontFamily: 'inherit', fontSize: 12, padding: '10px 12px', outline: 'none',
          }}
        />
        <button onClick={() => setShow(!show)}
          style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 3, color: T.whiteMid, fontFamily: 'inherit', fontSize: 10, padding: '0 12px', cursor: 'pointer' }}>
          {show ? 'HIDE' : 'SHOW'}
        </button>
      </div>
      <Btn v="primary" sz="lg" full onClick={() => key.trim() && onSave(key.trim())} disabled={!key.trim()}>
        CONNECT AI
      </Btn>
      <div style={{ marginTop: 12, fontSize: 10, color: T.whiteDim, lineHeight: 1.5, textAlign: 'center' }}>
        Get your key at <span style={{ color: T.blue }}>console.anthropic.com</span>. Saved on this device only — never shared.
      </div>
    </div>
  );
}
