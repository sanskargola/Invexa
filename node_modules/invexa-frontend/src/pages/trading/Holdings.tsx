import { useTrading } from '../../hooks/useTrading'
import HoldingsTable from '../../components/portfolio/HoldingsTable'

export default function Holdings() {
  const { positions, loading, closePosition } = useTrading()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#e4eae5]">Portfolio Holdings</h1>
        <p className="text-xs text-[#7d8f82]">
          Assets currently held in your investment account.
        </p>
      </div>

      <div className="rounded-xl border border-[#232c25] bg-[#121814] p-5">
        {loading ? (
          <div className="py-8 text-center text-xs text-[#7d8f82]">Loading holdings...</div>
        ) : (
          <HoldingsTable positions={positions} onClose={closePosition} />
        )}
      </div>
    </div>
  )
}
