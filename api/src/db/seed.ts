import { faker } from '@faker-js/faker'
import { db } from '.'
import { webhooks } from './schema'

const stripeEventTypes = [
  'payment_intent.succeeded',
  'payment_intent.failed',
  'payment_intent.canceled',
  'charge.succeeded',
  'charge.failed',
  'charge.refunded',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
  'invoice.upcoming',
  'checkout.session.completed',
  'checkout.session.expired',
]

const stripeWebhooks = Array.from({ length: 60 }, () => {
  const eventType = faker.helpers.arrayElement(stripeEventTypes)
  const now = new Date()
  const timestamp = faker.date.between({
    from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: now,
  })

  // Generate a realistic Stripe webhook body based on the event type
  const body = generateStripeWebhookBody(eventType)

  return {
    method: 'POST',
    pathname: '/webhook/stripe',
    ip: faker.internet.ip(),
    statusCode: faker.helpers.arrayElement([200, 200, 200, 408, 500]), // Majority successful
    contentType: 'application/json',
    contentLength: JSON.stringify(body).length,
    queryParams: {},
    headers: {
      'stripe-signature': faker.string.alphanumeric(90),
      'user-agent': 'Stripe/1.0 (+https://stripe.com/webhooks)',
      'content-type': 'application/json',
      accept: '*/*',
      'connect-time': faker.number.int({ min: 1, max: 100 }).toString(),
      'x-request-id': faker.string.uuid(),
      'x-stripe-client-user-agent': JSON.stringify({
        bindings_version: '1.0.0',
        lang: 'ruby',
        lang_version: '2.7.0',
        platform: 'x86_64-linux',
        publisher: 'stripe',
      }),
    },
    body: JSON.stringify(body, null, 2),
    createdAt: timestamp,
  }
})

function generateStripeWebhookBody(eventType: string) {
  const eventId = `evt_${faker.string.alphanumeric(24)}`
  const customerId = `cus_${faker.string.alphanumeric(14)}`
  const paymentIntentId = `pi_${faker.string.alphanumeric(24)}`
  const chargeId = `ch_${faker.string.alphanumeric(24)}`
  const subscriptionId = `sub_${faker.string.alphanumeric(14)}`
  const invoiceId = `in_${faker.string.alphanumeric(14)}`
  const sessionId = `cs_${faker.string.alphanumeric(24)}`

  const baseEvent = {
    id: eventId,
    object: 'event',
    api_version: '2023-10-16',
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: `req_${faker.string.alphanumeric(24)}`,
      idempotency_key: faker.string.uuid(),
    },
    type: eventType,
  }

  let data: any = {}

  switch (eventType) {
    case 'payment_intent.succeeded':
    case 'payment_intent.failed':
    case 'payment_intent.canceled':
      data = {
        object: {
          id: paymentIntentId,
          object: 'payment_intent',
          amount: faker.number.int({ min: 500, max: 100000 }),
          currency: 'usd',
          customer: customerId,
          payment_method: `pm_${faker.string.alphanumeric(24)}`,
          status: eventType.split('.')[1],
          created: Math.floor(Date.now() / 1000),
        },
      }
      break

    case 'charge.succeeded':
    case 'charge.failed':
    case 'charge.refunded':
      data = {
        object: {
          id: chargeId,
          object: 'charge',
          amount: faker.number.int({ min: 500, max: 100000 }),
          currency: 'usd',
          customer: customerId,
          payment_intent: paymentIntentId,
          status: eventType.split('.')[1],
          created: Math.floor(Date.now() / 1000),
        },
      }
      break

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      data = {
        object: {
          id: subscriptionId,
          object: 'subscription',
          customer: customerId,
          status: eventType.includes('deleted') ? 'canceled' : 'active',
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
          items: {
            object: 'list',
            data: [
              {
                id: `si_${faker.string.alphanumeric(14)}`,
                price: `price_${faker.string.alphanumeric(14)}`,
                quantity: 1,
              },
            ],
          },
        },
      }
      break

    case 'invoice.paid':
    case 'invoice.payment_failed':
    case 'invoice.upcoming':
      data = {
        object: {
          id: invoiceId,
          object: 'invoice',
          customer: customerId,
          subscription: subscriptionId,
          status: eventType.includes('paid') ? 'paid' : 'open',
          amount_due: faker.number.int({ min: 500, max: 100000 }),
          amount_paid: eventType.includes('paid')
            ? faker.number.int({ min: 500, max: 100000 })
            : 0,
          currency: 'usd',
          created: Math.floor(Date.now() / 1000),
        },
      }
      break

    case 'checkout.session.completed':
    case 'checkout.session.expired':
      data = {
        object: {
          id: sessionId,
          object: 'checkout.session',
          customer: customerId,
          payment_intent: paymentIntentId,
          subscription: subscriptionId,
          status: eventType.includes('completed') ? 'complete' : 'expired',
          amount_total: faker.number.int({ min: 500, max: 100000 }),
          currency: 'usd',
          created: Math.floor(Date.now() / 1000),
        },
      }
      break
  }

  return {
    ...baseEvent,
    data,
  }
}

async function main() {
  console.log('🌱 Seeding database...')

  try {
    await db.delete(webhooks)
    await db.insert(webhooks).values(stripeWebhooks)
    console.log('✅ Database seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }

  process.exit()
}

main()
