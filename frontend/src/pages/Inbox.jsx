import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
import Sidebar from '../components/Sidebar'

function Inbox() {
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

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7)

  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < today && !t.completed)
  const dueToday = tasks.filter(t => {
    if (!t.dueDate || t.completed) return false
    const d = new Date(t.dueDate)
    return d >= today && d < tomorrow
  })
  const upcoming = tasks.filter(t => {
    if (!t.dueDate || t.completed) return false
    const d = new Date(t.dueDate)
    return d >= tomorrow && d <= nextWeek
  })
  const recentlyCompleted = tasks
    .filter(t => t.completed)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5)

  const totalNotifications = overdue.length + dueToday.length

  const priorityColor = (p) => {
    if (p === 'high') return 'text-red-500 bg-red-50'
    if (p === 'medium') return 'text-yellow-500 bg-yellow-50'
    return 'text-green-500 bg-green-50'
  }

  const Section = ({ title, icon, items, emptyMsg, badgeColor }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{icon}</span>
        <h2 className="text-base font-semibold text-gray-800 dark:text-white">{title}</h2>
        {items.length > 0 && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>{items.length}</span>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">{emptyMsg}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map(task => (
            <div key={task._id}
              onClick={() => navigate('/tasks')}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition cursor-pointer">
              <div className={`w-2 h-2 rounded-full flex-shrink-0
                ${task.priority === 'high' ? 'bg-red-400' : task.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{task.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{task.category}</p>
              </div>
              {task.dueDate && (
                <span className="text-xs text-gray-400 flex-shrink-0">
                  📅 {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md capitalize ${priorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <Sidebar badge={totalNotifications} />
      <main className="ml-56 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Inbox</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {totalNotifications > 0
              ? `You have ${totalNotifications} item${totalNotifications > 1 ? 's' : ''} that need attention`
              : 'You are all caught up!'}
          </p>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading inbox...</div>
        ) : (
          <>
            {totalNotifications === 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-6 mb-6 text-center">
                <p className="text-3xl mb-2">🎉</p>
                <p className="text-green-700 dark:text-green-400 font-medium">All caught up!</p>
                <p className="text-green-600 dark:text-green-500 text-sm mt-1">No overdue or due-today tasks.</p>
              </div>
            )}
            <Section title="Overdue" icon="🚨" items={overdue} emptyMsg="No overdue tasks!" badgeColor="bg-red-100 text-red-600" />
            <Section title="Due Today" icon="📌" items={dueToday} emptyMsg="Nothing due today!" badgeColor="bg-yellow-100 text-yellow-600" />
            <Section title="Upcoming This Week" icon="📅" items={upcoming} emptyMsg="No upcoming tasks this week" badgeColor="bg-blue-100 text-blue-600" />
            <Section title="Recently Completed" icon="✅" items={recentlyCompleted} emptyMsg="No completed tasks yet" badgeColor="bg-green-100 text-green-600" />
          </>
        )}
      </main>
    </div>
  )
}

export default Inbox