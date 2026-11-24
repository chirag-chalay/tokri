import React, { useEffect, useRef, useState } from 'react'
import { ApiClient } from 'adminjs'

const api = new ApiClient()
const tabs = {
  pincodes: 'Pincode & delivery', funnel: 'Sales funnel', guest: 'Guest checkout', failures: 'Failures',
  carts: 'Cart & fees', products: 'Products', orders: 'Orders & payments', channels: 'Website & app',
  hours: 'Peak hours', areas: 'Areas', landing: 'Entry pages', alerts: 'Alerts',
}
const formatDate = value => value.split('-').reverse().join('/')
const formatTime = value => new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })
const visitLink = (row, headers) => './logs?visit=' + encodeURIComponent(row.session) +
  (['Android', 'iPhone'].includes(row.values[headers.indexOf('Channel')]) ? '&channel=app' : '')
const toIso = value => /^\d{2}\/\d{2}\/\d{4}$/.test(value) ? value.split('/').reverse().join('-') : ''
const recent = days => {
  const india = Date.now() + 330 * 60000
  return { from: formatDate(new Date(india - (days - 1) * 86400000).toISOString().slice(0, 10)),
    to: formatDate(new Date(india).toISOString().slice(0, 10)) }
}

async function readReports(data) {
  const response = await api.getPage({ pageName: 'reports', method: 'POST', headers: { 'X-Tokri-Monitoring': '1' }, data })
  if (!response.data || response.data.error) throw new Error(response.data?.error || 'Reports could not be loaded.')
  return response.data
}

function ReportDetails({ metadata, note, pincodeFiltered }) {
  const days = (Date.parse(metadata.to) - Date.parse(metadata.from)) / 86400000 + 1
  const limited = metadata.observedDays < days || metadata.from < metadata.retainedFrom
  const comparison = metadata.comparison
  return <div className="report-coverage">
    {limited && <span className="report-coverage-warning">Limited activity history</span>}
    {metadata.corrupt > 0 && <span className="report-coverage-warning">Some records couldn’t be read</span>}
    <details className="report-details">
      <summary>Data details</summary>
      <dl>
        <div><dt>Records through</dt><dd>{formatTime(metadata.end)} IST</dd></div>
        <div><dt>Days with activity files</dt><dd>{metadata.observedDays} of {days}</dd></div>
        {metadata.eventsWithoutSession > 0 && <div><dt>Activity events without a session ID</dt><dd>{metadata.eventsWithoutSession}</dd></div>}
        {metadata.ordersWithoutChannel > 0 && <div><dt>Orders without a verified channel</dt><dd>{metadata.ordersWithoutChannel}</dd></div>}
        {metadata.corrupt > 0 && <div><dt>Unreadable records</dt><dd>{metadata.corrupt}</dd></div>}
        {comparison && <div><dt>Comparison period</dt><dd>{formatTime(comparison.from)} to {formatTime(comparison.end)} IST</dd></div>}
      </dl>
      {pincodeFiltered && <p>Uses the delivery pincode recorded on each event.</p>}
      {note && <p>{note}</p>}
    </details>
  </div>
}

function Records({ data, onDrill }) {
  if (!data.rows.length) return <p>No records match this report.</p>
  return <div className="report-scroll">
    <table aria-label="Report records">
      <thead><tr>{data.headers.map(header => <th scope="col" key={header}>{header}</th>)}</tr></thead>
      <tbody>{data.rows.map((row, i) => <tr key={(row.drill || row.session || '') + i}>
        {row.values.map((value, column) => <td key={data.headers[column]} data-label={data.headers[column]}>
          {column === 0 && row.drill ? <button className="report-link" type="button" onClick={() => onDrill(row.drill, row.values[0])}>{value}</button> : value ?? 'Unavailable'}
          {row.session && data.headers[column] === 'Visit' && <a className="report-visit" href={visitLink(row, data.headers)}>Open visit</a>}
          {column === row.values.length - 1 && row.orderDrill && <button className="report-link report-visit" type="button" onClick={() => onDrill(row.orderDrill, row.values[0] + ' orders')}>Open orders</button>}
        </td>)}
      </tr>)}</tbody>
    </table>
  </div>
}

export default function Reports() {
  const [section, setSection] = useState('pincodes')
  const [draft, setDraft] = useState(() => ({ ...recent(7), channel: '', pin: '' }))
  const [filters, setFilters] = useState(draft)
  const [data, setData] = useState(null)
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [drill, setDrill] = useState({ key: '', title: '' })
  const [exporting, setExporting] = useState(false)
  const request = useRef(0)

  async function load(params, destination, replace) {
    const latest = ++request.current
    setBusy(true)
    setError('')
    if (replace) { setData(null); setDrill(destination) }
    try {
      const result = await readReports(params)
      if (latest === request.current) { setData(result); setDrill(destination) }
    } catch (err) {
      if (latest === request.current) setError(err.message)
    } finally {
      if (latest === request.current) setBusy(false)
    }
  }

  useEffect(() => {
    const params = { section, from: toIso(filters.from), to: toIso(filters.to),
      pin: section === 'alerts' ? '' : filters.pin, channel: section === 'alerts' ? '' : filters.channel }
    void load(params, { key: '', title: '' }, true)
    return () => { request.current++ }
  }, [section, filters])

  function open(key, title, page = 1) {
    if (!data || busy) return
    void load({ id: data.id, drill: key, page }, { key, title }, false)
  }

  async function download() {
    setExporting(true)
    setError('')
    try {
      const result = await readReports({ id: data.id, drill: drill.key, format: 'csv' })
      const url = URL.createObjectURL(new Blob(['\uFEFF', result.csv], { type: 'text/csv;charset=utf-8' }))
      const file = document.createElement('a')
      file.href = url
      file.download = 'tokriii-' + section + '-' + data.metadata.from + '-' + data.metadata.to + '.csv'
      file.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (err) { setError(err.message) }
    finally { setExporting(false) }
  }

  const refresh = () => setFilters({ ...filters })
  const update = event => setDraft({ ...draft, [event.target.name]: event.target.value })
  const metadata = data?.metadata
  return <div className="tokri-reports">
    <style>{`
      .tokri-reports{max-width:1540px;padding:18px;color:#18362d}.tokri-reports h1{font-size:28px;margin:0}.tokri-reports h2{font-size:19px}
      .report-header,.report-heading,.report-coverage,.report-actions,.report-filters,.report-tabs{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
      .report-header,.report-actions{justify-content:space-between}.report-tabs,.report-filters,.report-actions{margin:14px 0}
      .report-heading{justify-content:space-between;margin:16px 0 6px}.report-heading h2{margin:0}
      .report-coverage{font-size:13px;min-width:0}.report-coverage-warning{color:#845314}
      .report-details summary{cursor:pointer;color:#205440;text-decoration:underline;text-underline-offset:3px}
      .report-details[open]{flex-basis:100%;max-width:640px}
      .report-details dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(190px,100%),1fr));gap:8px;margin:8px 0}
      .report-details dt{font-weight:600}.report-details dd{margin:2px 0 0}.report-details p{margin:6px 0}
      .tokri-reports :is(button,input,select){font:inherit;color:inherit}.tokri-reports button{cursor:pointer;border:1px solid #a9beb1;padding:7px 10px;background:white;border-radius:6px}
      .tokri-reports button[aria-pressed=true],.tokri-reports .report-apply{background:#205440;color:white;border-color:#205440}
      .tokri-reports button:disabled{opacity:.58;cursor:default}.tokri-reports label{display:grid;gap:4px}
      .report-filters{align-items:end}.report-filters :is(input,select){border:1px solid #a9beb1;border-radius:6px;padding:7px;max-width:155px;background:white}
      .report-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(170px,100%),1fr));gap:9px;margin:14px 0}
      .report-card{padding:10px;background:#f4f8f5;border:1px solid #d7e1da;border-radius:7px;display:grid;gap:6px;align-content:center;text-align:left}
      .report-card span,.report-meta{font-size:13px}.report-card strong{font-size:20px}
      .report-scroll{overflow:auto;border:1px solid #dce4df;border-radius:7px}.report-scroll table{width:100%;border-collapse:collapse;background:white;min-width:600px}
      .report-scroll :is(td,th){padding:9px;text-align:left;vertical-align:top;border-bottom:1px solid #e5ede7;white-space:normal;overflow-wrap:anywhere;min-width:85px}
      .report-scroll th{background:#ecf4ef}.tokri-reports .report-link{padding:0;border:0;color:#205440;text-decoration:underline;text-align:left}
      .report-visit{display:block;margin-top:5px;color:#205440}
      @media(max-width:720px){.tokri-reports{padding:10px}.report-scroll{border:0}.report-scroll :is(table,tbody){display:block;min-width:0;background:transparent}
        .report-scroll thead{position:absolute;clip-path:inset(50%);width:1px;height:1px;overflow:hidden}
        .report-scroll tr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));border:1px solid #dce4df;border-radius:7px;background:white;margin-bottom:7px}
        .report-scroll td{display:block;min-width:0}.report-scroll td::before{content:attr(data-label);display:block;font-size:11px;font-weight:700;color:#456454}}
    `}</style>
    <header className="report-header"><h1>Reports</h1><a href="./logs">Customer activity logs</a></header>
    <nav className="report-tabs" aria-label="Report sections">
      {Object.entries(tabs).map(([key, label]) => <button key={key} type="button" aria-pressed={section === key} disabled={busy && !data}
        onClick={() => setSection(key)}>{label}</button>)}
    </nav>
    <form className="report-filters" onSubmit={event => { event.preventDefault(); setFilters({ ...draft }) }}>
      {[[1, 'Today'], [7, '7 days'], [30, '30 days']].map(([days, label]) => <button type="button" key={days} disabled={busy}
        onClick={() => { const range = { ...draft, ...recent(days) }; setDraft(range); setFilters(range) }}>{label}</button>)}
      <label>From (IST)<input name="from" value={draft.from} onChange={update} placeholder="dd/mm/yyyy" inputMode="numeric" maxLength={10} required /></label>
      <label>To (IST)<input name="to" value={draft.to} onChange={update} placeholder="dd/mm/yyyy" inputMode="numeric" maxLength={10} required /></label>
      {section !== 'alerts' && <>
        <label>Channel<select name="channel" value={draft.channel} onChange={update}><option value="">All channels</option>
          <option value="website">Website</option><option value="android">Android</option><option value="ios">iPhone</option></select></label>
        <label>Delivery pincode<input name="pin" value={draft.pin} onChange={update} inputMode="numeric" maxLength={6} placeholder="All pincodes" /></label>
      </>}
      <button className="report-apply" type="submit" disabled={busy}>Apply filters</button>
    </form>
    {error && <p role="alert">{error}</p>}
    {busy && <p role="status">Loading report…</p>}
    <div className="report-heading">
      <h2>{drill.title || tabs[section]}</h2>
      {metadata && <ReportDetails key={data.id} metadata={metadata} note={data.note} pincodeFiltered={Boolean(filters.pin && section !== 'alerts')} />}
    </div>
    {metadata?.comparison && !drill.key && <p className="report-meta">{metadata.comparison.label} · <strong>{metadata.comparison.current}</strong> vs {metadata.comparison.previous} previous period</p>}
    {data && <>
      {!drill.key && data.cards.length > 0 && <div className="report-cards">
        {data.cards.map(card => card.drill ? <button type="button" className="report-card" key={card.label} onClick={() => open(card.drill, card.label)}>
          <span>{card.label}</span><strong>{card.value}</strong></button> :
          <div className="report-card" key={card.label}><span>{card.label}</span><strong>{card.value}</strong></div>)}
      </div>}
      <div className="report-actions">
        {drill.key && <button type="button" disabled={busy} onClick={() => open('', '')}>Back to report</button>}
        <span>{data.total} {data.total === 1 ? 'record' : 'records'}</span>
        <button type="button" onClick={download} disabled={busy || exporting || !data.total}>Export CSV</button>
        <button type="button" disabled={busy} onClick={refresh}>Refresh report</button>
      </div>
      <Records data={data} onDrill={open} />
      {data.pages > 1 && <nav className="report-actions" aria-label="Report pages">
        <button type="button" disabled={busy || data.page <= 1} onClick={() => open(drill.key, drill.title, data.page - 1)}>Previous</button>
        <span>Page {data.page} of {data.pages}</span>
        <button type="button" disabled={busy || data.page >= data.pages} onClick={() => open(drill.key, drill.title, data.page + 1)}>Next</button>
      </nav>}
    </>}
    {error && !data && <button type="button" disabled={busy} onClick={refresh}>Reload report</button>}
  </div>
}
