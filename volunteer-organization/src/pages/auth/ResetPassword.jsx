import { useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import AuthShell from '../../components/auth/AuthShell'
import AuthAlert from '../../components/auth/AuthAlert'
import { ROUTES } from '../../constants/paths'
import useAsyncAction from '../../hooks/useAsyncAction'
import { resetPasswordSchema } from '../../utils/auth/validation'
import { resetPassword } from '../../services/auth'

const emailShape = z.string().email()

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isTokenError, setIsTokenError] = useState(false)
  const { loading, error, execute, clearError } = useAsyncAction(resetPassword)

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  // Direct derivative of URL, without useEffect — prevents any formal flash before
  // The emergence of the case of "invalid link" if the link is incomplete / distorted from the beginning
  const isLinkWellFormed = useMemo(
    () => Boolean(token?.trim()) && emailShape.safeParse(email).success,
    [token, email],
  )

  const isLinkInvalid = !isLinkWellFormed || isTokenError

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onTouched',
  })

  const handleFieldChange = () => {
    clearError()
  }

  const onSubmit = async (values) => {
    const result = await execute({
      token,
      email,
      password: values.password,
      passwordConfirmation: values.confirmPassword,
    })

    if (!result?.success) {
    // Token finished/pre-used: Retrying with the same form will not work,
    // We replace it with the status of "invalid link" instead of just a normal mistake banner
      if (result?.isTokenError) {
        setIsTokenError(true)
        return
      }

      if (result?.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, message]) => {
          setError(field, { type: 'server', message })
        })
      }
      return
    }

    navigate(ROUTES.LOGIN, { state: { resetSuccess: true } })
  }

  return (
    <AuthShell
      title='Reset Password'
      subtitle={isLinkInvalid ? undefined : 'Choose a new password for your account.'}
      footer={
        <>
          Remembered your password?{' '}
          <Link to={ROUTES.LOGIN} className='text-primary hover:underline'>
            Sign In
          </Link>
        </>
      }
    >
      {isLinkInvalid ? (
        <div className='space-y-4'>
          <AuthAlert variant='error'>
            This password reset link is invalid or has expired. Please request a new one.
          </AuthAlert>
          <Button as={Link} to={ROUTES.FORGOT_PASSWORD} fullWidth>
            Request a New Link
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4' noValidate>
          <Input
            label='New Password'
            type='password'
            name='password'
            register={register}
            registerOptions={{ onChange: handleFieldChange }}
            placeholder='********'
            error={errors.password?.message}
            autoComplete='new-password'
            required
          />

          <Input
            label='Confirm Password'
            type='password'
            name='confirmPassword'
            register={register}
            registerOptions={{ onChange: handleFieldChange }}
            placeholder='********'
            error={errors.confirmPassword?.message}
            autoComplete='new-password'
            required
          />

          <AuthAlert variant='error'>{error}</AuthAlert>

          <Button type='submit' isLoading={loading} loadingText='Resetting...' fullWidth>
            Reset Password
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
