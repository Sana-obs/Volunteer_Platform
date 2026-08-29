import Input from '../ui/Input'

export default function VolunteerForm({ register, errors, onFieldChange }) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
      <Input
        label='First Name'
        type='text'
        name='firstName'
        register={register}
        registerOptions={{ onChange: onFieldChange }}
        placeholder='John'
        error={errors?.firstName?.message}
        autoComplete='given-name'
        required
      />

      <Input
        label='Last Name'
        type='text'
        name='lastName'
        register={register}
        registerOptions={{ onChange: onFieldChange }}
        placeholder='Doe'
        error={errors?.lastName?.message}
        autoComplete='family-name'
        required
      />

    </div>
  )
}