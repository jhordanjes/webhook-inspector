import * as RadixCheckBox from '@radix-ui/react-checkbox'
import { CheckIcon } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

interface CheckBoxProps extends RadixCheckBox.CheckboxProps {}

export function CheckBox(props: CheckBoxProps) {
  return (
    <RadixCheckBox.Root
      className={twMerge(
        'flex size-4 shrink-0 items-center justify-center rounded border border-zinc-600 bg-zinc-800 transition-colors hover:border-zinc-500',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2',
        'data-[state=checked]:border-indigo-400 data-[state=checked]:bg-indigo-400',
      )}
      {...props}
    >
      <RadixCheckBox.Indicator className="flex items-center justify-center text-zinc-900">
        <CheckIcon className="size-3" strokeWidth={3} />
      </RadixCheckBox.Indicator>
    </RadixCheckBox.Root>
  )
}
