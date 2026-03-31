import React from 'react'

export default function WeightChart({ data = [], loading = false }){
  if (loading) return <div className="muted">Loading chart…</div>
  if (!data || data.length === 0) return <div className="muted">No weight data yet.</div>

  // Minimal textual chart placeholder
  return (
    <div className="weight-chart">
      <ul>
        {data.map(d => (
          <li key={d._id || d.date}>{d.date}: {d.weightKg} kg</li>
        ))}
      </ul>
    </div>
  )
}
