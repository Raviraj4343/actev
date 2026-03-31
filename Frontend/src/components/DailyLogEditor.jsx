import React, { useEffect, useMemo, useState } from 'react'
import Input from './ui/Input'
import Button from './ui/Button'
import FoodSearch from './FoodSearch'

const WATER_OPTIONS = ['', '<1L', '1-2L', '2-3L', '3L+']
const MEAL_OPTIONS = ['breakfast', 'lunch', 'dinner', 'snacks']

const formatLogDate = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const normalizeMeals = (incomingMeals = []) =>
  incomingMeals.map((meal) => ({
    type: meal.type,
    items: (meal.items || []).map((item) => ({
      foodId: item.foodId?._id || item.foodId,
      foodName: item.foodName || item.foodId?.name || 'Food item',
      quantity: item.quantity || 1,
    })),
  }))

export default function DailyLogEditor({ date, log, loading, onSave }){
  const [water, setWater] = useState(log?.waterIntake || '')
  const [sleep, setSleep] = useState(log?.sleepHours || '')
  const [steps, setSteps] = useState(log?.steps || '')
  const [mealType, setMealType] = useState('breakfast')
  const [meals, setMeals] = useState(normalizeMeals(log?.meals || []))
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setWater(log?.waterIntake || '')
    setSleep(log?.sleepHours || '')
    setSteps(log?.steps || '')
    setMeals(normalizeMeals(log?.meals || []))
    setStatus('')
  }, [log])

  const groupedMeals = useMemo(
    () => MEAL_OPTIONS.map((type) => ({
      type,
      items: meals.find((meal) => meal.type === type)?.items || [],
    })).filter((meal) => meal.items.length > 0),
    [meals]
  )

  const handleAddFood = (food) => {
    setMeals((prev) => {
      const existingIndex = prev.findIndex((meal) => meal.type === mealType)
      const nextItem = {
        foodId: food._id,
        foodName: food.name,
        quantity: 1,
      }

      if (existingIndex === -1) {
        return [...prev, { type: mealType, items: [nextItem] }]
      }

      return prev.map((meal, index) => (
        index === existingIndex
          ? { ...meal, items: [...meal.items, nextItem] }
          : meal
      ))
    })
    setStatus(`${food.name} added to ${mealType}.`)
  }

  const changeQuantity = (type, foodId, value) => {
    const quantity = Math.max(1, Number(value) || 1)
    setMeals((prev) => prev.map((meal) => (
      meal.type !== type
        ? meal
        : {
            ...meal,
            items: meal.items.map((item) => (
              item.foodId !== foodId ? item : { ...item, quantity }
            )),
          }
    )))
  }

  const removeItem = (type, foodId) => {
    setMeals((prev) => prev
      .map((meal) => (
        meal.type !== type
          ? meal
          : { ...meal, items: meal.items.filter((item) => item.foodId !== foodId) }
      ))
      .filter((meal) => meal.items.length > 0))
  }

  const save = async () => {
    if (!onSave) return

    const payload = {
      date: formatLogDate(date),
      waterIntake: water || undefined,
      sleepHours: sleep === '' ? undefined : Number(sleep),
      steps: steps === '' ? undefined : Number(steps),
      meals: meals.map((meal) => ({
        type: meal.type,
        items: meal.items.map((item) => ({
          foodId: item.foodId,
          quantity: Number(item.quantity) || 1,
        })),
      })),
    }

    try {
      setSaving(true)
      setStatus('')
      await onSave(payload)
      setStatus('Daily log saved.')
    } catch (err) {
      setStatus(err?.payload?.message || err?.message || 'Unable to save daily log.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="muted">Loading...</div>

  return (
    <div className="daily-editor">
      <div className="vitals">
        <div className="field">
          <select
            value={water}
            onChange={(e) => setWater(e.target.value)}
            aria-label="Water intake"
          >
            <option value="">Water</option>
            {WATER_OPTIONS.filter(Boolean).map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <div className="field-hint">Choose the closest daily range.</div>
        </div>
        <Input label="Sleep (hours)" value={sleep} onChange={e => setSleep(e.target.value)} type="number" min="0" max="24" />
        <Input label="Steps" value={steps} onChange={e => setSteps(e.target.value)} type="number" min="0" />
      </div>

      <div className="meals">
        <h4>Meals</h4>
        <div className="feature-chip-row">
          {MEAL_OPTIONS.map((type) => (
            <button
              key={type}
              type="button"
              className={`feature-chip ${mealType === type ? 'active' : ''}`}
              onClick={() => setMealType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <FoodSearch onSelect={handleAddFood} placeholder={`Search foods for ${mealType}...`} />

        {groupedMeals.length > 0 ? (
          groupedMeals.map((meal) => (
            <div key={meal.type} className="meal-group">
              <div className="muted meal-group-title">
                {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
              </div>
              {meal.items.map((item) => (
                <div key={`${meal.type}-${item.foodId}`} className="meal-item-row">
                  <div className="meal-item-copy">
                    <strong>{item.foodName}</strong>
                  </div>
                  <input
                    className="meal-qty-input"
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => changeQuantity(meal.type, item.foodId, e.target.value)}
                    aria-label={`Quantity for ${item.foodName}`}
                  />
                  <button
                    type="button"
                    className="meal-remove-btn"
                    onClick={() => removeItem(meal.type, item.foodId)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="feature-empty compact">
            <strong>No foods added yet</strong>
            <p className="muted">Pick a meal type, search for a food, and add it to today&apos;s log.</p>
          </div>
        )}
      </div>

      {status ? <div className="feature-inline-note">{status}</div> : null}

      <div className="actions" style={{ marginTop: 12 }}>
        <Button variant="primary" onClick={save} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
