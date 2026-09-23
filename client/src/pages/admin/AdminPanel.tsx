import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

export default function AdminPanel() {
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [tables, setTables] = useState<Record<string, number>>({});
  const [engine, setEngine] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, usersRes, tablesRes, engineRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getTableCounts(),
        adminService.checkEngine(),
      ]);
      setStats(statsRes.data || {});
      setUsers(usersRes.data || []);
      setTables(tablesRes.data || {});
      setEngine(engineRes.data || {});
    } catch (err: any) {
      setError(err.response?.data?.error || 'Admin access required');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    await adminService.updateUserRole(userId, newRole);
    loadAll();
  };

  if (loading) return <p className="text-white/50 text-center py-12">Loading admin panel...</p>;

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-white/50">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Admin Panel</h1>

      {/* System Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Users', value: stats.users, color: 'text-blue-400' },
          { label: 'Courses', value: stats.courses, color: 'text-green-400' },
          { label: 'Sessions', value: stats.sessions, color: 'text-yellow-400' },
          { label: 'Tasks', value: stats.tasks, color: 'text-purple-400' },
          { label: 'Insights', value: stats.insights, color: 'text-[#F5C518]' },
          { label: 'Notifications', value: stats.notifications, color: 'text-red-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-white/50 text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Tables */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Database Tables</h2>
          <div className="space-y-2">
            {Object.entries(tables).map(([table, count]) => (
              <div key={table} className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <span className="text-white/70 text-sm">{table}</span>
                <span className="text-white font-mono text-sm">{count} rows</span>
              </div>
            ))}
          </div>
        </div>

        {/* Engine Status */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Adaptive Engine</h2>
          <div className="flex items-center gap-3 mb-4">
            <span className={`relative flex h-4 w-4`}>
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${engine.online ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className={`relative inline-flex rounded-full h-4 w-4 ${engine.online ? 'bg-green-500' : 'bg-red-500'}`} />
            </span>
            <span className={`font-medium ${engine.online ? 'text-green-400' : 'text-red-400'}`}>
              {engine.online ? 'Online' : 'Offline'}
            </span>
          </div>
          <p className="text-white/50 text-sm">
            {engine.online ? 'Engine is running and processing behavior data.' : 'Engine is not reachable. Start with: python main.py'}
          </p>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">User Management</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-3 text-white/50 font-medium">Name</th>
                <th className="text-left p-3 text-white/50 font-medium">Email</th>
                <th className="text-left p-3 text-white/50 font-medium">Department</th>
                <th className="text-left p-3 text-white/50 font-medium">Streak</th>
                <th className="text-left p-3 text-white/50 font-medium">Role</th>
                <th className="text-left p-3 text-white/50 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3 text-white">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="p-3 text-white/50">{user.email}</td>
                  <td className="p-3 text-white/50">{user.department || '-'}</td>
                  <td className="p-3 text-white/50">{user.day_streak}</td>
                  <td className="p-3">
                    <select
                      value={user.role || 'student'}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-xs"
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-3 text-white/30 text-xs">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}