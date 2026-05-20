import { useEffect, useState } from 'react'
import WorkoutCalendar from '../components/workoutCalendar.jsx'
import { API_BASE_URL } from '../config/api.js'

function getDateKey(date = new Date()) {
  return date.toLocaleDateString('en-CA')
}

function formatType(type) {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

function Dashboard({ typeOfWorkout, workoutsByDay, backendWorking }) {
  const [selectedDate, setSelectedDate] = useState(getDateKey())
  const [selectedLedger, setSelectedLedger] = useState([])
  const [deleteError, setDeleteError] = useState('')
  const totalCalories = selectedLedger.reduce(
    (total, entry) => total + (entry.calories ?? 0),
    0,
  )

  useEffect(() => {
    async function loadWorkoutsForDate() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/workouts?date=${selectedDate}`,
        )

        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`)
        }

        const data = await response.json()
        setSelectedLedger(data)
      } catch (error) {
        console.log('Failed to load workouts for date', error)
        setSelectedLedger([])
      }
    }

    loadWorkoutsForDate()
  }, [selectedDate])

  function handleDateChange(event) {
    setSelectedDate(event.target.value)
  }

  async function handleDeleteWorkout(workoutId) {
    const workoutToDelete = selectedLedger.find((entry) => entry.id === workoutId)

    setDeleteError('')
    setSelectedLedger((currentLedger) =>
      currentLedger.filter((item) => item.id !== workoutId),
    )

    try {
      const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`)
      }
    } catch (error) {
      console.log('Failed to delete workout', error)
      setDeleteError('Could not delete that workout. Check that the backend is running and has been restarted.')

      if (workoutToDelete) {
        setSelectedLedger((currentLedger) => [
          workoutToDelete,
          ...currentLedger,
        ])
      }
    }
  }

  return (
    <section className="page-section">
      <div className="row align-items-start g-4">
        <div className="col-lg-8">
          <h4>Backend is currently {backendWorking ? "working" : "not working"}</h4>
          <h1 className="display-5 fw-semibold mb-3">Dashboard</h1>
          <h2>Todays workout is {typeOfWorkout}</h2>
        </div>

        <div className="col-12">
          <WorkoutCalendar workoutsByDay={workoutsByDay} />
        </div>

        <div className="col-12">
          <section className="workout-ledger dashboard-history">
            <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
              <div>
                <h2 className="h3 mb-1">Workout History</h2>
                <p className="text-body-secondary mb-0">
                  Select a day to see the workouts completed that day.
                </p>
              </div>

              <label className="dashboard-date-picker">
                <span>Date</span>
                <input
                  className="form-control"
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                />
              </label>
            </div>

            <div className="ledger-summary mb-3">
              <span className="badge text-bg-light border">
                {selectedLedger.length} completed
              </span>
              <span className="badge text-bg-light border">
                {totalCalories} calories
              </span>
            </div>

            {selectedLedger.length === 0 ? (
              <div className="ledger-empty">
                No workouts found for this day.
              </div>
            ) : (
              <>
                {deleteError && (
                  <div className="alert alert-warning" role="alert">
                    {deleteError}
                  </div>
                )}

                <div className="ledger-list">
                  {selectedLedger.map((entry) => (
                    <article className="ledger-entry" key={entry.id}>
                      <div className="ledger-entry-content">
                        <div className="ledger-entry-details">
                          <div>
                            <span className={`badge workout-type workout-type-${entry.type}`}>
                              {formatType(entry.type)}
                            </span>
                            <h3 className="h5 mt-2 mb-1">{entry.name}</h3>
                            <p className="text-body-secondary mb-0">
                              Added at {entry.completedAt}
                            </p>
                          </div>

                          <div className="ledger-stats mt-3">
                            <span>{entry.sets ?? 3} sets</span>
                            <span>{entry.reps ?? '8-12'} reps</span>
                            <span>{entry.calories ?? 0} calories</span>
                          </div>
                        </div>

                        <div className="ledger-entry-actions">
                          <button
                            className="btn btn-outline-danger btn-sm"
                            type="button"
                            onClick={() => handleDeleteWorkout(entry.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </section>
  )
}

export default Dashboard
