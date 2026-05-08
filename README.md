# FlowTask - Todo Task Manager

> A modern, fullstack productivity app built with the MERN stack. Manage your tasks, track your progress, and stay focused.

![FlowTask](https://img.shields.io/badge/FlowTask-Productivity%20App-7C3AED)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248)

---

## Features

### Core
- ✅ User authentication — register, login, JWT protected routes
- ✅ Task management — create, edit, delete, complete tasks
- ✅ Priority levels (Low, Medium, High) and categories
- ✅ Due dates with calendar view

### Pages
- 📊 **Dashboard** — overview of tasks, progress, and stats
- ☑ **Tasks** — full task list with search, filter, and sort
- 📅 **Calendar** — view tasks by date
- ⏱ **Focus Mode** — Pomodoro timer with task selection
- 📈 **Stats** — weekly activity, priority breakdown, category charts
- 🏆 **Achievements** — badges, XP system, and milestones
- 📬 **Inbox** — overdue, due today, and upcoming task alerts
- ⚙️ **Settings** — profile, appearance, notifications, data export

### Appearance
- 🌙 Dark mode / Light mode / System mode
- 🎨 Accent color picker (Violet, Blue, Rose, Emerald, Orange, Pink)
- 🔤 Font picker (Inter, Poppins, Mono, Serif)

### Data
- 📤 Export all tasks as JSON
- 🔒 Secure password change
- ❌ Delete account with confirmation

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS |
| Routing | React Router v7 |
| HTTP Client | Axios |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |

---

## Project Structure

```
todo-app/
├── backend/
│   ├── middleware/
│   │   └── auth.js          # JWT middleware
│   ├── models/
│   │   ├── User.js          # User schema
│   │   └── Task.js          # Task schema
│   ├── routes/
│   │   ├── auth.js          # Auth routes
│   │   └── tasks.js         # Task CRUD routes
│   ├── .env                 # Environment variables (not committed)
│   └── server.js            # Express server entry point
│
└── frontend/
├── src/
│   ├── api/
│   │   └── axios.js         # Axios instance with JWT interceptor
│   ├── components/
│   │   └── Sidebar.jsx      # Shared sidebar navigation
│   ├── context/
│   │   ├── AuthContext.jsx  # Auth state management
│   │   └── ThemeContext.jsx # Theme, accent, font management
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Tasks.jsx
│   │   ├── Calendar.jsx
│   │   ├── Focus.jsx
│   │   ├── Stats.jsx
│   │   ├── Achievements.jsx
│   │   ├── Inbox.jsx
│   │   └── Settings.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
└── vite.config.js
```

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB installed locally OR MongoDB Atlas account
- Git

### 1. Clone the repo

```bash
git clone https://github.com/Gracee001-M/TO-DO-Task-Manager.git
cd TO-DO-Task-Manager
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
MONGO_URI=mongodb://localhost:27017/todoapp
JWT_SECRET=your_secret_key_here
PORT=5000
```

> If using MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

Start MongoDB (Windows):

```bash
net start MongoDB
```

Run the backend:

```bash
npm run dev
```

You should see:

Server running on port 5000
MongoDB connected

### 3. Frontend setup

```bash
cd ../frontend
npm install
npm run dev
```

### 4. Open the app

Visit **http://localhost:5173** in your browser.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/me` | Update profile |
| PATCH | `/api/auth/change-password` | Change password |
| DELETE | `/api/auth/me` | Delete account |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/todoapp` |
| `JWT_SECRET` | Secret key for JWT tokens | `mysecretkey123` |
| `PORT` | Backend server port | `5000` |

> ⚠️ Never commit your `.env` file to GitHub.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your fork: `git push origin feat/your-feature`
5. Open a Pull Request to `Gracee001-M/TO-DO-Task-Manager`

---

## Contributors

- 
- 
- 

---

## License

MIT License — feel free to use and modify.
