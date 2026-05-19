import { useEffect, useState } from 'react'
import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/dashboard.jsx'
import Diet from './pages/diet.jsx'
import Workouts from './pages/workouts.jsx'
import { API_BASE_URL } from './config/api.js'
import './App.css'

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/workouts', label: 'Workouts' },
  { path: '/diet', label: 'Diet' },
]
const dayToWorkout = {
  monday: "push",
  tuesday: "legs",
  wednesday: "pull",
  thursday: "rest",
  friday: "push",
  saturday: "legs",
  sunday: "pull"
}
function getTodaysWorkout(){
  const today = new Date();
  const day = today.toLocaleDateString("en-US", {
    weekday: "long"
  }).toLowerCase();
  return dayToWorkout[day];

}
function App() {
  const [isWorking, setIsWorking] = useState(false)

  useEffect(() => {
    async function backendWorking() {
      try {
        const response = await fetch(`${API_BASE_URL}/working`)

        if (!response.ok) {
          setIsWorking(false)
          console.log('is not working', response.status)
          return
        }

        const data = await response.json()

        setIsWorking(Boolean(data))
        console.log('is working', data)
      } catch (error) {
        setIsWorking(false)
        console.log('is not working', error)
      }
    }

    backendWorking()
  }, [])

  return (
    <div className="app-shell">
      <nav className="navbar navbar-expand bg-body-tertiary border-bottom">
        <div className="container">
          <NavLink className="navbar-brand fw-semibold" to="/dashboard">
            Fitness App
          </NavLink>

          <div className="navbar-nav flex-row gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-link rounded px-3 ${isActive ? 'active bg-primary text-white' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard typeOfWorkout={getTodaysWorkout()} workoutsByDay={dayToWorkout} backendWorking={isWorking}/>} />
          <Route path="/workouts" element={<Workouts typeOfWorkout={getTodaysWorkout()} />} />
          <Route path="/diet" element={<Diet />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
