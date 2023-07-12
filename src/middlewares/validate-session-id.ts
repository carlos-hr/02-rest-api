import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'

export function validateSessionId(
  req: FastifyRequest,
  res: FastifyReply,
  done: HookHandlerDoneFunction,
) {
  const { sessionId } = req.cookies

  if (!sessionId) {
    return res.status(401).send({
      error: 'Unauthorized',
    })
  }

  done()
}
