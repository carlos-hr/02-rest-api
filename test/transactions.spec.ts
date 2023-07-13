import req from 'supertest'
import { it, afterAll, beforeAll, describe } from 'vitest'

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
})
