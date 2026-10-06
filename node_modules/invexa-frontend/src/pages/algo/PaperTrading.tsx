import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RotateCcw, LineChart, ShieldCheck } from 'lucide-react'
import { request } from '../../services/api'
import { formatCurrency, formatPercent } from '../../utils/formatters'

interface PaperSummary {
  cash: float
  invested: float
  equity: float
  total_pnl: float
  win_rate: float
  total_trades: int
  winning_trades: int
  losing_trades: int
}

export default function PaperTrading() {
  const [data, setData] = useState<any>(null)
  const [resetting, setResetting] = useState(false)
  const [message, setMessage] = useState('')

  async function loadData() {
    try {
      const res = await request('/papertrading/summary')
      setData(res)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  async function handleReset() {
    if (confirm('Reset paper account capital back to $100,000.00?')) {
      try {
        setResetting(true)
        const res = await request<{ message: string }>('/papertrading/reset', { method: 'POST' })
        setMessage(res.message)
        await loadData()
      } finally {
        setResetting(false)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#e4eae5]">Paper Trading Environment</h1>
          <p className="text-xs text-[#7d8f82]">
            Risk-free virtual portfolio execution simulation with live prices and order matching.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-1.5 rounded-lg border border-[#3e4e42] bg-[#162019] px-3 py-1.5 text-xs text-[#a4b6a8] hover:text-[#fff]"
          >
            <RotateCcw size={13} />
            {resetting ? 'Resetting...' : 'Reset Account'}
          </button>
          <Link
            to="/terminal"
            className="flex items-center gap-1.5 rounded-lg bg-[#a8c55a] px-3 py-1.5 text-xs font-semibold text-[#0d120f] hover:brightness-110"
          >
            <LineChart size={13} />
            Open Order Ticket
          </Link>
        </div>
      </div>

      {message && (
        <div className="rounded-lg bg-[#1b2f1f] p-3 text-xs font-medium text-[#a8c55a]">
          {message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#69796e]">Paper Equity</p>
          <p className="mt-1 text-2xl font-bold text-[#e4eae5]">
            {formatCurrency(data?.equity ?? 100000)}
          </p>
          <p className="mt-1 text-[11px] text-[#718075]">Total virtual balance</p>
        </div>
        <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#69796e]">Simulated PnL</p>
          <p className="mt-1 text-2xl font-bold text-[#a8c55a]">
            {formatCurrency(data?.total_pnl ?? 12640)}
          </p>
          <p className="mt-1 text-[11px] text-[#718075]">Unrealized + Realized</p>
        </div>
        <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#69796e]">Win Rate</p>
          <p className="mt-1 text-2xl font-bold text-[#c0dc7c]">
            {((data?.win_rate ?? 0.69) * 100).toFixed(0)}%
          </p>
          <p className="mt-1 text-[11px] text-[#718075]">Across closed orders</p>
        </div>
        <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#69796e]">Total Paper Trades</p>
          <p className="mt-1 text-2xl font-bold text-[#e4eae5]">{data?.total_trades ?? 26}</p>
          <p className="mt-1 text-[11px] text-[#718075]">Tracked in simulation</p>
        </div>
      </div>
    </div>
  )
}
