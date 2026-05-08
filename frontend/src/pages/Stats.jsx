import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import API from '../api/axios'
import Sidebar from '../components/Sidebar'
import { useTheme } from '../context/ThemeContext'

function Stats() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { darkMode } = useTheme()

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

  const total = tasks.length
  const completed = tasks.filter(t => t.completed).length
  const active = total - completed
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed).length

  const priorityData = [
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: '#EF4444' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: '#F59E0B' },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: '#10B981' },
  ]

  const categoryMap = {}
  tasks.forEach(t => { categoryMap[t.category] = (categoryMap[t.category] || 0) + 1 })
  const categoryData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value).slice(0, 6)

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return { date: d.toLocaleDateString('en-US', { weekday: 'short' }), fullDate: d.toDateString(), created: 0, completed: 0 }
  })
  tasks.forEach(task => {
    const created = new Date(task.createdAt).toDateString()
    const day = last7Days.find(d => d.fullDate === created)
    if (day) { day.created++; if (task.completed) day.completed++ }
  })

  const COLORS = ['#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899']
  const tooltipStyle = {
    contentStyle: {
      borderRadius: '8px',
      border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
      background: darkMode ? '#1f2937' : '#fff',
      color: darkMode ? '#f9fafb' : '#111827',
      fontSize: '12px'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <Sidebar />
      <main className="ml-56 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Stats</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Your productivity at a glance</p>
        </div>

        {loading ? <div className="text-center text-gray-400 py-20">Loading stats...</div> : (
          <>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Tasks', value: total, color: 'text-gray-800 dark:text-white' },
                { label: 'Completed', value: completed, color: 'text-green-500' },
                { label: 'In Progress', value: active, color: 'text-violet-500' },
                { label: 'Overdue', value: overdue, color: 'text-red-500' },
              ].map(card => (
                <div key={card.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
                  <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Overall Completion Rate</p>
                <p className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{completionRate}%</p>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                <div className="h-3 rounded-full transition-all duration-700"
                  style={{ width: `${completionRate}%`, background: 'var(--accent)' }} />
              </div>
              <p className="text-xs text-gray-400 mt-2">{completed} of {total} tasks completed</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Weekly Activity</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={last7Days} barSize={16}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#f0f0f0'} />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="created" name="Created" fill="#DDD6FE" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" name="Completed" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Tasks by Priority</h2>
                {total === 0 ? (
                  <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No tasks yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={priorityData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                        {priorityData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                      <Tooltip {...tooltipStyle} />
                      <Legend iconType="circle" iconSize={8}
                        formatter={(value) => <span style={{ fontSize: '12px', color: darkMode ? '#9CA3AF' : '#6B7280' }}>{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Tasks by Category</h2>
              {categoryData.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No tasks yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={categoryData} barSize={24} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#f0f0f0'} horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: darkMode ? '#9CA3AF' : '#6B7280' }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="value" name="Tasks" radius={[0, 4, 4, 0]}>
                      {categoryData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
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