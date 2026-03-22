import { useNavigate } from 'react-router-dom'
import AddCommuterRouteForm from '@/components/commuter/AddCommuterRouteForm'

export default function CommuterAddRoutePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white px-4 pt-14 pb-4 shadow-sm flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/explore')}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors -ml-1"
          aria-label="Go back"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-800">Share a route</h1>
          <p className="text-xs text-slate-400">Help other commuters find their way</p>
        </div>
      </div>

      <AddCommuterRouteForm />
    </div>
  )
}
