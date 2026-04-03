import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token } = useAuthStore()
  const location = useLocation()

  // Use both isAuthenticated and token as a safety check
  if (!isAuthenticated || !token) {
    // Redirect to login but save the current location they were trying to access
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
