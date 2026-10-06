import type { Order } from '../../types/order'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

interface OrderHistoryProps {
  orders: Order[]
  onCancel?: (orderId: string) => void
}

export default function OrderHistory({ orders, onCancel }: OrderHistoryProps) {
  if (!orders.length) {
    return (
      <div className="py-6 text-center text-xs text-[#718075]">
        No orders found.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-[#cfd9d1]">
        <thead>
          <tr className="border-b border-[#252f27] text-[11px] uppercase tracking-wider text-[#6e8073]">
            <th className="pb-2 font-medium">Order ID</th>
            <th className="pb-2 font-medium">Symbol</th>
            <th className="pb-2 font-medium">Side</th>
            <th className="pb-2 font-medium">Type</th>
            <th className="pb-2 font-medium">Qty</th>
            <th className="pb-2 font-medium">Price</th>
            <th className="pb-2 font-medium">Status</th>
            <th className="pb-2 font-medium">Time</th>
            {onCancel && <th className="pb-2 text-right font-medium">Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1b231d]">
          {orders.map((ord) => {
            const isBuy = ord.side === 'Buy'
            const isFilled = ord.status === 'Filled'
            return (
              <tr key={ord.id} className="transition-colors hover:bg-[#141b16]">
                <td className="py-2.5 font-mono text-[11px] text-[#95a598]">{ord.id}</td>
                <td className="py-2.5 font-bold text-[#e4eae5]">{ord.symbol}</td>
                <td className="py-2.5">
                  <span
                    className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      isBuy ? 'bg-[#23351d] text-[#a8c55a]' : 'bg-[#3d1e1e] text-[#e57373]'
                    }`}
                  >
                    {ord.side.toUpperCase()}
                  </span>
                </td>
                <td className="py-2.5 text-[#95a598]">{ord.type}</td>
                <td className="py-2.5">{ord.quantity}</td>
                <td className="py-2.5 font-medium">{formatCurrency(ord.price)}</td>
                <td className="py-2.5">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      isFilled
                        ? 'bg-[#1b2e21] text-[#a8c55a]'
                        : ord.status === 'Open'
                        ? 'bg-[#2b2b1b] text-[#facc15]'
                        : 'bg-[#282121] text-[#95a598]'
                    }`}
                  >
                    {ord.status}
                  </span>
                </td>
                <td className="py-2.5 text-[11px] text-[#718075]">
                  {formatDateTime(ord.created_at)}
                </td>
                {onCancel && (
                  <td className="py-2.5 text-right">
                    {ord.status === 'Open' && (
                      <button
                        onClick={() => onCancel(ord.id)}
                        className="rounded border border-[#3d2b2b] px-2 py-0.5 text-[10px] text-[#e57373] hover:bg-[#381a1a]"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
