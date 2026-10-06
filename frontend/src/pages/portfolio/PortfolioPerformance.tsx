import { usePortfolio } from '../../hooks/usePortfolio'
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { TrendingUp, ArrowUpRight, Award, ShieldCheck } from 'lucide-react'

export default function PortfolioPerformance() {
  const { performance, summary } = usePortfolio()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#e4eae5]">Portfolio Performance</h1>
        <p className="text-xs text-[#7d8f82]">
          Time-weighted returns, benchmark alpha, drawdown statistics, and volatility metrics.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#69796e]">YTD Return</p>
          <div className="mt-1 flex items-baseline gap-1 text-xl font-bold text-[#a8c55a]">
            <ArrowUpRight size={18} />
            +24.8%
          </div>
          <p className="mt-1 text-[11px] text-[#69796e]">vs S&P 500 (+14.2%)</p>
        </div>

        <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#69796e]">Sharpe Ratio</p>
          <p className="mt-1 text-xl font-bold text-[#c0dc7c]">1.84</p>
          <p className="mt-1 text-[11px] text-[#69796e]">Risk-adjusted return rating</p>
        </div>

        <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#69796e]">Maximum Drawdown</p>
          <p className="mt-1 text-xl font-bold text-[#e4eae5]">-8.4%</p>
          <p className="mt-1 text-[11px] text-[#69796e]">Historical peak-to-trough</p>
        </div>

        <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#69796e]">Win Rate</p>
          <p className="mt-1 text-xl font-bold text-[#a8c55a]">69.2%</p>
          <p className="mt-1 text-[11px] text-[#69796e]">Profitable trade closures</p>
        </div>
      </div>

      {/* Equity Curve Progression */}
      <div className="rounded-xl border border-[#232c25] bg-[#121814] p-5">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#9db0a1]">
          Historical Equity Growth vs S&P 500
        </h3>
        <div className="space-y-3">
          {performance.map((point) => (
            <div key={point.date} className="flex items-center justify-between border-b border-[#1b231d] pb-2 text-xs">
              <span className="font-mono text-[#718075]">{point.date}</span>
              <div className="flex items-center gap-6">
                <span className="text-[#849588]">Benchmark: {formatCurrency(point.benchmark)}</span>
                <span className="font-bold text-[#c0dc7c]">{formatCurrency(point.value)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
