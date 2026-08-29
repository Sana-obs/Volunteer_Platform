import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { isAccountType } from '../constants/auth/accountTypes'
import { AUTH_STORAGE_KEY } from '../constants/auth/storage'
import { normalizeUser } from '../utils/auth/normalizeUser'
import { useCitiesQuery } from '../hooks/queries/useCitiesQuery'
import { AuthContext } from './AuthContextInstance'

const emptySession = {
  user: null,
  token: null,
  accountType: null,
  isAuthenticated: false,
}

// Restore the saved session from localStorage
function loadPersistedSession() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return emptySession

  try {
    const parsed = JSON.parse(raw)
    const accountType = isAccountType(parsed?.accountType) ? parsed.accountType : null
    const token = typeof parsed?.token === 'string' ? parsed.token : null
    const user = parsed?.user && typeof parsed.user === 'object' ? parsed.user : null

    if (!user || !token || !accountType) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return emptySession
    }

    return { user, token, accountType, isAuthenticated: true }
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return emptySession
  }
}

// Save the current session for persistence
function persistSession({ user, token, accountType }) {
  try {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ user, token, accountType })
    )
  } catch (error) {
    // Keep the in-memory session active if persistence fails
    console.warn(
      'Failed to persist session to localStorage — changes will not survive a reload.',
      error
    )
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadPersistedSession)

  // Clear shared React Query cache when the session changes
  const queryClient = useQueryClient()

  // Used to normalize city data when updating the user
  const citiesQuery = useCitiesQuery()
  const governorates = citiesQuery.data ?? []

  const login = (payload = {}) => {
    const user = payload.user && typeof payload.user === 'object' ? payload.user : null
    const token = typeof payload.token === 'string' ? payload.token : null
    const accountType = isAccountType(payload.accountType) ? payload.accountType : null

    if (!user || !token || !accountType) {
      setSession(emptySession)
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return false
    }

    // Prevent the new user from inheriting cached data
    queryClient.clear()

    const next = { user, token, accountType, isAuthenticated: true }
    setSession(next)
    persistSession(next)
    return true
  }

  const logout = () => {
    setSession(emptySession)
    localStorage.removeItem(AUTH_STORAGE_KEY)

    // Remove cached data belonging to the logged-out user
    queryClient.clear()
  }

  const updateUser = (nextUser) => {
    if (!nextUser || typeof nextUser !== 'object') return

    setSession((current) => {
      if (!current.isAuthenticated) return current

      const user = normalizeUser(
        { ...(current.user || {}), ...nextUser },
        governorates
      )

      const next = { ...current, user }
      persistSession(next)
      return next
    })
  }

  return (
    <AuthContext.Provider value={{ ...session, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
