import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '../../constants/paths'
import { useAuth } from '../../hooks/useAuth'

export default function ProtectedRoute({ allowedAccountTypes = [] }) {
  const location = useLocation()
  const { isAuthenticated, accountType } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />
  }

  if (allowedAccountTypes.length > 0 && !allowedAccountTypes.includes(accountType)) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return <Outlet />
}
