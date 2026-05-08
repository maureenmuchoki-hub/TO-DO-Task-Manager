import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import API from '../api/axios'
import { useTheme, ACCENT_COLORS, FONTS } from '../context/ThemeContext'

function Settings() {
  const [user, setUser] = useState({ name: '', email: '' })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false, new: false, confirm: false
  })
  const [notifications, setNotifications] = useState({
    emailReminders: true, dueDateAlerts: true, weeklyReport: false, browserPush: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const navigate = useNavigate()
  const location = useLocation()
  const { theme, setTheme, accent, setAccent, font, setFont } = useTheme()

  useEffect(() => { fetchUser() }, [])

  const fetchUser = async () => {
    try {
      const res = await API.get('/auth/me')
      setUser({ name: res.data.name, email: res.data.email })
    } catch (err) {
      if (err.response?.status === 401) navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await API.patch('/auth/me', user)
      localStorage.setItem('user', JSON.stringify(res.data))
      showMessage('success', 'Profile updated successfully!')
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      return showMessage('error', 'New passwords do not match')
    if (passwordForm.newPassword.length < 6)
      return showMessage('error', 'Password must be at least 6 characters')
    setSaving(true)
    try {
      await API.patch('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      showMessage('success', 'Password changed successfully!')
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const exportData = async () => {
    try {
      const res = await API.get('/tasks')
      const data = {
        exportDate: new Date().toISOString(),
        user: user.name,
        totalTasks: res.data.length,
        tasks: res.data,
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `flowtask-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      showMessage('success', 'Data exported successfully!')
    } catch (err) {
      showMessage('error', 'Failed to export data')
    }
  }

  const deleteAccount = async () => {
    try {
      await API.delete('/auth/me')
      localStorage.clear()
      navigate('/login')
    } catch (err) {
      showMessage('error', 'Failed to delete account')
    }
  }

  const requestPushNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setNotifications({ ...notifications, browserPush: true })
        showMessage('success', 'Browser notifications enabled!')
        new Notification('FlowTask', { body: 'Notifications are now enabled!' })
      } else {
        showMessage('error', 'Notification permission denied')
      }
    } else {
      showMessage('error', 'Browser notifications not supported')
    }
  }

  const navItems = [
    { label: 'Dashboard', icon: '⊞', path: '/dashboard' },
    { label: 'Tasks', icon: '☑', path: '/tasks' },
    { label: 'Calendar', icon: '📅', path: '/calendar' },
    { label: 'Focus Mode', icon: '⏱', path: '/focus' },
    { label: 'Stats', icon: '📊', path: '/stats' },
    { label: 'Achievements', icon: '🏆', path: '/achievements' },
    { label: 'Inbox', icon: '📬', path: '/inbox' },
    { label: 'Settings', icon: '⚙️', path: '/settings' },
  ]

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'data', label: 'Data', icon: '💾' },
  ]

  const PasswordInput = ({ label, field, value, onChange }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{label}</label>
      <div className="relative">
        <input
          type={showPasswords[field] ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          required
          className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 pr-10"
        />
        <button type="button"
          onClick={() => setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] })}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
          {showPasswords[field] ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">

      {/* Sidebar */}
      <aside className="w-56 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-700 flex flex-col p-4 fixed h-full">
        <div className="flex items-center gap-2 mb-8 mt-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent)' }}>
            <span className="text-white text-sm font-bold">✓</span>
          </div>
          <span className="text-lg font-bold dark:text-violet-400"
            style={{ color: 'var(--accent)' }}>FlowTask</span>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(item => (
            <button key={item.label} onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition text-left w-full
                ${location.pathname === item.path
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              style={location.pathname === item.path ? { background: 'var(--accent)' } : {}}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <button onClick={() => { localStorage.clear(); navigate('/login') }}
          className="text-sm text-gray-400 hover:text-red-500 transition text-left px-3 py-1">
          Sign out
        </button>
      </aside>

      {/* Main */}
      <main className="ml-56 flex-1 p-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your account and preferences</p>
        </div>

        {message.text && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium
            ${message.type === 'success' ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1.5 mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-1.5">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition text-white"
              style={activeTab === tab.id
                ? { background: 'var(--accent)' }
                : { background: 'transparent', color: '' }}
              // override color for inactive
              {...(activeTab !== tab.id ? {
                className: 'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              } : {})}>
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading settings...</div>
        ) : (
          <>
            {/* ── Profile Tab ── */}
            {activeTab === 'profile' && (
              <div className="flex flex-col gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Profile</h2>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                      style={{ background: 'var(--accent)' }}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{user.name}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <form onSubmit={saveProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Full Name</label>
                      <input type="text" required value={user.name}
                        onChange={e => setUser({ ...user, name: e.target.value })}
                        className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
                      <input type="email" required value={user.email}
                        onChange={e => setUser({ ...user, email: e.target.value })}
                        className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
                    </div>
                    <button type="submit" disabled={saving}
                      className="text-white text-sm font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-50 hover:opacity-90"
                      style={{ background: 'var(--accent)' }}>
                      {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                  </form>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Change Password</h2>
                  <form onSubmit={changePassword} className="space-y-4">
                    <PasswordInput label="Current Password" field="current"
                      value={passwordForm.currentPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
                    <PasswordInput label="New Password" field="new"
                      value={passwordForm.newPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                    <PasswordInput label="Confirm New Password" field="confirm"
                      value={passwordForm.confirmPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                    <button type="submit" disabled={saving}
                      className="text-white text-sm font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-50 hover:opacity-90"
                      style={{ background: 'var(--accent)' }}>
                      {saving ? 'Changing...' : 'Change Password'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ── Appearance Tab ── */}
            {activeTab === 'appearance' && (
              <div className="flex flex-col gap-6">

                {/* Theme */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Theme</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: 'Light', icon: '☀️' },
                      { value: 'dark', label: 'Dark', icon: '🌙' },
                      { value: 'system', label: 'System', icon: '💻' },
                    ].map(t => (
                      <button key={t.value} onClick={() => setTheme(t.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition
                          ${theme === t.value
                            ? 'bg-gray-50 dark:bg-gray-700'
                            : 'border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500'}`}
                        style={theme === t.value ? { borderColor: 'var(--accent)' } : {}}>
                        <span className="text-2xl">{t.icon}</span>
                        <span className={`text-sm font-medium ${theme === t.value ? '' : 'text-gray-600 dark:text-gray-300'}`}
                          style={theme === t.value ? { color: 'var(--accent)' } : {}}>
                          {t.label}
                        </span>
                        {theme === t.value && (
                          <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>✓ Active</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-1">Accent Color</h2>
                  <p className="text-xs text-gray-400 mb-4">Changes the primary color throughout the app</p>
                  <div className="flex gap-4 flex-wrap">
                    {Object.entries(ACCENT_COLORS).map(([key, val]) => (
                      <button key={key} onClick={() => setAccent(key)}
                        className="flex flex-col items-center gap-1.5">
                        <div className={`w-10 h-10 rounded-full transition-all duration-200
                          ${accent === key ? 'ring-4 ring-offset-2 ring-gray-400 dark:ring-gray-500 scale-110' : 'hover:scale-105'}`}
                          style={{ background: val.primary }} />
                        <span className={`text-xs font-medium ${accent === key ? 'text-gray-800 dark:text-white' : 'text-gray-400'}`}>
                          {val.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-1">Font</h2>
                  <p className="text-xs text-gray-400 mb-4">Choose your preferred reading font</p>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(FONTS).map(([key, val]) => (
                      <button key={key} onClick={() => setFont(key)}
                        className={`p-4 rounded-xl border-2 text-left transition
                          ${font === key
                            ? 'bg-gray-50 dark:bg-gray-700'
                            : 'border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500'}`}
                        style={{ fontFamily: val.value, ...(font === key ? { borderColor: 'var(--accent)' } : {}) }}>
                        <p className={`text-sm font-medium ${font === key ? '' : 'text-gray-700 dark:text-gray-200'}`}
                          style={font === key ? { color: 'var(--accent)' } : {}}>
                          {val.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">The quick brown fox jumps</p>
                        {font === key && (
                          <p className="text-xs mt-1 font-medium" style={{ color: 'var(--accent)' }}>✓ Active</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Notifications Tab ── */}
            {activeTab === 'notifications' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Notifications</h2>
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Browser Push Notifications</p>
                      <p className="text-xs text-gray-400 mt-0.5">Get real-time alerts in your browser</p>
                    </div>
                    {notifications.browserPush ? (
                      <span className="text-xs text-green-500 font-medium bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-lg">✓ Enabled</span>
                    ) : (
                      <button onClick={requestPushNotifications}
                        className="text-xs text-white font-medium px-3 py-1.5 rounded-lg transition hover:opacity-90"
                        style={{ background: 'var(--accent)' }}>
                        Enable
                      </button>
                    )}
                  </div>
                  {[
                    { key: 'emailReminders', label: 'Email Reminders', desc: 'Get email reminders for upcoming tasks' },
                    { key: 'dueDateAlerts', label: 'Due Date Alerts', desc: 'Get notified when tasks are due soon' },
                    { key: 'weeklyReport', label: 'Weekly Report', desc: 'Receive a weekly productivity summary' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                        className="w-12 h-6 rounded-full transition-colors relative"
                        style={{ background: notifications[item.key] ? 'var(--accent)' : '' }}
                        {...(!notifications[item.key] ? { className: 'w-12 h-6 rounded-full transition-colors relative bg-gray-200 dark:bg-gray-600' } : {})}>
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm
                          ${notifications[item.key] ? 'left-6' : 'left-0.5'}`} />
                      </button>
                    </div>
                  ))}
                  <p className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                    📧 Email notifications require backend setup — coming soon!
                  </p>
                </div>
              </div>
            )}

            {/* ── Data Tab ── */}
            {activeTab === 'data' && (
              <div className="flex flex-col gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-1">Export Data</h2>
                  <p className="text-sm text-gray-400 mb-4">Download all your tasks as a JSON file. Your data belongs to you.</p>
                  <button onClick={exportData}
                    className="flex items-center gap-2 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition hover:opacity-90"
                    style={{ background: 'var(--accent)' }}>
                    ⬇️ Export as JSON
                  </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-100 dark:border-red-900/50 p-6">
                  <h2 className="text-base font-semibold text-red-600 mb-1">Danger Zone</h2>
                  <p className="text-sm text-gray-400 mb-4">
                    Once you delete your account, all your tasks and data will be permanently removed. This cannot be undone.
                  </p>
                  {!showDeleteConfirm ? (
                    <button onClick={() => setShowDeleteConfirm(true)}
                      className="border border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium px-5 py-2.5 rounded-lg transition">
                      Delete Account
                    </button>
                  ) : (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                      <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-3">
                        Are you absolutely sure? This cannot be undone.
                      </p>
                      <div className="flex gap-3">
                        <button onClick={deleteAccount}
                          className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                          Yes, delete everything
                        </button>
                        <button onClick={() => setShowDeleteConfirm(false)}
                          className="border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default Settings