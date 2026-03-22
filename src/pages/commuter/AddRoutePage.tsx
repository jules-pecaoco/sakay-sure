import AddCommuterRouteForm from '@/components/commuter/AddCommuterRouteForm'

import TopBar from '@/components/common/TopBar'

export default function CommuterAddRoutePage() {

  return (
    <div className="min-h-screen bg-surface">
      <TopBar 
        title="RouteSure" 
      />

      <div className="max-w-lg mx-auto">
        <AddCommuterRouteForm />
      </div>
    </div>
  )
}
