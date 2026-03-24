import { X } from 'lucide-react'

export default function ModalDetail({ open, onClose, title, children, loading }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-10 w-10 border-4 border-slate-600 border-t-transparent rounded-full animate-spin" />
              <p className="mt-3 text-gray-500">Chargement...</p>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  )
}
