import { useEffect, useState } from 'react'

const SEV_ORDER = { critical: 4, high: 3, medium: 2, low: 1 }

export default function App() {
  const [items, setItems] = useState(null)
  const [kev, setKev] = useState(null)
  const [error, setError] = useState(null)
  const [eco, setEco] = useState('')
  const [minSev, setMinSev] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    // 60 req/h анонимно, для дашборда хватает
    let url = 'https://api.github.com/advisories?per_page=40'
    if (eco) url += '&ecosystem=' + eco
    if (minSev) url += '&severity=' + minSev
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error('github api ' + r.status)
        return r.json()
      })
      .then(setItems)
      .catch((e) => setError(e.message))
  }, [eco, minSev])

  // cisa kev: то что реально эксплуатируют. фид 1.7МБ, тянем один раз
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/cisagov/kev-data/main/known_exploited_vulnerabilities.json')
      .then((r) => r.json())
      .then((d) => setKev(new Set(d.vulnerabilities.map((v) => v.cveID))))
      .catch(() => setKev(null)) // нет kev — не беда, живём без меток
  }, [])

  if (error) return <p className="status">error: {error}</p>
  if (!items) return <p className="status">loading advisories...</p>

  let shown = items
  if (query) {
    const q = query.toLowerCase()
    shown = items.filter(
      (a) =>
        a.summary.toLowerCase().includes(q) ||
        (a.cve_id || '').toLowerCase().includes(q),
    )
  }
  const kevCount = kev ? shown.filter((a) => kev.has(a.cve_id)).length : null

  // группировка по дню публикации, для простенького бара
  const byDay = {}
  for (const a of shown) {
    const d = a.published_at.slice(0, 10)
    byDay[d] = (byDay[d] || 0) + 1
  }
  const days = Object.keys(byDay).sort().slice(-10)
  const maxDay = Math.max(1, ...days.map((d) => byDay[d]))

  return (
    <div className="wrap">
      <h1>
        cvedigest<span className="dim">-ui</span>
      </h1>
      <div className="bar">
        <select value={eco} onChange={(e) => setEco(e.target.value)}>
          <option value="">all ecosystems</option>
          {['pip', 'npm', 'go', 'maven', 'rubygems', 'cargo', 'nuget'].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select value={minSev} onChange={(e) => setMinSev(e.target.value)}>
          <option value="">any severity</option>
          {['low', 'medium', 'high', 'critical'].map((x) => (
            <option key={x} value={x}>
              {x}+
            </option>
          ))}
        </select>
        <input
          placeholder="search cve or text..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <p className="dim small">
        {shown.length} advisories from github advisory db
        {kevCount != null && (
          <>
            {' · '}
            <span className={kevCount ? 'kev-hot' : 'dim'}>
              {kevCount} in cisa kev
            </span>
          </>
        )}
      </p>

      <div className="chart">
        {days.map((d) => (
          <div key={d} className="day">
            <div className="bar-v" style={{ height: (byDay[d] / maxDay) * 60 + 'px' }} title={d + ': ' + byDay[d]} />
            <span className="dim small">{d.slice(5)}</span>
          </div>
        ))}
      </div>

      {shown.map((a) => {
        const score = a.cvss ? a.cvss.score : null
        const inKev = kev && kev.has(a.cve_id)
        return (
          <a
            key={a.ghsa_id}
            className={'card sev-' + a.severity + (inKev ? ' is-kev' : '')}
            href={a.html_url}
            target="_blank"
            rel="noreferrer"
          >
            <div className="row">
              <span className={'badge ' + a.severity}>{a.severity}</span>
              {score != null && <span className="score">{score.toFixed(1)}</span>}
              <span className="cve">{a.cve_id || a.ghsa_id}</span>
              {inKev && <span className="kev-tag">KEV</span>}
              <span className="dim small">{a.published_at.slice(0, 10)}</span>
            </div>
            <p>{a.summary}</p>
            <div className="pkgs">
              {(a.vulnerabilities || []).slice(0, 3).map((v, i) => (
                <code key={i}>
                  {v.package?.ecosystem}/{v.package?.name} {v.vulnerable_version_range}
                </code>
              ))}
            </div>
          </a>
        )
      })}
    </div>
  )
}
