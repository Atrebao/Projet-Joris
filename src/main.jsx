import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from "react-router-dom";
import { AppRoute } from './router/AppRoute.jsx'
import { Toaster } from "react-hot-toast";
import { CurrencyProvider } from './context/CurrencyContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CurrencyProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <RouterProvider router={AppRoute} />
    </CurrencyProvider>
  </StrictMode>,
)
