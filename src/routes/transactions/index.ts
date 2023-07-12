import { createTransactionBodySchema } from './schema'
import { knex } from '../../database'

import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'

export async function transactionRoutes(app: FastifyInstance) {
  app.post('/', async (req, res) => {
    const { amount, title, type } = createTransactionBodySchema.parse(req.body)

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
    })

    return res.status(201).send()
  })
}
