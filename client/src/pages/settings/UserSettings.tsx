import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { settingsService } from '../../services/settingsService';
import { pushService } from '../../services/pushService';

export default function UserSettings() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
  });

  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [preferences, setPreferences] = useState({
    pomodoro_focus_mins: 25,
    pomodoro_break_mins: 5,
    theme: 'dark',
    notif_academic_analytics: true,
    notif_study_reminders: true,
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'danger'>('profile');
  const [pushLoading, setPushLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    loadProfile();
    loadSettings();
    checkPushStatus();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await settingsService.getProfile();
      const data = res.data;
      setProfile({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
      });
    } catch (err) {
      console.error('Failed to load profile');
    }
  };

  const loadSettings = async () => {
    try {
      const res = await settingsService.getSettings();
      if (res.data) {
        setPreferences({
          pomodoro_focus_mins: res.data.pomodoro_focus_mins || 25,
          pomodoro_break_mins: res.data.pomodoro_break_mins || 5,
          theme: res.data.theme || 'dark',
          notif_academic_analytics: res.data.notif_academic_analytics ?? true,
          notif_study_reminders: res.data.notif_study_reminders ?? true,
        });
      }
    } catch (err) {
      console.error('Failed to load settings');
    }
  };

  const checkPushStatus = async () => {
    if (!('serviceWorker' in navigator)) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setPushEnabled(!!subscription);
    } catch {
      setPushEnabled(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await settingsService.updateProfile(profile);
      if (user) {
        setAuth(
          { ...user, ...res.data },
          useAuthStore.getState().accessToken!,
          useAuthStore.getState().refreshToken!
        );
      }
      setMessage('Profile updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (passwords.new_password !== passwords.confirm_password) {
      setError('New passwords do not match');
      return;
    }
    try {
      await settingsService.changePassword(
        passwords.current_password,
        passwords.new_password
      );
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
      setMessage('Password changed successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to change password');
    }
  };

  const handlePreferencesUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await settingsService.updateSettings(preferences);
      if (preferences.theme === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
      setMessage('Preferences updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update preferences');
    }
  };

  const handleDeleteAccount = async () => {
    if (
      confirm(
        'Are you sure? This will permanently delete your account and all data. This cannot be undone.'
      )
    ) {
      try {
        await settingsService.deleteAccount();
        logout();
        navigate('/sign-in');
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to delete account');
      }
    }
  };

  const handleEnablePush = async () => {
    setPushLoading(true);
    setError('');
    setMessage('');
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await pushService.subscribe();
        setPushEnabled(true);
        setMessage('Push notifications enabled successfully');
      } else {
        setError(
          'Notification permission denied. Please enable it in your browser settings.'
        );
      }
    } catch (err: any) {
      setError('Failed to enable push notifications. Please try again.');
      console.error(err);
    } finally {
      setPushLoading(false);
    }
  };

  const tabs = [
    { key: 'profile' as const, label: 'Profile & Security' },
    { key: 'preferences' as const, label: 'Study Preferences' },
    { key: 'danger' as const, label: 'Danger Zone' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-white">User Settings</h1>

      {message && (
        <div className="bg-green-500/20 text-green-400 p-4 rounded-xl text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setMessage('');
              setError('');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-[#F5C518] text-[#0D0F3C]'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Profile card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-1">First Name</label>
                  <input
                    type="text"
                    value={profile.first_name}
                    onChange={(e) =>
                      setProfile({ ...profile, first_name: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F5C518]"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">Last Name</label>
                  <input
                    type="text"
                    value={profile.last_name}
                    onChange={(e) =>
                      setProfile({ ...profile, last_name: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F5C518]"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-[#F5C518] text-[#0D0F3C] font-semibold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-all"
              >
                Save Changes
              </button>
            </form>
          </div>

          {/* Security card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Security</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwords.current_password}
                  onChange={(e) =>
                    setPasswords({ ...passwords, current_password: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F5C518]"
                  required
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">New Password</label>
                <input
                  type="password"
                  value={passwords.new_password}
                  onChange={(e) =>
                    setPasswords({ ...passwords, new_password: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F5C518]"
                  required
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwords.confirm_password}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm_password: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F5C518]"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-[#F5C518] text-[#0D0F3C] font-semibold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-all"
              >
                Change Password
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Study Preferences</h2>
          <form onSubmit={handlePreferencesUpdate} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-1">
                  Pomodoro Focus (mins)
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={preferences.pomodoro_focus_mins}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      pomodoro_focus_mins: parseInt(e.target.value),
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F5C518]"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">
                  Pomodoro Break (mins)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={preferences.pomodoro_break_mins}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      pomodoro_break_mins: parseInt(e.target.value),
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F5C518]"
                />
              </div>
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-1">Theme</label>
              <select
                value={preferences.theme}
                onChange={(e) =>
                  setPreferences({ ...preferences, theme: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F5C518]"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-white/70 text-sm">
                  Academic Analytics Notifications
                </span>
                <input
                  type="checkbox"
                  checked={preferences.notif_academic_analytics}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      notif_academic_analytics: e.target.checked,
                    })
                  }
                  className="accent-[#F5C518] w-5 h-5"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-white/70 text-sm">Study Reminders</span>
                <input
                  type="checkbox"
                  checked={preferences.notif_study_reminders}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      notif_study_reminders: e.target.checked,
                    })
                  }
                  className="accent-[#F5C518] w-5 h-5"
                />
              </label>
            </div>

            <div className="border-t border-white/10 pt-4">
              <h3 className="text-white/70 text-sm font-medium mb-3">
                Browser Push Notifications
              </h3>
              {pushEnabled ? (
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-sm font-medium">
                    ✓ Push notifications enabled
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleEnablePush}
                  disabled={pushLoading}
                  className="bg-[#F5C518] text-[#0D0F3C] font-semibold px-4 py-2 rounded-xl text-sm hover:bg-yellow-400 transition-all disabled:opacity-50"
                >
                  {pushLoading ? 'Enabling...' : 'Enable Push Notifications'}
                </button>
              )}
            </div>

            <button
              type="submit"
              className="bg-[#F5C518] text-[#0D0F3C] font-semibold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-all"
            >
              Save Preferences
            </button>
          </form>
        </div>
      )}

      {activeTab === 'danger' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
          <p className="text-white/50 text-sm mb-4">
            Once you delete your account, there is no going back. All your data will be
            permanently removed.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="bg-red-500/20 text-red-400 font-medium px-6 py-3 rounded-xl hover:bg-red-500/30 transition-all"
          >
            Delete Account
          </button>
        </div>
      )}
    </div>
  );
}
