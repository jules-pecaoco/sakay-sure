import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import type { ReactNode } from 'react'

interface PublicOnlyRouteProps {
  children: ReactNode
}

export default function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading SakaySure…" />
  }

  if (user) {
    const home = user.role === 'driver' ? '/driver' : '/explore'
    return <Navigate to={home} replace />
  }

  return <>{children}</>
}
