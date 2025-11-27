import { db } from '@/db'
import { webhooks } from '@/db/schema'
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { inArray } from 'drizzle-orm'
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const generateHandler: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/api/generate',
    {
      schema: {
        summary: 'Generate a TypeScript handler',
        tags: ['Webhooks'],
        body: z.object({
          webhookIds: z.array(z.uuidv7()),
        }),
        response: {
          201: z.object({
            code: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { webhookIds } = request.body

      const result = await db
        .select({
          body: webhooks.body,
        })
        .from(webhooks)
        .where(inArray(webhooks.id, webhookIds))

      const webhooksBodies = result.map((webhook) => webhook.body).join('\n\n')

      const { text } = await generateText({
         model: google('gemini-2.5-flash-lite'),
        prompt: `
          You are an expert TypeScript backend engineer.
          Your task is to generate a strongly-typed webhook handler in TypeScript + Zod based on example webhook request bodies that I will provide.

          Inputs you will receive from me

          """${webhooksBodies}"""

          Your goals

          Infer the event schemas

          Identify distinct event types and their discriminant field (e.g. type, event, action, etc.).

          Infer required/optional fields and their types for each event.

          Generate Zod schemas + TypeScript types

          Create Zod schemas for each event type.

          Create a discriminated union schema across all event types.

          Export TypeScript types using z.infer.

          Generate a full TypeScript webhook handler

          Validate the incoming JSON payload using Zod.

          Narrow the event type using the discriminated union.

          Implement a type-safe switch to handle each event.

          Provide placeholders where business logic should be added.

          Error handling & structure

          Use .parse() or .safeParse().

          Throw or return meaningful validation errors.

          Ensure code is framework-agnostic.

          Return only the TypeScript code, without any explanations or comments. Not return any other markdown symbols
        `.trim(),
      })

      return reply.status(201).send({ code: text })
    },
  )
}
