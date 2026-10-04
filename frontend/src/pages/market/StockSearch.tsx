import { useState } from 'react'
import { useMarketData } from '../../hooks/useMarketData'

export default function StockSearch() {
  const [query, setQuery] = useState('')
  const { items, loading, error } = useMarketData(query)

  return (
    <div className="space-y-5 p-6 text-slate-100">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">Stock search</p>
        <h1 className="mt-2 text-3xl font-bold">Search global & Indian stocks</h1>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try AAPL, RELIANCE, TCS, INFY, NVDA, HDFC..."
          className="mt-5 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none"
        />
      </div>

      {loading && <p className="text-slate-300">Searching market…</p>}
      {error && <p className="text-rose-400">{error}</p>}

      {!loading && !error && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div key={item.symbol} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/40">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.exchange}</p>
                  <h2 className="mt-2 text-2xl font-bold text-cyan-300">{item.symbol}</h2>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${item.percent_change >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {item.percent_change >= 0 ? '+' : ''}{item.percent_change.toFixed(2)}%
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-300">{item.name}</p>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl font-semibold">{item.currency === 'INR' ? '₹' : '$'}{item.price.toLocaleString()}</span>
                <span className={`text-sm ${item.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
