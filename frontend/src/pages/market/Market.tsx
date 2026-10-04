import { useMemo, useState } from 'react'
import { useMarketData } from '../../hooks/useMarketData'

export default function Market() {
  const [query, setQuery] = useState('')
  const { items, loading, error } = useMarketData(query)

  const stats = useMemo(() => {
    if (!items.length) {
      return { gainers: 0, losers: 0, avgMove: 0 }
    }

    const gainers = items.filter((item) => item.percent_change > 0).length
    const losers = items.filter((item) => item.percent_change < 0).length
    const avgMove = items.reduce((sum, item) => sum + item.percent_change, 0) / items.length

    return { gainers, losers, avgMove }
  }, [items])

  return (
    <div className="space-y-6 p-6 text-slate-100">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-cyan-950/30">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">Market overview</p>
            <h1 className="mt-2 text-3xl font-bold">Global & Indian equities</h1>
          </div>
          <div className="w-full max-w-md">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search symbol, company or exchange"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Gainers</p>
          <p className="mt-3 text-3xl font-bold">{stats.gainers}</p>
        </div>
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-rose-400">Losers</p>
          <p className="mt-3 text-3xl font-bold">{stats.losers}</p>
        </div>
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">Average move</p>
          <p className="mt-3 text-3xl font-bold">{stats.avgMove.toFixed(2)}%</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Live market list</h2>
          <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">{items.length} symbols</span>
        </div>

        {loading && <p className="text-slate-300">Loading market data…</p>}
        {error && <p className="text-rose-400">{error}</p>}

        {!loading && !error && (
          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
              <thead className="bg-slate-950/80 text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-medium">Symbol</th>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Exchange</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Change</th>
                  <th className="px-4 py-3 font-medium">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                {items.map((item) => (
                  <tr key={item.symbol} className="hover:bg-slate-800/80">
                    <td className="px-4 py-3 font-semibold text-cyan-300">{item.symbol}</td>
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3 text-slate-300">{item.exchange}</td>
                    <td className="px-4 py-3">{item.currency === 'INR' ? '₹' : '$'}{item.price.toLocaleString()}</td>
                    <td className={`px-4 py-3 font-medium ${item.percent_change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.percent_change >= 0 ? '+' : ''}{item.percent_change.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-slate-300">{item.volume.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
