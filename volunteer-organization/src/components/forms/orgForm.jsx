import Input from '../ui/Input'
import UploadRow from '../common/UploadRow'
import { FIELD_LABEL } from '../../utils/fieldStyles'

export default function OrganizationForm({
  register,
  errors,
  onFieldChange,
  verificationImagePreview,
  verificationImageError,
  verificationImageFile,
  onVerificationImageChange,
  onVerificationImageRemove,
}) {
  return (
    <>
      <Input
        label='Organization Name'
        type='text'
        name='orgName'
        register={register}
        registerOptions={{ onChange: onFieldChange }}
        placeholder='Your Organization'
        error={errors?.orgName?.message}
        required
      />

      <Input
        label='Contact Person'
        type='text'
        name='contactPerson'
        register={register}
        registerOptions={{ onChange: onFieldChange }}
        placeholder='Full Name'
        error={errors?.contactPerson?.message}
        required
      />

      <div className='flex w-full flex-col gap-1'>
        <label htmlFor='verificationImage' className={FIELD_LABEL}>
          Organization Verification Image
          <span className='ml-1 text-primary'>*</span>
        </label>
        <p className='text-xs text-body mb-1'>
          Upload an official document proving your organization's legitimacy,
          such as a business registration certificate, official license, or
          government-issued NGO registration. This helps our team verify your
          organization faster.
        </p>

        <UploadRow
          fieldId='verificationImage'
          previewUrl={verificationImagePreview}
          fileName={verificationImageFile?.name}
          fileSize={verificationImageFile?.size}
          onFileChange={onVerificationImageChange}
          onRemove={onVerificationImageRemove}
          changeText='Change verification image'
          uploadText='Upload verification document'
          error={verificationImageError || errors?.verificationImage?.message}
        />
      </div>
    </>
  )
}
