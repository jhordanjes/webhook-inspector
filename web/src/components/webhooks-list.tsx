import * as Dialog from '@radix-ui/react-dialog'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { Loader2, Wand2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { webhookListSchema } from '../http/schemas/webhooks'
import { CodeBlock } from './ui/code-block'
import { WebhooksListItem } from './webhooks-list-item'

export function WebhooksList() {
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver>(null)
  const [checkedWebhooksIds, setCheckedWEbhooksIds] = useState<string[]>([])
  const [generatedHandlerCode, setGenerateHandlerCode] = useState<
    string | null
  >(null)

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: ['webhooks'],
      queryFn: async ({ pageParam }) => {
        const url = new URL('http://localhost:3333/api/webhooks')

        if (pageParam) {
          url.searchParams.set('cursor', pageParam)
        }
        const response = await fetch(url)
        const data = await response.json()

        return webhookListSchema.parse(data)
      },
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor ?? undefined
      },
      initialPageParam: undefined as string | undefined,
    })

  const webhooks = data.pages.flatMap((page) => page.webhooks)

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]

        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      {
        threshold: 0.1,
      },
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  function handleCheckWEbhook(webhookId: string) {
    if (checkedWebhooksIds.includes(webhookId)) {
      setCheckedWEbhooksIds((state) =>
        state.filter((item) => item !== webhookId),
      )
    } else {
      setCheckedWEbhooksIds((state) => [...state, webhookId])
    }
  }

  async function handleGenerateHandler() {
    const response = await fetch('http://localhost:3333/api/generate', {
      method: 'POST',
      body: JSON.stringify({ webhookIds: checkedWebhooksIds }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    type GenerateResponse = { code: string }
    const data: GenerateResponse = await response.json()

    setGenerateHandlerCode(data.code)
  }

  const hasAnyWebhooksChecked = checkedWebhooksIds.length > 0

  return (
    <>
      <div className="flex-1 overflow-y-auto ">
        <div className="space-y-1 p-2">
          {webhooks.map((item) => (
            <WebhooksListItem
              key={item.id}
              webhook={item}
              onWebhookChecked={handleCheckWEbhook}
              isWebhookChecked={checkedWebhooksIds.includes(item.id)}
            />
          ))}
        </div>

        {hasNextPage && (
          <div className="p-2" ref={loadMoreRef}>
            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="size-5 animate-spin text-zinc-500" />
              </div>
            )}
          </div>
        )}

        <div className="fixed bottom-3 left-3">
          <button
            title="Gerar handle"
            className="bg-indigo-500 size-8 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-50"
            disabled={!hasAnyWebhooksChecked}
            onClick={handleGenerateHandler}
          >
            <Wand2 className="size-4" />
          </button>
        </div>
      </div>

      {generatedHandlerCode && (
        <Dialog.Root defaultOpen>
          <Dialog.Overlay className='bg-black/60 inset-0 fixed z-20' />
          <Dialog.Content className='flex items-center justify-center fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 max-h-[85vh] w-[90vw]'>
            <div className="bg-zinc-900 w-[600px] p-4 rounded-lg border border-zinc-800 max-h-[500px] overflow-y-auto">
              <CodeBlock language='typescript' code={generatedHandlerCode} />
            </div>
          </Dialog.Content>
        </Dialog.Root>
      )}
    </>
  )
}
