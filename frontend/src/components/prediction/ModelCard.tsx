import type { ModelInfo } from '../../types/prediction'
import { Cpu, CheckCircle } from 'lucide-react'

interface ModelCardProps {
  model: ModelInfo
}

export default function ModelCard({ model }: ModelCardProps) {
  return (
    <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4 transition-all hover:border-[#38483b]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#18231b] text-[#c0dc7c]">
            <Cpu size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#e4eae5]">{model.name}</h4>
            <p className="text-[11px] text-[#78887c]">{model.architecture}</p>
          </div>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-[#1b2f1f] px-2 py-0.5 text-[10px] font-medium text-[#a8c55a]">
          <CheckCircle size={10} />
          {model.status}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#1c241e] pt-3 text-center">
        <div>
          <p className="text-[10px] uppercase text-[#69796e]">Accuracy</p>
          <p className="text-xs font-bold text-[#e4eae5]">{(model.accuracy * 100).toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-[#69796e]">Sharpe</p>
          <p className="text-xs font-bold text-[#a8c55a]">{model.sharpe.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-[#69796e]">Features</p>
          <p className="text-xs font-bold text-[#e4eae5]">{model.features_count}</p>
        </div>
      </div>
    </div>
  )
}
