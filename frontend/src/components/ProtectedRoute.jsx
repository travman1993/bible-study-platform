import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoadingSpinner } from './LoadingSpinner'

function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner message="Loading..." />
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute