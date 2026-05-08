import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
import Sidebar from '../components/Sidebar'

function Achievements() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

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

  const completed = tasks.filter(t => t.completed).length
  const total = tasks.length
  const highPriority = tasks.filter(t => t.priority === 'high' && t.completed).length
  const categories = [...new Set(tasks.map(t => t.category))].length
  const xp = completed * 10 + highPriority * 5
  const level = Math.floor(xp / 100) + 1
  const xpInLevel = xp % 100

  const badges = [
    { id: 'first_task', icon: '✅', title: 'First Task', desc: 'Complete your first task', unlocked: completed >= 1, color: '#10B981' },
    { id: 'five_tasks', icon: '🔥', title: 'On Fire', desc: 'Complete 5 tasks', unlocked: completed >= 5, color: '#F97316' },
    { id: 'ten_tasks', icon: '⭐', title: 'Star Performer', desc: 'Complete 10 tasks', unlocked: completed >= 10, color: '#EAB308' },
    { id: 'twenty_tasks', icon: '🚀', title: 'Rocket', desc: 'Complete 20 tasks', unlocked: completed >= 20, color: '#3B82F6' },
    { id: 'high_priority', icon: '🎯', title: 'Sharp Shooter', desc: 'Complete a high priority task', unlocked: highPriority >= 1, color: '#EF4444' },
    { id: 'five_high', icon: '💪', title: 'Task Crusher', desc: 'Complete 5 high priority tasks', unlocked: highPriority >= 5, color: '#8B5CF6' },
    { id: 'categories', icon: '🌈', title: 'Multi-Tasker', desc: 'Create tasks in 3 categories', unlocked: categories >= 3, color: '#EC4899' },
    { id: 'half_complete', icon: '🏅', title: 'Halfway There', desc: 'Complete 50% of your tasks', unlocked: total > 0 && (completed / total) >= 0.5, color: '#6366F1' },
    { id: 'all_complete', icon: '👑', title: 'Champion', desc: 'Complete all your tasks', unlocked: total > 0 && completed === total, color: '#F59E0B' },
    { id: 'ten_created', icon: '📝', title: 'Planner', desc: 'Create 10 tasks', unlocked: total >= 10, color: '#14B8A6' },
    { id: 'focus_master', icon: '⏱', title: 'Focus Master', desc: 'Use Focus Mode', unlocked: false, comingSoon: true },
    { id: 'early_bird', icon: '🌅', title: 'Early Bird', desc: 'Complete a task before 9am', unlocked: false, comingSoon: true },
  ]

  const unlockedCount = badges.filter(b => b.unlocked).length

  const milestones = [
    { label: '1st task', target: 1, current: completed },
    { label: '5 tasks', target: 5, current: completed },
    { label: '10 tasks', target: 10, current: completed },
    { label: '20 tasks', target: 20, current: completed },
    { label: '50 tasks', target: 50, current: completed },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <Sidebar />
      <main className="ml-56 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Achievements</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{unlockedCount} of {badges.length} badges unlocked</p>
        </div>

        {loading ? <div className="text-center text-gray-400 py-20">Loading achievements...</div> : (
          <>
            <div className="rounded-2xl p-6 text-white mb-8"
              style={{ background: 'linear-gradient(135deg, var(--accent), #4F46E5)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/70 text-sm font-medium">Current Level</p>
                  <p className="text-4xl font-bold mt-1">Level {level}</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">🏆</div>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-white/70">{xpInLevel} XP</span>
                <span className="text-white/70">100 XP to Level {level + 1}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2.5">
                <div className="bg-white h-2.5 rounded-full transition-all duration-700" style={{ width: `${xpInLevel}%` }} />
              </div>
              <div className="flex gap-6 mt-4">
                <div><p className="text-white/70 text-xs">Total XP</p><p className="text-lg font-bold">{xp} XP</p></div>
                <div><p className="text-white/70 text-xs">Tasks Done</p><p className="text-lg font-bold">{completed}</p></div>
                <div><p className="text-white/70 text-xs">Badges</p><p className="text-lg font-bold">{unlockedCount}</p></div>
              </div>
            </div>

            <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Badges</h2>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {badges.map(badge => (
                <div key={badge.id}
                  className={`rounded-xl border p-4 flex flex-col items-center text-center transition
                    ${badge.unlocked
                      ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                      : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 opacity-50'}`}>
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{badge.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{badge.desc}</p>
                  {badge.unlocked ? (
                    <span className="mt-2 text-xs font-medium" style={{ color: badge.color }}>✓ Unlocked</span>
                  ) : badge.comingSoon ? (
                    <span className="mt-2 text-xs text-gray-400">Coming soon</span>
                  ) : (
                    <span className="mt-2 text-xs text-gray-400">Locked 🔒</span>
                  )}
                </div>
              ))}
            </div>

            <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Milestones</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex flex-col gap-4">
                {milestones.map(m => {
                  const pct = Math.min((m.current / m.target) * 100, 100)
                  const done = m.current >= m.target
                  return (
                    <div key={m.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{m.label}</span>
                        <span className={`text-xs font-medium ${done ? 'text-green-500' : 'text-gray-400'}`}>
                          {done ? '✓ Complete' : `${m.current} / ${m.target}`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                        <div className="h-2 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: done ? '#10B981' : 'var(--accent)' }} />
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