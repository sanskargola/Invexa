import type { AllocationItem } from '../../types/portfolio'
import { formatCurrency } from '../../utils/formatters'

interface AllocationChartProps {
  items: AllocationItem[]
}

export default function AllocationChart({ items }: AllocationChartProps) {
  if (!items.length) {
    return <div className="text-xs text-[#718075]">No allocation data available</div>
  }

  return (
    <div className="space-y-4">
      {/* Visual progress bar representation */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-[#1c241e]">
        {items.map((item) => (
          <div
            key={item.name}
            style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
            className="transition-all duration-500"
            title={`${item.name}: ${item.percentage}%`}
          />
        ))}
      </div>

      {/* Legend list */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.name} className="flex items-center gap-2 rounded-lg bg-[#141b16] p-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-[#e4eae5]">{item.name}</p>
              <p className="text-[11px] text-[#78887c]">
                {item.percentage}% · {formatCurrency(item.value)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
