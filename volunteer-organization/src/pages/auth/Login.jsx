import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { ROUTES, AUTH_QUERY_KEYS } from '../../constants/paths'
import { ACCOUNT_TYPES } from '../../constants/auth/accountTypes'
import { SESSION_EXPIRED_STORAGE_KEY } from '../../constants/auth/storage'
import AuthShell from '../../components/auth/AuthShell'
import AuthAlert from '../../components/auth/AuthAlert'
import { useAuth } from '../../hooks/useAuth'
import useAsyncAction from '../../hooks/useAsyncAction'
import { useCitiesQuery } from '../../hooks/queries/useCitiesQuery'
import { loginSchema } from '../../utils/auth/validation'
import { loginUser } from '../../services/auth'

const initialValues = {
  email: '',
  password: '',
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Shared async state management for authentication actions
  const { loading, error, execute, clearError } = useAsyncAction(loginUser)

  // Shared city data used to normalize the authenticated user
  const { data: governorates = [] } = useCitiesQuery()

  // Show password-reset success message once
  const [showResetSuccess, setShowResetSuccess] = useState(
    Boolean(location.state?.resetSuccess)
  )

  // Show session-expiration message once
  const [showSessionExpired] = useState(() => {
    try {
      const wasSet =
        sessionStorage.getItem(SESSION_EXPIRED_STORAGE_KEY) === '1'

      if (wasSet) {
        sessionStorage.removeItem(SESSION_EXPIRED_STORAGE_KEY)
      }

      return wasSet
    } catch {
      return false
    }
  })

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    setFocus,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: initialValues,
  })

  const handleFieldChange = useCallback(() => {
    clearError()
    setShowResetSuccess(false)
  }, [clearError])

  // Clear only the password and restore focus for retry
  const clearPasswordAndFocus = () => {
    setValue('password', '')
    setFocus('password')
  }

  const onSubmit = async (values) => {
    const result = await execute(values, governorates)

    if (!result?.success) {
      // Map backend validation errors to their form fields
      if (result?.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, message]) => {
          setError(field, { type: 'server', message })
        })
      }

      clearPasswordAndFocus()
      return
    }

    if (!login(result.data)) {
      setError('root', {
        type: 'manual',
        message: 'Received invalid authentication response. Please try again.',
      })
      clearPasswordAndFocus()
      return
    }

    // Redirect admins to settings; other users start at Home
    navigate(
      result.data.accountType === ACCOUNT_TYPES.ADMIN
        ? ROUTES.ADMIN_SETTINGS
        : ROUTES.HOME
    )
  }

  return (
    <AuthShell
      title='Sign In'
      subtitle='Welcome back! Please enter your details.'
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link
            to={`${ROUTES.REGISTER}?${AUTH_QUERY_KEYS.TYPE}=${ACCOUNT_TYPES.VOLUNTEER}`}
            className='text-primary hover:underline'
          >
            Register
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4' noValidate>
        {showResetSuccess ? (
          <AuthAlert variant='success'>
            Your password has been reset. Please sign in.
          </AuthAlert>
        ) : null}

        {showSessionExpired ? (
          <AuthAlert variant='error'>
            Your session has expired. Please sign in again.
          </AuthAlert>
        ) : null}

        <Input
          label='Email'
          type='email'
          name='email'
          register={register}
          registerOptions={{ onChange: handleFieldChange }}
          placeholder='you@example.com'
          error={errors.email?.message}
          autoComplete='email'
          required
        />

        <div>
          <Input
            label='Password'
            type='password'
            name='password'
            register={register}
            registerOptions={{ onChange: handleFieldChange }}
            placeholder='********'
            error={errors.password?.message}
            autoComplete='current-password'
            required
          />

          <div className='mt-1 flex justify-end'>
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className='text-sm text-primary hover:underline'
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <AuthAlert variant='error'>
          {error || errors.root?.message}
        </AuthAlert>

        <Button
          type='submit'
          disabled={loading}
          isLoading={loading}
          loadingText='Signing In...'
          fullWidth
        >
          Sign In
        </Button>
      </form>
    </AuthShell>
  )
}
