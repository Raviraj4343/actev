import React from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import '../styles/global.css'

export default function Landing(){
  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column'}}>

      <main className="landing-main">
        <section className="hero">
          <h1 style={{fontSize:'var(--fs-xxl)',margin:0}}>AQTEV — Health tracking built for teams</h1>
          <p style={{color:'var(--color-muted)',marginTop:12, maxWidth:680}}>AQTEV is a lightweight health tracking platform that helps professionals collect daily vitals, log meals and weight, and surface actionable insights — all in one elegant dashboard. Integrates with food databases, provides personalized recommendations and supports team workflows.</p>

          <div style={{display:'flex',gap:12,marginTop:20}}>
            <Link to="/signup"><Button>Get started — free</Button></Link>
            <Link to="/signin"><Button variant="ghost">View demo</Button></Link>
          </div>

          <section id="features" style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,marginTop:36}}>
            <Card>
              <h4 style={{margin:0}}>Daily logging</h4>
              <p style={{color:'var(--color-muted)',marginTop:8}}>Log water, sleep, steps and meals with quick inputs and food search.</p>
            </Card>

            <Card>
              <h4 style={{margin:0}}>Insights & goals</h4>
              <p style={{color:'var(--color-muted)',marginTop:8}}>Personalized calorie & protein targets, BMI and weekly trends for users and teams.</p>
            </Card>

            <Card>
              <h4 style={{margin:0}}>Weight tracking</h4>
              <p style={{color:'var(--color-muted)',marginTop:8}}>Daily weight entries, history, and weekly summaries with trend analysis.</p>
            </Card>

            <Card>
              <h4 style={{margin:0}}>Food database</h4>
              <p style={{color:'var(--color-muted)',marginTop:8}}>Searchable food catalog with calories and protein per unit — customizable to your menu.</p>
            </Card>
          </section>
        </section>

        <aside className="aside-panel">
          <Card>
            <h3 style={{marginTop:0}}>Ready to try AQTEV?</h3>
            <p style={{color:'var(--color-muted)'}}>Create an account and start tracking today. Designed for clinics, coaches and wellness teams.</p>
            <div style={{marginTop:12}}>
              <Link to="/signup"><Button style={{width:'100%'}}>Create account</Button></Link>
            </div>

            <hr style={{margin:'16px 0',border:'none',borderTop:'1px solid rgba(11,31,36,0.04)'}} />
            <div style={{fontSize:13,color:'var(--color-muted)'}}>
              Tech: Node.js · MongoDB · Vite · React · Tailwind (utility)
            </div>
            <div style={{marginTop:8}}><a href="https://github.com" target="_blank" rel="noreferrer">View on GitHub</a></div>
          </Card>
        </aside>
      </main>

      <footer style={{marginTop:'auto',padding:20,background:'transparent',textAlign:'center',color:'var(--color-muted)'}}>© {new Date().getFullYear()} AQTEV — Built with care.</footer>
    </div>
  )
}
