import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { strategyStore } from '../../store/strategyStore'
import { STRATEGY_TYPES, DEFAULT_SYMBOLS } from '../../utils/constants'
import { Cpu, Save, ArrowLeft } from 'lucide-react'

export default function StrategyBuilder() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [type, setType] = useState('Momentum Breakout')
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(['NVDA', 'AAPL'])
  const [description, setDescription] = useState('')
  const [fastEma, setFastEma] = useState('12')
  const [slowEma, setSlowEma] = useState('26')
  const [rsiThreshold, setRsiThreshold] = useState('30')
  const [submitting, setSubmitting] = useState(false)

  function toggleSymbol(s: string) {
    if (selectedSymbols.includes(s)) {
      setSelectedSymbols(selectedSymbols.filter((x) => x !== s))
    } else {
      setSelectedSymbols([...selectedSymbols, s])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    try {
      setSubmitting(true)
      await strategyStore.createStrategy({
        name: name.trim(),
        type,
        symbols: selectedSymbols.length ? selectedSymbols : ['NVDA'],
        description: description.trim() || `Automated ${type} model testing Fast EMA ${fastEma} / Slow EMA ${slowEma} & RSI ${rsiThreshold}.`,
      })
      navigate('/algo/strategies')
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs text-[#a8c55a] hover:underline"
      >
        <ArrowLeft size={13} /> Back
      </button>

      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#e4eae5]">Strategy Builder</h1>
        <p className="text-xs text-[#7d8f82]">
          Define entry rules, indicator triggers, asset universe, and risk management criteria.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-[#232c25] bg-[#121814] p-5 space-y-4">
        <div>
          <label className="text-xs font-medium text-[#7d8f82]">Strategy Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Adaptive VWAP Reversal Bot"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#263128] bg-[#161e18] px-3 py-2 text-xs text-[#e4eae5] focus:border-[#a8c55a] focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[#7d8f82]">Strategy Archetype</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#263128] bg-[#161e18] px-3 py-2 text-xs text-[#e4eae5] focus:border-[#a8c55a] focus:outline-none"
          >
            {STRATEGY_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-[#7d8f82]">Target Assets</label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {DEFAULT_SYMBOLS.slice(0, 8).map((s) => {
              const checked = selectedSymbols.includes(s)
              return (
                <button
                  type="button"
                  key={s}
                  onClick={() => toggleSymbol(s)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    checked
                      ? 'bg-[#a8c55a] text-[#0d120f]'
                      : 'border border-[#263128] bg-[#161e18] text-[#86968a] hover:text-[#fff]'
                  }`}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 border-t border-[#1c241e] pt-3">
          <div>
            <label className="text-[11px] text-[#7d8f82]">Fast EMA</label>
            <input
              type="number"
              value={fastEma}
              onChange={(e) => setFastEma(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#263128] bg-[#161e18] px-2.5 py-1.5 text-xs text-[#e4eae5]"
            />
          </div>
          <div>
            <label className="text-[11px] text-[#7d8f82]">Slow EMA</label>
            <input
              type="number"
              value={slowEma}
              onChange={(e) => setSlowEma(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#263128] bg-[#161e18] px-2.5 py-1.5 text-xs text-[#e4eae5]"
            />
          </div>
          <div>
            <label className="text-[11px] text-[#7d8f82]">RSI Threshold</label>
            <input
              type="number"
              value={rsiThreshold}
              onChange={(e) => setRsiThreshold(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#263128] bg-[#161e18] px-2.5 py-1.5 text-xs text-[#e4eae5]"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-[#7d8f82]">Description & Thesis</label>
          <textarea
            rows={3}
            placeholder="Describe the logic and market regime for this strategy..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#263128] bg-[#161e18] px-3 py-2 text-xs text-[#e4eae5] focus:border-[#a8c55a] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#a8c55a] py-2 text-xs font-bold text-[#0d120f] transition-all hover:brightness-110"
        >
          <Save size={14} />
          {submitting ? 'Deploying...' : 'Save & Deploy Strategy'}
        </button>
      </form>
    </div>
  )
}
