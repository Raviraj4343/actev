import React, { useState } from 'react'
import Input from './ui/Input'
import Button from './ui/Button'
import FoodSearch from './FoodSearch'

export default function DailyLogEditor({ date, log, loading, onSave }){
  const [water, setWater] = useState(log?.waterIntake || '')
  const [sleep, setSleep] = useState(log?.sleepHours || '')
  const [steps, setSteps] = useState(log?.steps || '')
  const [meals, setMeals] = useState(log?.meals || [])

  const handleAddFood = (food) => {
    const group = { type: 'breakfast', items: [{ foodId: food._id, quantity: 1 }] }
    setMeals(prev => [...prev, group])
  }

  const save = async ()=>{
    const payload = { date: date.toLocaleDateString('en-CA'), waterIntake: water, sleepHours: sleep, steps, meals }
    if (onSave) await onSave(payload)
  }

  if (loading) return <div className="muted">Loading…</div>

  return (
    <div className="daily-editor">
      <div className="vitals">
        <Input label="Water" value={water} onChange={e=>setWater(e.target.value)} placeholder="e.g. 1-2L" />
        <Input label="Sleep (hours)" value={sleep} onChange={e=>setSleep(e.target.value)} type="number" />
        <Input label="Steps" value={steps} onChange={e=>setSteps(e.target.value)} type="number" />
      </div>

      <div className="meals">
        <h4>Meals</h4>
        <FoodSearch onSelect={handleAddFood} />
        {meals.map((m, idx)=> (
          <div key={idx} className="meal-group">
            <div className="muted">{m.type}</div>
            {m.items.map((it, i)=> (
              <div key={i} className="meal-item">{it.foodId} — qty {it.quantity}</div>
            ))}
          </div>
        ))}
      </div>

      <div className="actions" style={{marginTop:12}}>
        <Button variant="primary" onClick={save}>Save</Button>
      </div>
    </div>
  )
}
