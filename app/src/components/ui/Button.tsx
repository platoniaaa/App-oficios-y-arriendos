import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'ember' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variantMap: Record<Variant, string> = {
  primary: 'btn-primary',
  ember: 'btn-ember',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
}

const sizeMap: Record<Size, string> = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'primary', size = 'md', className, loading, disabled, children, ...rest }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(variantMap[variant], sizeMap[size], loading && 'relative', className)}
      {...rest}
    >
      {loading && (
        <span className="absolute inset-0 grid place-items-center">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </span>
      )}
      <span className={cn('inline-flex items-center gap-2', loading && 'opacity-0')}>{children}</span>
    </button>
  ),
)
Button.displayName = 'Button'
