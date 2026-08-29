import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Typography from '../../components/ui/Typography'
import AccountSwitch from '../../components/forms/AccountSwitcher'
import OrganizationForm from '../../components/forms/orgForm'
import VolunteerForm from '../../components/forms/volunteerForm'
import { ROUTES, AUTH_QUERY_KEYS } from '../../constants/paths'
import { ACCOUNT_TYPES, isAccountType } from '../../constants/auth/accountTypes'
import AuthShell from '../../components/auth/AuthShell'
import AuthAlert from '../../components/auth/AuthAlert'
import { useAuth } from '../../hooks/useAuth'
import useAsyncAction from '../../hooks/useAsyncAction'
import { useImageUpload } from '../../hooks/useImageUpload'
import { useCitiesQuery } from '../../hooks/queries/useCitiesQuery'
import { getRegisterSchema } from '../../utils/auth/validation'
import { registerUser } from '../../services/auth'

// Shared account fields
const SHARED_INITIAL_VALUES = {
  email: '',
  phone: '',
  password: '',
}

// Volunteer-specific fields
const VOLUNTEER_INITIAL_VALUES = {
  ...SHARED_INITIAL_VALUES,
  firstName: '',
  lastName: '',
}

// Organization-specific fields
const ORGANIZATION_INITIAL_VALUES = {
  ...SHARED_INITIAL_VALUES,
  orgName: '',
  contactPerson: '',
  verificationImage: null,
}

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [searchParams] = useSearchParams()
  const [successMessage, setSuccessMessage] = useState('')
  const { loading, error, execute, clearError } = useAsyncAction(registerUser)

  // Shared city data used during registration
  const { data: governorates = [] } = useCitiesQuery()

  const accountTypeFromQuery = searchParams.get(AUTH_QUERY_KEYS.TYPE)

  const accountType = isAccountType(accountTypeFromQuery)
    ? accountTypeFromQuery
    : ACCOUNT_TYPES.VOLUNTEER

  const isVolunteer = accountType === ACCOUNT_TYPES.VOLUNTEER

  const subtitle = useMemo(() => {
    if (isVolunteer) {
      return 'Find volunteering opportunities that match your skills and schedule.'
    }

    return 'Register your organization and connect with volunteers.'
  }, [isVolunteer])

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    setFocus,
    formState: { errors },
  } = useForm({
    // Select the validation schema based on the current account type
    resolver: (values, context, options) =>
      zodResolver(getRegisterSchema(accountType))(values, context, options),

    defaultValues: isVolunteer
      ? VOLUNTEER_INITIAL_VALUES
      : ORGANIZATION_INITIAL_VALUES,
  })

  const handleFormChange = () => {
    clearError()
    setSuccessMessage('')
  }

  // Handles image preview and client-side file validation
  const verificationImage = useImageUpload()

  const handleVerificationImageChange = (event) => {
    const selectedFile = event.target.files?.[0] || null

    verificationImage.handleFileChange(event)

    // Keep the selected file in React Hook Form for schema validation
    setValue('verificationImage', selectedFile, {
      shouldValidate: true,
    })

    handleFormChange()
  }

  // Remove the file from both the preview and form state
  const handleVerificationImageRemove = () => {
    verificationImage.handleRemove()

    setValue('verificationImage', null, {
      shouldValidate: true,
    })

    handleFormChange()
  }

  const onSubmit = async (values) => {
    // Form submission runs only after schema validation succeeds
    const payload = { accountType, ...values }

    const result = await execute(payload, governorates)

    if (!result?.success) {
      // Map backend validation errors to form fields
      if (result?.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, message]) => {
          setError(field, {
            type: 'server',
            message,
          })
        })
      }

      setValue('password', '')
      setFocus('password')
      return
    }

    if (!login(result.data)) {
      setSuccessMessage('')

      setError('root', {
        type: 'manual',
        message:
          'Account created but session could not be started. Please sign in.',
      })

      setValue('password', '')
      return
    }

    setSuccessMessage(
      'Account created successfully. Redirecting to your profile...'
    )

    if (isVolunteer) {
      navigate(ROUTES.VOLUNTEER_PROFILE)
    } else {
      navigate(ROUTES.ORGANIZATION_PROFILE)
    }
  }

  return (
    <AuthShell
      title='Create Account'
      subtitle={subtitle}
      footer={
        <>
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className='text-primary hover:underline'>
            Sign In
          </Link>
        </>
      }
    >
      <AccountSwitch accountType={accountType} />

      <form
        className='space-y-4'
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <Typography
          variant='overline'
          color='muted'
          weight='semibold'
          className='mt-1'
        >
          {isVolunteer ? 'Your Information' : 'Organization Details'}
        </Typography>

        {isVolunteer ? (
          <VolunteerForm
            register={register}
            errors={errors}
            onFieldChange={handleFormChange}
          />
        ) : (
          <OrganizationForm
            register={register}
            errors={errors}
            onFieldChange={handleFormChange}
            verificationImagePreview={verificationImage.previewUrl}
            verificationImageError={verificationImage.error}
            verificationImageFile={verificationImage.file}
            onVerificationImageChange={handleVerificationImageChange}
            onVerificationImageRemove={handleVerificationImageRemove}
          />
        )}

        <Typography
          variant='overline'
          color='muted'
          weight='semibold'
          className='mt-8'
        >
          Account Details
        </Typography>

        <Input
          label='Email'
          type='email'
          name='email'
          register={register}
          registerOptions={{ onChange: handleFormChange }}
          placeholder={isVolunteer ? 'you@example.com' : 'org@example.com'}
          error={errors.email?.message}
          autoComplete='email'
          required
        />

        <Input
          label='Phone Number'
          type='tel'
          name='phone'
          register={register}
          registerOptions={{ onChange: handleFormChange }}
          placeholder='+1 234 567 890'
          error={errors.phone?.message}
          autoComplete='tel'
          required
        />

        <Input
          label='Password'
          type='password'
          name='password'
          register={register}
          registerOptions={{ onChange: handleFormChange }}
          placeholder='********'
          error={errors.password?.message}
          autoComplete='new-password'
          required
        />

        <AuthAlert variant='error'>
          {error || errors.root?.message}
        </AuthAlert>

        <AuthAlert variant='success'>
          {successMessage}
        </AuthAlert>

        <Button
          type='submit'
          disabled={loading}
          isLoading={loading}
          loadingText='Creating...'
          fullWidth
        >
          Create Account
        </Button>
      </form>
    </AuthShell>
  )
}
