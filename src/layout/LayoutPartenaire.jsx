import React, { useEffect } from 'react'
import { Outlet, useNavigate } from "react-router-dom";
import NavBarModerne from '../components/NavBarModerne'
import { getPartenaireId } from '../Utils/Utils'

export default function LayoutPartenaire() {
  const navigate = useNavigate()
  const partenaireId = getPartenaireId()

  useEffect(() => {
    if (!partenaireId && !localStorage.getItem('token')) {
      navigate('/backoffice/login')
    }
  }, [partenaireId, navigate])

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <NavBarModerne />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
