import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import API from '../api/axios'

function Achievements() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => { fetchTasks() }, [])

  const fetchTasks = async () => {
    try {
      const res = await API.get('/tasks')
      setTasks(res.data)
    } catch (err) {
      if (err.response?.status === 401) navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  const navItems = [
    { label: 'Dashboard', icon: '⊞', path: '/dashboard' },
    { label: 'Tasks', icon: '☑', path: '/tasks' },
    { label: 'Calendar', icon: '📅', path: '/calendar' },
    { label: 'Focus Mode', icon: '⏱', path: '/focus' },
    { label: 'Stats', icon: '📊', path: '/stats' },
    { label: 'Achievements', icon: '🏆', path: '/achievements' },
  ]

  // Stats calculations
  const completed = tasks.filter(t => t.completed).length
  const total = tasks.length
  const highPriority = tasks.filter(t => t.priority === 'high' && t.completed).length
  const categories = [...new Set(tasks.map(t => t.category))].length

  // XP system
  const xp = completed * 10 + highPriority * 5
  const level = Math.floor(xp / 100) + 1
  const xpInLevel = xp % 100
  const xpToNext = 100

  // Badges definition
  const badges = [
    {
      id: 'first_task',
      icon: '✅',
      title: 'First Task',
      desc: 'Complete your first task',
      unlocked: completed >= 1,
      color: 'green',
    },
    {
      id: 'five_tasks',
      icon: '🔥',
      title: 'On Fire',
      desc: 'Complete 5 tasks',
      unlocked: completed >= 5,
      color: 'orange',
    },
    {
      id: 'ten_tasks',
      icon: '⭐',
      title: 'Star Performer',
      desc: 'Complete 10 tasks',
      unlocked: completed >= 10,
      color: 'yellow',
    },
    {
      id: 'twenty_tasks',
      icon: '🚀',
      title: 'Rocket',
      desc: 'Complete 20 tasks',
      unlocked: completed >= 20,
      color: 'blue',
    },
    {
      id: 'high_priority',
      icon: '🎯',
      title: 'Sharp Shooter',
      desc: 'Complete a high priority task',
      unlocked: highPriority >= 1,
      color: 'red',
    },
    {
      id: 'five_high',
      icon: '💪',
      title: 'Task Crusher',
      desc: 'Complete 5 high priority tasks',
      unlocked: highPriority >= 5,
      color: 'purple',
    },
    {
      id: 'categories',
      icon: '🌈',
      title: 'Multi-Tasker',
      desc: 'Create tasks in 3 different categories',
      unlocked: categories >= 3,
      color: 'pink',
    },
    {
      id: 'half_complete',
      icon: '🏅',
      title: 'Halfway There',
      desc: 'Complete 50% of your tasks',
      unlocked: total > 0 && (completed / total) >= 0.5,
      color: 'indigo',
    },
    {
      id: 'all_complete',
      icon: '👑',
      title: 'Champion',
      desc: 'Complete all your tasks',
      unlocked: total > 0 && completed === total,
      color: 'gold',
    },
    {
      id: 'ten_tasks_created',
      icon: '📝',
      title: 'Planner',
      desc: 'Create 10 tasks',
      unlocked: total >= 10,
      color: 'teal',
    },
    {
      id: 'focus_master',
      icon: '⏱',
      title: 'Focus Master',
      desc: 'Use Focus Mode (coming soon)',
      unlocked: false,
      color: 'gray',
      comingSoon: true,
    },
    {
      id: 'early_bird',
      icon: '🌅',
      title: 'Early Bird',
      desc: 'Complete a task before 9am (coming soon)',
      unlocked: false,
      color: 'gray',
      comingSoon: true,
    },
  ]

  const unlockedCount = badges.filter(b => b.unlocked).length

  const badgeColor = (color, unlocked) => {
    if (!unlocked) return 'bg-gray-50 border-gray-100'
    const map = {
      green: 'bg-green-50 border-green-200',
      orange: 'bg-orange-50 border-orange-200',
      yellow: 'bg-yellow-50 border-yellow-200',
      blue: 'bg-blue-50 border-blue-200',
      red: 'bg-red-50 border-red-200',
      purple: 'bg-purple-50 border-purple-200',
      pink: 'bg-pink-50 border-pink-200',
      indigo: 'bg-indigo-50 border-indigo-200',
      gold: 'bg-amber-50 border-amber-200',
      teal: 'bg-teal-50 border-teal-200',
      gray: 'bg-gray-50 border-gray-100',
    }
    return map[color] || 'bg-violet-50 border-violet-200'
  }

  // Milestones
  const milestones = [
    { label: '1st task', target: 1, current: completed },
    { label: '5 tasks', target: 5, current: completed },
    { label: '10 tasks', target: 10, current: completed },
    { label: '20 tasks', target: 20, current: completed },
    { label: '50 tasks', target: 50, current: completed },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col p-4 fixed h-full">
        <div className="flex items-center gap-2 mb-8 mt-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">✓</span>
          </div>
          <span className="text-lg font-bold text-violet-600">FlowTask</span>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(item => (
            <button key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition text-left w-full
                ${location.pathname === item.path
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-600 hover:bg-violet-50 hover:text-violet-600'}`}>
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <button onClick={() => { localStorage.clear(); navigate('/login') }}
          className="text-sm text-gray-400 hover:text-red-500 transition text-left px-3 py-1">
          Sign out
        </button>
      </aside>

      {/* Main */}
      <main className="ml-56 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Achievements</h1>
          <p className="text-gray-500 text-sm mt-1">
            {unlockedCount} of {badges.length} badges unlocked
          </p>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading achievements...</div>
        ) : (
          <>
            {/* Level & XP card */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-violet-200 text-sm font-medium">Current Level</p>
                  <p className="text-4xl font-bold mt-1">Level {level}</p>
                </div>
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-3xl">
                  🏆
                </div>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-violet-200">{xpInLevel} XP</span>
                <span className="text-violet-200">{xpToNext} XP to Level {level + 1}</span>
              </div>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-2.5">
                <div className="bg-white h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${(xpInLevel / xpToNext) * 100}%` }} />
              </div>
              <div className="flex gap-6 mt-4">
                <div>
                  <p className="text-violet-200 text-xs">Total XP</p>
                  <p className="text-lg font-bold">{xp} XP</p>
                </div>
                <div>
                  <p className="text-violet-200 text-xs">Tasks Done</p>
                  <p className="text-lg font-bold">{completed}</p>
                </div>
                <div>
                  <p className="text-violet-200 text-xs">Badges</p>
                  <p className="text-lg font-bold">{unlockedCount}</p>
                </div>
              </div>
            </div>

            {/* Badges grid */}
            <h2 className="text-base font-semibold text-gray-800 mb-4">Badges</h2>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {badges.map(badge => (
                <div key={badge.id}
                  className={`rounded-xl border p-4 flex flex-col items-center text-center transition
                    ${badgeColor(badge.color, badge.unlocked)}
                    ${!badge.unlocked ? 'opacity-50' : ''}`}>
                  <div className={`text-3xl mb-2 ${!badge.unlocked ? 'grayscale' : ''}`}>
                    {badge.icon}
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{badge.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{badge.desc}</p>
                  {badge.unlocked ? (
                    <span className="mt-2 text-xs font-medium text-green-500">✓ Unlocked</span>
                  ) : badge.comingSoon ? (
                    <span className="mt-2 text-xs text-gray-400">Coming soon</span>
                  ) : (
                    <span className="mt-2 text-xs text-gray-400">Locked 🔒</span>
                  )}
                </div>
              ))}
            </div>

            {/* Milestones */}
            <h2 className="text-base font-semibold text-gray-800 mb-4">Milestones</h2>
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex flex-col gap-4">
                {milestones.map(m => {
                  const pct = Math.min((m.current / m.target) * 100, 100)
                  const done = m.current >= m.target
                  return (
                    <div key={m.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{m.label}</span>
                        <span className={`text-xs font-medium ${done ? 'text-green-500' : 'text-gray-400'}`}>
                          {done ? '✓ Complete' : `${m.current} / ${m.target}`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all duration-700
                          ${done ? 'bg-green-500' : 'bg-violet-500'}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default Achievements