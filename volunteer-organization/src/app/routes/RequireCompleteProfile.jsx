
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '../../constants/paths'
import { useAuth } from '../../hooks/useAuth'
import { ACCOUNT_TYPES } from '../../constants/auth/accountTypes'
import { isVolunteerProfileComplete } from '../../utils/auth/profileCompletion'

export default function RequireCompleteProfile() {
  const location = useLocation()
  const { isAuthenticated, accountType, user } = useAuth()

  const isVolunteer = isAuthenticated && accountType === ACCOUNT_TYPES.VOLUNTEER
  const profileIncomplete = isVolunteer && !isVolunteerProfileComplete(user)

 // otherwise the volunteer will not be able to deliver it originally to fill it
  const isAlreadyOnProfilePage = location.pathname === ROUTES.VOLUNTEER_PROFILE

  if (profileIncomplete && !isAlreadyOnProfilePage) {
    return (
      <Navigate
        to={ROUTES.VOLUNTEER_PROFILE}
        replace
        state={{
          reason: 'complete-profile',
          message: 'Please complete and save your volunteer profile before navigating elsewhere.',
        }}
      />
    )
  }

  return <Outlet />
}