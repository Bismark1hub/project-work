import { useState, useEffect } from 'react';
import { scheduleService } from '../../services/scheduleService';

function getWeekDates() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const start = new Date(today);
  start.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    days.push({
      date: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
    });
  }
  return days;
}

export default function SchedulePlanner() {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [sessions, setSessions] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '',
    start_time: '',
    end_time: '',
    focus_topic: '',
    is_urgent: false,
  });
  const weekDays = getWeekDates();

  const loadSessions = async (date: string) => {
    setLoading(true);
    try {
      const result = await scheduleService.getByDate(date);
      setSessions(result.data || []);
    } catch (err) {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions(selectedDate);
  }, [selectedDate]);

  // Auto-mark missed sessions (time has passed)
  useEffect(() => {
    const now = new Date();
    let changed = false;
    const updatedSessions = sessions.map(session => {
      if (session.status === 'planned') {
        const endTime = new Date(session.end_time);
        if (endTime < now) {
          changed = true;
          scheduleService.updateStatus(session.id, {
            status: 'missed',
            actual_start: session.start_time,
            actual_end: session.end_time,
          });
          return { ...session, status: 'missed' };
        }
      }
      return session;
    });
    if (changed) {
      setSessions(updatedSessions);
    }
  }, [sessions, selectedDate]);

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setShowForm(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const startTime = `${selectedDate}T${newSession.start_time}:00`;
      const endTime = `${selectedDate}T${newSession.end_time}:00`;

      await scheduleService.create({
        title: newSession.title,
        start_time: startTime,
        end_time: endTime,
        focus_topic: newSession.focus_topic || undefined,
        is_urgent: newSession.is_urgent,
      });

      setShowForm(false);
      setNewSession({ title: '', start_time: '', end_time: '', focus_topic: '', is_urgent: false });
      loadSessions(selectedDate);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create session');
    }
  };

  const handleMarkStatus = async (id: string, status: string) => {
    try {
      await scheduleService.updateStatus(id, {
        status,
        actual_start: new Date().toISOString(),
        actual_end: new Date().toISOString(),
      });
      loadSessions(selectedDate);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update');
    }
  };

  const completedCount = sessions.filter((s) => s.status === 'completed').length;
  const progressPct = sessions.length > 0 ? (completedCount / sessions.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Schedule Planner</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#F5C518] text-[#0D0F3C] font-semibold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-all"
          >
            + New Session
          </button>
        )}
      </div>

      {/* Week Date Strip */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {weekDays.map((day) => (
          <button
            key={day.date}
            onClick={() => handleSelectDate(day.date)}
            className={`flex flex-col items-center min-w-[70px] p-3 rounded-xl transition-all ${
              day.isToday
                ? 'bg-[#F5C518] text-[#0D0F3C] font-bold'
                : day.date === selectedDate
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            <span className="text-xs">{day.dayName}</span>
            <span className="text-lg">{day.dayNum}</span>
          </button>
        ))}
      </div>

      {/* New Session Form */}
      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">New Study Session</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm mb-1">Title *</label>
              <input
                type="text"
                value={newSession.title}
                onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F5C518]"
                placeholder="e.g. Calculus Review"
                required
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1">Focus Topic (optional)</label>
              <input
                type="text"
                value={newSession.focus_topic}
                onChange={(e) => setNewSession({ ...newSession, focus_topic: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F5C518]"
                placeholder="e.g. Derivatives"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-1">Start Time *</label>
                <input
                  type="time"
                  value={newSession.start_time}
                  onChange={(e) => setNewSession({ ...newSession, start_time: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F5C518]"
                  required
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">End Time *</label>
                <input
                  type="time"
                  value={newSession.end_time}
                  onChange={(e) => setNewSession({ ...newSession, end_time: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F5C518]"
                  required
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-white/70 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={newSession.is_urgent}
                onChange={(e) => setNewSession({ ...newSession, is_urgent: e.target.checked })}
                className="accent-[#F5C518] w-4 h-4"
              />
              Mark as urgent
            </label>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-[#F5C518] text-[#0D0F3C] font-semibold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-all"
              >
                Create Session
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-white/10 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Daily Timeline */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Daily Timeline — {selectedDate}
        </h2>

        {loading ? (
          <p className="text-white/50 text-center py-8">Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <p className="text-white/50 text-center py-8">No sessions planned for this day.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center gap-4 p-4 rounded-xl flex-wrap ${
                  session.status === 'completed'
                    ? 'bg-green-500/10 border border-green-500/20'
                    : session.status === 'missed'
                    ? 'bg-red-500/10 border border-red-500/20'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className="text-[#F5C518] font-mono text-sm min-w-[130px]">
                  {new Date(session.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}{' '}
                  -{' '}
                  {new Date(session.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex-1 min-w-[150px]">
                  <div className="text-white font-medium">{session.title}</div>
                  {session.focus_topic && (
                    <div className="text-white/40 text-sm">{session.focus_topic}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      session.status === 'completed'
                        ? 'bg-green-500/20 text-green-400'
                        : session.status === 'missed'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {session.status}
                  </span>
                  {session.is_urgent && (
                    <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                      Urgent
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {session.status === 'planned' && (
                    <>
                      <button
                        onClick={() => handleMarkStatus(session.id, 'completed')}
                        className="text-green-400 hover:bg-green-500/20 px-3 py-1 rounded-lg text-sm font-medium transition-all"
                      >
                        Done
                      </button>
                      <button
                        onClick={() => handleMarkStatus(session.id, 'missed')}
                        className="text-red-400 hover:bg-red-500/20 px-3 py-1 rounded-lg text-sm font-medium transition-all"
                      >
                        Miss
                      </button>
                    </>
                  )}
                  {(session.status === 'completed' || session.status === 'missed') && (
                    <button
                      onClick={() => handleMarkStatus(session.id, 'planned')}
                      className="text-white/50 hover:text-white hover:bg-white/10 px-3 py-1 rounded-lg text-sm font-medium transition-all"
                      title="Undo"
                    >
                      ↩ Undo
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Goal Progress */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Daily Goal Progress</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-4 bg-green-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-white font-medium whitespace-nowrap">
            {completedCount}/{sessions.length} sessions
          </span>
        </div>
      </div>
    </div>
  );
}