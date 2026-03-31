import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../utils/api'
import Button from '../components/ui/Button'

export default function VerifyEmail(){
  const [search] = useSearchParams()
  const [status, setStatus] = useState('pending')
  const [message, setMessage] = useState('Verifying...')
  const token = search.get('token')

  useEffect(()=>{
    if(!token){ setStatus('error'); setMessage('No verification token provided'); return }
    let mounted = true
    api.verifyEmail(token).then(res=>{
      if(!mounted) return
      setStatus('success')
      setMessage(res?.message || 'Email verified successfully. You can now sign in.')
    }).catch(err=>{
      console.error('Verify error', err)
      setStatus('error')
      setMessage(err.payload?.message || err.message || 'Verification failed')
    })
    return ()=>{ mounted = false }
  }, [token])

  return (
    <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{maxWidth:680,textAlign:'center'}}>
        <h2>{status === 'pending' ? 'Verifying...' : (status === 'success' ? 'Verified' : 'Verification failed')}</h2>
        <p style={{color:'var(--color-muted)'}}>{message}</p>
        {status === 'success' ? <Link to="/signin"><Button>Sign in</Button></Link> : <Link to="/auth"><Button variant="ghost">Back</Button></Link>}
      </div>
    </div>
  )
}
