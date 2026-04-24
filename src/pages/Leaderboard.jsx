import { useState, useEffect } from 'react';
import { T } from '../theme';
import TopBar from '../components/TopBar';
import Tag from '../components/Tag';
import { useAuth } from '../context/AuthContext';
import { getLeaderboard, getChallenges } from '../api/progress';

const RANK_BADGE = { 1: '🏆', 2: '🥈', 3: '🥉' };

function mapBoard(items, userId, userEmail) {
  return items.map((p, i) => ({
    rank:     p.rank     || i + 1,
    name:     p.name     || p.username || p.displayName || 'Athlete',
    pts:      p.points   || p.pts      || p.score       || 0,
    streak:   p.streak   || 0,
    workouts: p.workouts || p.totalWorkouts || 0,
    badge:    RANK_BADGE[p.rank || i + 1] || null,
    isMe:     (userId  && (p.userId === userId || p.id === userId)) ||
              (userEmail && (p.email === userEmail)),
  }));
}

function mapChallenges(items) {
  return items.map(c => ({
    name:         c.name || c.title || 'Challenge',
    end:          c.daysLeft != null ? `${c.daysLeft} days left` : (c.endsAt ? new Date(c.endsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''),
    participants: c.participants || c.participantCount || 0,
    current:      c.current || c.userProgress || 0,
    total:        c.total   || c.goal         || 1,
    color:        c.color   || T.red,
  }));
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [tab, setTab]             = useState('board');
  const [board, setBoard]         = useState([]);
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    getLeaderboard().then(data => {
      const items = Array.isArray(data) ? data : data?.leaderboard || data?.entries || [];
      if (items.length > 0) {
        setBoard(mapBoard(items, user?.id || user?._id, user?.email));
      }
    }).catch(() => {});

    getChallenges().then(data => {
      const items = Array.isArray(data) ? data : data?.challenges || [];
      if (items.length > 0) setChallenges(mapChallenges(items));
    }).catch(() => {});
  }, []);

  // Top 3 podium order: 2nd, 1st, 3rd — guard if board has fewer entries
  const top3 = board.length > 0 ? [board[1] || null, board[0], board[2] || null] : [];

  return (
    <div style={{ paddingBottom: 80 }}>
      <TopBar title="Leaderboard" backTo="/more" />

      {/* Tabs */}
      <div style={{ display: 'flex', background: T.surfaceHi, padding: 3, margin: '14px 18px 0', borderRadius: 2, border: `1px solid ${T.line}` }}>
        {[{ id: 'board', l: 'Rankings' }, { id: 'challenges', l: 'Challenges' }].map(t => (
          <div key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: '8px', textAlign: 'center', cursor: 'pointer', borderRadius: 2, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', transition: 'all .15s', background: tab === t.id ? T.white : 'transparent', color: tab === t.id ? T.black : T.whiteDim }}
          >
            {t.l}
          </div>
        ))}
      </div>

      {/* ── RANKINGS ── */}
      {tab === 'board' && (
        <div style={{ padding: '14px 18px 0' }}>
          {board.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🏆</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>No rankings yet</div>
              <div style={{ fontSize: 11, color: T.whiteDim }}>Complete workouts to earn points and appear on the leaderboard.</div>
            </div>
          ) : (
          <>
          {/* Top 3 podium */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 20, height: 110 }}>
            {top3.map((p, i) => {
              if (!p) return <div key={i} style={{ flex: 1 }} />;
              const heights = [85, 110, 70];
              const colors  = [T.whiteDim, T.gold, T.orange];
              return (
                <div key={p.rank} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontSize: i === 1 ? 26 : 20, marginBottom: 4 }}>{p.badge || `#${p.rank}`}</div>
                  <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 0.5, marginBottom: 4, textAlign: 'center' }}>{p.name.split(' ')[0]}</div>
                  <div style={{ width: '100%', height: heights[i], background: `${colors[i]}22`, border: `1px solid ${colors[i]}44`, borderRadius: '2px 2px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <div style={{ fontWeight: 900, fontSize: 14, color: colors[i] }}>{p.pts.toLocaleString()}</div>
                    <div style={{ fontSize: 7, color: T.whiteDim }}>PTS</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full table */}
          {board.map((p) => (
            <div key={p.rank}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding:    p.isMe ? '11px 18px' : '11px 0',
                margin:     p.isMe ? '0 -18px'   : undefined,
                borderBottom: `1px solid ${T.line}`,
                background: p.isMe ? T.goldDim : 'transparent',
              }}>
              <div style={{ width: 28, textAlign: 'center', fontSize: p.rank <= 3 ? 18 : 12, fontWeight: 900, color: p.rank === 1 ? T.gold : p.rank === 2 ? T.whiteDim : p.rank === 3 ? T.orange : T.whiteDim }}>
                {p.badge || `#${p.rank}`}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 12, letterSpacing: 0.5, marginBottom: 2 }}>
                  {p.name} {p.isMe && <Tag color={T.gold}>YOU</Tag>}
                </div>
                <div style={{ fontSize: 9, color: T.whiteDim }}>{p.workouts} workouts · {p.streak}d streak</div>
              </div>
              <div style={{ fontWeight: 900, fontSize: 14, color: p.rank === 1 ? T.gold : T.white }}>{p.pts.toLocaleString()}</div>
            </div>
          ))}
          </>
          )}
        </div>
      )}

      {/* ── CHALLENGES ── */}
      {tab === 'challenges' && (
        <div style={{ padding: '14px 18px 0' }}>
          {challenges.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>⚡</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>No active challenges</div>
              <div style={{ fontSize: 11, color: T.whiteDim }}>Challenges will appear here when your trainer creates them.</div>
            </div>
          )}
          {challenges.map((c, i) => (
            <div key={i} style={{ background: T.panel, border: `1px solid ${c.color}44`, borderRadius: 2, padding: '16px', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontWeight: 900, fontSize: 14, letterSpacing: 0.5 }}>{c.name}</div>
                {c.end ? <Tag color={c.color}>{c.end}</Tag> : null}
              </div>
              <div style={{ fontSize: 10, color: T.whiteDim, marginBottom: 10 }}>
                {c.participants > 0 ? `${c.participants} participants · ` : ''}{c.current}/{c.total} progress
              </div>
              <div style={{ height: 4, background: T.line, borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${Math.min(100, Math.round(c.current / c.total * 100))}%`, background: c.color, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
