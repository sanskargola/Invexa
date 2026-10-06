import { useState, useEffect } from 'react'
import { Play, TrendingUp, Award, ArrowUpRight } from 'lucide-react'
import { backtestApi } from '../../services/backtestApi'
import type { BacktestResult } from '../../types/strategy'
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { DEFAULT_SYMBOLS } from '../../utils/constants'

export default function Backtesting() {
  const [results, setResults] = useState<BacktestResult[]>([])
  const [strategy, setStrategy] = useState('Momentum Breakout Pro')
  const [symbol, setSymbol] = useState('NVDA')
  const [timeframe, setTimeframe] = useState('1D')
  const [capital, setCapital] = useState('100000')
  const [running, setRunning] = useState(false)
  const [activeResult, setActiveResult] = useState<BacktestResult | null>(null)

  useEffect(() => {
    void backtestApi.getBacktests().then((data) => {
      setResults(data)
      if (data.length) setActiveResult(data[0])
    })
  }, [])

  async function handleRun(e: React.FormEvent) {
    e.preventDefault()
    try {
      setRunning(true)
      const res = await backtestApi.runBacktest({
        strategy,
        symbol,
        timeframe,
        initial_capital: Number(capital),
      })
      setResults([res, ...results])
      setActiveResult(res)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#e4eae5]">Strategy Backtesting Engine</h1>
        <p className="text-xs text-[#7d8f82]">
          Simulate algorithmic rules against multi-year historical candles with slippage and realistic fill models.
        </p>
      </div>

      {/* Control Form */}
      <form onSubmit={handleRun} className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end">
          <div>
            <label className="text-[11px] font-medium text-[#7d8f82]">Strategy</label>
            <input
              type="text"
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#263128] bg-[#161e18] px-3 py-1.5 text-xs text-[#e4eae5]"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-[#7d8f82]">Asset Symbol</label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#263128] bg-[#161e18] px-3 py-1.5 text-xs text-[#e4eae5]"
            >
              {DEFAULT_SYMBOLS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-[#7d8f82]">Timeframe</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#263128] bg-[#161e18] px-3 py-1.5 text-xs text-[#e4eae5]"
            >
              <option value="15m">15 Minutes</option>
              <option value="1H">1 Hour</option>
              <option value="1D">1 Day (Daily)</option>
              <option value="1W">1 Week</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-[#7d8f82]">Initial Capital ($)</label>
            <input
              type="number"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#263128] bg-[#161e18] px-3 py-1.5 text-xs text-[#e4eae5]"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={running}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#a8c55a] py-2 text-xs font-bold text-[#0d120f] transition-all hover:brightness-110"
            >
              <Play size={13} />
              {running ? 'Running Simulation...' : 'Run Backtest'}
            </button>
          </div>
        </div>
      </form>

      {/* Active Result View */}
      {activeResult && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
              <p className="text-[11px] uppercase tracking-wider text-[#69796e]">Net Historical Return</p>
              <p className="mt-1 text-2xl font-bold text-[#a8c55a]">
                {formatPercent(activeResult.net_return * 100)}
              </p>
              <p className="mt-1 text-[11px] text-[#718075]">
                Ending Capital: {formatCurrency(activeResult.final_capital)}
              </p>
            </div>
            <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
              <p className="text-[11px] uppercase tracking-wider text-[#69796e]">Sharpe Ratio</p>
              <p className="mt-1 text-2xl font-bold text-[#c0dc7c]">{activeResult.sharpe_ratio.toFixed(2)}</p>
              <p className="mt-1 text-[11px] text-[#718075]">Risk-Adjusted Alpha</p>
            </div>
            <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
              <p className="text-[11px] uppercase tracking-wider text-[#69796e]">Max Drawdown</p>
              <p className="mt-1 text-2xl font-bold text-[#e57373]">
                {formatPercent(activeResult.max_drawdown * 100)}
              </p>
              <p className="mt-1 text-[11px] text-[#718075]">Peak-to-Trough Loss</p>
            </div>
            <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
              <p className="text-[11px] uppercase tracking-wider text-[#69796e]">Win Rate</p>
              <p className="mt-1 text-2xl font-bold text-[#e4eae5]">
                {(activeResult.win_rate * 100).toFixed(0)}%
              </p>
              <p className="mt-1 text-[11px] text-[#718075]">Total Trades: {activeResult.total_trades}</p>
            </div>
          </div>

          {/* Equity Progression */}
          <div className="rounded-xl border border-[#232c25] bg-[#121814] p-5">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#9db0a1]">
              Simulated Equity Curve Progression ({activeResult.strategy} on {activeResult.symbol})
            </h3>
            <div className="space-y-3">
              {activeResult.equity_curve.map((p) => (
                <div key={p.date} className="flex items-center justify-between border-b border-[#1b231d] pb-2 text-xs">
                  <span className="font-mono text-[#718075]">{p.date}</span>
                  <span className="font-bold text-[#c0dc7c]">{formatCurrency(p.equity)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
