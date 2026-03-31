import React, { useEffect, useState } from 'react'
import Card from '../components/ui/Card'
import DailyLogEditor from '../components/DailyLogEditor'
import * as api from '../utils/api'

export default function DailyLog(){
  const [log, setLog] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let mounted = true
    api.getTodayLog().then(r=>{ if(mounted) setLog(r?.data || null) }).catch(()=>{}).finally(()=>{ if(mounted) setLoading(false) })
    return ()=>{ mounted=false }
  }, [])

  const handleSave = async (payload)=>{
    const res = await api.createOrUpdateDailyLog(payload)
    setLog(res?.data || null)
    return res
  }

  return (
    <div className="page daily-log">
      <div className="page-top">
        <h1>Daily Log</h1>
        <p className="muted">Track meals, water, sleep and steps.</p>
      </div>

      <Card>
        <DailyLogEditor date={new Date()} log={log} loading={loading} onSave={handleSave} />
      </Card>
    </div>
  )
}
