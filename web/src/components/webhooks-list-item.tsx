import { Link } from '@tanstack/react-router'
import { Trash2Icon } from 'lucide-react'
import { CheckBox } from './ui/checkbox'
import { IconButton } from './ui/icon-button'

export function WebhooksListIcon() {
  return (
    <div className="group rounded-lg transition-colors duration-150 hover:bg-zinc-700/30">
      <div className="flex items-start gap-3 px-4 py-2.5">
        <CheckBox />
        <Link to="/" className="flex flex-1 min-w-0 items-start gap-3 text-xs">
          <span className="w-12 shrink-0 font-mono font-semibold text-zinc-300 text-right">
            POST
          </span>
          <div className="flex-1 min-w-0">
            <p className="truncate text-zinc-200 leading-tight font-mono">
              /video/status
            </p>
            <p className="text-zinc-500 font-medium mt-1">1 minute ago</p>
          </div>
        </Link>

        <IconButton
          icon={<Trash2Icon className="size-3.5 text-zinc-400" />}
          className="opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>
    </div>
  )
}
