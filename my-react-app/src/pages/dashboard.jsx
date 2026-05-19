import WorkoutCalendar from '../components/workoutCalendar.jsx'

function Dashboard({ toBeShown, stravaCall, typeOfWorkout, workoutsByDay, backendWorking }) {
    console.log(backendWorking);
    let workingVar;
  return (
    <section className="page-section">
      <div className="row align-items-start g-4">
        <div className="col-lg-8">
          <h4>Backend is currently {workingVar = backendWorking ? "working" : "not working"}</h4>
          <h1 className="display-5 fw-semibold mb-3">Dashboard</h1>
          <h2>Todays workout is {typeOfWorkout}</h2>
        </div>

        <div className="col-12">
          <WorkoutCalendar workoutsByDay={workoutsByDay} />
        </div>
      </div>
    </section>
  )
}

export default Dashboard
