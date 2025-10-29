import type { ComponentProps, ReactNode } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const iconButton = tv({
  base: 'flex items-center justify-center rounded-lg hover:bg-zinc-700 transition-colors duration-150',
  variants: {
    size: {
      sm: 'size-6',
      md: 'size-8',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

interface IconButtoProps
  extends ComponentProps<'button'>,
    VariantProps<typeof iconButton> {
  icon: ReactNode
}

export function IconButton({
  icon,
  size,
  className,
  ...props
}: IconButtoProps) {
  return (
    <button
      type="button"
      {...props}
      className={iconButton({ size, className })}
    >
      {icon}
    </button>
  )
}
