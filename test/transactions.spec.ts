import req from 'supertest'
import { it, afterAll, beforeAll, describe, expect, beforeEach } from 'vitest'

import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('Transaction routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex -- migrate:rollback --all')
    execSync('npm run knex -- migrate:latest')
  })

  it('should be able to create a transaction', async () => {
    await req(app.server)
      .post('/transactions')
      .send({
        title: 'Vitest request',
        type: 'credit',
        amount: 1000,
      })
      .expect(201)
  })

  it('should be able to list all transactions', async () => {
    const newTransacationResponse = await req(app.server)
      .post('/transactions')
      .send({
        title: 'Vitest request',
        type: 'credit',
        amount: 1000,
      })

    const cookies = newTransacationResponse.get('Set-Cookie')

    const listTransactionsResponse = await req(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'Vitest request',
        amount: 1000,
      }),
    ])
  })

  it('should be able to get a transaction by it id', async () => {
    const newTransacationResponse = await req(app.server)
      .post('/transactions')
      .send({
        title: 'Vitest request',
        type: 'credit',
        amount: 1000,
      })

    const cookies = newTransacationResponse.get('Set-Cookie')

    const listTransactionsResponse = await req(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    const { id } = listTransactionsResponse.body.transactions[0]

    const transactionById = await req(app.server)
      .get(`/transactions/${id}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(transactionById.body.transaction).toEqual(
      expect.objectContaining({
        title: 'Vitest request',
        amount: 1000,
      }),
    )
  })

  it.only('should be able to get a account balance', async () => {
    const newTransacationResponse = await req(app.server)
      .post('/transactions')
      .send({
        title: 'Vitest request',
        type: 'credit',
        amount: 10000,
      })

    const cookies = newTransacationResponse.get('Set-Cookie')

    await req(app.server).post('/transactions').set('Cookie', cookies).send({
      title: 'Vitest second request',
      type: 'debit',
      amount: 1000,
    })

    const balanceResponse = await req(app.server)
      .get('/transactions/balance')
      .set('Cookie', cookies)
      .expect(200)

    expect(balanceResponse.body.balance).toEqual({ amount: 9000 })
  })
})
