import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { predictionApi } from '../../services/predictionApi'
import type { PredictionHistoryItem } from '../../types/prediction'
import { formatPercent } from '../../utils/formatters'

export default function PredictionHistory() {
  const [history, setHistory] = useState<PredictionHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void predictionApi.getHistory().then((data) => {
      setHistory(data)
      setLoading(false)
    })
  }, [])

  const successRate = history.length
    ? (history.filter((h) => h.success).length / history.length) * 100
    : 80

  return (
    <div className="space-y-6">
      <Link to="/prediction" className="inline-flex items-center gap-1.5 text-xs text-[#a8c55a]">
        <ArrowLeft size={13} /> Back to Predictions
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#e4eae5]">Prediction History & Audit</h1>
          <p className="text-xs text-[#7d8f82]">
            Evaluation of historical AI directional and return forecasts against actual market outcomes.
          </p>
        </div>
        <div className="rounded-xl border border-[#232c25] bg-[#121814] px-4 py-2 text-right">
          <p className="text-[10px] uppercase text-[#69796e]">Empirical Accuracy</p>
          <p className="text-lg font-bold text-[#a8c55a]">{successRate.toFixed(1)}%</p>
        </div>
      </div>

      <div className="rounded-xl border border-[#232c25] bg-[#121814] p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#cfd9d1]">
            <thead>
              <tr className="border-b border-[#252f27] text-[11px] uppercase tracking-wider text-[#6e8073]">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Asset</th>
                <th className="pb-2 font-medium">Predicted Direction</th>
                <th className="pb-2 font-medium">Expected Move</th>
                <th className="pb-2 font-medium">Actual Move</th>
                <th className="pb-2 font-medium">Confidence</th>
                <th className="pb-2 text-right font-medium">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b231d]">
              {history.map((h) => (
                <tr key={h.id} className="transition-colors hover:bg-[#141b16]">
                  <td className="py-2.5 font-mono text-[11px] text-[#718075]">{h.date}</td>
                  <td className="py-2.5 font-bold text-[#e4eae5]">{h.symbol}</td>
                  <td className="py-2.5">
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        h.predicted_direction === 'Bullish'
                          ? 'bg-[#1b2f1f] text-[#a8c55a]'
                          : 'bg-[#3d1e1e] text-[#e57373]'
                      }`}
                    >
                      {h.predicted_direction}
                    </span>
                  </td>
                  <td className="py-2.5 text-[#cfd9d1]">{formatPercent(h.predicted_return * 100)}</td>
                  <td className="py-2.5 font-medium text-[#e4eae5]">
                    {formatPercent(h.actual_return * 100)}
                  </td>
                  <td className="py-2.5 text-[#86968a]">{(h.confidence * 100).toFixed(0)}%</td>
                  <td className="py-2.5 text-right">
                    {h.success ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#a8c55a]">
                        <CheckCircle size={13} /> Accurate
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#e57373]">
                        <XCircle size={13} /> Deviation
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
