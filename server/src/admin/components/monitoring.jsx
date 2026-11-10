import React, { useEffect, useRef, useState } from 'react'
import { ApiClient } from 'adminjs'

const api = new ApiClient()
const typeLabels = { access: 'Access logs', error: 'Error logs', audit: 'Admin activity', debug: 'Debug logs', payment: 'Payment logs', account: 'Account creation' }
const defaults = { date: '', category: '', status: '', user: '', orderId: '', ip: '', search: '', perPage: '50' }
const labels = { date: 'Date (IST)', category: 'Log type', status: 'Status / outcome', user: 'User ID', orderId: 'Order ID / number', ip: 'IP', search: 'Search', perPage: 'Rows per page' }
const ist = (value) => value && Number.isFinite(Date.parse(value)) ? `${new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })} IST` : 'Not recorded'
const dayLabel = (value) => new Date(`${value}T00:00:00+05:30`).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' })
const mb = (value) => ((Number(value) || 0) / 1048576).toFixed(2)

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
      </div> : data ? <p className="monitor-muted">Only Super Admins can change debug logging.</p> : null}
    </aside>
  )
}

function LogRow({ row }) {
  const view = row.presentation || {}
  const result = ['Successful', 'Failed', 'Warning', 'Pending'].includes(view.result) ? view.result : 'Warning'
  return (
    <tr className="monitor-log">
      <td data-label="Date and time" className="monitor-date">{ist(row.timestamp)}<small>{view.category || 'Other'}</small></td>
      <td data-label="Person" className="monitor-person">{view.actor || 'Name not recorded'}</td>
      <td data-label="What happened" className="monitor-event">
        <strong>{view.action || 'Recorded event'}</strong>
        <p>{view.description || 'An event was recorded. Further information is not available.'}</p>
        {view.changes?.length ? <div className="monitor-changes" aria-label="Recorded changes">{view.changes.map((change) => <div className="monitor-change" key={change.label}>
          <strong>{change.label}</strong>
          <div><span>Previous</span>{change.from ?? 'Not recorded'}</div>
          <div><span>Updated</span>{change.to}</div>
        </div>)}</div> : null}
        {view.outcomeNote ? <p className="monitor-muted">{view.outcomeNote}</p> : null}
        <details className="monitor-details"><summary>View details</summary>
          <dl>{view.details?.length ? view.details.map((detail) => <div key={detail.label}><dt>{detail.label}</dt><dd>{detail.value}</dd></div>) : <div><dt>Available information</dt><dd>Further details were not recorded.</dd></div>}</dl>
        </details>
      </td>
      <td data-label="Related record" className="monitor-related">{view.subject || 'Not recorded'}</td>
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
  const [minutes, setMinutes] = useState('15')
  const [refresh, setRefresh] = useState(0)
  const sequence = useRef(0)
  useEffect(() => {
    const id = ++sequence.current
    setBusy(true)
    setError('')
    api.getPage({ pageName: 'logs', params: { ...active, page } })
      .then((response) => { if (id === sequence.current) setData(response.data) })
      .catch(() => { if (id === sequence.current) { setData(null); setError('Unable to load monitoring. Check your admin access or try again.') } })
      .finally(() => { if (id === sequence.current) setBusy(false) })
    return () => { sequence.current++ }
  }, [active, page, refresh])
  useEffect(() => {
    const reload = () => setRefresh((value) => value + 1)
    window.addEventListener('focus', reload)
    return () => window.removeEventListener('focus', reload)
  }, [])
  async function debug(action) {
    setBusy(true)
    setError('')
    try {
      const response = await api.getPage({ pageName: 'logs', method: 'POST', headers: { 'X-Tokri-Monitoring': '1' }, data: { action, minutes } })
      setData((current) => current ? { ...current, ...response.data } : current)
      setRefresh((value) => value + 1)
    } catch { setError('Unable to change debug logging. Only an active Super Admin can use this control.'); setBusy(false) }
  }
  const recoveryWarning = data?.outbox && (!data.outbox.available || data.outbox.failures > 0 || data.outbox.retries > 0 || data.outbox.usedBytes >= data.outbox.maxBytes * 0.8)
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
        .monitor-debug{flex:0 0 340px;max-width:100%;padding:14px 16px;border:1px solid #dce5df;border-radius:8px;background:white}
        .monitor-debug-heading{display:flex;justify-content:space-between;gap:10px;align-items:center}
        .monitor-debug-actions{display:flex;justify-content:flex-end;align-items:flex-end;flex-wrap:wrap;gap:10px;margin-top:12px}
        .monitor-debug-actions label{display:grid;gap:3px;font-size:12px}
        .tokri-monitoring input,.tokri-monitoring select{width:100%;min-width:0;border:1px solid #cbd5e1;border-radius:6px;padding:7px;background:white;color:#16352c;font-size:13px;min-height:36px}
        .tokri-monitoring button{border:1px solid #b8cac2;border-radius:6px;padding:7px 12px;background:white;color:#16352c;cursor:pointer;font-size:13px;min-height:36px}
        .tokri-monitoring button:hover:not(:disabled){background:#eaf5ee}
        .tokri-monitoring button.monitor-primary{background:#23704d;color:white;border-color:#23704d}
        .tokri-monitoring button:disabled{opacity:.5;cursor:default}
        .tokri-monitoring summary{cursor:pointer;color:#41665a;font-size:12px}
        .tokri-monitoring :is(button,input,select,summary):focus-visible{outline:2px solid #24734b;outline-offset:2px}
        .monitor-filters{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:20px 0}
        .monitor-filter{display:grid;gap:4px;font-size:12px}
        .monitor-filter-actions{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:8px}
        .monitor-health{background:#fff;padding:14px 16px;border:1px solid #e2e9e4;border-radius:8px;margin-bottom:18px}
        .monitor-health dl,.monitor-details dl{margin:10px 0 0;display:grid;gap:8px}
        .monitor-health dl>div,.monitor-details dl>div{display:grid;grid-template-columns:minmax(100px,1fr) minmax(0,2fr);gap:12px}
        .monitor-health dt,.monitor-details dt{color:#62766b;font-size:12px}
        .monitor-health dd,.monitor-details dd{margin:0;overflow-wrap:anywhere}
        .monitor-alert{border-left:3px solid #b06c10;padding:6px 12px;background:#fff6e4;color:#795217;margin:10px 0}
        .monitor-table-wrap{background:white;border:1px solid #e2e9e4;border-radius:8px;overflow:hidden}
        .monitor-table{width:100%;border-collapse:collapse;text-align:left;table-layout:fixed}
        .monitor-table th{background:#f1f6f3;color:#41665a;font-size:11px;text-transform:uppercase;letter-spacing:.04em;padding:12px}
        .monitor-table th:nth-child(1){width:17%}.monitor-table th:nth-child(2){width:16%}.monitor-table th:nth-child(3){width:39%}.monitor-table th:nth-child(4){width:17%}.monitor-table th:nth-child(5){width:11%}
        .monitor-table td{padding:12px;border-bottom:1px solid #e5ece8;vertical-align:top;overflow-wrap:anywhere;min-width:0}
        .monitor-table tr:last-child td{border-bottom:0}
        .monitor-date{font-size:12px}.monitor-date small{display:block;color:#62766b;margin-top:3px}
        .monitor-badge{display:inline-block;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap}
        .is-successful{background:#e8f5ec;color:#22643c}.is-failed{background:#fdeced;color:#a12635}.is-warning{background:#fff4db;color:#825b07}.is-pending{background:#eaf0fb;color:#315a91}.is-neutral{background:#eef2f0;color:#4b6257}
        .monitor-details{margin-top:8px}.monitor-details[open]{padding:10px;background:#f4f7f5;border-radius:6px}
        .monitor-changes{margin:10px 0;display:grid;gap:6px}
        .monitor-change{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:6px 12px;background:#f5f8f6;border-radius:6px;padding:8px 10px;font-size:12px}
        .monitor-change>strong{grid-column:1/-1}.monitor-change span{display:block;color:#62766b;font-size:11px}
        .monitor-pagination{display:flex;align-items:center;gap:10px;padding-top:16px;flex-wrap:wrap}
        .monitor-files{margin-top:20px}.monitor-files ul{list-style:none;padding:0;display:flex;gap:8px;flex-wrap:wrap}
        @media(max-width:1100px){.monitor-header{gap:16px}.monitor-debug{flex-basis:310px}.monitor-table th,.monitor-table td{padding:10px}}
        @media(max-width:760px){
          .tokri-monitoring{padding:16px}.tokri-monitoring h1{font-size:22px}
          .monitor-header{flex-direction:column;gap:18px}.monitor-debug{order:-1;flex-basis:auto;width:100%;align-self:flex-end}
          .monitor-filters{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
          .monitor-table-wrap{background:transparent;border:0;overflow:visible}.monitor-table,.monitor-table tbody{display:block}
          .monitor-table thead{display:none}.monitor-table tr.monitor-log{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;background:white;border:1px solid #dce5df;border-radius:8px;margin-bottom:12px;padding:14px}
          .monitor-table td{display:block;border:0;padding:0;font-size:13px}
          .monitor-date{grid-column:1}.monitor-result{grid-column:2;grid-row:1}.monitor-person{grid-column:1/-1;grid-row:2}.monitor-related{grid-column:1/-1;grid-row:3}.monitor-event{grid-column:1/-1;grid-row:4}
          .monitor-person:before,.monitor-related:before{content:attr(data-label) ': ';font-size:12px;color:#62766b}
          .monitor-details dl>div,.monitor-health dl>div{grid-template-columns:minmax(0,1fr);gap:1px}
        }
      `}</style>
      <header className="monitor-header">
        <div className="monitor-heading"><h1>Logs &amp; Monitoring</h1><p className="monitor-muted">Read-only history · Newest entries first · All times are in IST.</p><p className="monitor-muted">Names come from current records when available. Sensitive information stays hidden.</p></div>
        <DebugControls data={data} busy={busy} unavailable={Boolean(error) && !data} minutes={minutes} onMinutes={setMinutes} onAction={debug} />
      </header>
      <form className="monitor-filters" onSubmit={(event) => { event.preventDefault(); setPage(1); setActive({ ...filters }) }}>
        {Object.entries(filters).map(([key, value]) => <div className="monitor-filter" key={key}>
          <label htmlFor={`monitoring-${key}`}>{labels[key]}</label>
          {['category', 'perPage'].includes(key) ? <select id={`monitoring-${key}`} value={value} onChange={(event) => setFilters({ ...filters, [key]: event.target.value })}>{(key === 'category' ? ['', ...Object.keys(typeLabels)] : ['50', '100']).map((option) => <option key={option} value={option}>{key === 'category' ? typeLabels[option] || 'All types' : option}</option>)}</select> : <input id={`monitoring-${key}`} type={key === 'date' ? 'date' : 'text'} value={value} maxLength={100} onChange={(event) => setFilters({ ...filters, [key]: event.target.value })} />}
        </div>)}
        <div className="monitor-filter-actions"><button className="monitor-primary" type="submit" disabled={busy}>Apply filters</button><button type="button" disabled={busy} onClick={() => { setPage(1); setRefresh((value) => value + 1) }}>Refresh latest</button><button type="button" disabled={busy} onClick={() => { const selection = { ...defaults, category: 'access', search: 'customer.login' }; setFilters(selection); setActive(selection); setPage(1); setRefresh((value) => value + 1) }}>Customer logins</button></div>
      </form>
      {error ? <p role="alert" className="monitor-alert">{error}</p> : null}
      {data ? <>
        <div className="monitor-health">
          {data.storageError || data.degraded || data.corruptRows ? <p role="alert" className="monitor-alert">{data.storageError ? 'The log files could not be opened. Ask the technical team to check storage access.' : data.corruptRows ? `${data.corruptRows} entries could not be read. Ask the technical team to review the server logs.` : 'Some entries previously needed backup handling. Ask the technical team to review logging health.'}</p> : null}
          <p role={recoveryWarning ? 'alert' : undefined} className={recoveryWarning ? 'monitor-alert' : undefined}>{data.outbox?.available ? recoveryWarning ? 'Automatic recovery is available. Its delivery health needs review.' : 'Automatic recovery is available for payment and admin activity logs.' : 'Automatic recovery for critical logs needs attention.'}</p>
          <details><summary>Log storage and delivery health</summary><dl>
            <div><dt>Log storage used</dt><dd>{mb(data.totalBytes)} of {mb(data.maxBytes)} MB</dd></div>
            <div><dt>History kept</dt><dd>{data.retentionDays} days</dd></div>
            <div><dt>Waiting to be saved</dt><dd>{data.outbox?.pending ?? 'Not available'}</dd></div>
            <div><dt>Other log entries queued</dt><dd>{data.pending}</dd></div>
            <div><dt>Oldest entry waiting for recovery</dt><dd>{data.outbox?.oldest ? ist(data.outbox.oldest) : data.outbox?.pending === 0 ? 'None waiting' : 'Not available'}</dd></div>
            <div><dt>Records needing another attempt</dt><dd>{data.outbox?.retries ?? 'Not available'}</dd></div>
            <div><dt>Recovery storage used</dt><dd>{mb(data.outbox?.usedBytes)} of {mb(data.outbox?.maxBytes)} MB</dd></div>
            <div><dt>Records not added to recovery</dt><dd>{data.outbox?.failures ?? 'Not available'}</dd></div>
            <div><dt>File writes that failed</dt><dd>{data.failed}</dd></div>
            <div><dt>Records skipped because the queue was full</dt><dd>{data.dropped}</dd></div>
            <div><dt>Records sent to backup output</dt><dd>{data.emergency}</dd></div>
            <div><dt>Backup output failures</dt><dd>{data.emergencyFailed}</dd></div>
            <div><dt>Old files removed automatically</dt><dd>{data.prunedFiles}</dd></div>
          </dl></details>
        </div>
        <p aria-live="polite" className="monitor-muted">{busy ? 'Loading…' : `${data.total} matching rows · Page ${data.page}`}</p>
        <div className="monitor-table-wrap"><table className="monitor-table">
          <thead><tr>{['Date & time (IST)', 'Person', 'What happened', 'Related record', 'Result'].map((title) => <th key={title} scope="col">{title}</th>)}</tr></thead>
          <tbody>{data.rows.map((row, index) => <LogRow key={row.eventId || `${row.file}-${row.timestamp}-${index}`} row={row} />)}</tbody>
        </table>{!busy && !data.rows.length ? <p style={{ padding: 14 }}>No matching log entries.</p> : null}</div>
        <nav className="monitor-pagination" aria-label="Log pages"><button type="button" disabled={busy || page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span className="monitor-muted">Page {data.page}</span><button type="button" disabled={busy || page * data.perPage >= data.total} onClick={() => setPage((value) => value + 1)}>Next</button></nav>
        <details className="monitor-files"><summary>Daily log groups ({data.files.length})</summary><ul>{data.files.map((file) => <li key={file.name}><button type="button" disabled={busy} onClick={() => { const selection = { ...defaults, date: file.date, category: file.category }; setFilters(selection); setActive(selection); setPage(1) }}>{typeLabels[file.category] || 'Other logs'} · {dayLabel(file.date)} · {(file.size / 1024).toFixed(1)} KB</button></li>)}</ul></details>
      </> : null}
    </section>
  )
}
