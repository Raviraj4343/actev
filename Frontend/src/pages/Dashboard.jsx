import React from 'react'
import Card from '../components/ui/Card'

const stats = [
  { id: 'users', label: 'Active Users', value: '1,234', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )},
  { id: 'mrr', label: 'Monthly MRR', value: '$12,345', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 1v22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 5H7a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )},
  { id: 'score', label: 'Health Score', value: '85%', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 8v4l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )}
]

const activity = [
  { id: 1, text: 'New user signed up: alice@example.com', time: '2h' },
  { id: 2, text: 'Payment received: $99', time: '8h' },
  { id: 3, text: 'Daily data synced for user #412', time: '1d' },
]

const subscriptions = [
  { id: 'starter', name: 'Starter', seats: 3, price: '$29/mo' },
  { id: 'pro', name: 'Pro', seats: 12, price: '$199/mo' }
]

export default function Dashboard(){
  return (
    <div className="page dashboard">
      <div className="dashboard-top">
        <h1>Dashboard</h1>
        <p className="muted">Overview of your key metrics and recent activity</p>
      </div>

      <section className="stats-grid">
        {stats.map(s => (
          <Card key={s.id} className="stat-card">
            <div className="stat-row">
              <div className="stat-icon">{s.icon}</div>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="dashboard-grid">
        <Card title="Recent activity" className="activity-card">
          <ul className="activity-list">
            {activity.map(a => (
              <li key={a.id} className="activity-item">
                <div className="activity-text">{a.text}</div>
                <div className="activity-time muted">{a.time}</div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Subscriptions" className="subs-card">
          <div className="subs-list">
            {subscriptions.map(s => (
              <div key={s.id} className="sub-row">
                <div>
                  <div style={{fontWeight:700}}>{s.name}</div>
                  <div className="muted">Seats: {s.seats}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontWeight:700}}>{s.price}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}
