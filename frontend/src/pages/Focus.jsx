import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import API from '../api/axios'

function Focus() {
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [mode, setMode] = useState('pomodoro') // pomodoro | short | long
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [session, setSession] = useState(1)
  const [completedSessions, setCompletedSessions] = useState(0)
  const intervalRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const modes = {
    pomodoro: { label: 'Focus', time: 25 * 60, color: 'violet' },
    short: { label: 'Short Break', time: 5 * 60, color: 'green' },
    long: { label: 'Long Break', time: 15 * 60, color: 'blue' },
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            setIsRunning(false)
            handleSessionEnd()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  const fetchTasks = async () => {
    try {
      const res = await API.get('/tasks')
      setTasks(res.data.filter(t => !t.completed))
    } catch (err) {
      if (err.response?.status === 401) navigate('/login')
    }
  }

  const handleSessionEnd = () => {
    setCompletedSessions(prev => prev + 1)
    // Auto suggest break after pomodoro
    if (mode === 'pomodoro') {
      const next = session % 4 === 0 ? 'long' : 'short'
      switchMode(next)
    } else {
      switchMode('pomodoro')
      setSession(prev => prev + 1)
    }
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setTimeLeft(modes[newMode].time)
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(modes[mode].time)
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const progress = ((modes[mode].time - timeLeft) / modes[mode].time) * 100

  const navItems = [
    { label: 'Dashboard', icon: '⊞', path: '/dashboard' },
    { label: 'Tasks', icon: '☑', path: '/tasks' },
    { label: 'Calendar', icon: '📅', path: '/calendar' },
    { label: 'Focus Mode', icon: '⏱', path: '/focus' },
    { label: 'Stats', icon: '📊', path: '/stats' },
    { label: 'Achievements', icon: '🏆', path: '/achievements' },
  ]

  const motivationalQuotes = [
    "Focus on your goals. You've got this! 💪",
    "One task at a time. You're doing great! 🌟",
    "Stay focused, stay powerful. 🔥",
    "Small steps lead to big achievements. 🚀",
    "You are capable of amazing things. ✨",
  ]
  const quote = motivationalQuotes[Math.floor(Date.now() / 1000 / 60) % motivationalQuotes.length]

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
          <h1 className="text-2xl font-bold text-gray-800">Focus Mode</h1>
          <p className="text-gray-500 text-sm mt-1">Stay focused with the Pomodoro technique</p>
        </div>

        <div className="grid grid-cols-2 gap-8">

          {/* Timer */}
          <div className="bg-slate-900 rounded-2xl p-8 flex flex-col items-center text-white">

            {/* Mode tabs */}
            <div className="flex gap-2 mb-8">
              {Object.entries(modes).map(([key, val]) => (
                <button key={key} onClick={() => switchMode(key)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition
                    ${mode === key ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'}`}>
                  {val.label}
                </button>
              ))}
            </div>

            {/* Circular progress */}
            <div className="relative w-48 h-48 mb-8">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none"
                  stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                <circle cx="50" cy="50" r="45" fill="none"
                  stroke="white" strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold tracking-tight">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-slate-400 text-sm mt-1">
                  Pomodoro {session} of 4
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6 mb-8">
              <button onClick={resetTimer}
                className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition text-lg">
                ↺
              </button>
              <button onClick={() => setIsRunning(!isRunning)}
                className="w-16 h-16 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center transition text-slate-900 text-2xl shadow-lg">
                {isRunning ? '⏸' : '▶'}
              </button>
              <button onClick={() => handleSessionEnd()}
                className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition text-lg">
                ⏭
              </button>
            </div>

            {/* Quote */}
            <p className="text-slate-400 text-sm text-center italic">{quote}</p>

            {/* Sessions completed */}
            <div className="flex gap-2 mt-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i}
                  className={`w-3 h-3 rounded-full ${completedSessions >= i ? 'bg-white' : 'bg-slate-700'}`} />
              ))}
            </div>
            <p className="text-slate-500 text-xs mt-2">{completedSessions} sessions completed today</p>
          </div>

          {/* Task selector */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Focus on a Task</h2>
              {tasks.length === 0 ? (
                <p className="text-gray-400 text-sm">No pending tasks. Add tasks from the Tasks page!</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {tasks.slice(0, 6).map(task => (
                    <button key={task._id}
                      onClick={() => setSelectedTask(task._id === selectedTask?._id ? null : task)}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-left transition
                        ${selectedTask?._id === task._id
                          ? 'border-violet-300 bg-violet-50'
                          : 'border-gray-100 hover:bg-gray-50'}`}>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0
                        ${task.priority === 'high' ? 'bg-red-400' :
                          task.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
                        {task.dueDate && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {selectedTask?._id === task._id && (
                        <span className="text-violet-500 text-xs font-medium">Selected</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currently focusing on */}
            {selectedTask && (
              <div className="bg-violet-600 rounded-xl p-5 text-white">
                <p className="text-violet-200 text-xs font-medium mb-1">Currently focusing on</p>
                <p className="text-lg font-bold">{selectedTask.title}</p>
                {selectedTask.description && (
                  <p className="text-violet-200 text-sm mt-1">{selectedTask.description}</p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs bg-violet-500 px-2 py-1 rounded-lg capitalize">
                    {selectedTask.priority} priority
                  </span>
                  <span className="text-xs bg-violet-500 px-2 py-1 rounded-lg">
                    {selectedTask.category}
                  </span>
                </div>
              </div>
            )}

            {/* How it works */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-3">How it works</h2>
              <div className="flex flex-col gap-2">
                {[
                  { step: '1', text: 'Pick a task to focus on' },
                  { step: '2', text: 'Work for 25 minutes (one Pomodoro)' },
                  { step: '3', text: 'Take a 5 minute short break' },
                  { step: '4', text: 'After 4 Pomodoros, take a 15 min break' },
                ].map(item => (
                  <div key={item.step} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-violet-600">{item.step}</span>
                    </div>
                    <p className="text-sm text-gray-600">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Focus