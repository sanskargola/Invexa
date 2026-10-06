import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { formatCurrency, formatPercent } from '../../utils/formatters'

interface PnLCardProps {
  label: string
  amount: number
  percent?: number
  sublabel?: string
}

export default function PnLCard({ label, amount, percent, sublabel }: PnLCardProps) {
  const isPositive = amount >= 0

  return (
    <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
      <p className="text-xs font-medium text-[#7d8f82] uppercase tracking-wider">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-[#e4eae5]">
          {formatCurrency(amount)}
        </span>
        {percent !== undefined && (
          <span
            className={`inline-flex items-center text-xs font-semibold ${
              isPositive ? 'text-[#a8c55a]' : 'text-[#e57373]'
            }`}
          >
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {formatPercent(percent)}
          </span>
        )}
      </div>
      {sublabel && <p className="mt-1 text-[11px] text-[#69796e]">{sublabel}</p>}
    </div>
  )
}
