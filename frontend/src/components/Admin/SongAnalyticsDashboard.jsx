import React, { useState, useEffect } from 'react';
import { getAllSongAnalytics } from '../../services/api';
import { IconMusic, IconPlayerPlay, IconRepeat, IconShare, IconTrophy, IconChartBar, IconTrendingUp, IconAlertTriangle, IconLoader2, IconRefresh } from '@tabler/icons-react';

function StatCard({ icon: Icon, label, value, sub, color = 'text-primary', bg = 'bg-primary/10' }) {
  return (
    <div className="bg-surface rounded-2xl border border-outline/10 p-5 flex items-start gap-4 shadow-sm transition-colors duration-300">
      <div className={`p-3 rounded-xl ${bg} flex-shrink-0`}>
        <Icon size={22} className={color} />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-black text-on-surface">{value ?? '—'}</div>
        <div className="text-sm font-semibold text-on-surface mt-0.5">{label}</div>
        {sub && <div className="text-xs text-on-surface-variant mt-1 truncate">{sub}</div>}
      </div>
    </div>
  );
}

function RetentionHeatmap({ distribution = [], title }) {
  const max = Math.max(...distribution, 1);
  const labels = ['0-10%', '10-20%', '20-30%', '30-40%', '40-50%', '50-60%', '60-70%', '70-80%', '80-90%', '90-100%'];
  return (
    <div className="bg-surface rounded-2xl border border-outline/10 p-5 shadow-sm transition-colors duration-300">
      <h4 className="font-bold text-on-surface text-sm mb-4">{title}</h4>
      <div className="flex items-end gap-1.5 h-24">
        {distribution.map((val, i) => {
          const pct = (val / max) * 100;
          const isHigh = pct > 70;
          const isMid = pct > 35;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div
                className={`w-full rounded-t-sm transition-all duration-300 ${isHigh ? 'bg-emerald-400/60' : isMid ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ height: `${Math.max(4, pct)}%` }}
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container border border-outline/20 rounded-lg px-2 py-1 text-[10px] font-bold text-on-surface opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-sm pointer-events-none">
                {val} listeners reached {labels[i]}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-[9px] text-on-surface-variant/60 font-mono">
        <span>0%</span><span>50%</span><span>100%</span>
      </div>
      <div className="flex items-center gap-3 mt-3">
        <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant">
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400/60" /> High retention
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant">
          <div className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> Medium
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant">
          <div className="w-2.5 h-2.5 rounded-sm bg-red-400" /> Low retention
        </div>
      </div>
    </div>
  );
}

function SongRankTable({ songs, sortKey, label, icon: Icon, valueKey }) {
  const sorted = [...songs].sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0)).slice(0, 10);
  return (
    <div className="bg-surface rounded-2xl border border-outline/10 shadow-sm overflow-hidden transition-colors duration-300">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-outline/10">
        <Icon size={18} className="text-primary" />
        <h4 className="font-bold text-on-surface text-sm">{label}</h4>
      </div>
      <div className="divide-y divide-outline/5">
        {sorted.length === 0 ? (
          <div className="px-5 py-6 text-center text-on-surface-variant/60 text-sm">No data yet</div>
        ) : sorted.map((song, i) => (
          <div key={song._id || i} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-container/50 transition-colors">
            <span className={`text-xs font-black w-5 flex-shrink-0 ${i === 0 ? 'text-primary' : 'text-on-surface-variant/40'}`}>
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-on-surface truncate">{song.title}</div>
              <div className="text-xs text-on-surface-variant/60 truncate">{song.subject} • {song.class}</div>
            </div>
            <div className="flex-shrink-0 font-mono text-sm font-bold text-primary">
              {song[valueKey] ?? 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SongAnalyticsDashboard() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllSongAnalytics();
      setSongs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Aggregate stats
  const totalPlays = songs.reduce((s, x) => s + (x.playCount || 0), 0);
  const totalShares = songs.reduce((s, x) => s + (x.shareCount || 0), 0);
  const totalRepeats = songs.reduce((s, x) => s + (x.repeatCount || 0), 0);
  const avgCompletion = songs.length > 0
    ? (songs.reduce((s, x) => s + parseFloat(x.completionRate || 0), 0) / songs.length).toFixed(1)
    : 0;
  const mostPlayed = songs.reduce((best, s) => (s.playCount || 0) > (best?.playCount || 0) ? s : best, null);

  const aggregateDropOff = songs.reduce((acc, song) => {
    (song.dropOffDistribution || []).forEach((v, i) => { acc[i] = (acc[i] || 0) + v; });
    return acc;
  }, new Array(10).fill(0));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <IconLoader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <IconAlertTriangle size={40} className="text-red-400" />
        <p className="text-on-surface-variant">{error}</p>
        <button onClick={fetchData} className="px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-sm">Retry</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Song Analytics</h2>
          <p className="text-sm text-on-surface-variant mt-1">{songs.length} songs tracked</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-outline/20 text-sm font-bold text-on-surface hover:bg-surface-variant transition-colors">
          <IconRefresh size={16} /> Refresh
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={IconPlayerPlay} label="Total Plays" value={totalPlays.toLocaleString()} sub={`#1: ${mostPlayed?.title || 'N/A'}`} />
        <StatCard icon={IconRepeat} label="Total Repeats" value={totalRepeats.toLocaleString()} color="text-purple-400" bg="bg-purple-500/10" />
        <StatCard icon={IconShare} label="Total Shares" value={totalShares.toLocaleString()} color="text-sky-400" bg="bg-sky-500/10" />
        <StatCard icon={IconTrophy} label="Avg Completion" value={`${avgCompletion}%`} color="text-emerald-400" bg="bg-emerald-500/10" />
      </div>

      {/* Retention heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RetentionHeatmap distribution={aggregateDropOff} title="Overall Audience Retention (all songs)" />
        
        {/* Song selector for individual heatmap */}
        <div className="bg-surface rounded-2xl border border-outline/10 p-5 shadow-sm flex flex-col gap-3 transition-colors duration-300">
          <h4 className="font-bold text-on-surface text-sm">Per-Song Drop-Off</h4>
          <select
            className="w-full px-3 py-2 rounded-xl border border-outline/20 bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={selectedSong?._id || ''}
            onChange={(e) => setSelectedSong(songs.find(s => s._id === e.target.value) || null)}
          >
            <option value="">— Select a song —</option>
            {songs.map(s => <option key={s._id} value={s._id}>{s.title}</option>)}
          </select>
          {selectedSong ? (
            <RetentionHeatmap distribution={selectedSong.dropOffDistribution || new Array(10).fill(0)} title={selectedSong.title} />
          ) : (
            <div className="flex items-center justify-center h-24 text-on-surface-variant/50 text-sm">Select a song above</div>
          )}
        </div>
      </div>

      {/* Ranking Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <SongRankTable songs={songs} sortKey="playCount" valueKey="playCount" label="Most Listened" icon={IconPlayerPlay} />
        <SongRankTable songs={songs} sortKey="repeatCount" valueKey="repeatCount" label="Most Repeated" icon={IconRepeat} />
        <SongRankTable songs={songs} sortKey="shareCount" valueKey="shareCount" label="Most Shared" icon={IconShare} />
        <SongRankTable songs={songs} sortKey="completionRate" valueKey="completionRate" label="Highest Completion" icon={IconTrendingUp} />
      </div>

      {/* Full song table */}
      <div className="bg-surface rounded-2xl border border-outline/10 shadow-sm overflow-hidden transition-colors duration-300">
        <div className="px-5 py-4 border-b border-outline/10 flex items-center gap-2">
          <IconChartBar size={18} className="text-primary" />
          <h4 className="font-bold text-on-surface text-sm">All Songs Overview</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline/10 text-on-surface-variant text-xs font-semibold uppercase tracking-wide">
                <th className="px-5 py-3 text-left">Song</th>
                <th className="px-4 py-3 text-right">Plays</th>
                <th className="px-4 py-3 text-right">Completions</th>
                <th className="px-4 py-3 text-right">Completion %</th>
                <th className="px-4 py-3 text-right">Repeats</th>
                <th className="px-4 py-3 text-right">Shares</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/5">
              {songs.map(song => (
                <tr key={song._id} className="hover:bg-surface-container/40 transition-colors group">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-on-surface">{song.title}</div>
                    <div className="text-xs text-on-surface-variant/60">{song.subject} • {song.class}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-on-surface">{song.playCount || 0}</td>
                  <td className="px-4 py-3 text-right font-mono text-on-surface-variant">{song.completionCount || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-mono font-bold ${parseFloat(song.completionRate) >= 60 ? 'text-emerald-400' : parseFloat(song.completionRate) >= 30 ? 'text-amber-400' : 'text-red-400'}`}>
                      {song.completionRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-on-surface-variant">{song.repeatCount || 0}</td>
                  <td className="px-4 py-3 text-right font-mono text-on-surface-variant">{song.shareCount || 0}</td>
                </tr>
              ))}
              {songs.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-on-surface-variant/60">No song data available yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
