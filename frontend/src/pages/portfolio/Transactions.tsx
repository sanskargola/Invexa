import { usePortfolio } from '../../hooks/usePortfolio'
import { formatCurrency, formatDateTime } from '../../utils/formatters'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'

export default function Transactions() {
  const { transactions } = usePortfolio()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#e4eae5]">Capital Transactions</h1>
        <p className="text-xs text-[#7d8f82]">
          Audit log of all cash flows, trading settlements, deposits, and dividends.
        </p>
      </div>

      <div className="rounded-xl border border-[#232c25] bg-[#121814] p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#cfd9d1]">
            <thead>
              <tr className="border-b border-[#252f27] text-[11px] uppercase tracking-wider text-[#6e8073]">
                <th className="pb-2 font-medium">Tx ID</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Asset</th>
                <th className="pb-2 font-medium">Shares</th>
                <th className="pb-2 font-medium">Price</th>
                <th className="pb-2 font-medium">Amount</th>
                <th className="pb-2 font-medium">Fee</th>
                <th className="pb-2 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b231d]">
              {transactions.map((tx) => {
                const isPositive = tx.amount >= 0
                return (
                  <tr key={tx.id} className="transition-colors hover:bg-[#141b16]">
                    <td className="py-2.5 font-mono text-[11px] text-[#849588]">{tx.id}</td>
                    <td className="py-2.5">
                      <span
                        className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          tx.type === 'BUY'
                            ? 'bg-[#1b2f1f] text-[#a8c55a]'
                            : tx.type === 'SELL'
                            ? 'bg-[#3d1e1e] text-[#e57373]'
                            : 'bg-[#1e2a38] text-[#78a9d2]'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 font-bold text-[#e4eae5]">{tx.symbol}</td>
                    <td className="py-2.5">{tx.shares ? `${tx.shares} shares` : '—'}</td>
                    <td className="py-2.5">{tx.price ? formatCurrency(tx.price) : '—'}</td>
                    <td className="py-2.5">
                      <span className={`font-bold ${isPositive ? 'text-[#a8c55a]' : 'text-[#e4eae5]'}`}>
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="py-2.5 text-[#849588]">{formatCurrency(tx.fee)}</td>
                    <td className="py-2.5 text-[11px] text-[#718075]">
                      {formatDateTime(tx.date)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
