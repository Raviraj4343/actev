import React, { useEffect, useMemo, useState } from 'react'
import Card from '../components/ui/Card'
import FoodSearch from '../components/FoodSearch'
import * as api from '../utils/api'

export default function Foods(){
  const [selected, setSelected] = useState(null)
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('')
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    Promise.all([api.getFoodCategories(), api.getAllFoods()])
      .then(([categoriesResponse, foodsResponse]) => {
        if (!mounted) return
        setCategories(categoriesResponse?.data || [])
        setFoods(foodsResponse?.data || [])
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const filteredFoods = useMemo(() => {
    if (!activeCategory) return foods
    return foods.filter((food) => food.category === activeCategory)
  }, [foods, activeCategory])

  return (
    <div className="page feature-page feature-foods">
      <section className="feature-hero card">
        <div className="feature-hero-copy">
          <span className="feature-eyebrow">Foods</span>
          <h1>Search and browse nutrition data</h1>
          <p className="muted">
            Explore active foods from the backend catalog, narrow by category, and inspect calories and protein quickly.
          </p>
        </div>
        <div className="feature-hero-aside">
          <span className="feature-date-chip">{loading ? 'Loading catalog' : `${foods.length} foods available`}</span>
          <div className="feature-orbit feature-orbit-blue">
            <strong>{loading ? '—' : categories.length}</strong>
            <span>categories</span>
          </div>
        </div>
      </section>

      <section className="feature-layout">
        <Card className="feature-main-panel">
          <div className="feature-panel-head">
            <div>
              <h3>Search foods</h3>
              <p className="muted">Powered by `searchFoods` with the same nutrition fields used in daily logs.</p>
            </div>
          </div>
          <FoodSearch onSelect={(food) => setSelected(food)} />

          {selected ? (
            <div className="food-detail-panel">
              <h3>{selected.name}</h3>
              <div className="food-detail-grid">
                <div className="feature-list-row">
                  <div><strong>Calories</strong><span>Per {selected.unit}</span></div>
                  <div className="feature-list-metric">{selected.caloriesPerUnit} kcal</div>
                </div>
                <div className="feature-list-row">
                  <div><strong>Protein</strong><span>Per {selected.unit}</span></div>
                  <div className="feature-list-metric">{selected.proteinPerUnit} g</div>
                </div>
                <div className="feature-list-row">
                  <div><strong>Category</strong><span>Catalog group</span></div>
                  <div className="feature-list-metric">{selected.category || 'General'}</div>
                </div>
                <div className="feature-list-row">
                  <div><strong>Diet</strong><span>Backend diet type</span></div>
                  <div className="feature-list-metric">{selected.dietType || 'Mixed'}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="feature-empty compact">
              <strong>Select a food</strong>
              <p className="muted">Search above to preview calories, protein, and category details.</p>
            </div>
          )}
        </Card>

        <Card className="feature-side-panel">
          <div className="feature-panel-head">
            <div>
              <h3>Browse by category</h3>
              <p className="muted">Built from `getFoodCategories` and `getAllFoods`.</p>
            </div>
          </div>

          <div className="feature-chip-row">
            <button type="button" className={`feature-chip ${activeCategory === '' ? 'active' : ''}`} onClick={() => setActiveCategory('')}>All</button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`feature-chip ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="feature-stack-list foods-browser">
            {filteredFoods.slice(0, 8).map((food) => (
              <button key={food._id} type="button" className="feature-browser-row" onClick={() => setSelected(food)}>
                <div>
                  <strong>{food.name}</strong>
                  <span>{food.category || 'General'}</span>
                </div>
                <div className="feature-list-metric">{food.caloriesPerUnit} kcal</div>
              </button>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}
