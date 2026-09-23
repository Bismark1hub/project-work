import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { notificationService } from '../../services/notificationService';

export default function TopBar() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnread = async () => {
      try {
        const res = await notificationService.getUnread();
        setUnreadCount(res.data?.length || 0);
      } catch {
        setUnreadCount(0);
      }
    };
    loadUnread();
    // refresh every 30 seconds
    const interval = setInterval(loadUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white/5 border-b border-white/10 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-white font-semibold text-lg truncate">
          Welcome, {user?.first_name || 'Student'}
        </h2>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Notification bell */}
        <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
          <svg className="w-6 h-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <div className="w-9 h-9 bg-[#F5C518] rounded-full flex items-center justify-center">
          <span className="text-[#0D0F3C] font-bold text-sm">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </span>
        </div>
      </div>
    </header>
  );
}