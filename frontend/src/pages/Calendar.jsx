import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'

function CalendarPage() {
  const [tasks, setTasks] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const navigate = useNavigate()

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await API.get('/tasks')
      setTasks(res.data)
    } catch (err) {
      if (err.response?.status === 401) navigate('/login')
    }
  }

  const taskDates = tasks
    .filter(t => t.dueDate)
    .map(t => new Date(t.dueDate).toDateString())

  const tasksForDate = tasks.filter(task => {
    if (!task.dueDate) return false
    return new Date(task.dueDate).toDateString() === selectedDate.toDateString()
  })

  const priorityColor = (p) => {
    if (p === 'high') return 'text-red-500 bg-red-50'
    if (p === 'medium') return 'text-yellow-500 bg-yellow-50'
    return 'text-green-500 bg-green-50'
  }

  // Calendar grid logic
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1))

  const isSelected = (day) => {
    if (!day) return false
    return new Date(year, month, day).toDateString() === selectedDate.toDateString()
  }

  const isToday = (day) => {
    if (!day) return false
    return new Date(year, month, day).toDateString() === new Date().toDateString()
  }

  const hasTask = (day) => {
    if (!day) return false
    return taskDates.includes(new Date(year, month, day).toDateString())
  }

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
          {[
            { label: 'Dashboard', icon: '⊞', path: '/dashboard' },
            { label: 'Tasks', icon: '☑', path: '/dashboard' },
            { label: 'Calendar', icon: '📅', path: '/calendar' },
            { label: 'Focus Mode', icon: '⏱', path: '/focus' },
            { label: 'Stats', icon: '📊', path: '/stats' },
            { label: 'Achievements', icon: '🏆', path: '/achievements' },
          ].map(item => (
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
          <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
          <p className="text-gray-500 text-sm mt-1">View your tasks by date</p>
        </div>

        <div className="grid grid-cols-2 gap-8">

          {/* Calendar Grid */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-violet-50 text-gray-600">
                ‹
              </button>
              <h2 className="text-sm font-semibold text-gray-800">{monthName}</h2>
              <button onClick={nextMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-violet-50 text-gray-600">
                ›
              </button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => (
                <button key={i}
                  onClick={() => day && setSelectedDate(new Date(year, month, day))}
                  className={`relative h-9 w-full rounded-lg text-sm flex flex-col items-center justify-center transition
                    ${!day ? 'invisible' : ''}
                    ${isSelected(day) ? 'bg-violet-600 text-white' : ''}
                    ${isToday(day) && !isSelected(day) ? 'bg-violet-50 text-violet-600 font-bold' : ''}
                    ${!isSelected(day) && !isToday(day) ? 'hover:bg-gray-50 text-gray-700' : ''}
                  `}>
                  {day}
                  {hasTask(day) && (
                    <div className={`w-1 h-1 rounded-full absolute bottom-1 
                      ${isSelected(day) ? 'bg-white' : 'bg-violet-500'}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks for selected date */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-1">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric'
              })}
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              {tasksForDate.length} task{tasksForDate.length !== 1 ? 's' : ''}
            </p>

            {tasksForDate.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">📅</p>
                <p className="text-gray-400 text-sm">No tasks due on this day</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {tasksForDate.map(task => (
                  <div key={task._id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0
                      ${task.priority === 'high' ? 'bg-red-400' :
                        task.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'}`} />
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming tasks */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mt-8">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Upcoming Tasks</h2>
          {tasks
            .filter(t => t.dueDate && new Date(t.dueDate) >= new Date() && !t.completed)
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5)
            .map(task => (
              <div key={task._id}
                className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                <div className="w-10 h-10 bg-violet-50 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-violet-600">
                    {new Date(task.dueDate).getDate()}
                  </span>
                  <span className="text-xs text-violet-400">
                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{task.title}</p>
                  <p className="text-xs text-gray-400">{task.category}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-lg capitalize ${priorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            ))}
          {tasks.filter(t => t.dueDate && new Date(t.dueDate) >= new Date() && !t.completed).length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">No upcoming tasks with due dates</p>
          )}
        </div>
      </main>
    </div>
  )
}

export default CalendarPage