import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Play, Pause, Trash2, Cpu } from 'lucide-react'
import { strategyStore } from '../../store/strategyStore'
import type { Strategy } from '../../types/strategy'
import { formatPercent } from '../../utils/formatters'

export default function Strategies() {
  const [strategies, setStrategies] = useState<Strategy[]>([])

  useEffect(() => {
    void strategyStore.fetchStrategies().then(setStrategies)
  }, [])

  async function handleToggle(id: string) {
    await strategyStore.toggleStrategy(id)
    setStrategies(strategyStore.getStrategies())
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this strategy?')) {
      await strategyStore.deleteStrategy(id)
      setStrategies(strategyStore.getStrategies())
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#e4eae5]">Trading Strategies</h1>
          <p className="text-xs text-[#7d8f82]">
            Build, configure, backtest, and deploy systematic trading rules.
          </p>
        </div>
        <Link
          to="/algo/builder"
          className="flex items-center gap-1.5 rounded-lg bg-[#a8c55a] px-3 py-1.5 text-xs font-semibold text-[#0d120f] hover:brightness-110 w-fit"
        >
          <Plus size={14} />
          Create New Strategy
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {strategies.map((strat) => {
          const isActive = strat.status === 'active'
          return (
            <div
              key={strat.id}
              className="rounded-xl border border-[#232c25] bg-[#121814] p-5 shadow-sm transition-all hover:border-[#334236]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#e4eae5]">{strat.name}</h3>
                  <p className="text-[11px] text-[#78887c]">{strat.type}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggle(strat.id)}
                    className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold ${
                      isActive ? 'bg-[#1b2f1f] text-[#a8c55a]' : 'bg-[#2b2b1b] text-[#facc15]'
                    }`}
                  >
                    {isActive ? <Pause size={10} /> : <Play size={10} />}
                    {isActive ? 'Active' : 'Paused'}
                  </button>
                  <button
                    onClick={() => handleDelete(strat.id)}
                    className="rounded p-1 text-[#78887c] hover:text-[#e57373]"
                    title="Delete strategy"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-[#95a598]">
                {strat.description}
              </p>

              <div className="mt-3 flex flex-wrap gap-1">
                {strat.symbols.map((s) => (
                  <span
                    key={s}
                    className="rounded bg-[#18221b] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#c0dc7c]"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#1c241e] pt-3 text-center">
                <div>
                  <p className="text-[10px] uppercase text-[#69796e]">Annual Return</p>
                  <p className="text-xs font-bold text-[#a8c55a]">
                    {formatPercent(strat.annual_return * 100)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-[#69796e]">Win Rate</p>
                  <p className="text-xs font-bold text-[#e4eae5]">
                    {(strat.win_rate * 100).toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-[#69796e]">Trades</p>
                  <p className="text-xs font-bold text-[#e4eae5]">{strat.trades_count}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
