const daysOfWeek = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

const workoutIcons = {
  push: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14" />
      <path d="m6 11 6-6 6 6" />
      <path d="M5 19h14" />
    </svg>
  ),
  pull: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 19V5" />
      <path d="m6 13 6 6 6-6" />
      <path d="M5 5h14" />
    </svg>
  ),
  legs: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 4c1.8 1.2 2.8 2.9 3 5.2" />
      <path d="M11 9.2h4.2c1.9 0 3.3 1.5 3.3 3.3s-1.4 3.3-3.3 3.3h-3.6" />
      <path d="M11.6 15.8 8.8 20" />
      <path d="M8.8 20H5" />
      <path d="M14.8 15.8 17 20" />
      <path d="M17 20h3" />
      <path d="M7.2 8.2c1.8.5 3 .8 3.8 1" />
    </svg>
  ),
  rest: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 14.5A7 7 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
    </svg>
  ),
}

function formatDay(day) {
  return day.charAt(0).toUpperCase() + day.slice(1)
}

function formatWorkout(workout) {
  return workout.charAt(0).toUpperCase() + workout.slice(1)
}

function WorkoutCalendar({ workoutsByDay }) {
  const today = new Date()
    .toLocaleDateString('en-US', {
      weekday: 'long',
    })
    .toLowerCase()

  return (
    <section className="workout-calendar mt-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="h4 mb-0">Workout Calendar</h3>
      </div>

      <div className="row g-3">
        {daysOfWeek.map((day) => {
          const workout = workoutsByDay[day]
          const isToday = day === today

          return (
            <div className="col-sm-6 col-lg-3" key={day}>
              <article className={`calendar-day ${isToday ? 'is-today' : ''}`}>
                <div className="d-flex align-items-start justify-content-between gap-3">
                  <div>
                    <p className="calendar-day-name">{formatDay(day)}</p>
                    <p className="calendar-workout">{formatWorkout(workout)}</p>
                  </div>
                  <span className={`workout-icon workout-icon-${workout}`}>
                    {workoutIcons[workout]}
                  </span>
                </div>
              </article>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default WorkoutCalendar
