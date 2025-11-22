import { Construction, ArrowLeft } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function EnConstruction({ titre = "Page en construction" }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-100 rounded-full mb-6">
          <Construction className="h-12 w-12 text-orange-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {titre}
        </h1>
        
        <p className="text-gray-600 mb-8">
          Cette page est en cours de développement et sera bientôt disponible.
        </p>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6 text-left">
          <p className="text-sm text-blue-900 font-semibold mb-2">
            Page demandée :
          </p>
          <p className="text-xs text-blue-700 font-mono break-all">
            {location.pathname}
          </p>
        </div>
        
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
          Retour
        </button>
      </div>
    </div>
  )
}
