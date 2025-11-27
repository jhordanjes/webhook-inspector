import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { Trash2Icon } from 'lucide-react'
import { CheckBox } from './ui/checkbox'
import { IconButton } from './ui/icon-button'

interface WebhookListItemProps {
  webhook: {
    id: string
    method: string
    pathname: string
    createdAt: Date
  }
  onWebhookChecked: (webhookId: string) => void
  isWebhookChecked: boolean
}

export function WebhooksListItem({
  webhook,
  isWebhookChecked,
  onWebhookChecked,
}: WebhookListItemProps) {
  const queryClient = useQueryClient()
  const { mutate: deleteWebhook } = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`http://localhost:3333/api/webhooks/${id}`, {
        method: 'DELETE',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['webhooks'],
      })
    },
  })

  return (
    <div className="group rounded-lg transition-colors duration-150 hover:bg-zinc-700/30">
      <div className="flex items-start gap-3 px-4 py-2.5">
        <CheckBox
          checked={isWebhookChecked}
          onCheckedChange={() => onWebhookChecked(webhook.id)}
        />
        <Link
          to="/webhooks/$id"
          params={{ id: webhook.id }}
          className="flex flex-1 min-w-0 items-start gap-3 text-xs"
        >
          <span className="w-12 shrink-0 font-mono font-semibold text-zinc-300 text-right">
            {webhook.method}
          </span>
          <div className="flex-1 min-w-0">
            <p className="truncate text-zinc-200 leading-tight font-mono">
              {webhook.pathname}
            </p>
            <p className="text-zinc-500 font-medium mt-1">
              {formatDistanceToNow(webhook.createdAt, {
                addSuffix: true,
              })}
            </p>
          </div>
        </Link>

        <IconButton
          icon={<Trash2Icon className="size-3.5 text-zinc-400" />}
          onClick={() => deleteWebhook(webhook.id)}
          className="opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>
    </div>
  )
}
