import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../config/api.js'

const todayKey = new Date().toLocaleDateString('en-CA')

const foodOptions = [
  {
    name: 'Chicken Breast',
    serving: 'chicken breast',
    caloriesPerServing: 300,
  },
  {
    name: 'Steak Serloin',
    serving: 'oz',
    caloriesPerServing: 55,
  },
  {
    name: 'Brown Rice',
    serving: 'cup',
    caloriesPerServing: 675,
  },
  {
    name: 'Greek Yogurt',
    serving: 'cup',
    caloriesPerServing: 150,
  },
  {
    name: 'Banana',
    serving: 'banana',
    caloriesPerServing: 105,
  },
  {
    name: 'Spinich',
    serving: 'oz',
    caloriesPerServing: 6,
  },
  {
    name: 'Cherry Totatoes',
    serving: 'handfull',
    caloriesPerServing: '30',
  },
  {
    name: 'Protein Powder',
    serving: 'scoop',
    calories: '120',
  },
  {
    name: 'Cashews',
    serving: 'cup',
    calories: '775',
  }
]

function Diet() {
  const [selectedFoodName, setSelectedFoodName] = useState(foodOptions[0].name)
  const [amount, setAmount] = useState(1)
  const [foodLedger, setFoodLedger] = useState([])
  const selectedFood = foodOptions.find((food) => food.name === selectedFoodName)
  const calculatedCalories = Math.round(
    Number(amount || 0) * selectedFood.caloriesPerServing,
  )
  const totalCalories = foodLedger.reduce(
    (total, entry) => total + entry.calories,
    0,
  )

  useEffect(() => {
    async function loadTodaysFoods() {
      try {
        const response = await fetch(`${API_BASE_URL}/foods?date=${todayKey}`)

        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`)
        }

        const data = await response.json()
        setFoodLedger(data)
      } catch (error) {
        console.log('Failed to load food ledger', error)
      }
    }

    loadTodaysFoods()
  }, [])

  async function handleAddFood(event) {
    event.preventDefault()

    if (!amount || Number(amount) <= 0) {
      return
    }

    const foodEntry = {
      date: todayKey,
      name: selectedFood.name,
      amount: Number(amount),
      serving: selectedFood.serving,
      calories: calculatedCalories,
      addedAt: new Date().toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      }),
    }

    try {
      const response = await fetch(`${API_BASE_URL}/foods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(foodEntry),
      })

      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`)
      }

      const savedFood = await response.json()

      setFoodLedger((currentLedger) => [
        savedFood,
        ...currentLedger,
      ])
      setAmount(1)
    } catch (error) {
      console.log('Failed to add food', error)
    }
  }

  async function handleDeleteFood(foodId) {
    try {
      const response = await fetch(`${API_BASE_URL}/foods/${foodId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`)
      }

      setFoodLedger((currentLedger) =>
        currentLedger.filter((entry) => entry.id !== foodId),
      )
    } catch (error) {
      console.log('Failed to delete food', error)
    }
  }

  return (
    <section className="page-section">
      <div>
        <h1 className="display-5 fw-semibold mb-3">Diet</h1>
        <p className="lead text-body-secondary">
          Plan meals, monitor nutrition, and keep your food goals connected to
          your training.
        </p>
      </div>

      <div className="diet-grid mt-4">
        <form className="diet-panel" onSubmit={handleAddFood}>
          <div>
            <h2 className="h3 mb-1">Add Food</h2>
            <p className="text-body-secondary mb-0">
              Select a food and enter the amount eaten.
            </p>
          </div>

          <label className="form-label mt-4">
            Food
            <select
              className="form-select mt-2"
              value={selectedFoodName}
              onChange={(event) => setSelectedFoodName(event.target.value)}
            >
              {foodOptions.map((food) => (
                <option key={food.name} value={food.name}>
                  {food.name}
                </option>
              ))}
            </select>
          </label>

          <label className="form-label">
            Amount
            <div className="input-group mt-2">
              <input
                className="form-control"
                min="0"
                step="0.25"
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
              <span className="input-group-text">{selectedFood.serving}</span>
            </div>
          </label>

          <div className="diet-calorie-preview">
            <span>Estimated calories</span>
            <strong>{calculatedCalories}</strong>
          </div>

          <button className="btn btn-primary" type="submit">
            Add food
          </button>
        </form>

        <section className="workout-ledger">
          <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
            <div>
              <h2 className="h3 mb-1">Food Ledger</h2>
              <p className="text-body-secondary mb-0">
                Foods added for the current session.
              </p>
            </div>

            <div className="ledger-summary">
              <span className="badge text-bg-light border">
                {foodLedger.length} foods
              </span>
              <span className="badge text-bg-light border">
                {totalCalories} calories
              </span>
            </div>
          </div>

          {foodLedger.length === 0 ? (
            <div className="ledger-empty">
              No foods added yet.
            </div>
          ) : (
            <div className="ledger-list">
              {foodLedger.map((entry) => (
                <article className="ledger-entry" key={entry.id}>
                  <div className="ledger-entry-content">
                    <div className="ledger-entry-details">
                      <div>
                        <h3 className="h5 mb-1">{entry.name}</h3>
                        <p className="text-body-secondary mb-0">
                          Added at {entry.addedAt}
                        </p>
                      </div>

                      <div className="ledger-stats mt-3">
                        <span>{entry.amount} {entry.serving}</span>
                        <span>{entry.calories} calories</span>
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
          )}
        </section>
      </div>
    </section>
  )
}

export default Diet
