import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function AppShell() {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Page content - padded above bottom nav */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Fixed bottom nav */}
      <BottomNav />
    </div>
  )
}
