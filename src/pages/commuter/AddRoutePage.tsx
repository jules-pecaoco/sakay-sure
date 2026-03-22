import { useNavigate } from 'react-router-dom'
import AddCommuterRouteForm from '@/components/commuter/AddCommuterRouteForm'

import TopBar from '@/components/common/TopBar'

export default function CommuterAddRoutePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-surface">
      <TopBar 
        title="RouteSure" 
        onBack={() => navigate('/explore')}
      />

      <div className="max-w-lg mx-auto">
        <AddCommuterRouteForm />
      </div>
    </div>
  )
}
