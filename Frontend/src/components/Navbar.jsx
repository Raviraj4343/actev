import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import Brand from './Brand'
export default function Navbar({ onToggleSidebar }){
  const { pathname } = useLocation()
  const isLanding = pathname === '/'

  return (
    <header className="topbar">
      <div className="container topbar-container">
        <div className="topbar-left">
          <div className="topbrand"><Brand to="/" /></div>
        </div>

        <div className="topbar-right">
          {isLanding ? (
            <>
              <Link to="/signin" className="nav-auth-link">Sign in</Link>
              <Link to="/signup" className="btn-primary" style={{ marginTop: 0, padding: '10px 14px' }}>Sign up</Link>
            </>
          ) : (
            <button
              type="button"
              aria-label="Open menu"
              className="menu-btn"
              onClick={onToggleSidebar}
            >
              ☰
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
