import fs from 'fs'

export function errorHandler(err, _req, res, _next) {
  console.error(err)
  try {
    fs.appendFileSync(
      '/tmp/tokri-api-error.log',
      `${new Date().toISOString()} ${err?.stack || err?.message || err}\n\n`,
    )
  } catch {
    // ignore log write failures
  }

  const status = err.status || err.statusCode || 500
  const message = err.message || 'Internal server error'

  res.status(status).json({
    message,
    ...(err.code ? { code: err.code } : {}),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
