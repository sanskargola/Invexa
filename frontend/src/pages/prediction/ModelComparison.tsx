import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { predictionApi } from '../../services/predictionApi'
import type { ModelInfo } from '../../types/prediction'
import ModelCard from '../../components/prediction/ModelCard'

export default function ModelComparison() {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void predictionApi.getModels().then((data) => {
      setModels(data)
      setLoading(false)
    })
  }, [])

  return (
    <div className="space-y-6">
      <Link to="/prediction" className="inline-flex items-center gap-1.5 text-xs text-[#a8c55a]">
        <ArrowLeft size={13} /> Back to Predictions
      </Link>

      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#e4eae5]">Model Architecture Suite</h1>
        <p className="text-xs text-[#7d8f82]">
          Benchmark neural architectures, hyperparameter optimizations, and cross-validation Sharpe metrics.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {models.map((m) => (
          <ModelCard key={m.id} model={m} />
        ))}
      </div>
    </div>
  )
}
