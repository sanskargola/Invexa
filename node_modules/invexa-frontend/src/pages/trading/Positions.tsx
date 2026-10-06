import { RefreshCw } from 'lucide-react'
import { useTrading } from '../../hooks/useTrading'
import PositionsTable from '../../components/trading/PositionsTable'
import { formatCurrency, formatPercent } from '../../utils/formatters'

export default function Positions() {
  const { positions, loading, closePosition, refresh } = useTrading()

  const totalValue = positions.reduce((acc, p) => acc + p.market_value, 0)
  const totalPnL = positions.reduce((acc, p) => acc + p.pnl, 0)
  const isPos = totalPnL >= 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#e4eae5]">Open Positions</h1>
          <p className="text-xs text-[#7d8f82]">
            Live mark-to-market valuations and unrealized PnL tracking.
          </p>
        </div>
        <button
          onClick={() => refresh()}
          className="flex items-center gap-1.5 rounded-lg border border-[#2a342d] bg-[#161d18] px-3 py-1.5 text-xs text-[#a4b3a8] transition-colors hover:border-[#3d4d42] hover:text-[#fff]"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#69796e]">Total Position Value</p>
          <p className="mt-1 text-xl font-bold text-[#e4eae5]">{formatCurrency(totalValue)}</p>
        </div>
        <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#69796e]">Total Unrealized PnL</p>
          <p className={`mt-1 text-xl font-bold ${isPos ? 'text-[#a8c55a]' : 'text-[#e57373]'}`}>
            {formatCurrency(totalPnL)}
          </p>
        </div>
        <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#69796e]">Active Positions</p>
          <p className="mt-1 text-xl font-bold text-[#e4eae5]">{positions.length} Assets</p>
        </div>
      </div>

      <div className="rounded-xl border border-[#232c25] bg-[#121814] p-5">
        {loading ? (
          <div className="py-8 text-center text-xs text-[#7d8f82]">Loading positions...</div>
        ) : (
          <PositionsTable positions={positions} onClose={closePosition} />
        )}
      </div>
    </div>
  )
}
