import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/dashboard.jsx'
import Diet from './pages/diet.jsx'
import Workouts from './pages/workouts.jsx'
import './App.css'

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/workouts', label: 'Workouts' },
  { path: '/diet', label: 'Diet' },
]
async function testAPICall() {
  try{
    const x = await fetch("http://127.0.0.1:8000/");
    const data = await x.json();
    console.log(data);
    return data;
  }
  catch(e){
    console.log("failed to make the fetch request")
  }
}

async function testStravaAPICall() {
  try{
    const x = await fetch("http://127.0.0.1:8000/activities");
    const data = await x.json();
    console.log(data);
    return data;
  }
  catch(e){
    console.log("failed to make the fetch request")
  }
}
function App() {
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
          <Route path="/dashboard" element={<Dashboard toBeShown={testAPICall()} stravaCall={testStravaAPICall()}/>} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/diet" element={<Diet />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
