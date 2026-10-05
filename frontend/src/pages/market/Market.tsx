import { useMemo, useState } from 'react'
import { ArrowRight, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import TradingChart from '../../components/charts/TradingChart'
import { useMarketData } from '../../hooks/useMarketData'

function money(value: number, currency: string) {
  const prefix = currency === 'INR' ? '₹' : '$'
  return `${prefix}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function Market() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const { items, loading, error } = useMarketData(query)
  const [selected, setSelected] = useState('NVDA')

  const stats = useMemo(() => {
    if (!items.length) return { gainers: 0, losers: 0, avgMove: 0 }
    const gainers = items.filter((item) => item.percent_change > 0).length
    const losers = items.filter((item) => item.percent_change < 0).length
    const avgMove = items.reduce((sum, item) => sum + item.percent_change, 0) / items.length
    return { gainers, losers, avgMove }
  }, [items])

  const active = items.find((item) => item.symbol === selected) ?? items[0]

  return (
    <div className="market-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">MARKETS <span className="eyebrow-dot">·</span> LIVE YAHOO FINANCE</p>
          <h1>Market overview</h1>
          <p className="page-subtitle">Track US and Indian equities with live quotes and candlestick charts.</p>
        </div>
        <div className="market-search-field">
          <Search size={14} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search AAPL, RELIANCE, TCS…" />
        </div>
      </div>

      <section className="metric-grid market-metrics" aria-label="Session snapshot">
        <article className="metric-panel"><div className="metric-top"><span>Advancers</span></div><div className="metric-value positive-text">{stats.gainers}</div><div className="metric-foot"><span className="muted">Symbols up on the list</span></div></article>
        <article className="metric-panel"><div className="metric-top"><span>Decliners</span></div><div className="metric-value negative-text">{stats.losers}</div><div className="metric-foot"><span className="muted">Symbols down on the list</span></div></article>
        <article className="metric-panel"><div className="metric-top"><span>Average move</span></div><div className={`metric-value ${stats.avgMove >= 0 ? 'positive-text' : 'negative-text'}`}>{stats.avgMove >= 0 ? '+' : ''}{stats.avgMove.toFixed(2)}%</div><div className="metric-foot"><span className="muted">{items.length} live symbols</span></div></article>
      </section>

      <div className="market-layout">
        <article className="surface holdings-panel">
          <div className="section-heading">
            <div><h2>Live market list</h2><p>Select a symbol to load its candlestick chart</p></div>
            <button className="text-button" onClick={() => navigate(`/terminal?symbol=${active?.symbol ?? 'NVDA'}`)}>Open terminal <ArrowRight size={14} /></button>
          </div>
          {loading && !items.length && <p className="market-status-copy">Loading live quotes…</p>}
          {error && <p className="market-status-copy error">{error}</p>}
          {items.length > 0 && (
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>SYMBOL</th><th>COMPANY</th><th>EXCHANGE</th><th>PRICE</th><th>CHANGE</th><th>VOLUME</th></tr></thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.symbol} className={item.symbol === (active?.symbol) ? 'row-selected' : ''} onClick={() => setSelected(item.symbol)}>
                      <td><strong className="symbol-link">{item.symbol}</strong></td>
                      <td>{item.name}</td>
                      <td>{item.exchange}</td>
                      <td>{money(item.price, item.currency)}</td>
                      <td><span className={item.percent_change >= 0 ? 'positive-text' : 'negative-text'}>{item.percent_change >= 0 ? '+' : ''}{item.percent_change.toFixed(2)}%</span></td>
                      <td>{item.volume.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
        {active && <TradingChart symbol={active.symbol} />}
      </div>
    </div>
  )
}
