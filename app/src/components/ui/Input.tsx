import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  prefix?: string
  wrapClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, prefix, className, wrapClassName, id, ...rest }, ref) => {
    const inputId = id ?? rest.name
    return (
      <div className={cn('flex flex-col', wrapClassName)}>
        {label && (
          <label htmlFor={inputId} className="label-base">
            {label}
          </label>
        )}
        <div className="relative">
          {prefix && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-ink-400">
              {prefix}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn('input-base', prefix && 'pl-10', error && 'border-rust focus:border-rust', className)}
            {...rest}
          />
        </div>
        {error ? (
          <p className="mt-1 text-xs text-rust">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-ink-400">{hint}</p>
        ) : null}
      </div>
    )
  },
)
Input.displayName = 'Input'

interface TAProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  wrapClassName?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TAProps>(
  ({ label, error, hint, className, wrapClassName, id, ...rest }, ref) => {
    const tid = id ?? rest.name
    return (
      <div className={cn('flex flex-col', wrapClassName)}>
        {label && (
          <label htmlFor={tid} className="label-base">
            {label}
          </label>
        )}
        <textarea
          id={tid}
          ref={ref}
          className={cn('input-base min-h-[120px] resize-y', error && 'border-rust', className)}
          {...rest}
        />
        {error ? (
          <p className="mt-1 text-xs text-rust">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-ink-400">{hint}</p>
        ) : null}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  wrapClassName?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, wrapClassName, id, options, placeholder, ...rest }, ref) => {
    const sid = id ?? rest.name
    return (
      <div className={cn('flex flex-col', wrapClassName)}>
        {label && (
          <label htmlFor={sid} className="label-base">
            {label}
          </label>
        )}
        <select id={sid} ref={ref} className={cn('input-base appearance-none pr-10', error && 'border-rust', className)} {...rest}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-rust">{error}</p>}
      </div>
    )
  },
)
Select.displayName = 'Select'
