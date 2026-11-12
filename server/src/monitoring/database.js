import { Prisma } from '@prisma/client'
import { log, logContext, logConfig, prepareLogRecord, configureDurableLogging, deliverOutboxRecord, reportRecordUndelivered } from './index.js'
import { safeSnapshot } from './sanitize.js'
import { createCriticalOutbox } from './outbox.js'

const mutations = new Set(['create', 'update', 'delete', 'upsert', 'createMany', 'updateMany', 'deleteMany'])
const models = new Map(Object.values(Prisma.ModelName).map((name) => [name[0].toLowerCase() + name.slice(1), name]))
const modelDefinitions = new Map(Prisma.dmmf.datamodel.models.map((model) => [model.name, model]))
const quote = (name) => '`' + name.replaceAll('`', '``') + '`'
async function snapshot(target, key, model, where, locking) {
  const definition = modelDefinitions.get(model)
  const field = definition?.fields.find((f) => (f.isId || f.isUnique) && ['string', 'number'].includes(typeof where?.[f.name]))
  if (locking && field && target.$queryRawUnsafe) {
    const rows = await target.$queryRawUnsafe(`SELECT * FROM ${quote(definition.dbName || model)} WHERE ${quote(field.dbName || field.name)} = ? FOR UPDATE`, where[field.name])
    const row = rows[0]
    if (row) for (const f of definition.fields) if (f.type === 'Boolean' && row[f.name] != null) row[f.name] = Boolean(row[f.name])
    return row || null
  }
  return target[key].findUnique({ where })
}
const seenErrors = new WeakSet()
export function logError(error, source = 'application') {
  const context = logContext.getStore()
  if (context?.telemetryRequest) return // Invalid optional telemetry must not create logging loops.
  if (context && !context.accessError) context.accessError = { source, errorKind: error instanceof Error ? error.constructor.name.replace(/[^a-zA-Z]/g, '').slice(0, 60) : 'Error', code: /^[A-Z][A-Z0-9_]{1,60}$/.test(error?.code || '') ? error.code : undefined }
  if (error && typeof error === 'object') {
    if (seenErrors.has(error)) return
    seenErrors.add(error)
  }
  log('debug', 'backend.operation.failed', { source, status: Number(error?.status || error?.statusCode) || 500, errorKind: error instanceof Error ? error.constructor.name.replace(/[^a-zA-Z]/g, '').slice(0, 60) : 'Error', code: /^[A-Z][A-Z0-9_]{1,60}$/.test(error?.code || '') ? error.code : undefined })
  log('error', 'operation.failed', { source, status: Number(error?.status || error?.statusCode) || 500,
    code: /^[A-Z][A-Z0-9_]{1,60}$/.test(error?.code || '') ? error.code : undefined,
    errorKind: error instanceof Error ? error.constructor.name.replace(/[^a-zA-Z]/g, '').slice(0, 60) : 'Error' })
}

export function instrumentPrisma(client, { store } = {}) {
  if (!store && client.monitoringOutbox && client.monitoringOutboxBudget) {
    store = createCriticalOutbox(client, { deliver: deliverOutboxRecord, alert: reportRecordUndelivered, logRetentionDays: logConfig.retentionDays })
    configureDurableLogging(store)
  }
  const tasks = new WeakMap()
  async function runInTransaction(work, options) {
    await store?.initialize().catch(() => {})
    const parent = logContext.getStore()
    const scope = { active: true, client: undefined, afterCommit: [] }
    const context = { ...parent, transaction: scope }
    try {
      const result = await client.$transaction(async (tx) => {
        scope.client = tx
        return logContext.run(context, () => work(tx))
      }, options)
      scope.active = false
      if (parent && context.auditRecorded) parent.auditRecorded = true
      for (const callback of scope.afterCommit) callback()
      store?.wake()
      return result
    } catch (error) { logError(error, 'database-transaction'); throw error }
    finally { scope.active = false }
  }
  async function execute(target, descriptor) {
    const { key, model, operation, callArgs } = descriptor
    const args = callArgs[0] || {}
    const context = logContext.getStore()
    const admin = context?.req?.session?.adminUser
    const mutation = mutations.has(operation) && !model?.startsWith('MonitoringOutbox')
    const critical = mutation && (admin || (model === 'Order' && (operation === 'create' || args.data?.paymentStatus || args.data?.paymentCollectedAs)))
    if (critical && store?.enabled && !context?.transaction?.active) return runInTransaction((tx) => execute(tx, descriptor))
    let previous
    if (admin && mutation && ['update', 'upsert'].includes(operation)) {
      try { previous = await snapshot(target, key, model, args.where, context?.transaction?.active) } catch { /* snapshot absence is explicitly annotated */ }
    }
    let result
    try { result = key ? await target[key][operation](...callArgs) : await target[operation](...callArgs) }
    catch (error) { logError(error, 'database'); throw error }
    if (!mutation) return result
    const events = []
    if (admin) {
      if (context) context.auditRecorded = true
      events.push(['audit', `${model}.${operation}`, { model, operation, resourceId: result?.id || args.where?.id,
        status: 'success', changedFields: Object.keys(args.data || args.update || args.create || {}).slice(0, 100),
        old: operation === 'delete' ? safeSnapshot(result) : safeSnapshot(previous),
        new: operation === 'delete' ? null : operation.endsWith('Many') ? { ...safeSnapshot(args.data || {}), ...safeSnapshot(result) } : safeSnapshot(result), count: result?.count,
        reason: operation.endsWith('Many') ? 'bulk-summary' : !previous && operation === 'update' ? 'previous-snapshot-unavailable' : undefined }])
    }
    if (model === 'Order' && result?.count !== 0 && !(previous && previous.paymentStatus === result?.paymentStatus && previous.paymentCollectedAs === result?.paymentCollectedAs) && (operation === 'create' || args.data?.paymentStatus || args.data?.paymentCollectedAs)) {
      events.push(['payment', operation === 'create' ? 'order.payment.created' : 'order.payment.updated', {
        orderId: result?.id || args.where?.id, orderNo: result?.orderNo, status: result?.paymentStatus || args.data?.paymentStatus,
        paymentMode: result?.paymentMode || args.data?.paymentMode, paymentCollectedAs: result?.paymentCollectedAs || args.data?.paymentCollectedAs,
        razorpayPaymentId: result?.razorpayPaymentId || args.data?.razorpayPaymentId, count: result?.count }])
    }
    for (const [category, event, details] of events) {
      const entry = prepareLogRecord(category, event, details)
      if (store?.enabled) await store.appendInTransaction(target, category, entry)
      else if (context?.transaction?.active) context.transaction.afterCommit.push(() => log(category, event, details))
      else log(category, event, details)
    }
    if (['Customer', 'User'].includes(model) && operation === 'create') {
      const emit = () => log('account', `${model}.created`, { resourceId: result?.id, userId: result?.id, role: result?.role, status: 'success' })
      if (context?.transaction?.active) context.transaction.afterCommit.push(emit)
      else emit()
    }
    return result
  }
  function task(descriptor, target) {
    const state = { started: false, promise: undefined, descriptor }
    const consume = () => {
      if (!state.started) {
        state.started = true
        const scope = logContext.getStore()?.transaction
        state.promise = execute(scope?.active ? scope.client : target, descriptor)
      }
      return state.promise
    }
    const query = {
      then: (resolve, reject) => consume().then(resolve, reject),
      catch: (reject) => consume().catch(reject),
      finally: (callback) => consume().finally(callback),
      [Symbol.toStringTag]: 'PrismaPromise',
    }
    tasks.set(query, state)
    return query
  }
  function wrap(target) {
    const delegates = new Map()
    return new Proxy(target, { get(raw, key) {
      if (key === '$disconnect' && typeof raw.$disconnect === 'function') return async () => { await store?.stop(); return raw.$disconnect() }
      if (key === '$transaction' && typeof raw.$transaction === 'function') return (input, options) => {
        if (typeof input === 'function') return runInTransaction((tx) => input(wrap(tx)), options)
        if (!Array.isArray(input)) throw new TypeError('Expected a transaction callback or query array')
        const states = input.map((query) => tasks.get(query))
        if (states.some((state) => !state || state.started)) throw new TypeError('Transaction arrays require unconsumed queries from this client')
        for (const state of states) state.started = true
        const transaction = runInTransaction(async (tx) => {
          const results = []
          for (const state of states) results.push(await execute(tx, state.descriptor))
          return results
        }, options)
        states.forEach((state, i) => { state.promise = transaction.then((results) => results[i]); state.promise.catch(() => {}) })
        return transaction
      }
      if (['$queryRaw', '$executeRaw', '$queryRawUnsafe', '$executeRawUnsafe'].includes(key)) return (...callArgs) => task({ operation: key, callArgs }, raw)
      const value = Reflect.get(raw, key)
      if (models.has(key) && value) {
        if (!delegates.has(key)) {
          const overrides = new Map()
          delegates.set(key, new Proxy(value, {
            get(delegate, operation) {
              if (overrides.has(operation)) return overrides.get(operation)
              const method = Reflect.get(delegate, operation)
              return typeof method === 'function' ? (...callArgs) => task({ key, model: models.get(key), operation, callArgs }, raw) : method
            },
            set(_delegate, operation, method) { overrides.set(operation, method); return true },
          }))
        }
        return delegates.get(key)
      }
      return typeof value === 'function' ? value.bind(raw) : value
    } })
  }
  return wrap(client)
}
