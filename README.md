# FlowTask - Todo Task Manager

A fullstack productivity app built with the MERN stack.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, React Router, Axios, Recharts
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs

## Prerequisites
- Node.js v18+
- MongoDB installed locally OR MongoDB Atlas account

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/maureenmuchoki-hub/TO-DO-Task-Manager.git
cd TO-DO-Task-Manager
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:# FlowTask - Todo Task Manager

A fullstack productivity app built with the MERN stack.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, React Router, Axios, Recharts
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs

## Prerequisites
- Node.js v18+
- MongoDB installed locally OR MongoDB Atlas account

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/maureenmuchoki-hub/TO-DO-Task-Manager.git
cd TO-DO-Task-Manager
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:

MONGO_URI=mongodb://localhost:27017/todoapp
JWT_SECRET=your_secret_key_here
PORT=5000

Start MongoDB service:
```bash
net start MongoDB
```

Run the backend:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Open the app
Visit `http://localhost:5173`

## Features
- ✅ User authentication (register, login, JWT)
- ✅ Task management (create, edit, delete, complete)
- ✅ Priority levels and categories
- ✅ Calendar view
- ✅ Focus Mode with Pomodoro timer
- ✅ Productivity stats and charts
- ✅ Achievements and XP system
- ✅ Inbox (overdue, due today, upcoming)
- ✅ Settings (profile, appearance, notifications, data export)
- ✅ Dark mode, accent colors, font picker

