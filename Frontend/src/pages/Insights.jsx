import React, { useEffect, useState } from 'react'
import Card from '../components/ui/Card'
import * as api from '../utils/api'

export default function Insights(){
  const [insight, setInsight] = useState(null)
  useEffect(()=>{ api.getTodayInsight().then(r=>setInsight(r?.data || null)).catch(()=>{}) }, [])

  return (
    <div className="page insights">
      <div className="page-top">
        <h1>Insights</h1>
        <p className="muted">Personalized health insights and recommendations.</p>
      </div>

      <Card>
        {insight ? (
          <div>
            <h3>Today's summary</h3>
            <div>Total Calories: {insight.totalCalories ?? 0}</div>
            <div>Total Protein: {insight.totalProtein ?? 0}</div>
          </div>
        ) : (
          <p className="muted">No insights available yet.</p>
        )}
      </Card>
    </div>
  )
}
