import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react'
import { useTrading } from '../../hooks/useTrading'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

export default function OrderDetails() {
  const [params] = useSearchParams()
  const orderId = params.get('id')
  const { orders } = useTrading()

  const order = orders.find((o) => o.id === orderId) ?? orders[0]

  if (!order) {
    return (
      <div className="space-y-4">
        <Link to="/trading/orders" className="inline-flex items-center gap-1.5 text-xs text-[#a8c55a]">
          <ArrowLeft size={13} /> Back to Orders
        </Link>
        <p className="text-xs text-[#7d8f82]">No order found.</p>
      </div>
    )
  }

  const isBuy = order.side === 'Buy'
  const isFilled = order.status === 'Filled'

  return (
    <div className="space-y-6">
      <Link to="/trading/orders" className="inline-flex items-center gap-1.5 text-xs text-[#a8c55a]">
        <ArrowLeft size={13} /> Back to Orders
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#e4eae5]">
            Order {order.id}
          </h1>
          <p className="text-xs text-[#7d8f82]">{order.symbol} · {order.type} Order</p>
        </div>
        <span
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            isFilled
              ? 'bg-[#1b2f1f] text-[#a8c55a]'
              : 'bg-[#2b2b1b] text-[#facc15]'
          }`}
        >
          {isFilled ? <CheckCircle2 size={13} /> : <Clock size={13} />}
          {order.status}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#69796e]">Side</p>
          <p className={`mt-1 text-base font-bold ${isBuy ? 'text-[#a8c55a]' : 'text-[#e57373]'}`}>
            {order.side.toUpperCase()}
          </p>
        </div>
        <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#69796e]">Execution Price</p>
          <p className="mt-1 text-base font-bold text-[#e4eae5]">{formatCurrency(order.price)}</p>
        </div>
        <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#69796e]">Quantity</p>
          <p className="mt-1 text-base font-bold text-[#e4eae5]">{order.quantity} shares</p>
        </div>
        <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#69796e]">Total Consideration</p>
          <p className="mt-1 text-base font-bold text-[#c0dc7c]">
            {formatCurrency(order.price * order.quantity)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[#232c25] bg-[#121814] p-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#9db0a1]">
          Audit Timeline & Routing
        </h3>
        <div className="space-y-3 text-xs text-[#a4b3a8]">
          <div className="flex justify-between border-b border-[#1b231d] pb-2">
            <span>Created At</span>
            <span className="font-mono text-[#e4eae5]">{formatDateTime(order.created_at)}</span>
          </div>
          <div className="flex justify-between border-b border-[#1b231d] pb-2">
            <span>Execution Venue</span>
            <span className="text-[#e4eae5]">Invexa DMA Gateway · NASDAQ</span>
          </div>
          <div className="flex justify-between border-b border-[#1b231d] pb-2">
            <span>Commission & Fees</span>
            <span className="text-[#e4eae5]">$0.00 (Zero Commission Paper)</span>
          </div>
          {order.filled_at && (
            <div className="flex justify-between">
              <span>Filled At</span>
              <span className="font-mono text-[#a8c55a]">{formatDateTime(order.filled_at)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
