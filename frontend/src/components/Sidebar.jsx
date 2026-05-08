import { useNavigate, useLocation } from 'react-router-dom'

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

function Sidebar({ badge = 0 }) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return (
    <aside className="w-56 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-700 flex flex-col p-4 fixed h-full z-10">
      <div className="flex items-center gap-2 mb-8 mt-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
          <span className="text-white text-sm font-bold">✓</span>
        </div>
        <span className="text-lg font-bold" style={{ color: 'var(--accent)' }}>FlowTask</span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(item => {
          const isActive = location.pathname === item.path
          return (
            <button key={item.label} onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition text-left w-full
                ${isActive
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              style={isActive ? { background: 'var(--accent)' } : {}}>
              <span>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.label === 'Inbox' && badge > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white"
            style={{ background: 'var(--accent)' }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-white">{user.name}</p>
            <p className="text-xs text-gray-400">Level 1</p>
          </div>
        </div>
        <button onClick={() => { localStorage.clear(); navigate('/login') }}
          className="w-full text-sm text-gray-400 hover:text-red-500 transition text-left px-3 py-1">
          Sign out
        </button>
      </div>
    </aside>
  )
}

export default Sidebar