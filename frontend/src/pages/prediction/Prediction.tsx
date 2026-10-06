import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, TrendingUp, SlidersHorizontal, ArrowRight } from 'lucide-react'
import { predictionApi } from '../../services/predictionApi'
import type { ModelInfo, Prediction } from '../../types/prediction'
import PredictionCard from '../../components/prediction/PredictionCard'
import PredictionChart from '../../components/prediction/PredictionChart'
import ConfidenceCard from '../../components/prediction/ConfidenceCard'

export default function PredictionPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [selected, setSelected] = useState<Prediction | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void predictionApi.getPredictions().then((data) => {
      setPredictions(data)
      if (data.length) setSelected(data[0])
      setLoading(false)
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#e4eae5]">AI Price Predictions</h1>
          <p className="text-xs text-[#7d8f82]">
            Ensemble deep neural networks and gradient boosting forecasts across multi-day horizons.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/prediction/models"
            className="flex items-center gap-1.5 rounded-lg border border-[#263128] bg-[#141b16] px-3 py-1.5 text-xs text-[#a4b3a8] hover:border-[#38483b] hover:text-[#fff]"
          >
            <SlidersHorizontal size={13} />
            Model Suite
          </Link>
          <Link
            to="/prediction/history"
            className="flex items-center gap-1.5 rounded-lg bg-[#a8c55a] px-3 py-1.5 text-xs font-semibold text-[#0d120f] hover:brightness-110"
          >
            <TrendingUp size={13} />
            Historical Accuracy
          </Link>
        </div>
      </div>

      {selected && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PredictionChart
              currentPrice={selected.current_price}
              targetPrice={selected.target_price}
              symbol={selected.symbol}
            />
          </div>
          <div>
            <ConfidenceCard score={selected.confidence} label={`${selected.symbol} Model Confidence`} />
          </div>
        </div>
      )}

      {/* Grid of Predictions */}
      <div className="rounded-xl border border-[#232c25] bg-[#121814] p-5">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#9db0a1]">
          Active Asset Forecasts (Click to inspect)
        </h3>
        {loading ? (
          <div className="py-8 text-center text-xs text-[#7d8f82]">Loading AI models...</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {predictions.map((pred) => (
              <PredictionCard
                key={pred.symbol}
                prediction={pred}
                onSelect={(sym) => {
                  const m = predictions.find((p) => p.symbol === sym)
                  if (m) setSelected(m)
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
