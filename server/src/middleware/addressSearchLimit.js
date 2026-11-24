// Bounded process-local limiter. Configure an upstream shared limit on multi-node
// deployments; IPs come from Express trust proxy configuration, never raw XFF.
export function addressSearchLimit({ limit = 30, interval = 60000, maxKeys = 5000, now = Date.now } = {}) {
  const clients = new Map()
  return (req, res, next) => {
    const time = now(), key = req.ip || req.socket?.remoteAddress || 'unknown'
    for (const [ip, value] of clients) if (value.expires <= time) clients.delete(ip)
    let client = clients.get(key)
    if (!client && clients.size >= maxKeys) return res.status(429).set('Retry-After', '60').json({ message: 'Address search is busy. Please enter your address manually.' })
    if (!client) { client = { count: 0, expires: time + interval }; clients.set(key, client) }
    if (++client.count > limit) return res.status(429).set('Retry-After', String(Math.ceil((client.expires - time) / 1000))).json({ message: 'Too many address searches. Please enter your address manually or try again shortly.' })
    next()
  }
}
