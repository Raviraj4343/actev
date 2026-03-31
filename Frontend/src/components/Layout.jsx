import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function Layout({ children }){
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-root">
      <Sidebar isOpen={sidebarOpen} onClose={()=>setSidebarOpen(false)} />
      <div className="main-area">
        <Navbar onToggleSidebar={()=>setSidebarOpen(s=>!s)} />
        <main className="content-area" onClick={()=> sidebarOpen && setSidebarOpen(false)}>
          {children}
        </main>
      </div>
    </div>
  )
}
