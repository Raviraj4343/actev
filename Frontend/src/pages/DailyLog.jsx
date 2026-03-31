import React, { useEffect, useMemo, useState } from 'react'
import Card from '../components/ui/Card'
import DailyLogEditor from '../components/DailyLogEditor'
import * as api from '../utils/api'

const formatDate = (date) =>
  date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

export default function DailyLog(){
  const [log, setLog] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    api.getTodayLog()
      .then((response) => { if (mounted) setLog(response?.data || null) })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const handleSave = async (payload) => {
    const response = await api.createOrUpdateDailyLog(payload)
    setLog(response?.data || null)
    return response
  }

  const summary = useMemo(() => {
    const meals = log?.meals || []
    return [
      { label: 'Calories', value: log?.totalCalories ?? 0, suffix: 'kcal' },
      { label: 'Protein', value: log?.totalProtein ?? 0, suffix: 'g' },
      { label: 'Meals', value: meals.length, suffix: 'logged' },
      { label: 'Steps', value: log?.steps ?? 0, suffix: 'today' }
    ]
  }, [log])

  const mealTimeline = (log?.meals || []).map((meal) => ({
    type: meal.type,
    count: meal.items?.length || 0,
    calories: meal.items?.reduce((sum, item) => sum + (item.totalCalories || 0), 0) || 0
  }))

  return (
    <div className="page feature-page feature-daily-log">
      <section className="feature-hero card">
        <div className="feature-hero-copy">
          <span className="feature-eyebrow">Daily Log</span>
          <h1>Meals, vitals, and progress</h1>
          <p className="muted">
            Capture what you ate, how you slept, your hydration, and your movement in one calm daily workspace.
          </p>
        </div>
        <div className="feature-hero-aside">
          <span className="feature-date-chip">{formatDate(new Date())}</span>
          <div className="feature-orbit feature-orbit-soft">
            <strong>{loading ? '—' : `${log?.totalCalories ?? 0}`}</strong>
            <span>calories logged</span>
          </div>
        </div>
      </section>

      <section className="feature-summary-grid">
        {summary.map((item) => (
          <Card key={item.label} className="feature-stat-card">
            <span className="feature-stat-label">{item.label}</span>
            <strong className="feature-stat-value">{loading ? '—' : item.value}</strong>
            <span className="feature-stat-note">{item.suffix}</span>
          </Card>
        ))}
      </section>

      <section className="feature-layout feature-layout-wide">
        <Card className="feature-main-panel">
          <div className="feature-panel-head">
            <div>
              <h3>Today&apos;s entry</h3>
              <p className="muted">Update vitals and add meals using the same backend log record.</p>
            </div>
          </div>
          <DailyLogEditor date={new Date()} log={log} loading={loading} onSave={handleSave} />
        </Card>

        <Card className="feature-side-panel">
          <div className="feature-panel-head">
            <div>
              <h3>Meal snapshot</h3>
              <p className="muted">A quick overview of what has been captured so far today.</p>
            </div>
          </div>

          {mealTimeline.length > 0 ? (
            <div className="feature-stack-list">
              {mealTimeline.map((meal) => (
                <div key={meal.type} className="feature-list-row">
                  <div>
                    <strong>{String(meal.type).replace(/\b\w/g, (c) => c.toUpperCase())}</strong>
                    <span>{meal.count} item{meal.count === 1 ? '' : 's'}</span>
                  </div>
                  <div className="feature-list-metric">{meal.calories} kcal</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="feature-empty">
              <strong>No meals added yet</strong>
              <p className="muted">Use the editor to search for foods and build your breakfast, lunch, dinner, or snack log.</p>
            </div>
          )}
        </Card>
      </section>
    </div>
  )
}
