import {
  createTransactionBodySchema,
  getTransactionByIdParamsSchema,
} from './schema'
import { knex } from '../../database'

import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'

export async function transactionRoutes(app: FastifyInstance) {
  app.get('/', async (_, res) => {
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
