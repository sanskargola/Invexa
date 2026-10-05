import { useState } from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMarketData } from '../../hooks/useMarketData'

function money(value: number, currency: string) {
  const prefix = currency === 'INR' ? '₹' : '$'
  return `${prefix}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function StockSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const { items, loading, error } = useMarketData(query)

  return (
    <div className="market-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">MARKETS <span className="eyebrow-dot">·</span> SYMBOL LOOKUP</p>
          <h1>Stock search</h1>
          <p className="page-subtitle">Find listed companies, then open a live candlestick chart in the terminal.</p>
        </div>
      </div>
      <div className="market-search-field wide">
        <Search size={14} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try AAPL, NVDA, RELIANCE, TCS, INFY…" />
      </div>
      {loading && !items.length && <p className="market-status-copy">Searching Yahoo Finance…</p>}
      {error && <p className="market-status-copy error">{error}</p>}
      {items.length > 0 && (
        <div className="search-grid">
          {items.map((item) => (
            <button key={item.symbol} className="search-card" onClick={() => navigate(`/terminal?symbol=${item.symbol}`)}>
              <div className="search-card-top">
                <span>{item.exchange}</span>
                <span className={item.percent_change >= 0 ? 'positive-text' : 'negative-text'}>{item.percent_change >= 0 ? '+' : ''}{item.percent_change.toFixed(2)}%</span>
              </div>
              <strong>{item.symbol}</strong>
              <small>{item.name}</small>
              <div className="search-card-price">
                <b>{money(item.price, item.currency)}</b>
                <span className={item.change >= 0 ? 'positive-text' : 'negative-text'}>{item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
