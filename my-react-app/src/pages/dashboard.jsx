import { useEffect, useState } from 'react'
import WorkoutCalendar from '../components/workoutCalendar.jsx'
import { API_BASE_URL } from '../config/api.js'

function getDateKey(date = new Date()) {
  return date.toLocaleDateString('en-CA')
}

function formatType(type) {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

function getRunCalories(run) {
  if (typeof run.calories === 'number' && run.calories > 0) {
    return Math.round(run.calories)
  }

  const bodyWeightKg = 170 / 2.20462
  const distanceKm = (run.distance ?? 0) / 1000

  return Math.round(bodyWeightKg * distanceKm)
}

function formatRunDistance(distanceMeters) {
  const miles = (distanceMeters ?? 0) / 1609.344

  return `${miles.toFixed(2)} mi`
}

function formatRunDuration(seconds) {
  const minutes = Math.round((seconds ?? 0) / 60)

  return `${minutes} min`
}

function formatRunCompletedAt(startDate) {
  if (!startDate) {
    return 'today'
  }

  return new Date(startDate).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatSelectedDate(dateKey) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function getRunsFromResponse(data) {
  if (Array.isArray(data.runs)) {
    return data.runs
  }

  if (Array.isArray(data.run)) {
    return data.run
  }

  if (data.run) {
    return [data.run]
  }

  return []
}

function Dashboard({ typeOfWorkout, workoutsByDay, backendWorking }) {
  const [selectedDate, setSelectedDate] = useState(getDateKey())
  const [selectedLedger, setSelectedLedger] = useState([])
  const [selectedFoodLedger, setSelectedFoodLedger] = useState([])
  const [selectedRuns, setSelectedRuns] = useState([])
  const [deleteError, setDeleteError] = useState('')
  const [foodDeleteError, setFoodDeleteError] = useState('')
  const selectedRunEntries = selectedRuns.map((run) => {
    const activityType = run.type?.toLowerCase() ?? 'run'

    return {
      id: `strava-${activityType}-${run.id}`,
      completedAt: formatRunCompletedAt(run.start_date),
      name: run.name ?? formatType(activityType),
      type: activityType,
      distance: formatRunDistance(run.distance),
      duration: formatRunDuration(run.moving_time),
      calories: getRunCalories(run),
      source: 'strava',
    }
  })
  const displayedLedger = [...selectedRunEntries, ...selectedLedger]
  const totalCalories = displayedLedger.reduce(
    (total, entry) => total + (entry.calories ?? 0),
    0,
  )
  const totalFoodCalories = selectedFoodLedger.reduce(
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

  useEffect(() => {
    async function loadRunsForDate() {
      try {
        const response = await fetch(`${API_BASE_URL}/runs?date=${selectedDate}`)

        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`)
        }

        const data = await response.json()
        setSelectedRuns(getRunsFromResponse(data))
      } catch (error) {
        console.log('There was an error getting the selected date run', error)
        setSelectedRuns([])
      }
    }

    loadRunsForDate()
  }, [selectedDate])

  useEffect(() => {
    async function loadFoodsForDate() {
      try {
        const response = await fetch(`${API_BASE_URL}/foods?date=${selectedDate}`)

        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`)
        }

        const data = await response.json()
        setSelectedFoodLedger(data)
      } catch (error) {
        console.log('Failed to load foods for date', error)
        setSelectedFoodLedger([])
      }
    }

    loadFoodsForDate()
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

  async function handleDeleteFood(foodId) {
    const foodToDelete = selectedFoodLedger.find((entry) => entry.id === foodId)

    setFoodDeleteError('')
    setSelectedFoodLedger((currentLedger) =>
      currentLedger.filter((item) => item.id !== foodId),
    )

    try {
      const response = await fetch(`${API_BASE_URL}/foods/${foodId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`)
      }
    } catch (error) {
      console.log('Failed to delete food', error)
      setFoodDeleteError('Could not delete that food. Check that the backend is running and has been restarted.')

      if (foodToDelete) {
        setSelectedFoodLedger((currentLedger) => [
          foodToDelete,
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
          <section className="dashboard-date-panel">
            <div>
              <h2 className="h3 mb-1">History Calendar</h2>
              <p className="text-body-secondary mb-0">
                Showing workout and diet history for {formatSelectedDate(selectedDate)}.
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
          </section>
        </div>

        <div className="col-12">
          <section className="workout-ledger dashboard-history">
            <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
              <div>
                <h2 className="h3 mb-1">Workout History</h2>
                <p className="text-body-secondary mb-0">
                  Workouts completed on the selected day.
                </p>
              </div>
            </div>

            <div className="ledger-summary mb-3">
              <span className="badge text-bg-light border">
                {displayedLedger.length} completed
              </span>
              <span className="badge text-bg-light border">
                {totalCalories} calories
              </span>
            </div>

            {displayedLedger.length === 0 ? (
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
                  {displayedLedger.map((entry) => (
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
                            {entry.source === 'strava' ? (
                              <>
                                <span>{entry.distance}</span>
                                <span>{entry.duration}</span>
                              </>
                            ) : (
                              <>
                                <span>{entry.sets ?? 3} sets</span>
                                <span>{entry.reps ?? '8-12'} reps</span>
                              </>
                            )}
                            <span>{entry.calories ?? 0} calories</span>
                          </div>
                        </div>

                        {entry.source !== 'strava' && (
                          <div className="ledger-entry-actions">
                            <button
                              className="btn btn-outline-danger btn-sm"
                              type="button"
                              onClick={() => handleDeleteWorkout(entry.id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>

        <div className="col-12">
          <section className="workout-ledger dashboard-history">
            <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
              <div>
                <h2 className="h3 mb-1">Diet History</h2>
                <p className="text-body-secondary mb-0">
                  Foods logged for the selected day.
                </p>
              </div>
            </div>

            <div className="ledger-summary mb-3">
              <span className="badge text-bg-light border">
                {selectedFoodLedger.length} foods
              </span>
              <span className="badge text-bg-light border">
                {totalFoodCalories} calories
              </span>
            </div>

            {selectedFoodLedger.length === 0 ? (
              <div className="ledger-empty">
                No foods found for this day.
              </div>
            ) : (
              <>
                {foodDeleteError && (
                  <div className="alert alert-warning" role="alert">
                    {foodDeleteError}
                  </div>
                )}

                <div className="ledger-list">
                  {selectedFoodLedger.map((entry) => (
                    <article className="ledger-entry" key={entry.id}>
                      <div className="ledger-entry-content">
                        <div className="ledger-entry-details">
                          <div>
                            <span className="badge text-bg-success">
                              Food
                            </span>
                            <h3 className="h5 mt-2 mb-1">{entry.name}</h3>
                            <p className="text-body-secondary mb-0">
                              Added at {entry.addedAt}
                            </p>
                          </div>

                          <div className="ledger-stats mt-3">
                            <span>{entry.amount} {entry.serving}</span>
                            <span>{entry.calories ?? 0} calories</span>
                          </div>
                        </div>

                        <div className="ledger-entry-actions">
                          <button
                            className="btn btn-outline-danger btn-sm"
                            type="button"
                            onClick={() => handleDeleteFood(entry.id)}
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
