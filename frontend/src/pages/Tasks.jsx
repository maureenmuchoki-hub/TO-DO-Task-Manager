import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import API from '../api/axios'

function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddTask, setShowAddTask] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [search, setSearch] = useState('')
  const [newTask, setNewTask] = useState({
    title: '', description: '', priority: 'medium', category: 'General', dueDate: ''
  })

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

  const addTask = async (e) => {
    e.preventDefault()
    try {
      const res = await API.post('/tasks', newTask)
      setTasks([res.data, ...tasks])
      setNewTask({ title: '', description: '', priority: 'medium', category: 'General', dueDate: '' })
      setShowAddTask(false)
    } catch (err) { console.error(err) }
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    try {
      const res = await API.patch(`/tasks/${editTask._id}`, editTask)
      setTasks(tasks.map(t => t._id === editTask._id ? res.data : t))
      setEditTask(null)
    } catch (err) { console.error(err) }
  }

  const toggleComplete = async (task) => {
    try {
      const res = await API.patch(`/tasks/${task._id}`, { completed: !task.completed })
      setTasks(tasks.map(t => t._id === task._id ? res.data : t))
    } catch (err) { console.error(err) }
  }

  const deleteTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`)
      setTasks(tasks.filter(t => t._id !== id))
    } catch (err) { console.error(err) }
  }

  const priorityColor = (p) => {
    if (p === 'high') return 'text-red-500 bg-red-50 border-red-100'
    if (p === 'medium') return 'text-yellow-500 bg-yellow-50 border-yellow-100'
    return 'text-green-500 bg-green-50 border-green-100'
  }

  const navItems = [
    { label: 'Dashboard', icon: '⊞', path: '/dashboard' },
    { label: 'Tasks', icon: '☑', path: '/tasks' },
    { label: 'Calendar', icon: '📅', path: '/calendar' },
    { label: 'Focus Mode', icon: '⏱', path: '/focus' },
    { label: 'Stats', icon: '📊', path: '/stats' },
    { label: 'Achievements', icon: '🏆', path: '/achievements' },
  ]

  // Filter, search, sort
  let filtered = tasks.filter(t => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    if (filter === 'high') return t.priority === 'high'
    if (filter === 'medium') return t.priority === 'medium'
    if (filter === 'low') return t.priority === 'low'
    return true
  })

  if (search) {
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.toLowerCase().includes(search.toLowerCase())
    )
  }

  filtered = filtered.sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
    if (sortBy === 'due') return new Date(a.dueDate || '9999') - new Date(b.dueDate || '9999')
    if (sortBy === 'priority') {
      const order = { high: 0, medium: 1, low: 2 }
      return order[a.priority] - order[b.priority]
    }
    return 0
  })

  const completedCount = tasks.filter(t => t.completed).length

  const TaskModal = ({ task, setTask, onSubmit, title }) => (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-bold text-gray-800 mb-4">{title}</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="text" placeholder="Task title" required
            value={task.title}
            onChange={e => setTask({ ...task, title: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
          <textarea placeholder="Description (optional)" rows={3}
            value={task.description}
            onChange={e => setTask({ ...task, description: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <select value={task.priority}
              onChange={e => setTask({ ...task, priority: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <input type="text" placeholder="Category"
              value={task.category}
              onChange={e => setTask({ ...task, category: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
          </div>
          <input type="date"
            value={task.dueDate ? task.dueDate.split('T')[0] : ''}
            onChange={e => setTask({ ...task, dueDate: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
          <div className="flex gap-3 pt-2">
            <button type="button"
              onClick={() => { setShowAddTask(false); setEditTask(null) }}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-lg text-sm font-medium transition">
              {title === 'New Task' ? 'Add Task' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

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

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
            <p className="text-gray-500 text-sm mt-1">
              {completedCount} of {tasks.length} tasks completed
            </p>
          </div>
          <button onClick={() => setShowAddTask(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition flex items-center gap-2">
            + Add Task
          </button>
        </div>

        {/* Search + Sort + Filter */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
          <div className="flex gap-3 mb-3">
            <input type="text" placeholder="🔍  Search tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="due">Due date</option>
              <option value="priority">Priority</option>
            </select>
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'active', 'completed', 'high', 'medium', 'low'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize
                  ${filter === f ? 'bg-violet-600 text-white' : 'bg-gray-50 text-gray-500 hover:bg-violet-50'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400">Loading tasks...</div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400">
              {search ? `No tasks matching "${search}"` : 'No tasks here yet!'}
            </div>
          ) : (
            filtered.map(task => (
              <div key={task._id}
                className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-start gap-4 hover:shadow-sm transition">
                <input type="checkbox" checked={task.completed}
                  onChange={() => toggleComplete(task)}
                  className="w-4 h-4 accent-violet-600 cursor-pointer mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-gray-400 mt-1">{task.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md capitalize border ${priorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                      {task.category}
                    </span>
                    {task.dueDate && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        📅 {new Date(task.dueDate).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </span>
                    )}
                    {task.completed && (
                      <span className="text-xs text-green-500 font-medium">✓ Completed</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setEditTask({ ...task, dueDate: task.dueDate || '' })}
                    className="text-gray-300 hover:text-violet-500 transition text-sm px-2 py-1 rounded hover:bg-violet-50">
                    ✏️
                  </button>
                  <button onClick={() => deleteTask(task._id)}
                    className="text-gray-300 hover:text-red-400 transition text-lg leading-none px-2 py-1 rounded hover:bg-red-50">
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Add Task Modal */}
      {showAddTask && (
        <TaskModal
          task={newTask}
          setTask={setNewTask}
          onSubmit={addTask}
          title="New Task"
        />
      )}

      {/* Edit Task Modal */}
      {editTask && (
        <TaskModal
          task={editTask}
          setTask={setEditTask}
          onSubmit={saveEdit}
          title="Edit Task"
        />
      )}
    </div>
  )
}

export default Tasks