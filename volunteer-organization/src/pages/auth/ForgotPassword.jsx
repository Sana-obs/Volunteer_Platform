import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import AuthShell from '../../components/auth/AuthShell'
import AuthAlert from '../../components/auth/AuthAlert'
import { ROUTES } from '../../constants/paths'
import useAsyncAction from '../../hooks/useAsyncAction'
import { forgotPasswordSchema } from '../../utils/auth/validation'
import { requestPasswordReset } from '../../services/auth'

export default function ForgotPassword() {
  const [isSent, setIsSent] = useState(false)
  const { loading, error, execute, clearError } = useAsyncAction(requestPasswordReset)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (values) => {
    const result = await execute(values)
    if (result?.success) setIsSent(true)
  }

  return (
    <AuthShell
      title='Forgot Password'
      subtitle='Enter your email address and we will send you a link to reset your password.'
      footer={
        <>
          Remembered your password?{' '}
          <Link to={ROUTES.LOGIN} className='text-primary hover:underline'>
            Sign In
          </Link>
        </>
      }
    >
      {isSent ? (
        <div className='space-y-4'>
          <AuthAlert variant='success'>
            If an account exists for that email address, we&apos;ve sent a link to reset your password. Please
            check your inbox.
          </AuthAlert>
          <Button as={Link} to={ROUTES.LOGIN} fullWidth>
            Back to Sign In
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4' noValidate>
          <Input
            label='Email'
            type='email'
            name='email'
            register={register}
            registerOptions={{ onChange: clearError }}
            placeholder='you@example.com'
            error={errors.email?.message}
            autoComplete='email'
            required
          />

          <AuthAlert variant='error'>{error}</AuthAlert>

          <Button type='submit' isLoading={loading} loadingText='Sending...' fullWidth>
            Send Reset Link
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
