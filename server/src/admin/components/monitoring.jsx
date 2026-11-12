import React, { useEffect, useRef, useState } from 'react'
import { ApiClient } from 'adminjs'

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

export default function Monitoring() {
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
