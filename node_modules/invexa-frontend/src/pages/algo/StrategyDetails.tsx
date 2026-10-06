import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Play, Pause, Activity, TrendingUp } from 'lucide-react'
import { strategyStore } from '../../store/strategyStore'
import type { Strategy } from '../../types/strategy'
import { formatPercent } from '../../utils/formatters'

export default function StrategyDetails() {
  const [params] = useSearchParams()
  const id = params.get('id')
  const [strategy, setStrategy] = useState<Strategy | null>(null)

  useEffect(() => {
    void strategyStore.fetchStrategies().then((list) => {
      const match = list.find((s) => s.id === id) ?? list[0]
      if (match) setStrategy(match)
    })
  }, [id])

  if (!strategy) {
    return (
      <div className="space-y-4">
        <Link to="/algo/strategies" className="inline-flex items-center gap-1.5 text-xs text-[#a8c55a]">
          <ArrowLeft size={13} /> Back to Strategies
        </Link>
        <p className="text-xs text-[#7d8f82]">Loading strategy details...</p>
      </div>
    )
  }

  const isActive = strategy.status === 'active'

  return (
    <div className="space-y-6">
      <Link to="/algo/strategies" className="inline-flex items-center gap-1.5 text-xs text-[#a8c55a]">
        <ArrowLeft size={13} /> Back to Strategies
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#e4eae5]">{strategy.name}</h1>
          <p className="text-xs text-[#7d8f82]">{strategy.type} · Deployed on Invexa Algo Core</p>
        </div>
        <button
          onClick={async () => {
            await strategyStore.toggleStrategy(strategy.id)
            setStrategy({ ...strategy, status: isActive ? 'paused' : 'active' })
          }}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            isActive ? 'bg-[#1b2f1f] text-[#a8c55a]' : 'bg-[#2b2b1b] text-[#facc15]'
          }`}
        >
          {isActive ? <Pause size={12} /> : <Play size={12} />}
          {isActive ? 'Execution Active' : 'Execution Paused'}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#69796e]">Annualized Alpha</p>
          <p className="mt-1 text-xl font-bold text-[#a8c55a]">{formatPercent(strategy.annual_return * 100)}</p>
        </div>
        <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#69796e]">Win Rate</p>
          <p className="mt-1 text-xl font-bold text-[#e4eae5]">{(strategy.win_rate * 100).toFixed(0)}%</p>
        </div>
        <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#69796e]">Total Trade Executions</p>
          <p className="mt-1 text-xl font-bold text-[#c0dc7c]">{strategy.trades_count}</p>
        </div>
      </div>

      <div className="rounded-xl border border-[#232c25] bg-[#121814] p-5">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#9db0a1]">Strategy Logic</h3>
        <p className="text-xs text-[#cfd9d1] leading-relaxed">{strategy.description}</p>
        <div className="mt-4 flex gap-2">
          <Link
            to={`/algo/backtesting?strategy=${encodeURIComponent(strategy.name)}`}
            className="flex items-center gap-1.5 rounded-lg bg-[#a8c55a] px-3 py-1.5 text-xs font-semibold text-[#0d120f] hover:brightness-110"
          >
            <TrendingUp size={13} /> Run Backtest
          </Link>
        </div>
      </div>
    </div>
  )
}
