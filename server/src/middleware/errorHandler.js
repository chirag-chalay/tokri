import { logError } from '../monitoring/database.js'

export function errorHandler(err, _req, res, _next) {
  logError(err, 'api')

  const status = err.status || err.statusCode || 500
  const message = err.message || 'Internal server error'

  res.status(status).json({
    message,
    ...(err.code ? { code: err.code } : {}),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
