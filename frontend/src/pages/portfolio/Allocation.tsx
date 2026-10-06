import { usePortfolio } from '../../hooks/usePortfolio'
import AllocationChart from '../../components/portfolio/AllocationChart'
import { PieChart, Sliders } from 'lucide-react'

export default function Allocation() {
  const { allocation, summary } = usePortfolio()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#e4eae5]">Asset Allocation & Exposure</h1>
        <p className="text-xs text-[#7d8f82]">
          Understand diversification, sector distribution, and cash weightings.
        </p>
      </div>

      <div className="rounded-xl border border-[#232c25] bg-[#121814] p-5">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#9db0a1]">
          Current Weightings
        </h3>
        <AllocationChart items={allocation} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#69796e]">Equities Weight</p>
          <p className="mt-1 text-xl font-bold text-[#e4eae5]">
            {((summary?.allocation?.equity ?? 0.65) * 100).toFixed(0)}%
          </p>
          <p className="mt-1 text-[11px] text-[#718075]">Target Range: 60% - 80%</p>
        </div>
        <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#69796e]">Cash Reserves</p>
          <p className="mt-1 text-xl font-bold text-[#c0dc7c]">
            {((summary?.allocation?.cash ?? 0.35) * 100).toFixed(0)}%
          </p>
          <p className="mt-1 text-[11px] text-[#718075]">Target Range: 15% - 40%</p>
        </div>
        <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#69796e]">Rebalance Status</p>
          <p className="mt-1 text-xl font-bold text-[#a8c55a]">Balanced</p>
          <p className="mt-1 text-[11px] text-[#718075]">Within acceptable risk bounds</p>
        </div>
      </div>
    </div>
  )
}
