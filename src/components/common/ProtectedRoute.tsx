import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import type { UserRole } from '@/types'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: UserRole
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading SakaySure…" />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to the correct home for their actual role
    const home = user.role === 'driver' ? '/driver' : '/explore'
    return <Navigate to={home} replace />
  }

  return <>{children}</>
}
