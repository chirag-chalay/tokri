import React, { useEffect, useRef, useState } from 'react'
import { ApiClient } from 'adminjs'
import { logReasons } from '../../../../shared/logReasons.js'

const api = new ApiClient()
const typeLabels = { website: 'Website visits', api: 'API access', access: 'Earlier access history', error: 'Error logs', audit: 'Admin activity', debug: 'Debug logs', payment: 'Payment logs', account: 'Account creation' }
const defaults = { date: '', category: '', status: '', user: '', orderId: '', ip: '', search: '', perPage: '50' }
const labels = { date: 'Date (IST)', category: 'Log type', status: 'Status / outcome', user: 'User ID', orderId: 'Order ID / number', ip: 'IP', search: 'Search', perPage: 'Rows per page' }
const ist = (value) => value && Number.isFinite(Date.parse(value)) ? `${new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })} IST` : 'Not recorded'
const dayLabel = (value) => new Date(`${value}T00:00:00+05:30`).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' })

function DebugControls({ data, busy, unavailable, minutes, onMinutes, onAction }) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer) }, [])
  // The server's expiry is the only source of debug state. No optimistic toggle.
  const enabled = Boolean(data?.debugUntil && Date.parse(data.debugUntil) > now)
  return (
    <aside className="monitor-debug" aria-label="Debug logging controls">
      <div className="monitor-debug-heading"><strong>Debug logging</strong><span className={`monitor-badge ${enabled ? 'is-successful' : 'is-neutral'}`} role="status">{!data ? unavailable ? 'Unavailable' : 'Checking…' : enabled ? 'Enabled' : 'Disabled'}</span></div>
      <p className="monitor-muted">{!data ? unavailable ? 'The server debug status could not be loaded.' : 'Waiting for the current server debug status.' : enabled ? `Automatically disables at ${ist(data.debugUntil)}.` : 'Extra diagnostic logs are off. Enabling them is temporary.'}</p>
      {data?.canManageDebug ? <div className="monitor-debug-actions">
        {!enabled ? <label htmlFor="monitor-debug-duration">Duration <select id="monitor-debug-duration" value={minutes} disabled={busy} onChange={(event) => onMinutes(event.target.value)}>{['5', '15', '30', '60'].map((value) => <option key={value} value={value}>{value} minutes</option>)}</select></label> : null}
        <button type="button" className="monitor-primary" disabled={busy} onClick={() => onAction(enabled ? 'disable' : 'enable')}>{enabled ? 'Disable debug logging' : 'Enable debug logging'}</button>
      </div> : data ? <p className="monitor-muted">Only authorized administrators can change debug logging.</p> : null}
    </aside>
  )
}

function LogRow({ row }) {
  const view = row.presentation || {}
  const result = ['Successful', 'Failed', 'Warning', 'Pending'].includes(view.result) ? view.result : 'Warning'
  return (
    <tr className="monitor-log">
      <td data-label="Date and time" className="monitor-date">{ist(row.timestamp)}</td>
      <td data-label="Category" className="monitor-category"><span className="monitor-badge is-neutral">{view.category || 'Other'}</span></td>
      <td data-label="Person" className="monitor-person">{view.actor || 'Name not recorded'}</td>
      <td data-label="What happened" className="monitor-event">
        <strong>{view.action || 'Recorded event'}</strong>
        <p className="monitor-description">{view.description || 'An event was recorded. Further information is not available.'}</p>
        {view.details?.find(detail => detail.label === 'Why it failed') ? <p className="monitor-reason"><strong>Reason: </strong>{view.details.find(detail => detail.label === 'Why it failed').value}</p> : null}
        {view.context ? <p className="monitor-context">{view.context}</p> : null}
        {view.subject && view.subject !== 'Not recorded' ? <p className="monitor-context">{view.subject}</p> : null}
        {view.changes?.length ? <div className="monitor-changes" aria-label="Recorded changes">{view.changes.map((change) => <div className="monitor-change" key={change.label}>
          <strong>{change.label}</strong>
          <div><span>Previous</span>{change.from ?? 'Not recorded'}</div>
          <div><span>Updated</span>{change.to}</div>
        </div>)}</div> : null}
        {view.outcomeNote ? <p className="monitor-muted">{view.outcomeNote}</p> : null}
        <dl className="monitor-facts" aria-label="Event information">{view.details?.filter(detail => detail.label !== 'Why it failed').map((detail) => <div key={detail.label}><dt>{detail.label}</dt><dd>{detail.value}</dd></div>)}</dl>
      </td>
      <td data-label="Result" className="monitor-result"><span className={`monitor-badge is-${result.toLowerCase()}`}>{result}</span></td>
    </tr>
  )
}

function TechnicalMonitoring() {
  const [filters, setFilters] = useState(defaults)
  const [active, setActive] = useState(defaults)
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [debugBusy, setDebugBusy] = useState(false)
  const [minutes, setMinutes] = useState('15')
  const [refresh, setRefresh] = useState(0)
  const sequence = useRef(0)
  const debugSnapshot = useRef({ version: 0, until: null })
  useEffect(() => {
    const id = ++sequence.current
    const debugVersion = debugSnapshot.current.version
    setBusy(true)
    setError('')
    api.getPage({ pageName: 'logs', params: { ...active, page } })
      .then((response) => { if (id === sequence.current) setData(debugSnapshot.current.version !== debugVersion ? { ...response.data, debugUntil: debugSnapshot.current.until } : response.data) })
      .catch(() => { if (id === sequence.current) { setData(null); setError('Unable to load monitoring. Check your admin access or try again.') } })
      .finally(() => { if (id === sequence.current) setBusy(false) })
    return () => { sequence.current++ }
  }, [active, page, refresh])
  useEffect(() => {
    const reload = () => setRefresh((value) => value + 1)
    window.addEventListener('focus', reload)
    return () => window.removeEventListener('focus', reload)
  }, [])
  useEffect(() => {
    const stream = new EventSource('/api/v1/monitoring/stream')
    stream.onmessage = (event) => {
      try {
        const state = JSON.parse(event.data)
        debugSnapshot.current = { version: debugSnapshot.current.version + 1, until: state.debugUntil }
        setData(current => current ? { ...current, debugUntil: state.debugUntil } : current)
      } catch { /* Keep the last server deadline; it still expires locally. */ }
    }
    return () => stream.close()
  }, [])
  async function debug(action) {
    if (debugBusy) return
    setDebugBusy(true)
    setError('')
    try {
      const response = await api.getPage({ pageName: 'logs', method: 'POST', headers: { 'X-Tokri-Monitoring': '1' }, data: { action, minutes } })
      setData((current) => current ? { ...current, ...response.data } : current)
      setRefresh((value) => value + 1)
    } catch { setError('The debug change could not be confirmed. Check your admin access or ask the technical team to check monitoring storage.') }
    finally { setDebugBusy(false) }
  }
  function chooseCategory(category) {
    const selection = { ...filters, category }
    setFilters(selection); setActive(selection); setPage(1)
  }
  function chooseDay(direction) {
    const days = data?.days || []
    const index = active.date ? days.indexOf(active.date) : -1
    const day = direction === 'previous' ? days[index + 1] : days[index - 1]
    if (!day) return
    const selection = { ...filters, date: day }
    setFilters(selection); setActive(selection); setPage(1)
  }
  return (
    <section className="tokri-monitoring">
      <style>{`
        .tokri-monitoring{padding:24px;color:#16352c;font-size:14px;line-height:1.5;min-width:0}
        .tokri-monitoring *{box-sizing:border-box}
        .tokri-monitoring h1{font-size:24px;font-weight:700;margin:0 0 6px}
        .tokri-monitoring p{margin:5px 0}
        .tokri-monitoring .monitor-muted{color:#62766b;font-size:12px}
        .monitor-header{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;margin-bottom:22px}
        .monitor-heading{max-width:640px}
        .monitor-tabs{display:flex;gap:7px;overflow-x:auto;padding:5px 0 12px;border-bottom:1px solid #dce5df;margin-bottom:18px}
        .monitor-tabs button{white-space:nowrap;border-radius:20px;border-color:transparent;background:#e6ede9;padding:7px 13px}
        .monitor-tabs button[aria-pressed="true"]{background:#1e6648;color:white}
        .monitor-date-actions{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
        .monitor-resultbar{display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px}
        .monitor-context{font-size:12px;color:#62766b}
        .monitor-description{color:#16352c;line-height:1.6}
        .monitor-reason{padding:7px 10px;border-left:3px solid #b6414b;background:#fff5f5;color:#862c35;font-size:13px;line-height:1.6}
        .monitor-debug{flex:0 0 340px;max-width:100%;padding:14px 16px;border:1px solid #dce5df;border-radius:8px;background:white}
        .monitor-debug-heading{display:flex;justify-content:space-between;gap:10px;align-items:center}
        .monitor-debug-actions{display:flex;justify-content:flex-end;align-items:flex-end;flex-wrap:wrap;gap:10px;margin-top:12px}
        .monitor-debug-actions label{display:grid;gap:3px;font-size:12px}
        .tokri-monitoring input,.tokri-monitoring select{width:100%;min-width:0;border:1px solid #cbd5e1;border-radius:6px;padding:7px;background:white;color:#16352c;font-size:13px;min-height:36px}
        .tokri-monitoring button{border:1px solid #b8cac2;border-radius:6px;padding:7px 12px;background:white;color:#16352c;cursor:pointer;font-size:13px;min-height:36px}
        .tokri-monitoring button:hover:not(:disabled){background:#eaf5ee}
        .tokri-monitoring button.monitor-primary{background:#23704d;color:white;border-color:#23704d}
        .tokri-monitoring button:disabled{opacity:.5;cursor:default}
        .tokri-monitoring :is(button,input,select,summary):focus-visible{outline:2px solid #24734b;outline-offset:2px}
        .monitor-filters{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:20px 0}
        .monitor-filter{display:grid;gap:4px;font-size:12px}
        .monitor-filter-actions{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:8px}
        .monitor-alert{border-left:3px solid #b06c10;padding:6px 12px;background:#fff6e4;color:#795217;margin:10px 0}
        .monitor-table-wrap{background:white;border:1px solid #e2e9e4;border-radius:8px;overflow:hidden}
        .monitor-table{width:100%;border-collapse:collapse;text-align:left;table-layout:fixed}
        .monitor-table th{background:#f1f6f3;color:#41665a;font-size:11px;text-transform:uppercase;letter-spacing:.04em;padding:12px}
        .monitor-table th:nth-child(1){width:140px}.monitor-table th:nth-child(2){width:120px}.monitor-table th:nth-child(3){width:140px}.monitor-table th:nth-child(5){width:100px}
        .monitor-table td{padding:12px;border-bottom:1px solid #e5ece8;vertical-align:top;overflow-wrap:anywhere;min-width:0}
        .monitor-table tr:last-child td{border-bottom:0}
        .monitor-date{font-size:12px}.monitor-date small{display:block;color:#62766b;margin-top:3px}
        .monitor-badge{display:inline-block;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap}
        .is-successful{background:#e8f5ec;color:#22643c}.is-failed{background:#fdeced;color:#a12635}.is-warning{background:#fff4db;color:#825b07}.is-pending{background:#eaf0fb;color:#315a91}.is-neutral{background:#eef2f0;color:#4b6257}
        .monitor-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 16px;margin:12px 0 0;font-size:12px}
        .monitor-facts>div{min-width:0}.monitor-facts dt{color:#62766b}.monitor-facts dd{margin:1px 0 0;overflow-wrap:anywhere;color:#16352c}
        .monitor-changes{margin:10px 0;display:grid;gap:6px}
        .monitor-change{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:6px 12px;background:#f5f8f6;border-radius:6px;padding:8px 10px;font-size:12px}
        .monitor-change>strong{grid-column:1/-1}.monitor-change span{display:block;color:#62766b;font-size:11px}
        .monitor-pagination{display:flex;align-items:center;gap:10px;padding-top:16px;flex-wrap:wrap}
        @media(max-width:1100px){.monitor-header{gap:16px}.monitor-debug{flex-basis:310px}.monitor-table th,.monitor-table td{padding:10px}}
        @media(max-width:1100px){
          .tokri-monitoring{padding:16px}.tokri-monitoring h1{font-size:22px}
          .monitor-header{flex-direction:column;gap:18px}.monitor-debug{order:-1;flex-basis:auto;width:100%;align-self:flex-end}
          .monitor-filters{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
          .monitor-table-wrap{background:transparent;border:0;overflow:visible}.monitor-table,.monitor-table tbody{display:block}
          .monitor-table thead{display:none}.monitor-table tr.monitor-log{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;background:white;border:1px solid #dce5df;border-radius:8px;margin-bottom:12px;padding:14px}
          .monitor-table td{display:block;border:0;padding:0;font-size:13px}
          .monitor-date{grid-column:1}.monitor-result{grid-column:2;grid-row:1}.monitor-category{grid-column:1/-1;grid-row:2}.monitor-person{grid-column:1/-1;grid-row:3}.monitor-event{grid-column:1/-1;grid-row:4}
          .monitor-person:before{content:attr(data-label) ': ';font-size:12px;color:#62766b}
          .monitor-facts{grid-template-columns:minmax(0,1fr);gap:7px}
        }
      `}</style>
      <header className="monitor-header">
        <div className="monitor-heading"><h1>Logs &amp; Monitoring</h1><p className="monitor-muted">Read-only history · Newest entries first · All times are in IST.</p><p className="monitor-muted">Website visits and API traffic are separate. Names are shown only when known; private information stays hidden.</p></div>
        <DebugControls data={data} busy={debugBusy} unavailable={Boolean(error) && !data} minutes={minutes} onMinutes={setMinutes} onAction={debug} />
      </header>
      <nav className="monitor-tabs" aria-label="Log categories">
        {[['', 'All records'], ...Object.entries(typeLabels).filter(([key]) => key !== 'access')].map(([category, label]) => <button type="button" key={category} aria-pressed={active.category === category} disabled={debugBusy} onClick={() => chooseCategory(category)}>{label}</button>)}
      </nav>
      <form className="monitor-filters" onSubmit={(event) => { event.preventDefault(); setPage(1); setActive({ ...filters }) }}>
        {Object.entries(filters).filter(([key]) => key !== 'category').map(([key, value]) => <div className="monitor-filter" key={key}>
          <label htmlFor={`monitoring-${key}`}>{labels[key]}</label>
          {['category', 'perPage', 'status'].includes(key) ? <select id={`monitoring-${key}`} value={value} onChange={(event) => setFilters({ ...filters, [key]: event.target.value })}>{(key === 'status' ? ['', 'Successful', 'Failed', 'Warning', 'Pending'] : key === 'category' ? ['', ...Object.keys(typeLabels)] : ['50', '100']).map((option) => <option key={option} value={option}>{key === 'status' ? option || 'All outcomes' : key === 'category' ? typeLabels[option] || 'All types' : option}</option>)}</select> : <input id={`monitoring-${key}`} type={key === 'date' ? 'date' : 'text'} value={value} maxLength={100} onChange={(event) => setFilters({ ...filters, [key]: event.target.value })} />}
        </div>)}
        <div className="monitor-filter-actions"><button className="monitor-primary" type="submit" disabled={busy}>Apply filters</button><button type="button" disabled={busy} onClick={() => { setPage(1); setRefresh((value) => value + 1) }}>Refresh latest</button></div>
      </form>
      {error ? <p role="alert" className="monitor-alert">{error}</p> : null}
      {data ? <>
        {data.storageError ? <p role="alert" className="monitor-alert">The log files could not be opened. Ask the technical team to check storage access.</p> : null}
        <div className="monitor-resultbar"><p aria-live="polite" className="monitor-muted">{busy ? 'Loading…' : `${data.total} matching rows · Page ${data.page}`}</p><div className="monitor-date-actions"><span className="monitor-muted">{active.date ? dayLabel(active.date) : 'All recorded days'} · IST</span><button type="button" disabled={busy || !(data.days || [])[active.date ? (data.days || []).indexOf(active.date) + 1 : 0]} onClick={() => chooseDay('previous')}>Previous day</button><button type="button" disabled={busy || !active.date || (data.days || []).indexOf(active.date) <= 0} onClick={() => chooseDay('next')}>Next day</button></div></div>
        <div className="monitor-table-wrap"><table className="monitor-table">
          <thead><tr>{['Date & time (IST)', 'Category', 'Person', 'What happened', 'Result'].map((title) => <th key={title} scope="col">{title}</th>)}</tr></thead>
          <tbody>{data.rows.map((row, index) => <LogRow key={row.eventId || `${row.file}-${row.timestamp}-${index}`} row={row} />)}</tbody>
        </table>{!busy && !data.rows.length ? <p style={{ padding: 14 }}>No matching log entries.</p> : null}</div>
        <nav className="monitor-pagination" aria-label="Log pages"><button type="button" disabled={busy || page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span className="monitor-muted">Page {data.page}</span><button type="button" disabled={busy || page * data.perPage >= data.total} onClick={() => setPage((value) => value + 1)}>Next</button></nav>
        <p className="monitor-muted" style={{ marginTop: 16 }}>Daily files are retained securely on the server. <button type="button" disabled={busy} onClick={() => chooseCategory('access')}>Earlier access history</button></p>
      </> : null}
    </section>
  )
}

const reasonText = Object.fromEntries(Object.entries(logReasons).map(([code, [label]]) => [code, label]))
const columns = [
  ['timestamp', 'Time (IST)'], ['who', 'Who'], ['where', 'Where'], ['pincode', 'Pincode'],
  ['action', 'What happened'], ['result', 'Result'], ['why', 'Why'], ['device', 'Device'], ['source', 'Source'],
]
const visitDefaults = { from: '', to: '', status: '', reason: '', pin: '', coverage: '', device: '', source: '', search: '', customerOnly: true }
const istDay = (daysAgo = 0) => new Date(Date.now() + 330 * 60000 - daysAgo * 86400000).toISOString().slice(0, 10)
const displayDay = iso => iso.split('-').reverse().join('/')
function parseLogDate(value) {
  if (value === '') return ''
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim())
  if (!match) return null
  const date = match[3] + '-' + match[2] + '-' + match[1]
  const parsed = new Date(date)
  return Number.isFinite(+parsed) && parsed.toISOString().slice(0, 10) === date ? date : null
}
const makeDateRange = days => ({ from: displayDay(istDay(days - 1)), to: displayDay(istDay()) })
const initialFilters = tab => ({ ...visitDefaults, ...makeDateRange(1), customerOnly: tab !== 'admin' })

function LogTrend({ today, yesterday }) {
  if (today === undefined || yesterday === undefined) return null
  const sign = today > yesterday ? '↑' : today < yesterday ? '↓' : '→'
  return <small className="business-trend"><span aria-hidden="true">{sign}</span> Today {today} · Yesterday {yesterday}</small>
}

function WeeklyLogInsights({ insights, alertEnabled }) {
  if (!insights) return null
  const { demand, checkout, peak, city } = insights
  return <section className="business-insights" aria-label="This week’s activity insights">
    <h2>This week</h2>
    <dl>
      <div><dt>Unserviceable demand</dt><dd>{demand ? <>{demand.pin} checked {demand.count} {demand.count === 1 ? 'time' : 'times'}. Consider expanding delivery.</> : 'No unserviceable pincode checks recorded.'}</dd></div>
      <div><dt>Guest checkout drop-off</dt><dd>{checkout.reached ? <>{Math.round(100 * checkout.blocked / checkout.reached)}% hit the sign-in requirement ({checkout.blocked} of {checkout.reached} website guest sessions).</> : 'No website guest checkout sessions recorded.'}</dd></div>
      <div><dt>Busiest hour and top city</dt><dd>{peak ? peak.hour + ':00–' + String((Number(peak.hour) + 1) % 24).padStart(2, '0') + ':00 IST · ' + peak.count + ' events' : 'No customer activity recorded.'}
        {city && <><br />{city.name}{city.approximate ? ' (includes approximate locations)' : ''} · {city.count} events</>}</dd></div>
      <div><dt>Hourly failure alert</dt><dd>{alertEnabled ? 'Email alerts enabled' : 'Email alerts awaiting setup'}</dd></div>
    </dl>
  </section>
}
const sources = ['Website', 'Android app', 'iPhone app', 'Backoffice', 'Payment provider', 'Server API', 'System']
const tabs = { website: 'Website', app: 'Mobile App (API)', errors: 'Errors', admin: 'Admin/System' }

async function businessQuery(filters, page, extra = {}) {
  const { search, from, to, ...rest } = filters
  const start = parseLogDate(from), end = parseLogDate(to)
  if (start === null || end === null || start && end && start > end) throw new Error('Enter a valid date range in dd/mm/yyyy format.')
  const value = search.trim()
  const lookup = !value ? {} : /^[a-f0-9-]{36}$/.test(value) ? { visitSession: value } : { phone: value }
  const result = await api.getPage({ pageName: 'logs', method: 'POST', headers: { 'X-Tokri-Monitoring': '1' }, data: { action: 'business-read', filters: { ...rest, from: start, to: end, ...lookup, page, ...extra } } })
  if (result.data.storageError) throw new Error('Logs unavailable')
  return result.data
}

function BusinessMonitoring({ tab, onTab, access, onTechnical }) {
  const [draft, setDraft] = useState(() => initialFilters(tab))
  const [active, setActive] = useState(() => initialFilters(tab))
  const [data, setData] = useState(null)
  const [insights, setInsights] = useState(null)
  const [page, setPage] = useState(1)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [journey, setJourney] = useState(null)
  const [exporting, setExporting] = useState(false)
  const dialog = useRef(null)

  useEffect(() => {
    let current = true
    setBusy(true)
    setError('')
    businessQuery(active, page, { tab })
      .then(result => { if (current) { setData(result); if (result.insights) setInsights(result.insights) } })
      .catch(() => { if (current) { setData(null); setError('Could not load the logs. Check the filters and try again.') } })
      .finally(() => { if (current) setBusy(false) })
    return () => { current = false }
  }, [active, page, tab])

  async function showJourney() {
    const row = selected
    setJourney({ loading: true })
    try {
      const result = await businessQuery(visitDefaults, 1, { tab, visitSession: row.sessionId, journey: '1', perPage: '100' })
      setJourney({ rows: result.rows, total: result.total })
    } catch { setJourney({ error: 'Could not load this visit. Try again.' }) }
  }

  async function exportCsv() {
    setExporting(true)
    try {
      const result = await businessQuery(active, 1, { tab, export: 'csv' })
      const url = URL.createObjectURL(new Blob(['\uFEFF', result.csv], { type: 'text/csv;charset=utf-8' }))
      const link = document.createElement('a')
      link.href = url
      link.download = 'tokriii-logs.csv'
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      if (result.total > result.count) setError('CSV contains the newest 5,000 rows. Choose a shorter date range to export the remaining rows.')
    } catch { setError('Could not download the logs. Try again.') }
    finally { setExporting(false) }
  }

  function openDetails(row) {
    setSelected(row)
    setJourney(null)
    dialog.current.showModal()
  }

  function applyFilters(filters) {
    const start = parseLogDate(filters.from), end = parseLogDate(filters.to)
    if (start === null || end === null || start && end && start > end) {
      setError('Enter a valid date range in dd/mm/yyyy format.')
      return
    }
    setPage(1)
    setDraft(filters)
    setActive({ ...filters })
  }

  const summary = data?.summary
  const trend = insights?.trends?.[tab]
  const top = entries => Object.entries(entries || {}).sort((a, b) => b[1] - a[1]).slice(0, 3)
  const period = active.from || active.to ? [active.from || 'Earliest', active.to || 'Today'].join(' – ') + ' · IST' : 'Last 24 hours'
  const pageCount = Math.max(1, Math.ceil((data?.total || 0) / (data?.perPage || 50)))
  const first = data?.total ? (page - 1) * data.perPage + 1 : 0
  const last = Math.min(page * (data?.perPage || 50), data?.total || 0)
  const fullPhoneSearch = access.fullAccess
  const update = event => {
    const { name, value } = event.target
    const digits = value.replace(/\D/g, '').slice(0, 8)
    const date = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('/')
    setDraft({ ...draft, [name]: name === 'from' || name === 'to' ? date : value })
  }

  return <section className="business-logs">
    <style>{`
      .business-logs{padding:clamp(12px,3vw,32px);color:#16352c;background:#f5f8f6;min-height:100vh}
      .business-logs h1{font-size:26px;margin:0}.business-logs h2{font-size:16px;margin:0 0 8px}
      .business-logs p{margin:6px 0}.business-logs button{border:1px solid #b9cfc3;background:#fff;border-radius:6px;padding:8px 12px;cursor:pointer;color:#16352c}
      .business-logs button:disabled{opacity:.55;cursor:default}.business-logs button:focus-visible,.business-logs input:focus-visible,.business-logs select:focus-visible{outline:2px solid #23704d}
      .business-top,.business-actions{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
      .business-tabs{justify-content:flex-start;margin-top:12px}.business-tabs button[aria-pressed=true]{background:#174d3b;color:#fff}
      .business-cards,.business-filters{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(155px,100%),1fr));gap:10px;margin:14px 0}
      .business-cards article,.business-table{background:#fff;border:1px solid #dce5df;border-radius:8px;padding:12px}
      .business-cards ul{margin:0;padding-left:16px}.business-filters label{display:grid;gap:4px;font-size:13px}
      .business-filters :is(input,select){width:100%;min-width:0;min-height:36px;border:1px solid #bbcfc5;border-radius:6px;padding:6px;background:#fff;color:#16352c}
      .business-table{overflow:auto;max-height:62vh;padding:0}.business-table table{border-collapse:separate;border-spacing:0;width:100%;text-align:left;table-layout:fixed}
      .business-table :is(th,td){padding:8px 10px;border-bottom:1px solid #e7eee9;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .business-table th{position:sticky;top:0;background:#ecf4ef;z-index:1}
      .business-table tbody tr{cursor:pointer}.business-table tbody tr:hover,.business-table tbody tr:focus-within{background:#f1f6f3}
      .business-table .business-detail-trigger{display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0;border:0;background:transparent;text-decoration:underline;text-underline-offset:3px;text-align:left}
      .business-badge{display:inline-block;padding:4px 8px;border-radius:999px;font-size:12px;font-weight:700;background:#eef2f0;color:#405b4d}
      .business-badge[data-result=Failed]{background:#fbe8eb;color:#921d2e}.business-badge[data-result=Successful]{background:#e3f4e8;color:#21603a}
      .business-quick{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
      .business-trend{display:block;color:#435f52;margin-top:5px}
      .business-cards li + li{margin-top:5px}.business-cards button{white-space:normal;text-align:left}
      .business-insights{margin:12px 0;padding:12px;background:#fff;border:1px solid #dce5df;border-radius:8px}
      .business-insights dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(190px,100%),1fr));gap:10px;margin:0}
      .business-table td:first-child,.business-table th:first-child{width:15%}
      .business-table th:nth-child(5){width:18%}.business-table th:nth-child(6){width:100px}
      .business-logs dialog{position:fixed;inset:0 0 0 auto;margin:0;height:100dvh;max-height:100dvh;width:min(100vw,440px);max-width:100vw;padding:20px;border:1px solid #bcd1c5;background:#fff;color:#16352c}
      .business-logs dialog::backdrop{background:#15382d59}.business-logs dd{overflow-wrap:anywhere;margin:3px 0 12px}.business-logs dt{font-weight:600}.business-journey li{margin-bottom:12px}
      @media(max-width:950px){
        .business-table{background:transparent;border:0;max-height:none}
        .business-table :is(table,tbody){display:block}.business-table thead{position:absolute;clip-path:inset(50%);width:1px;height:1px;overflow:hidden}
        .business-table tr{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:4px 8px;margin-bottom:10px;padding:10px;background:#fff;border:1px solid #dce5df;border-radius:8px}
        .business-table td,.business-table td:first-child{display:block;width:auto;white-space:normal;overflow-wrap:anywhere;padding:4px;border:0}
        .business-table td::before{content:attr(data-label);display:block;font-size:11px;font-weight:600;color:#52665c}
        .business-table td[data-label="What happened"]{grid-column:1/-1}.business-table .business-detail-trigger{white-space:normal}
      }
    `}</style>
    <header className="business-top"><div><h1>Customer activity logs</h1><p>{period}</p></div>{onTechnical && <button type="button" onClick={onTechnical}>Technical logs</button>}</header>
    <nav className="business-actions business-tabs" aria-label="Log tabs">
      {Object.entries(tabs).map(([key, label]) =>
        <button type="button" key={key} aria-pressed={tab === key} onClick={() => onTab(key)}>{label}</button>)}
    </nav>
    <p>{tab === 'admin' ? 'Kept for 1 year' : 'Kept for ' + access.activityDays + ' days'}</p>
    <div className="business-cards">
      <article><h2>Failed checkouts</h2><button type="button" onClick={() => applyFilters({ ...active, status: 'Failed', reason: '', checkoutOnly: true })}>{summary?.failedCheckouts ?? 'Unknown'}</button>
        <LogTrend today={trend?.today.failedCheckouts} yesterday={trend?.yesterday.failedCheckouts} /></article>
      <article><h2>Top failure reasons</h2>{top(summary?.reasons).length ? <ul>{top(summary.reasons).map(([code, count]) => <li key={code}><button type="button" onClick={() => applyFilters({ ...active, status: 'Failed', reason: code, checkoutOnly: false })}>{reasonText[code]} ({count})</button></li>)}</ul> : <p>{summary ? 'None recorded' : 'Unknown'}</p>}
        {summary?.unclassified > 0 && <button type="button" onClick={() => applyFilters({ ...active, status: 'Failed', reason: 'UNKNOWN', checkoutOnly: false })}>{summary.unclassified} without a recorded cause</button>}</article>
      <article><h2>Unserviceable pincodes</h2>{top(summary?.pincodes).length ? <ul>{top(summary.pincodes).map(([pin, count]) => <li key={pin}><button type="button" onClick={() => applyFilters({ ...active, pin, reason: 'PINCODE_NOT_SERVICEABLE', coverage: '', status: 'Failed', checkoutOnly: false })}>{pin} ({count})</button>
        <LogTrend today={trend?.today.pincodes[pin] ?? (trend ? 0 : undefined)} yesterday={trend?.yesterday.pincodes[pin] ?? (trend ? 0 : undefined)} /></li>)}</ul> : <p>{summary ? 'None recorded' : 'Unknown'}</p>}</article>
      <article><h2>Website vs app activity</h2><p>Website {summary?.website ?? 'Unknown'}</p><p>App {summary?.app ?? 'Unknown'}</p><LogTrend today={trend?.today.activity} yesterday={trend?.yesterday.activity} /></article>
    </div>
    {tab !== 'admin' && <WeeklyLogInsights insights={insights} alertEnabled={access.failureAlertEnabled} />}
    <div className="business-quick">
      {[[1, 'Today'], [7, '7 days'], [30, '30 days']].map(([days, label]) => <button type="button" key={days} onClick={() => applyFilters({ ...draft, ...makeDateRange(days) })}>{label}</button>)}
      {tab !== 'admin' && <label><input type="checkbox" checked={active.customerOnly} onChange={event => applyFilters({ ...active, customerOnly: event.target.checked })} /> Customer activity only</label>}
      {active.checkoutOnly && <button type="button" onClick={() => applyFilters({ ...active, checkoutOnly: false })}>Clear checkout filter</button>}
    </div>
    <form onSubmit={event => { event.preventDefault(); applyFilters(draft) }}>
      <div className="business-filters">
        <label>From<input name="from" inputMode="numeric" placeholder="dd/mm/yyyy" maxLength={10} value={draft.from} onChange={update} /></label>
        <label>To<input name="to" inputMode="numeric" placeholder="dd/mm/yyyy" maxLength={10} value={draft.to} onChange={update} /></label>
        <label>Result<select name="status" value={draft.status} onChange={update}><option value="">All</option><option>Failed</option><option>Successful</option></select></label>
        <label>Reason<select name="reason" value={draft.reason} onChange={update}><option value="">All reasons</option>{Object.entries(reasonText).map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></label>
        <label>Pincode<input name="pin" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={draft.pin} onChange={update} /></label>
        <label>Delivers<select name="coverage" value={draft.coverage} onChange={update}><option value="">All</option><option value="true">Yes</option><option value="false">No</option></select></label>
        <label>Device<select name="device" value={draft.device} onChange={update}><option value="">All devices</option><option value="website">Website</option><option value="app">App</option></select></label>
        <label>Source<select name="source" value={draft.source} onChange={update}><option value="">All sources</option>{sources.map(source => <option key={source}>{source}</option>)}</select></label>
        <label>{fullPhoneSearch ? 'Session ID or phone' : 'Session ID or masked phone'}<input name="search" maxLength={40} value={draft.search} onChange={update} placeholder={fullPhoneSearch ? 'Exact session ID or phone' : 'Session ID or 98XXXXXX21'} /></label>
      </div>
      <div className="business-actions"><button type="submit" disabled={busy}>Apply filters</button><button type="button" onClick={exportCsv} disabled={busy || exporting || !data}>Export CSV</button></div>
    </form>
    {error && <p role="alert">{error}</p>}
    <p aria-live="polite">{busy ? 'Loading activity…' : data?.total ? data.total + ' matching events' : 'No matching activity'}</p>
    <div className="business-table"><table><thead><tr>{columns.map(([key, label]) => <th key={key} scope="col">{label}</th>)}</tr></thead><tbody>
      {(data?.rows || []).map((row, index) => <tr key={row.eventId || row.timestamp + index} onClick={() => openDetails(row)}>
        {columns.map(([key, label]) => <td key={key} data-label={label} title={key === 'timestamp' || key === 'result' ? undefined : row[key]}>
          {key === 'timestamp' ? row.timestamp ? ist(row.timestamp) : 'Unknown'
            : key === 'result' ? <span className="business-badge" data-result={row.result}>{row.result}</span>
            : key === 'action' ? <button type="button" className="business-detail-trigger" aria-label={'View details for ' + row.action} onClick={event => { event.stopPropagation(); openDetails(row) }}>{row.action}</button>
            : row[key] || 'Unknown'}
        </td>)}
      </tr>)}
    </tbody></table></div>
    <nav className="business-actions" aria-label="Log pages">
      <button type="button" disabled={busy || page <= 1} onClick={() => setPage(1)}>First</button>
      <button type="button" disabled={busy || page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
      <span>Page {page} of {pageCount} · {first}–{last} of {data?.total || 0}</span>
      <button type="button" disabled={busy || page >= pageCount} onClick={() => setPage(page + 1)}>Next</button>
      <button type="button" disabled={busy || page >= pageCount} onClick={() => setPage(pageCount)}>Last</button>
    </nav>
    <dialog ref={dialog} onClose={() => { setSelected(null); setJourney(null) }}>
      <form method="dialog"><button autoFocus>Close</button></form>
      {selected && <><h2>{selected.action}</h2><p>{selected.why}</p>{selected.hint && <p>{selected.hint}</p>}
        <dl>{Object.entries({ Who: selected.who, Where: selected.where, Pincode: selected.pincode, Device: selected.device, Source: selected.source, ...selected.details }).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value || (selected.who === 'System' ? 'Not applicable' : 'Unknown')}</dd></div>)}</dl>
        {selected.sessionId && <button type="button" onClick={showJourney}>Show visitor journey</button>}
        {journey?.loading && <p>Loading journey…</p>}{journey?.error && <p role="alert">{journey.error}</p>}
        {journey?.rows && <><h2>Visitor journey</h2>{journey.total > journey.rows.length && <p>Showing the oldest {journey.rows.length} events.</p>}<ol className="business-journey">{journey.rows.map((row, index) => <li key={row.eventId || row.timestamp + index}><strong>{row.action} · {row.result}</strong><br />{ist(row.timestamp)} · {row.pincode}</li>)}</ol></>}
      </>}
    </dialog>
  </section>
}

export default function Monitoring() {
  const [technical, setTechnical] = useState(false)
  const [access, setAccess] = useState(null)
  const [tab, setTab] = useState('website')
  const [unavailable, setUnavailable] = useState(false)
  useEffect(() => {
    let active = true
    api.getPage({ pageName: 'logs', params: { view: 'access' } }).then(({ data }) => {
      if (!active) return
      setAccess(data)
    }).catch(() => { if (active) setUnavailable(true) })
    return () => { active = false }
  }, [])
  if (!access) return <p role="status">{unavailable ? 'Could not open logs. Refresh to try again.' : 'Loading logs…'}</p>
  return <>
    {technical && access.fullAccess ? <><button type="button" onClick={() => setTechnical(false)}>Back to customer activity</button><TechnicalMonitoring /></>
    : <BusinessMonitoring key={tab} tab={tab} onTab={setTab} access={access} onTechnical={access.fullAccess ? () => setTechnical(true) : undefined} />}
    {access.ipLocationProvider === 'db-ip' && <footer style={{ padding: '12px 24px' }}>
      <a href="https://db-ip.com">IP Geolocation by DB-IP</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>
    </footer>}
  </>
}
