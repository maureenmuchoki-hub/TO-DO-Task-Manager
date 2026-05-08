import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
import Sidebar from '../components/Sidebar'

function Focus() {
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [mode, setMode] = useState('pomodoro')
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [session, setSession] = useState(1)
  const [completedSessions, setCompletedSessions] = useState(0)
  const intervalRef = useRef(null)
  const navigate = useNavigate()

  const modes = {
    pomodoro: { label: 'Focus', time: 25 * 60 },
    short: { label: 'Short Break', time: 5 * 60 },
    long: { label: 'Long Break', time: 15 * 60 },
  }

  useEffect(() => { fetchTasks() }, [])

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
    if (mode === 'pomodoro') {
      switchMode(session % 4 === 0 ? 'long' : 'short')
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

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const progress = ((modes[mode].time - timeLeft) / modes[mode].time) * 100

  const quotes = [
    "Focus on your goals. You've got this! 💪",
    "One task at a time. You're doing great! 🌟",
    "Stay focused, stay powerful. 🔥",
    "Small steps lead to big achievements. 🚀",
    "You are capable of amazing things. ✨",
  ]
  const quote = quotes[Math.floor(Date.now() / 1000 / 60) % quotes.length]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <Sidebar />
      <main className="ml-56 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Focus Mode</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Stay focused with the Pomodoro technique</p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="bg-slate-900 rounded-2xl p-8 flex flex-col items-center text-white">
            <div className="flex gap-2 mb-8">
              {Object.entries(modes).map(([key, val]) => (
                <button key={key} onClick={() => switchMode(key)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition
                    ${mode === key ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'}`}>
                  {val.label}
                </button>
              ))}
            </div>
            <div className="relative w-48 h-48 mb-8">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold tracking-tight">{formatTime(timeLeft)}</span>
                <span className="text-slate-400 text-sm mt-1">Pomodoro {session} of 4</span>
              </div>
            </div>
            <div className="flex items-center gap-6 mb-8">
              <button onClick={() => { setIsRunning(false); setTimeLeft(modes[mode].time) }}
                className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition text-lg">↺</button>
              <button onClick={() => setIsRunning(!isRunning)}
                className="w-16 h-16 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center transition text-slate-900 text-2xl shadow-lg">
                {isRunning ? '⏸' : '▶'}
              </button>
              <button onClick={handleSessionEnd}
                className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition text-lg">⏭</button>
            </div>
            <p className="text-slate-400 text-sm text-center italic">{quote}</p>
            <div className="flex gap-2 mt-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`w-3 h-3 rounded-full ${completedSessions >= i ? 'bg-white' : 'bg-slate-700'}`} />
              ))}
            </div>
            <p className="text-slate-500 text-xs mt-2">{completedSessions} sessions completed today</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Focus on a Task</h2>
              {tasks.length === 0 ? (
                <p className="text-gray-400 text-sm">No pending tasks. Add tasks from the Tasks page!</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {tasks.slice(0, 6).map(task => (
                    <button key={task._id}
                      onClick={() => setSelectedTask(task._id === selectedTask?._id ? null : task)}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-left transition
                        ${selectedTask?._id === task._id
                          ? 'border-violet-300 dark:border-violet-700'
                          : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                      style={selectedTask?._id === task._id ? { background: 'var(--accent-light)' } : {}}>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0
                        ${task.priority === 'high' ? 'bg-red-400' : task.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{task.title}</p>
                        {task.dueDate && <p className="text-xs text-gray-400 mt-0.5">Due {new Date(task.dueDate).toLocaleDateString()}</p>}
                      </div>
                      {selectedTask?._id === task._id && (
                        <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>Selected</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedTask && (
              <div className="rounded-xl p-5 text-white" style={{ background: 'var(--accent)' }}>
                <p className="text-white/70 text-xs font-medium mb-1">Currently focusing on</p>
                <p className="text-lg font-bold">{selectedTask.title}</p>
                {selectedTask.description && <p className="text-white/70 text-sm mt-1">{selectedTask.description}</p>}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-lg capitalize">{selectedTask.priority} priority</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">{selectedTask.category}</span>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-3">How it works</h2>
              <div className="flex flex-col gap-2">
                {[
                  { step: '1', text: 'Pick a task to focus on' },
                  { step: '2', text: 'Work for 25 minutes (one Pomodoro)' },
                  { step: '3', text: 'Take a 5 minute short break' },
                  { step: '4', text: 'After 4 Pomodoros, take a 15 min break' },
                ].map(item => (
                  <div key={item.step} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--accent-light)' }}>
                      <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{item.step}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{item.text}</p>
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