import { useState } from 'react'
import { ChevronDown, Eye, EyeOff } from 'lucide-react'
import { FIELD_SURFACE, FIELD_PLACEHOLDER } from '../../utils/fieldStyles'

export default function Input({
  label,
  name,
  register,
  registerOptions,
  as = 'input',
  type = 'text',
  placeholder = '',
  size = 'medium',
  variant = 'default',
  fullWidth = false,
  disabled = false,
  className = '',
  labelClassName = 'text-heading',
  error = '',
  warning = '',
  success = false,
  required = false,
  options = [],
  icon: Icon = null,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPasswordField = type === 'password'
  const resolvedType = isPasswordField && showPassword ? 'text' : type

  const sizeStyles = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-3 text-base',
    large: 'px-5 py-4 text-lg',
  }

  // default and filled are intentionally identical (no distinct "filled" design yet)
  const sharedFieldStyle = `${FIELD_SURFACE} text-heading ${FIELD_PLACEHOLDER} rounded-xl focus:border-primary`
  const variantStyles = {
    default: sharedFieldStyle,
    filled: sharedFieldStyle,
    underline: "border-0 border-b-2 border-heading/20 bg-transparent text-heading placeholder-body/60 rounded-none focus:border-primary",
    danger: "w-full px-4 py-3 border border-danger bg-danger/5 text-danger rounded-lg transition focus:border-dangerHover",
    success: "border border-success bg-success/5 text-success rounded-xl focus:border-successHover"
  }

  const appliedVariant = error ? 'danger' : success ? 'success' : variant

  const classes = [
    'w-full transition focus:outline-none',
    sizeStyles[size],
    variantStyles[appliedVariant],
    disabled ? 'opacity-50 cursor-not-allowed' : 'focus:ring-2 focus:ring-primary/30',
    as === 'select' ? 'appearance-none cursor-pointer pr-10' : '',
    Icon ? 'pl-10' : '',
    isPasswordField ? 'pr-11' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const registerProps = register ? register(name, registerOptions) : {}

  // Merge register()'s handlers with any passed via props instead of overwriting.
  const mergedOnKeyDown =
    registerProps.onKeyDown && props.onKeyDown
      ? (event) => {
          registerProps.onKeyDown(event)
          props.onKeyDown(event)
        }
      : props.onKeyDown || registerProps.onKeyDown

  const mergedOnPaste =
    registerProps.onPaste && props.onPaste
      ? (event) => {
          registerProps.onPaste(event)
          props.onPaste(event)
        }
      : props.onPaste || registerProps.onPaste

  const sharedProps = {
    id: name,
    name,
    disabled,
    required,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? `${name}-error` : undefined,
    className: classes,
    ...registerProps,
    ...props,
    ...(mergedOnKeyDown ? { onKeyDown: mergedOnKeyDown } : {}),
    ...(mergedOnPaste ? { onPaste: mergedOnPaste } : {}),
  }

  const iconColorClass = error ? 'text-danger' : 'text-primary'

  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={name} className={`mb-1 text-sm font-medium ${labelClassName}`}>
          {label}
          {required && <span className="text-primary ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${iconColorClass}`}
          />
        )}

        {as === 'select' && (
          <>
            <select {...sharedProps}>
              <option value="" hidden>{placeholder || 'Select an option'}</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-heading/40"
            />
          </>
        )}

        {as === 'input' && (
          <input type={resolvedType} placeholder={placeholder} {...sharedProps} />
        )}

        {as === 'input' && isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-heading/40 transition-colors hover:bg-heading/5 hover:text-heading focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}

      {/* Transient inline hint (e.g. typing a letter in a numeric field); error takes priority. */}
      {!error && warning && (
        <p
          id={`${name}-warning`}
          role="status"
          aria-live="polite"
          className="mt-1 text-xs text-amber-600"
        >
          {warning}
        </p>
      )}
    </div>
  )
}