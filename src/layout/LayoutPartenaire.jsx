import React from 'react'
import { Outlet } from "react-router-dom";
import NavBarModerne from '../components/NavBarModerne'

export default function LayoutPartenaire() {
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <NavBarModerne />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
