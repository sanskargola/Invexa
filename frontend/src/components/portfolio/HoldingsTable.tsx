import type { Position } from '../../types/portfolio'
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

interface HoldingsTableProps {
  positions: Position[]
  onClose?: (symbol: string) => void
}

export default function HoldingsTable({ positions, onClose }: HoldingsTableProps) {
  if (!positions.length) {
    return (
      <div className="py-8 text-center text-xs text-[#718075]">
        No open holdings. Visit the trading terminal to place orders.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-[#cfd9d1]">
        <thead>
          <tr className="border-b border-[#252f27] text-[11px] uppercase tracking-wider text-[#6e8073]">
            <th className="pb-2 font-medium">Asset</th>
            <th className="pb-2 font-medium">Quantity</th>
            <th className="pb-2 font-medium">Avg Cost</th>
            <th className="pb-2 font-medium">Market Price</th>
            <th className="pb-2 font-medium">Market Value</th>
            <th className="pb-2 font-medium">PnL</th>
            {onClose && <th className="pb-2 text-right font-medium">Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1b231d]">
          {positions.map((pos) => {
            const isPos = pos.pnl >= 0
            return (
              <tr key={pos.symbol} className="transition-colors hover:bg-[#141b16]">
                <td className="py-3 font-semibold text-[#e4eae5]">{pos.symbol}</td>
                <td className="py-3">{pos.quantity} shares</td>
                <td className="py-3">{formatCurrency(pos.avg_cost)}</td>
                <td className="py-3">{formatCurrency(pos.market_price)}</td>
                <td className="py-3 font-medium text-[#e4eae5]">
                  {formatCurrency(pos.market_value)}
                </td>
                <td className="py-3">
                  <span
                    className={`inline-flex items-center gap-0.5 font-medium ${
                      isPos ? 'text-[#a8c55a]' : 'text-[#e57373]'
                    }`}
                  >
                    {isPos ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {formatCurrency(pos.pnl)} ({formatPercent(pos.pnl_percent)})
                  </span>
                </td>
                {onClose && (
                  <td className="py-3 text-right">
                    <button
                      onClick={() => onClose(pos.symbol)}
                      className="rounded border border-[#3c4a3f] bg-[#161e18] px-2 py-1 text-[11px] text-[#a8b8ac] transition-colors hover:border-[#e57373] hover:text-[#e57373]"
                    >
                      Close
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
