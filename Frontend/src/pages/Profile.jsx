import React, { useState, useEffect } from 'react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import * as api from '../utils/api'
import { useAuth } from '../contexts/AuthContext'

const GENDERS = ['male','female','other']
const GOALS = [ {v:'weight_loss', l:'Weight loss'}, {v:'muscle_gain', l:'Muscle gain'}, {v:'maintain', l:'Maintain'} ]
const ACTIVITY = ['sedentary','light','moderate','active']
const DIETS = ['veg','non_veg','mixed']

export default function Profile(){
  const { user, refresh } = useAuth() || {}
  const [form, setForm] = useState({ age:'', gender:'male', heightCm:'', weightKg:'', bodyFatPercent:'', goal:'maintain', activityLevel:'moderate', dietPreference:'mixed' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(()=>{
    if (user){
      setForm({
        age: user.age ?? '',
        gender: user.gender ?? 'male',
        heightCm: user.heightCm ?? '',
        weightKg: user.weightKg ?? '',
        bodyFatPercent: user.bodyFatPercent ?? '',
        goal: user.goal ?? 'maintain',
        activityLevel: user.activityLevel ?? 'moderate',
        dietPreference: user.dietPreference ?? 'mixed'
      })
    }
  }, [user])

  const validate = (values)=>{
    const e = {}
    if (!values.age || values.age < 10 || values.age > 120) e.age = 'Age must be 10–120'
    if (!GENDERS.includes(values.gender)) e.gender = 'Invalid gender'
    if (!values.heightCm || values.heightCm < 50 || values.heightCm > 300) e.heightCm = 'Height 50–300 cm'
    if (!values.weightKg || values.weightKg < 10 || values.weightKg > 500) e.weightKg = 'Weight 10–500 kg'
    if (!['weight_loss','muscle_gain','maintain'].includes(values.goal)) e.goal = 'Invalid goal'
    if (!ACTIVITY.includes(values.activityLevel)) e.activityLevel = 'Invalid activity level'
    if (!DIETS.includes(values.dietPreference)) e.dietPreference = 'Invalid diet'
    return e
  }

  const handleChange = (k,v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e) =>{
    e.preventDefault()
    const val = { ...form }
    const v = validate(val)
    setErrors(v)
    if (Object.keys(v).length > 0) return
    setSaving(true)
    try{
      await api.setupProfile(val)
      await refresh()
    }catch(err){
      console.error(err)
    }finally{ setSaving(false) }
  }

  return (
    <div className="page profile">
      <div className="page-top">
        <h1>Profile</h1>
        <p className="muted">Complete your profile to receive insights.</p>
      </div>

      <div className="card profile-card">
        {!user?.profileCompleted ? (
          <form className="profile-form" onSubmit={handleSubmit} noValidate>
            <Input label="Age" type="number" value={form.age} onChange={e=>handleChange('age', Number(e.target.value))} />
            <label className="field-label">Gender</label>
            <select className="field" value={form.gender} onChange={e=>handleChange('gender', e.target.value)}>
              {GENDERS.map(g=> <option key={g} value={g}>{g}</option>)}
            </select>

            <Input label="Height (cm)" type="number" value={form.heightCm} onChange={e=>handleChange('heightCm', Number(e.target.value))} />
            <Input label="Weight (kg)" type="number" value={form.weightKg} onChange={e=>handleChange('weightKg', Number(e.target.value))} />
            <Input label="Body fat % (optional)" type="number" value={form.bodyFatPercent} onChange={e=>handleChange('bodyFatPercent', Number(e.target.value))} />

            <label className="field-label">Goal</label>
            <select className="field" value={form.goal} onChange={e=>handleChange('goal', e.target.value)}>
              {GOALS.map(g=> <option key={g.v} value={g.v}>{g.l}</option>)}
            </select>

            <label className="field-label">Activity level</label>
            <select className="field" value={form.activityLevel} onChange={e=>handleChange('activityLevel', e.target.value)}>
              {ACTIVITY.map(a=> <option key={a} value={a}>{a}</option>)}
            </select>

            <label className="field-label">Diet preference</label>
            <select className="field" value={form.dietPreference} onChange={e=>handleChange('dietPreference', e.target.value)}>
              {DIETS.map(d=> <option key={d} value={d}>{d}</option>)}
            </select>

            <div style={{marginTop:12}}>
              <Button type="submit" variant="primary" disabled={saving}>Save profile</Button>
            </div>
          </form>
        ) : (
          <div className="card-body">
            <div><strong>Name:</strong> {user.name}</div>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Goal:</strong> {user.goal}</div>
            <div style={{marginTop:8}}><Button onClick={()=>{ /* optional: allow editing */ }} variant="ghost">Edit</Button></div>
          </div>
        )}
      </div>
    </div>
  )
}
