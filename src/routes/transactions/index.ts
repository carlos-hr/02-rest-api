import {
  createTransactionBodySchema,
  getTransactionByIdParamsSchema,
} from './schema'
import { knex } from '../../database'

import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { validateSessionId } from '../../middlewares/validate-session-id'

export async function transactionRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [validateSessionId],
    },
    async (req, res) => {
      const { sessionId } = req.cookies
      const transactions = await knex('transactions')
        .where({ session_id: sessionId })
        .select()

      return res.status(200).send({ transactions })
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [validateSessionId],
    },
    async (req, res) => {
      const { sessionId } = req.cookies

      const { id } = getTransactionByIdParamsSchema.parse(req.params)
      const transaction = await knex('transactions')
        .select()
        .where({ id, session_id: sessionId })
        .first()

      return res.status(200).send({ transaction })
    },
  )

  app.get(
    '/balance',
    {
      preHandler: [validateSessionId],
    },
    async (req, res) => {
      const { sessionId } = req.cookies

      const balance = await knex('transactions')
        .where({ session_id: sessionId })
        .sum('amount', {
          as: 'amount',
        })
        .first()

      return res.status(200).send({ balance })
    },
  )

  app.post('/', async (req, res) => {
    const { amount, title, type } = createTransactionBodySchema.parse(req.body)

    let { sessionId } = req.cookies

    if (!sessionId) {
      sessionId = randomUUID()

      res.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return res.status(201).send()
  })
}
