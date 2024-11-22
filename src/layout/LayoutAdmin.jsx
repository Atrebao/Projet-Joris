import React from 'react'
import { Outlet, useNavigate } from "react-router-dom";
import NavBarAdmin from '../components/NavBarAdmin'

export default function LayoutAdmin() {
  return (
    <div className="w-full min-h-screen">
    <NavBarAdmin />
    <main>
      <Outlet />
    </main>
    
  </div>
  )
}
