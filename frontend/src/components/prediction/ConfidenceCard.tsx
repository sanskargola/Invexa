interface ConfidenceCardProps {
  score: number // 0 to 1
  label?: string
}

export default function ConfidenceCard({ score, label = 'Model Confidence' }: ConfidenceCardProps) {
  const pct = Math.round(score * 100)
  const isHigh = pct >= 75

  return (
    <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
      <p className="text-xs font-medium text-[#7d8f82] uppercase tracking-wider">{label}</p>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-2xl font-bold text-[#e4eae5]">{pct}%</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            isHigh ? 'bg-[#1b2f1f] text-[#a8c55a]' : 'bg-[#2b2b1b] text-[#facc15]'
          }`}
        >
          {isHigh ? 'High Confidence' : 'Moderate'}
        </span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#1b231d]">
        <div
          className="h-full bg-gradient-to-r from-[#78a9d2] to-[#a8c55a] transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
