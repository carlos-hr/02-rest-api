import req from 'supertest'
import { it, afterAll, beforeAll, describe, expect } from 'vitest'

import { app } from '../src/app'

describe('Transaction routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
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

  it.only('should be able to list all transactions', async () => {
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
})
