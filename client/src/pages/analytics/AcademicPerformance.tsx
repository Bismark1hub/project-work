import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { analyticsService } from '../../services/analyticsService';

export default function AcademicPerformance() {
  const [summary, setSummary] = useState<any>({});
  const [consistency, setConsistency] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [focusTrend, setFocusTrend] = useState<any[]>([]);
  const [range, setRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, [range]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sumRes, conRes, subRes, heatRes, focusRes] = await Promise.all([
        analyticsService.getSummary(),
        analyticsService.getConsistency(range),
        analyticsService.getSubjects(),
        analyticsService.getHeatmap(),
        analyticsService.getFocusTrend(),
      ]);
      setSummary(sumRes.data || {});
      setConsistency(Array.isArray(conRes.data) ? conRes.data : []);
      setSubjects(Array.isArray(subRes.data) ? subRes.data : []);
      setHeatmap(Array.isArray(heatRes.data) ? heatRes.data : []);
      setFocusTrend(Array.isArray(focusRes.data) ? focusRes.data : []);
    } catch (err) {
      console.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-white/5';
    if (count <= 2) return 'bg-green-500/30';
    if (count <= 4) return 'bg-green-500/60';
    return 'bg-green-500/90';
  };

  if (loading) {
    return <p className="text-white/50 text-center py-12">Loading analytics...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Academic Performance</h1>

      {/* Stats Row - 3 cards instead of 4 (GPA removed) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-green-400">{summary.productivity_score || 0}</div>
          <div className="text-white/50 text-xs mt-1">Productivity Score</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-blue-400">{summary.total_study_hours || 0}h</div>
          <div className="text-white/50 text-xs mt-1">Total Study Hours</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-[#F5C518]">{summary.day_streak || 0}</div>
          <div className="text-white/50 text-xs mt-1">Day Streak</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Consistency */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Study Consistency</h2>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-white text-sm"
            >
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={consistency}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} tickFormatter={(val) => val.slice(5)} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a1a3e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} />
              <Bar dataKey="minutes" fill="#F5C518" radius={[6, 6, 0, 0]} name="Minutes" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Allocation */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Subject Allocation</h2>
          {subjects.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={subjects} dataKey="percentage" nameKey="subject" cx="50%" cy="50%" outerRadius={80}>
                    {subjects.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1a1a3e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {subjects.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-white text-xs">{s.subject} ({s.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-white/50 text-sm text-center py-8">Complete sessions to see allocation</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Heatmap */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Activity Heatmap (90 Days)</h2>
          <div className="grid grid-cols-12 gap-1">
            {heatmap.slice(-84).map((day: any, i: number) => (
              <div
                key={i}
                className={`w-full aspect-square rounded-sm ${getHeatmapColor(day.count)}`}
                title={`${day.date}: ${day.count} sessions`}
              />
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 mt-3 text-xs text-white/50">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-white/5" />
            <div className="w-3 h-3 rounded-sm bg-green-500/30" />
            <div className="w-3 h-3 rounded-sm bg-green-500/60" />
            <div className="w-3 h-3 rounded-sm bg-green-500/90" />
            <span>More</span>
          </div>
        </div>

        {/* Focus Intensity Trend */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Focus Intensity Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={focusTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} tickFormatter={(val) => val.slice(5)} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#1a1a3e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} />
              <Line type="monotone" dataKey="focus_score" stroke="#F5C518" strokeWidth={2} dot={{ r: 3 }} name="Focus %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{summary.completed_sessions || 0}</div>
          <div className="text-white/50 text-xs mt-1">Completed Sessions</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{summary.missed_sessions || 0}</div>
          <div className="text-white/50 text-xs mt-1">Missed Sessions</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{summary.total_tasks || 0}</div>
          <div className="text-white/50 text-xs mt-1">Total Tasks</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-[#F5C518]">{summary.completed_tasks || 0}</div>
          <div className="text-white/50 text-xs mt-1">Tasks Done</div>
        </div>
      </div>
    </div>
  );
}