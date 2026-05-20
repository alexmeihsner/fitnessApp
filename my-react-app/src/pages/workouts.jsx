import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../config/api.js'

const todayKey = new Date().toLocaleDateString('en-CA')

const workoutOptions = [
  {
    name: 'Bench Press',
    type: 'push',
    focus: 'Chest, shoulders, triceps',
    equipment: 'Barbell',
  },
  {
    name: 'Overhead Press',
    type: 'push',
    focus: 'Shoulders, triceps, core',
    equipment: 'Barbell or dumbbells',
  },
  {
    name: 'Incline Dumbbell Press',
    type: 'push',
    focus: 'Upper chest, shoulders',
    equipment: 'Dumbbells',
  },
  {
    name: 'Push-Ups',
    type: 'push',
    focus: 'Chest, triceps, core',
    equipment: 'Bodyweight',
  },
  {
    name: 'Dips',
    type: 'push',
    focus: 'Chest, triceps',
    equipment: 'Dip bars',
  },
  {
    name: 'Lateral Raises',
    type: 'push',
    focus: 'Side delts',
    equipment: 'Dumbbells',
  },
  {
    name: 'Pull-Ups',
    type: 'pull',
    focus: 'Lats, upper back, biceps',
    equipment: 'Pull-up bar',
  },
  {
    name: 'Bent-Over Row',
    type: 'pull',
    focus: 'Back, rear delts',
    equipment: 'Barbell',
  },
  {
    name: 'Lat Pulldown',
    type: 'pull',
    focus: 'Lats, biceps',
    equipment: 'Cable machine',
  },
  {
    name: 'Seated Cable Row',
    type: 'pull',
    focus: 'Mid-back, lats',
    equipment: 'Cable machine',
  },
  {
    name: 'Face Pulls',
    type: 'pull',
    focus: 'Rear delts, upper back',
    equipment: 'Cable machine',
  },
  {
    name: 'Dumbbell Curls',
    type: 'pull',
    focus: 'Biceps',
    equipment: 'Dumbbells',
  },
  {
    name: 'Back Squat',
    type: 'legs',
    focus: 'Quads, glutes, core',
    equipment: 'Barbell',
  },
  {
    name: 'Romanian Deadlift',
    type: 'legs',
    focus: 'Hamstrings, glutes',
    equipment: 'Barbell or dumbbells',
  },
  {
    name: 'Walking Lunges',
    type: 'legs',
    focus: 'Quads, glutes, balance',
    equipment: 'Bodyweight or dumbbells',
  },
  {
    name: 'Leg Press',
    type: 'legs',
    focus: 'Quads, glutes',
    equipment: 'Leg press machine',
  },
  {
    name: 'Bulgarian Split Squat',
    type: 'legs',
    focus: 'Quads, glutes',
    equipment: 'Bench, dumbbells',
  },
  {
    name: 'Calf Raises',
    type: 'legs',
    focus: 'Calves',
    equipment: 'Machine or dumbbells',
  },
  {
    name: 'Mobility Flow',
    type: 'rest',
    focus: 'Hips, shoulders, spine',
    equipment: 'Mat',
  },
  {
    name: 'Easy Walk',
    type: 'rest',
    focus: 'Recovery, circulation',
    equipment: 'None',
  },
  {
    name: 'Zone 2 Bike',
    type: 'rest',
    focus: 'Light cardio recovery',
    equipment: 'Bike',
  },
  {
    name: 'Yoga Recovery',
    type: 'rest',
    focus: 'Flexibility, breathing',
    equipment: 'Mat',
  },
  {
    name: 'Foam Rolling',
    type: 'rest',
    focus: 'Soft tissue recovery',
    equipment: 'Foam roller',
  },
  {
    name: 'Core Reset',
    type: 'rest',
    focus: 'Core stability, posture',
    equipment: 'Mat',
  },
]

function formatType(type) {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

function getYoutubeLink(workoutName) {
  const searchTerm = encodeURIComponent(`${workoutName} exercise tutorial`)

  return `https://www.youtube.com/results?search_query=${searchTerm}`
}

function getWorkoutPrescription(workout) {
  const prescriptions = {
    push: {
      sets: 3,
      reps: '8-12',
    },
    pull: {
      sets: 3,
      reps: '8-12',
    },
    legs: {
      sets: 3,
      reps: '10-12',
    },
    rest: {
      sets: 1,
      reps: '10 minutes',
    },
  }

  return prescriptions[workout.type]
}

function getEstimatedCalories(workout) {
  const bodyWeightKg = 170 / 2.20462
  const durationHours = 10 / 60
  const metByWorkout = {
    'Bench Press': 6,
    'Overhead Press': 6,
    'Incline Dumbbell Press': 6,
    'Push-Ups': 7,
    Dips: 7,
    'Lateral Raises': 3.5,
    'Pull-Ups': 8,
    'Bent-Over Row': 6,
    'Lat Pulldown': 5,
    'Seated Cable Row': 5,
    'Face Pulls': 3.5,
    'Dumbbell Curls': 3.5,
    'Back Squat': 6,
    'Romanian Deadlift': 6,
    'Walking Lunges': 6.5,
    'Leg Press': 5,
    'Bulgarian Split Squat': 6.5,
    'Calf Raises': 3.5,
    'Mobility Flow': 2.5,
    'Easy Walk': 3.5,
    'Zone 2 Bike': 6.8,
    'Yoga Recovery': 2.5,
    'Foam Rolling': 2.3,
    'Core Reset': 3.8,
  }
  const met = metByWorkout[workout.name] ?? 4

  return Math.round(met * bodyWeightKg * durationHours)
}

function Workouts({ typeOfWorkout }) {
  const [startIndex, setStartIndex] = useState(0)
  const [workoutLedger, setWorkoutLedger] = useState([])
  const totalCalories = workoutLedger.reduce(
    (total, entry) => total + (entry.calories ?? 0),
    0,
  )
  const availableWorkouts = workoutOptions.filter(
    (workout) => workout.type === typeOfWorkout,
  )
  const rotatedWorkouts = availableWorkouts.map((_, index) => {
    const workoutIndex = (startIndex + index) % availableWorkouts.length

    return availableWorkouts[workoutIndex]
  })

  useEffect(() => {
    async function loadTodaysWorkouts() {
      try {
        const response = await fetch(`${API_BASE_URL}/workouts?date=${todayKey}`)

        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`)
        }

        const data = await response.json()
        setWorkoutLedger(data)
      } catch (error) {
        console.log('Failed to load workout ledger', error)
      }
    }

    loadTodaysWorkouts()
  }, [])

  function handleArrowClick(direction) {
    if (availableWorkouts.length === 0) {
      return
    }

    setStartIndex((currentIndex) => {
      const nextIndex = currentIndex + direction

      return (
        (nextIndex + availableWorkouts.length) % availableWorkouts.length
      )
    })
  }

  async function handleSelectWorkout(workout) {
    const prescription = getWorkoutPrescription(workout)
    const selectedWorkout = {
      date: todayKey,
      completedAt: new Date().toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      }),
      name: workout.name,
      type: workout.type,
      sets: prescription.sets,
      reps: prescription.reps,
      calories: getEstimatedCalories(workout),
    }

    try {
      const response = await fetch(`${API_BASE_URL}/workouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedWorkout),
      })

      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`)
      }

      const savedWorkout = await response.json()

      setWorkoutLedger((currentLedger) => [
        savedWorkout,
        ...currentLedger,
      ])
    } catch (error) {
      console.log('Failed to save workout', error)
    }
  }

  async function handleDeleteWorkout(workoutId) {
    try {
      const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`)
      }

      setWorkoutLedger((currentLedger) =>
        currentLedger.filter((item) => item.id !== workoutId),
      )
    } catch (error) {
      console.log('Failed to delete workout', error)
    }
  }

  return (
    <section className="page-section">
      <div>
        <h1 className="display-5 fw-semibold mb-3">Workouts</h1>
        <p className="lead text-body-secondary">
          Available {formatType(typeOfWorkout)} workouts for today.
        </p>
      </div>

      <div className="workout-carousel mt-4" aria-label="Workout navigation">
        <button
          className="workout-arrow"
          type="button"
          onClick={() => handleArrowClick(-1)}
          aria-label="Previous workouts"
        >
          <span aria-hidden="true">&lsaquo;</span>
        </button>

        <div
          className="workout-scroll"
          aria-label="Workout options"
        >
          {rotatedWorkouts.map((workout) => (
            <article className="workout-card" key={workout.name}>
              <span className={`badge workout-type workout-type-${workout.type}`}>
                {formatType(workout.type)}
              </span>
              <h2 className="h5 mt-3 mb-2">{workout.name}</h2>
              <p className="workout-focus">{workout.focus}</p>
              <p className="workout-equipment mb-0">{workout.equipment}</p>
              <a
                className="workout-video-link"
                href={getYoutubeLink(workout.name)}
                target="_blank"
                rel="noreferrer"
              >
                Watch tutorial
              </a>
              <button
                className="btn btn-primary mt-3"
                type="button"
                onClick={() => handleSelectWorkout(workout)}
              >
                Select workout
              </button>
            </article>
          ))}
        </div>

        <button
          className="workout-arrow"
          type="button"
          onClick={() => handleArrowClick(1)}
          aria-label="Next workouts"
        >
          <span aria-hidden="true">&rsaquo;</span>
        </button>
      </div>

      <section className="workout-ledger mt-5">
        <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
          <div>
            <h2 className="h3 mb-1">Today&apos;s Workout Ledger</h2>
            <p className="text-body-secondary mb-0">
              Selected workouts, sets, reps, and time for today.
            </p>
          </div>
          <div className="ledger-summary">
            <span className="badge text-bg-light border">
              {workoutLedger.length} completed
            </span>
            <span className="badge text-bg-light border">
              {totalCalories} calories
            </span>
          </div>
        </div>

        {workoutLedger.length === 0 ? (
          <div className="ledger-empty">
            No workouts selected yet today.
          </div>
        ) : (
          <div className="ledger-list">
            {workoutLedger.map((entry) => (
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
        )}
      </section>
    </section>
  )
}

export default Workouts
