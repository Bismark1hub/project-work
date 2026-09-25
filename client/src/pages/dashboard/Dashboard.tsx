import { useAuthStore } from '../../store/authStore';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { scheduleService } from '../../services/scheduleService';
import { taskService } from '../../services/taskService';
import { courseService } from '../../services/courseService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [hasData, setHasData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [insightStatus, setInsightStatus] = useState<'pending' | 'accepted' | 'dismissed'>('pending');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sRes, tRes, cRes] = await Promise.all([
        scheduleService.getByDate(today),
        taskService.getAll(),
        courseService.getAll(),
      ]);
      const sessionData = sRes.data || [];
      const taskData = tRes.data || [];
      const courseData = cRes.data || [];
      setSessions(sessionData);
      setTasks(taskData);
      setCourses(courseData);
      setHasData(sessionData.length > 0 || taskData.length > 0 || courseData.length > 0);
    } catch {
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const totalSessions = sessions.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyData = weekDays.map(day => ({ day, hours: 0 }));

  if (loading) {
    return <p className="text-white/50 text-center py-12">Loading...</p>;
  }

  // Empty state for new users
  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {getGreeting()}, {user?.first_name}!
          </h1>
          <p className="text-white/50 mt-1">Welcome to  Smart Study Planner</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-semibold text-white mb-2">Ready to start studying?</h2>
          <p className="text-white/50 mb-6 max-w-md mx-auto">
            Your dashboard will fill up as you add courses, schedule sessions, and complete tasks.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate('/courses')}
              className="bg-[#F5C518] text-[#0D0F3C] font-semibold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-all"
            >
              Add Courses
            </button>
            <button
              onClick={() => navigate('/schedule')}
              className="bg-white/10 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/20 transition-all"
            >
              Plan Schedule
            </button>
            <button
              onClick={() => navigate('/tasks')}
              className="bg-white/10 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/20 transition-all"
            >
              Create Tasks
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {getGreeting()}, {user?.first_name}!
          </h1>
          <p className="text-white/50 mt-1">Here's your study overview for today</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center min-w-[80px]">
            <div className="text-3xl font-bold text-[#F5C518]">{user?.day_streak || 0}</div>
            <div className="text-white/50 text-xs">Day Streak</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center min-w-[80px]">
            <div className="text-3xl font-bold text-green-400">{user?.productivity_score || 0}</div>
            <div className="text-white/50 text-xs">Productivity</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Today's Schedule</h2>
          {sessions.length === 0 ? (
            <p className="text-white/50 text-center py-4">No sessions today</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 p-4 rounded-xl ${
                    item.status === 'completed' ? 'bg-green-500/10 border border-green-500/20' :
                    item.status === 'missed' ? 'bg-red-500/10 border border-red-500/20' :
                    item.is_urgent ? 'bg-red-500/10 border border-red-500/20' : 'bg-white/5'
                  }`}
                >
                  <div className="text-[#F5C518] font-mono text-sm w-24">
                    {new Date(item.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">{item.title}</div>
                    <div className="text-white/40 text-sm">{item.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">💡</span>
            <h2 className="text-lg font-semibold text-white">Smart Insight</h2>
          </div>
          {completedSessions >= 3 ? (
            <>
              <h3 className="text-white font-medium mb-2">You're on a roll!</h3>
              <p className="text-white/50 text-sm mb-3">
                You've completed {completedSessions} sessions today. Keep the momentum!
              </p>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-2 bg-white/10 rounded-full">
                  <div className="h-2 bg-green-400 rounded-full" style={{ width: `${Math.min((completedSessions / 5) * 100, 100)}%` }} />
                </div>
                <span className="text-green-400 text-sm font-medium">{Math.min((completedSessions / 5) * 100, 100)}%</span>
              </div>
            </>
          ) : (
            <p className="text-white/50 text-sm">Complete more sessions to unlock insights.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Weekly Productivity</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1a1a3e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} />
              <Bar dataKey="hours" fill="#F5C518" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Tasks Overview</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
              <div className="h-4 bg-green-400 rounded-full" style={{ width: totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : '0%' }} />
            </div>
            <span className="text-white text-sm">{completedTasks}/{totalTasks}</span>
          </div>
          {tasks.slice(0, 3).map((task, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-green-400' : task.priority === 'high' ? 'bg-red-400' : 'bg-yellow-400'}`} />
              <span className="text-white/70 text-sm">{task.title}</span>
              <span className="text-white/30 text-xs ml-auto">{task.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}