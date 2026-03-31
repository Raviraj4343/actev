import React from 'react'
import Brand from './Brand'
export default function Navbar({ onToggleSidebar }){

  return (
    <header className="topbar">
      <div className="container topbar-container">
        <div className="topbar-left">
          <div className="topbrand"><Brand to="/" /></div>
        </div>

        <div className="topbar-right">
          <button
            type="button"
            aria-label="Open menu"
            className="menu-btn"
            onClick={onToggleSidebar}
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  )
}
