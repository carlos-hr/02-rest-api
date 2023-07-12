import { FastifyReply, FastifyRequest } from 'fastify'

export function validateSessionId(req: FastifyRequest, res: FastifyReply) {
  const { sessionId } = req.cookies

  if (!sessionId) {
    return res.status(401).send({
      error: 'Unauthorized',
    })
  }
}
