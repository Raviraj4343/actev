import React, { useState } from 'react'
import Card from '../components/ui/Card'
import FoodSearch from '../components/FoodSearch'

export default function Foods(){
  const [selected, setSelected] = useState(null)

  return (
    <div className="page foods">
      <div className="page-top">
        <h1>Foods</h1>
        <p className="muted">Search foods and add to meals.</p>
      </div>

      <Card>
        <FoodSearch onSelect={f=>setSelected(f)} />
        {selected && (
          <div className="food-detail">
            <h3>{selected.name}</h3>
            <div>Calories: {selected.caloriesPerUnit} per {selected.unit}</div>
            <div>Protein: {selected.proteinPerUnit} g</div>
          </div>
        )}
      </Card>
    </div>
  )
}
