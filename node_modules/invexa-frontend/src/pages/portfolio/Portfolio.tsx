import { Link } from 'react-router-dom'
import { ArrowRight, PieChart, TrendingUp, History, ShieldAlert } from 'lucide-react'
import { usePortfolio } from '../../hooks/usePortfolio'
import { useTrading } from '../../hooks/useTrading'
import PnLCard from '../../components/portfolio/PnLCard'
import AllocationChart from '../../components/portfolio/AllocationChart'
import HoldingsTable from '../../components/portfolio/HoldingsTable'

export default function Portfolio() {
  const { summary, allocation } = usePortfolio()
  const { positions, closePosition } = useTrading()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#e4eae5]">Portfolio Workspace</h1>
          <p className="text-xs text-[#7d8f82]">
            Comprehensive exposure, asset allocations, mark-to-market performance, and capital accounting.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/portfolio/allocation"
            className="flex items-center gap-1.5 rounded-lg border border-[#263128] bg-[#141b16] px-3 py-1.5 text-xs text-[#a4b3a8] hover:border-[#38483b] hover:text-[#fff]"
          >
            <PieChart size={13} />
            Rebalance
          </Link>
          <Link
            to="/portfolio/performance"
            className="flex items-center gap-1.5 rounded-lg bg-[#a8c55a] px-3 py-1.5 text-xs font-semibold text-[#0d120f] hover:brightness-110"
          >
            <TrendingUp size={13} />
            Performance Report
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PnLCard
          label="Total Portfolio Value"
          amount={summary?.account_value ?? 128450.32}
          sublabel="Equities + Cash Balance"
        />
        <PnLCard
          label="Unrealized Return"
          amount={summary?.pnl ?? 12640.57}
          percent={summary ? (summary.pnl / (summary.invested || 1)) * 100 : 8.4}
          sublabel="All active positions"
        />
        <PnLCard
          label="Available Cash"
          amount={summary?.cash ?? 45020.18}
          sublabel="Ready for deployment"
        />
        <PnLCard
          label="Invested Capital"
          amount={summary?.invested ?? 83430.14}
          sublabel={`${positions.length} securities held`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Holdings Table */}
        <div className="rounded-xl border border-[#232c25] bg-[#121814] p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9db0a1]">
              Active Positions & Exposures
            </h3>
            <Link to="/trading/positions" className="flex items-center gap-1 text-xs text-[#a8c55a] hover:underline">
              Manage <ArrowRight size={12} />
            </Link>
          </div>
          <HoldingsTable positions={positions} onClose={closePosition} />
        </div>

        {/* Allocation breakdown */}
        <div className="rounded-xl border border-[#232c25] bg-[#121814] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9db0a1]">
              Asset Allocation
            </h3>
            <Link to="/portfolio/allocation" className="text-xs text-[#a8c55a] hover:underline">
              Details
            </Link>
          </div>
          <AllocationChart items={allocation} />
        </div>
      </div>
    </div>
  )
}
