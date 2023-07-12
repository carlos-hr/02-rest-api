import {
  createTransactionBodySchema,
  getTransactionByIdParamsSchema,
} from './schema'
import { knex } from '../../database'

import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'

export async function transactionRoutes(app: FastifyInstance) {
  app.get('/', async (req, res) => {
    const transactions = await knex('transactions').select()

    return res.status(200).send({ transactions })
  })

  app.get('/:id', async (req, res) => {
    const { id } = getTransactionByIdParamsSchema.parse(req.params)
    const transaction = await knex('transactions')
      .select()
      .where({ id })
      .first()

    return res.status(200).send({ transaction })
  })

  app.get('/balance', async (_, res) => {
    const balance = await knex('transactions')
      .sum('amount', {
        as: 'amount',
      })
      .first()

    return res.status(200).send({ balance })
  })

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
