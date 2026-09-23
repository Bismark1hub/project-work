import { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';

const TYPE_ICONS: Record<string, string> = {
  adaptive: '🧠',
  reminder: '⏰',
  achievement: '🏆',
  system: '📊',
  alert: '🚨',
};

const TYPE_COLORS: Record<string, string> = {
  adaptive: 'border-l-blue-400',
  reminder: 'border-l-yellow-400',
  achievement: 'border-l-green-400',
  system: 'border-l-purple-400',
  alert: 'border-l-red-400',
};

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll();
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead();
    loadNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Group by time
  const now = new Date();
  const today = notifications.filter((n) => {
    const d = new Date(n.created_at);
    return d.toDateString() === now.toDateString();
  });
  const earlier = notifications.filter((n) => {
    const d = new Date(n.created_at);
    return d.toDateString() !== now.toDateString();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          <p className="text-white/50 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="bg-white/10 text-white px-4 py-2 rounded-xl text-sm hover:bg-white/20 transition-all"
          >
            Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-white/50 text-center py-12">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-white/50 text-lg">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Today */}
          {today.length > 0 && (
            <div>
              <h2 className="text-white/50 text-sm font-medium mb-3 uppercase tracking-wide">Today</h2>
              <div className="space-y-2">
                {today.map((n) => (
                  <div
                    key={n.id}
                    className={`bg-white/5 border border-white/10 border-l-4 ${TYPE_COLORS[n.type] || 'border-l-gray-400'} rounded-xl p-4 flex items-start gap-3 ${!n.read ? 'bg-white/10' : ''}`}
                  >
                    <span className="text-xl mt-0.5">{TYPE_ICONS[n.type] || '🔔'}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm">{n.title}</span>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-[#F5C518]" />
                        )}
                      </div>
                      <p className="text-white/50 text-sm mt-0.5">{n.body}</p>
                    </div>
                    <span className="text-white/30 text-xs whitespace-nowrap">{timeAgo(n.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Earlier */}
          {earlier.length > 0 && (
            <div>
              <h2 className="text-white/50 text-sm font-medium mb-3 uppercase tracking-wide">Earlier</h2>
              <div className="space-y-2">
                {earlier.map((n) => (
                  <div
                    key={n.id}
                    className={`bg-white/5 border border-white/10 border-l-4 ${TYPE_COLORS[n.type] || 'border-l-gray-400'} rounded-xl p-4 flex items-start gap-3`}
                  >
                    <span className="text-xl mt-0.5">{TYPE_ICONS[n.type] || '🔔'}</span>
                    <div className="flex-1">
                      <span className="text-white font-medium text-sm">{n.title}</span>
                      <p className="text-white/50 text-sm mt-0.5">{n.body}</p>
                    </div>
                    <span className="text-white/30 text-xs whitespace-nowrap">{timeAgo(n.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* System Updates Panel */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-white mb-2">System Updates</h2>
        <div className="text-white/40 text-xs space-y-1">
          <p>• Adaptive engine running on schedule (every 6 hours)</p>
          <p>• Study reminders enabled for all scheduled sessions</p>
          <p>• Weekly digest reports sent every Sunday at 8 PM</p>
        </div>
      </div>
    </div>
  );
}