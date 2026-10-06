import { formatCurrency } from '../../utils/formatters'

interface PredictionChartProps {
  currentPrice: number
  targetPrice: number
  symbol: string
}

export default function PredictionChart({ currentPrice, targetPrice, symbol }: PredictionChartProps) {
  const isUp = targetPrice >= currentPrice
  const diffPct = currentPrice ? ((targetPrice - currentPrice) / currentPrice) * 100 : 0

  return (
    <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[#e4eae5]">{symbol} AI Forecast Cone</span>
        <span className={`font-bold ${isUp ? 'text-[#a8c55a]' : 'text-[#e57373]'}`}>
          {isUp ? '+' : ''}{diffPct.toFixed(2)}% Expected
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-[#829285]">
        <div className="rounded bg-[#18201a] px-2 py-1">
          <p className="text-[10px]">Today</p>
          <p className="font-bold text-[#e4eae5]">{formatCurrency(currentPrice)}</p>
        </div>
        <div className="flex-1 px-4">
          <div className="relative flex items-center justify-center">
            <div className="h-0.5 w-full bg-gradient-to-r from-[#78a9d2] to-[#a8c55a]" />
            <span className="absolute rounded-full bg-[#c0dc7c] px-2 py-0.5 text-[10px] font-bold text-[#0d120f]">
              7-Day Target
            </span>
          </div>
        </div>
        <div className="rounded bg-[#18201a] px-2 py-1 text-right">
          <p className="text-[10px]">Forecast</p>
          <p className="font-bold text-[#c0dc7c]">{formatCurrency(targetPrice)}</p>
        </div>
      </div>
    </div>
  )
}
