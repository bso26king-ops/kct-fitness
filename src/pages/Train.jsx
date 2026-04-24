import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { T } from '../theme';
import TopBar from '../components/TopBar';
import Tag from '../components/Tag';
import Btn from '../components/Btn';

// ─── Claude API ───────────────────────────────────────────────────────────────
async function callClaude(apiKey, systemPrompt, userPrompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
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
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (!jsonMatch) throw new Error('No valid JSON in response');
  return JSON.parse(jsonMatch[1] || jsonMatch[0]);
}

// ─── PDF.js dynamic loader ────────────────────────────────────────────────────
function loadPdfJs() {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) return resolve(window.pdfjsLib);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function extractTextFromFile(file) {
  if (file.type === 'application/pdf') {
    const pdfjsLib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(' ') + '\n';
    }
    return text;
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// ─── Constants ────────────────────────────────────────────────────────────────
const FOCUS_OPTIONS = [
  { id: 'upper',  label: 'UPPER BODY', icon: '💪', desc: 'Chest · Back · Shoulders · Arms' },
  { id: 'lower',  label: 'LOWER BODY', icon: '🦵', desc: 'Quads · Hamstrings · Glutes · Calves' },
  { id: 'full',   label: 'FULL BODY',  icon: '⚡', desc: 'Total body conditioning' },
  { id: 'core',   label: 'CORE',       icon: '🔥', desc: 'Abs · Obliques · Lower back' },
];

const DURATION_OPTIONS = [15, 30, 45, 60];

const EQUIPMENT_OPTIONS = [
  { id: 'barbell',    label: 'Barbell + Rack',            icon: '🏋️' },
  { id: 'dumbbells',  label: 'Dumbbells',                 icon: '💿' },
  { id: 'bodyweight', label: 'Bodyweight Only',           icon: '🤸' },
  { id: 'functional', label: 'Kettlebells / Bands / Cables', icon: '🔗' },
];

const DIFF_COLOR = {
  easy: T.green, moderate: T.blue, hard: T.orange, 'very hard': T.red,
};

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an elite KCT (King's Combat Training) fitness coach building personalized workouts for clients.

When given reference workout files from the trainer, you MUST:
1. Pull exercises and structure directly from those files whenever possible
2. Adapt the workout to the client's selected duration, focus area, and available equipment
3. Scale sets/reps/rest periods to fit the time constraint
4. Preserve the KCT training philosophy: intensity, precision, warrior mindset

Return ONLY a JSON code block with this exact structure:
\`\`\`json
{
  "_id": "generated-id",
  "name": "Workout Name",
  "style": "warrior|weights|cardio|hiit|recovery",
  "duration": 45,
  "tag": "STRENGTH|CARDIO|HIIT|UPPER BODY|LOWER BODY|FULL BODY|CORE",
  "difficulty": "easy|moderate|hard|very hard",
  "coachNote": "Short motivational note from Coach King",
  "warmup": [
    { "exercise": "Exercise Name", "duration": "2 min", "cue": "Form cue" }
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
- warmup: 3–5 exercises, duration-based
- main: 5–10 exercises, sets/reps/rest-based (rest in seconds)
- cooldown: 3–4 stretches, duration-based
- Only include exercises that can be done with the available equipment
- Fewer exercises and shorter rests for shorter sessions
- Make every cue specific, actionable, and motivating`;

// ─── Workout result view ──────────────────────────────────────────────────────
function WorkoutResult({ workout, onBack, onStartWorkout }) {
  return (
    <div>
      {/* Custom top bar with back */}
      <div style={{
        background: T.panel, borderBottom: `1px solid ${T.line}`,
        padding: '11px 18px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: T.whiteMid, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}
        >
          ‹ Back
        </button>
        <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 2 }}>YOUR WORKOUT</div>
        <div style={{ width: 48 }} />
      </div>

      <div style={{ padding: '16px 16px 32px' }}>
        {/* Header card */}
        <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 6, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 2, marginBottom: 10, lineHeight: 1.1 }}>
            {workout.name?.toUpperCase()}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: workout.coachNote ? 12 : 0 }}>
            <Tag color={DIFF_COLOR[workout.difficulty] || T.whiteMid}>
              {workout.difficulty?.toUpperCase()}
            </Tag>
            <Tag color={T.whiteMid}>{workout.tag}</Tag>
            <Tag color={T.whiteDim}>{workout.duration} MIN</Tag>
          </div>
          {workout.coachNote && (
            <div style={{
              background: T.redDim, border: `1px solid ${T.red}33`,
              borderRadius: 4, padding: '10px 14px',
              fontSize: 11, color: T.red, fontStyle: 'italic', lineHeight: 1.5,
            }}>
              "{workout.coachNote}"
            </div>
          )}
        </div>

        {/* Sections */}
        {[
          { key: 'warmup',   label: 'WARM UP',    color: T.blue  },
          { key: 'main',     label: 'MAIN BLOCK', color: T.red   },
          { key: 'cooldown', label: 'COOL DOWN',  color: T.green },
        ].map(({ key, label, color }) =>
          workout[key]?.length > 0 && (
            <div key={key} style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 9, fontWeight: 900, letterSpacing: 3,
                color, marginBottom: 8, paddingLeft: 2,
              }}>
                {label}
              </div>
              {workout[key].map((ex, i) => (
                <div key={i} style={{
                  background: T.surface, border: `1px solid ${T.line}`,
                  borderRadius: 4, padding: '10px 14px', marginBottom: 6,
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: ex.cue ? 4 : 0,
                  }}>
                    <span style={{ fontWeight: 700, fontSize: 13, flex: 1, paddingRight: 8 }}>
                      {ex.exercise}
                    </span>
                    <span style={{ fontSize: 11, color: T.whiteMid, fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {ex.sets ? `${ex.sets}×${ex.reps}` : ex.duration}
                      {ex.rest ? ` · ${ex.rest}s` : ''}
                    </span>
                  </div>
                  {ex.cue && (
                    <div style={{ fontSize: 11, color: T.whiteDim, lineHeight: 1.5 }}>
                      {ex.cue}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <Btn
            v="primary" sz="lg" full
            onClick={() => onStartWorkout(workout)}
          >
            ▶ Start Workout
          </Btn>
          <Btn v="ghost" sz="lg" onClick={onBack}>
            ↺ Rebuild
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Main: Client Workout Builder ─────────────────────────────────────────────
export default function Train() {
  const navigate = useNavigate();

  const [view, setView]           = useState('build');   // 'build' | 'result'
  const [focus, setFocus]         = useState(null);
  const [duration, setDuration]   = useState(45);
  const [equipment, setEquipment] = useState([]);
  const [files, setFiles]         = useState([]);
  const [fileTexts, setFileTexts] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [workout, setWorkout]     = useState(null);
  const [apiKey, setApiKey]       = useState(() => localStorage.getItem('kct_claude_key') || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);

  const fileInputRef = useRef(null);

  // ── Equipment toggle ────────────────────────────────────────────────────────
  function toggleEquipment(id) {
    setEquipment(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  }

  // ── File handling ───────────────────────────────────────────────────────────
  async function handleFileUpload(e) {
    const newFiles = Array.from(e.target.files);
    if (!newFiles.length) return;
    setFileLoading(true);
    const texts = [];
    for (const file of newFiles) {
      try {
        const text = await extractTextFromFile(file);
        // Cap each file at 10 000 chars so we don't blow the prompt
        texts.push({ name: file.name, text: text.slice(0, 10000) });
      } catch (err) {
        texts.push({ name: file.name, text: `[Unable to read: ${file.name}]` });
      }
    }
    setFiles(prev => [...prev, ...newFiles]);
    setFileTexts(prev => [...prev, ...texts]);
    setFileLoading(false);
    // Reset the input so the same file can be re-added if needed
    e.target.value = '';
  }

  function removeFile(index) {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFileTexts(prev => prev.filter((_, i) => i !== index));
  }

  // ── Save API key ────────────────────────────────────────────────────────────
  function saveApiKey(key) {
    setApiKey(key);
    localStorage.setItem('kct_claude_key', key);
  }

  // ── Build workout ───────────────────────────────────────────────────────────
  async function buildWorkout() {
    setError(null);
    if (!focus)            return setError('Select a workout focus.');
    if (!equipment.length) return setError('Select at least one equipment option.');
    if (!apiKey)           return setError('Add your API key in AI Settings above.');

    setLoading(true);

    const eqLabels   = equipment.map(id => EQUIPMENT_OPTIONS.find(e => e.id === id)?.label).join(', ');
    const focusLabel = FOCUS_OPTIONS.find(f => f.id === focus)?.label;

    let userPrompt = `Build a ${duration}-minute ${focusLabel} workout. Available equipment: ${eqLabels}.`;

    if (fileTexts.length > 0) {
      userPrompt += `\n\nTRAINER'S REFERENCE WORKOUT FILES — draw exercises and structure from these:\n\n`;
      fileTexts.forEach(f => {
        userPrompt += `=== ${f.name} ===\n${f.text}\n\n`;
      });
      userPrompt += `\nAdapt the above materials to fit: ${duration} minutes · ${focusLabel} · Equipment: ${eqLabels}.`;
    }

    try {
      const result = await callClaude(apiKey, SYSTEM_PROMPT, userPrompt);
      setWorkout(result);
      setView('result');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Result view ─────────────────────────────────────────────────────────────
  if (view === 'result' && workout) {
    return (
      <WorkoutResult
        workout={workout}
        onBack={() => setView('build')}
        onStartWorkout={w => navigate('/workout', { state: { workout: w } })}
      />
    );
  }

  const canBuild = !!focus && equipment.length > 0 && !!apiKey;

  // ── Builder view ────────────────────────────────────────────────────────────
  return (
    <div>
      <TopBar title="Workout Builder" />

      <div style={{ padding: '20px 16px 40px' }}>

        {/* ── AI Settings ── */}
        <div style={{ marginBottom: 28 }}>
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            style={{
              background: 'none', border: 'none',
              color: apiKey ? T.green : T.whiteDim,
              fontSize: 10, letterSpacing: 2, cursor: 'pointer',
              padding: '4px 0', display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'inherit', fontWeight: 700, textTransform: 'uppercase',
            }}
          >
            <span>{apiKey ? '✓' : '⚙'}</span>
            AI Settings
            <span style={{ fontSize: 8, color: T.whiteDim }}>{showApiKey ? '▲' : '▼'}</span>
          </button>

          {showApiKey && (
            <div style={{
              marginTop: 10, background: T.surface,
              border: `1px solid ${T.line}`, borderRadius: 6, padding: 14,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: T.whiteDim, marginBottom: 8, fontWeight: 700 }}>
                ANTHROPIC API KEY
              </div>
              <input
                type="password"
                value={apiKey}
                onChange={e => saveApiKey(e.target.value)}
                placeholder="sk-ant-api03-…"
                style={{
                  width: '100%', background: T.surfaceHi,
                  border: `1px solid ${T.line}`, borderRadius: 4,
                  padding: '9px 12px', color: T.white, fontSize: 12,
                  fontFamily: 'inherit',
                }}
              />
              <div style={{ fontSize: 9, color: T.whiteDim, marginTop: 6, lineHeight: 1.5 }}>
                Key is stored locally on your device and never sent anywhere except Anthropic.
              </div>
            </div>
          )}
        </div>

        {/* ── Upload Reference Files ── */}
        <Section label="Trainer's Workout Files" hint="optional — AI draws from these">
          <div
            onClick={() => !fileLoading && fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${T.line}`, borderRadius: 8,
              padding: '22px 16px', textAlign: 'center',
              cursor: fileLoading ? 'wait' : 'pointer',
              background: T.surface,
              transition: 'border-color .15s',
            }}
          >
            <div style={{ fontSize: 26, marginBottom: 6 }}>
              {fileLoading ? '⏳' : '📁'}
            </div>
            <div style={{ fontSize: 12, color: T.whiteMid, fontWeight: 600 }}>
              {fileLoading ? 'Reading files…' : 'Tap to upload workout files'}
            </div>
            <div style={{ fontSize: 10, color: T.whiteDim, marginTop: 4 }}>
              PDF or TXT · AI references these to build your workout
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.text,text/plain,application/pdf"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          {files.length > 0 && (
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {files.map((file, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: T.surfaceHi, border: `1px solid ${T.line}`,
                  borderRadius: 4, padding: '8px 12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14 }}>
                      {file.type === 'application/pdf' ? '📄' : '📝'}
                    </span>
                    <div>
                      <div style={{ fontSize: 11, color: T.white, fontWeight: 600, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.name}
                      </div>
                      <div style={{ fontSize: 9, color: T.whiteDim }}>
                        {(file.size / 1024).toFixed(0)} KB · ready
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    style={{ background: 'none', border: 'none', color: T.red, cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 4px' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── Focus ── */}
        <Section label="Workout Focus">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {FOCUS_OPTIONS.map(f => {
              const active = focus === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFocus(f.id)}
                  style={{
                    background: active ? T.redDim : T.surface,
                    border: `1px solid ${active ? T.red : T.line}`,
                    borderRadius: 8, padding: '14px 12px',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'border-color .15s, background .15s',
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{f.icon}</div>
                  <div style={{
                    fontSize: 11, fontWeight: 900, letterSpacing: 1,
                    color: active ? T.red : T.white, marginBottom: 3,
                  }}>
                    {f.label}
                  </div>
                  <div style={{ fontSize: 9, color: T.whiteDim, lineHeight: 1.4 }}>
                    {f.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        {/* ── Duration ── */}
        <Section label="Duration">
          <div style={{ display: 'flex', gap: 8 }}>
            {DURATION_OPTIONS.map(d => {
              const active = duration === d;
              return (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  style={{
                    flex: 1,
                    background: active ? T.red : T.surface,
                    border: `1px solid ${active ? T.red : T.line}`,
                    borderRadius: 8, padding: '13px 0',
                    cursor: 'pointer',
                    color: active ? '#fff' : T.whiteMid,
                    fontSize: 13, fontWeight: 900, fontFamily: 'inherit',
                    transition: 'background .15s, border-color .15s',
                  }}
                >
                  {d}m
                </button>
              );
            })}
          </div>
        </Section>

        {/* ── Equipment ── */}
        <Section label="Available Equipment" hint="select all that apply">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {EQUIPMENT_OPTIONS.map(eq => {
              const active = equipment.includes(eq.id);
              return (
                <button
                  key={eq.id}
                  onClick={() => toggleEquipment(eq.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: active ? T.redDim : T.surface,
                    border: `1px solid ${active ? T.red : T.line}`,
                    borderRadius: 8, padding: '13px 14px',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'border-color .15s, background .15s',
                  }}
                >
                  <span style={{ fontSize: 22 }}>{eq.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: active ? T.red : T.white, flex: 1 }}>
                    {eq.label}
                  </span>
                  <span style={{
                    width: 18, height: 18, borderRadius: '50%',
                    border: `2px solid ${active ? T.red : T.line}`,
                    background: active ? T.red : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, color: '#fff',
                    flexShrink: 0,
                    transition: 'background .15s, border-color .15s',
                  }}>
                    {active ? '✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* ── Error ── */}
        {error && (
          <div style={{
            background: T.redDim, border: `1px solid ${T.red}55`,
            borderRadius: 6, padding: '11px 14px',
            fontSize: 11, color: T.red, marginBottom: 16, lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}

        {/* ── Build button ── */}
        <Btn
          v="primary"
          sz="lg"
          full
          disabled={!canBuild || loading}
          onClick={buildWorkout}
          sx={{ padding: '16px', fontSize: 13, letterSpacing: 3 }}
        >
          {loading ? 'BUILDING YOUR WORKOUT…' : '⚡  BUILD MY WORKOUT'}
        </Btn>

        {!apiKey && (
          <div style={{ fontSize: 10, color: T.whiteDim, textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>
            Tap <strong style={{ color: T.white }}>AI Settings</strong> above to add your API key first.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helper: section wrapper ──────────────────────────────────────────────────
function Section({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12,
      }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 3, color: T.whiteDim, textTransform: 'uppercase' }}>
          {label}
        </div>
        {hint && (
          <div style={{ fontSize: 9, color: T.whiteDim, fontStyle: 'italic' }}>
            {hint}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
