import type { Prediction } from '../../types/prediction'
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { ArrowDownRight, ArrowUpRight, Sparkles } from 'lucide-react'

interface PredictionCardProps {
  prediction: Prediction
  onSelect?: (symbol: string) => void
}

export default function PredictionCard({ prediction, onSelect }: PredictionCardProps) {
  const isBull = prediction.direction === 'Bullish'

  return (
    <div
      onClick={() => onSelect?.(prediction.symbol)}
      className="cursor-pointer rounded-xl border border-[#232c25] bg-[#121814] p-4 transition-all hover:border-[#a8c55a]/40 hover:bg-[#151d17]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#e4eae5]">{prediction.symbol}</span>
          <span className="text-[11px] text-[#78887c]">({prediction.horizon})</span>
        </div>
        <span
          className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            isBull ? 'bg-[#1b2f1f] text-[#a8c55a]' : 'bg-[#3d1e1e] text-[#e57373]'
          }`}
        >
          {isBull ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {prediction.direction}
        </span>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div>
          <p className="text-[10px] text-[#718075]">Current Price</p>
          <p className="text-xs font-semibold text-[#cfd9d1]">{formatCurrency(prediction.current_price)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-[#718075]">Forecast Target</p>
          <p className="text-sm font-bold text-[#e4eae5]">{formatCurrency(prediction.target_price)}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#1b231d] pt-2 text-[11px]">
        <span className="flex items-center gap-1 text-[#a8b8ac]">
          <Sparkles size={11} className="text-[#c0dc7c]" />
          Conf: {(prediction.confidence * 100).toFixed(0)}%
        </span>
        <span className={isBull ? 'font-bold text-[#a8c55a]' : 'font-bold text-[#e57373]'}>
          {formatPercent(prediction.expected_return * 100)} Exp.
        </span>
      </div>
    </div>
  )
}
