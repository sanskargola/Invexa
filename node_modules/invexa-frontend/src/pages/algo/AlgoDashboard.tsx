import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Cpu, Play, Pause, Plus, TrendingUp, Activity, ArrowRight } from 'lucide-react'
import { strategyStore } from '../../store/strategyStore'
import { strategyApi } from '../../services/strategyApi'
import type { Strategy } from '../../types/strategy'
import { formatPercent } from '../../utils/formatters'

export default function AlgoDashboard() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [summary, setSummary] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)
    const [strats, sum] = await Promise.all([
      strategyStore.fetchStrategies(),
      strategyApi.getAlgoSummary(),
    ])
    setStrategies(strats)
    setSummary(sum)
    setLoading(false)
  }

  useEffect(() => {
    void loadData()
  }, [])

  async function handleToggle(id: string) {
    await strategyStore.toggleStrategy(id)
    setStrategies(strategyStore.getStrategies())
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#e4eae5]">Algorithmic Trading Dashboard</h1>
          <p className="text-xs text-[#7d8f82]">
            Monitor active quantitative execution bots, signals, and real-time execution quality.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/algo/backtesting"
            className="flex items-center gap-1.5 rounded-lg border border-[#263128] bg-[#141b16] px-3 py-1.5 text-xs text-[#a4b3a8] hover:border-[#38483b] hover:text-[#fff]"
          >
            <TrendingUp size={13} />
            Backtesting
          </Link>
          <Link
            to="/algo/builder"
            className="flex items-center gap-1.5 rounded-lg bg-[#a8c55a] px-3 py-1.5 text-xs font-semibold text-[#0d120f] hover:brightness-110"
          >
            <Plus size={14} />
            Build Strategy
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#69796e]">Total Strategies</p>
          <p className="mt-1 text-2xl font-bold text-[#e4eae5]">{strategies.length}</p>
          <p className="mt-1 text-[11px] text-[#718075]">Automated models</p>
        </div>
        <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#69796e]">Active Execution</p>
          <p className="mt-1 text-2xl font-bold text-[#a8c55a]">
            {strategies.filter((s) => s.status === 'active').length} Running
          </p>
          <p className="mt-1 text-[11px] text-[#718075]">Live order routing</p>
        </div>
        <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#69796e]">System Health</p>
          <p className="mt-1 text-2xl font-bold text-[#c0dc7c]">98.6%</p>
          <p className="mt-1 text-[11px] text-[#718075]">1.4ms execution latency</p>
        </div>
        <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#69796e]">Trades Today</p>
          <p className="mt-1 text-2xl font-bold text-[#e4eae5]">24</p>
          <p className="mt-1 text-[11px] text-[#718075]">Zero failed executions</p>
        </div>
      </div>

      {/* Strategies List */}
      <div className="rounded-xl border border-[#232c25] bg-[#121814] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9db0a1]">
            Deployed Quantitative Strategies
          </h3>
          <Link to="/algo/strategies" className="flex items-center gap-1 text-xs text-[#a8c55a] hover:underline">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {strategies.map((strat) => {
            const isActive = strat.status === 'active'
            return (
              <div
                key={strat.id}
                className="rounded-xl border border-[#202922] bg-[#151c17] p-4 transition-all hover:border-[#334236]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a241c] text-[#a8c55a]">
                      <Cpu size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#e4eae5]">{strat.name}</h4>
                      <p className="text-[10px] text-[#78887b]">{strat.type}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle(strat.id)}
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                      isActive
                        ? 'bg-[#1b2f1f] text-[#a8c55a] hover:bg-[#253f2a]'
                        : 'bg-[#2b2b1b] text-[#facc15] hover:bg-[#3d3d25]'
                    }`}
                  >
                    {isActive ? <Pause size={10} /> : <Play size={10} />}
                    {isActive ? 'Active' : 'Paused'}
                  </button>
                </div>

                <p className="mt-3 text-[11px] leading-relaxed text-[#95a598] line-clamp-2">
                  {strat.description}
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#1e2720] pt-3 text-center">
                  <div>
                    <p className="text-[9px] uppercase text-[#69796e]">Return</p>
                    <p className="text-xs font-bold text-[#a8c55a]">
                      {formatPercent(strat.annual_return * 100)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase text-[#69796e]">Win Rate</p>
                    <p className="text-xs font-bold text-[#e4eae5]">
                      {(strat.win_rate * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase text-[#69796e]">Max DD</p>
                    <p className="text-xs font-bold text-[#e57373]">
                      {(strat.max_drawdown * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
