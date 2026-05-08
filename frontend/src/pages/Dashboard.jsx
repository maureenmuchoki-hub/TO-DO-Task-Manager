import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import API from '../api/axios'

function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddTask, setShowAddTask] = useState(false)
  const [filter, setFilter] = useState('all')
  const [newTask, setNewTask] = useState({
    title: '', description: '', priority: 'medium', category: 'General', dueDate: ''
  })

  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    fetchTasks()
  }, [])

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

  const addTask = async (e) => {
    e.preventDefault()
    try {
      const res = await API.post('/tasks', newTask)
      setTasks([res.data, ...tasks])
      setNewTask({ title: '', description: '', priority: 'medium', category: 'General', dueDate: '' })
      setShowAddTask(false)
    } catch (err) {
      console.error(err)
    }
  }

  const toggleComplete = async (task) => {
    try {
      const res = await API.patch(`/tasks/${task._id}`, { completed: !task.completed })
      setTasks(tasks.map(t => t._id === task._id ? res.data : t))
    } catch (err) {
      console.error(err)
    }
  }

  const deleteTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`)
      setTasks(tasks.filter(t => t._id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const filteredTasks = tasks.filter(t => {
    if (filter === 'all') return true
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return t.priority === filter
  })

  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const priorityColor = (p) => {
    if (p === 'high') return 'text-red-500 bg-red-50'
    if (p === 'medium') return 'text-yellow-500 bg-yellow-50'
    return 'text-green-500 bg-green-50'
  }

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const navItems = [
    { label: 'Dashboard', icon: '⊞', path: '/dashboard' },
    { label: 'Tasks', icon: '☑', path: '/dashboard' },
    { label: 'Calendar', icon: '📅', path: '/calendar' },
    { label: 'Focus Mode', icon: '⏱', path: '/focus' },
    { label: 'Stats', icon: '📊', path: '/stats' },
    { label: 'Achievements', icon: '🏆', path: '/achievements' },
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
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition text-left w-full
                ${location.pathname === item.path
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-600 hover:bg-violet-50 hover:text-violet-600'
                }`}>
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-bold text-sm">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-400">Level 1</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full text-sm text-gray-400 hover:text-red-500 transition text-left px-3 py-1">
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-56 flex-1 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {getGreeting()}, {user.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">Let's make today productive.</p>
          </div>
          <button onClick={() => setShowAddTask(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition flex items-center gap-2">
            + Add Task
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Total Tasks</p>
            <p className="text-3xl font-bold text-gray-800">{totalCount}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-500">{completedCount}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Today's Progress</p>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div className="bg-violet-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }} />
              </div>
              <span className="text-sm font-bold text-violet-600">{progress}%</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          {['all', 'active', 'completed', 'high', 'medium', 'low'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition capitalize
                ${filter === f ? 'bg-violet-600 text-white' : 'bg-white text-gray-500 hover:bg-violet-50'}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No tasks yet. Click "+ Add Task" to get started!
            </div>
          ) : (
            filteredTasks.map(task => (
              <div key={task._id}
                className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition">
                <input type="checkbox" checked={task.completed}
                  onChange={() => toggleComplete(task)}
                  className="w-4 h-4 accent-violet-600 cursor-pointer" />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{task.description}</p>
                  )}
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-lg capitalize ${priorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <span className="text-xs text-gray-400">{task.category}</span>
                {task.dueDate && (
                  <span className="text-xs text-gray-400">
                    📅 {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
                <button onClick={() => deleteTask(task._id)}
                  className="text-gray-300 hover:text-red-400 transition text-lg leading-none">
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4">New Task</h2>
            <form onSubmit={addTask} className="space-y-4">
              <input type="text" placeholder="Task title" required
                value={newTask.title}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
              <input type="text" placeholder="Description (optional)"
                value={newTask.description}
                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
              <div className="grid grid-cols-2 gap-3">
                <select value={newTask.priority}
                  onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <input type="text" placeholder="Category"
                  value={newTask.category}
                  onChange={e => setNewTask({ ...newTask, category: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
              </div>
              <input type="date"
                value={newTask.dueDate}
                onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddTask(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-lg text-sm font-medium transition">
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard