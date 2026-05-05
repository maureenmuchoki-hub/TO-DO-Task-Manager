import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import API from '../api/axios'

function Stats() {
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

  // --- Data calculations ---
  const total = tasks.length
  const completed = tasks.filter(t => t.completed).length
  const active = total - completed
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  // Tasks by priority
  const priorityData = [
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: '#EF4444' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: '#F59E0B' },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: '#10B981' },
  ]

  // Tasks by category
  const categoryMap = {}
  tasks.forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + 1
  })
  const categoryData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  // Tasks created per day (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return {
      date: d.toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: d.toDateString(),
      created: 0,
      completed: 0,
    }
  })

  tasks.forEach(task => {
    const created = new Date(task.createdAt).toDateString()
    const day = last7Days.find(d => d.fullDate === created)
    if (day) {
      day.created++
      if (task.completed) day.completed++
    }
  })

  // Overdue tasks
  const overdue = tasks.filter(t =>
    t.dueDate && new Date(t.dueDate) < new Date() && !t.completed
  ).length

  const navItems = [
    { label: 'Dashboard', icon: '⊞', path: '/dashboard' },
    { label: 'Tasks', icon: '☑', path: '/tasks' },
    { label: 'Calendar', icon: '📅', path: '/calendar' },
    { label: 'Focus Mode', icon: '⏱', path: '/focus' },
    { label: 'Stats', icon: '📊', path: '/stats' },
    { label: 'Achievements', icon: '🏆', path: '/achievements' },
  ]

  const COLORS = ['#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899']

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
          <h1 className="text-2xl font-bold text-gray-800">Stats</h1>
          <p className="text-gray-500 text-sm mt-1">Your productivity at a glance</p>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading stats...</div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Tasks', value: total, color: 'text-gray-800', bg: 'bg-white' },
                { label: 'Completed', value: completed, color: 'text-green-500', bg: 'bg-white' },
                { label: 'In Progress', value: active, color: 'text-violet-500', bg: 'bg-white' },
                { label: 'Overdue', value: overdue, color: 'text-red-500', bg: 'bg-white' },
              ].map(card => (
                <div key={card.label} className={`${card.bg} rounded-xl border border-gray-100 p-5`}>
                  <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                  <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                </div>
              ))}
            </div>

            {/* Completion rate */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Overall Completion Rate</p>
                <p className="text-sm font-bold text-violet-600">{completionRate}%</p>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-violet-500 h-3 rounded-full transition-all duration-700"
                  style={{ width: `${completionRate}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {completed} of {total} tasks completed
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">

              {/* Weekly activity chart */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Weekly Activity</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={last7Days} barSize={16}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                    />
                    <Bar dataKey="created" name="Created" fill="#DDD6FE" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" name="Completed" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-3 justify-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-violet-200" />
                    <span className="text-xs text-gray-500">Created</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-violet-600" />
                    <span className="text-xs text-gray-500">Completed</span>
                  </div>
                </div>
              </div>

              {/* Priority breakdown pie chart */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Tasks by Priority</h2>
                {total === 0 ? (
                  <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                    No tasks yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value">
                        {priorityData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => <span style={{ fontSize: '12px', color: '#6B7280' }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Tasks by category */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Tasks by Category</h2>
              {categoryData.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No tasks yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={categoryData} barSize={24} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                    />
                    <Bar dataKey="value" name="Tasks" radius={[0, 4, 4, 0]}>
                      {categoryData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default Stats