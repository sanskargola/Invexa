import { formatCurrency } from '../../utils/formatters'

interface OrderBookProps {
  currentPrice: number
}

export default function OrderBook({ currentPrice }: OrderBookProps) {
  const price = currentPrice || 150.0

  const asks = [0.18, 0.14, 0.10, 0.06, 0.02].map((offset, idx) => ({
    price: price + offset,
    size: 40 + idx * 25,
    total: 2100 + idx * 300,
  }))

  const bids = [0.02, 0.06, 0.10, 0.14, 0.18].map((offset, idx) => ({
    price: Math.max(0.1, price - offset),
    size: 55 + idx * 20,
    total: 2400 - idx * 250,
  }))

  return (
    <div className="rounded-xl border border-[#232c25] bg-[#121814] p-3 text-xs">
      <div className="mb-2 flex items-center justify-between border-b border-[#212923] pb-1.5 text-[11px] font-medium text-[#708073]">
        <span>Price</span>
        <span>Size</span>
        <span>Total</span>
      </div>

      {/* Asks (Red) */}
      <div className="space-y-1">
        {asks.map((ask, i) => (
          <div key={i} className="flex items-center justify-between text-[#e57373]">
            <span className="font-mono">{ask.price.toFixed(2)}</span>
            <span className="text-[#a4b3a7]">{ask.size}</span>
            <span className="text-[#78887b]">{ask.total}</span>
          </div>
        ))}
      </div>

      {/* Spread / Current */}
      <div className="my-2 border-y border-[#263128] py-1 text-center font-bold text-[#c0dc7c]">
        Spread · {formatCurrency(price)}
      </div>

      {/* Bids (Green) */}
      <div className="space-y-1">
        {bids.map((bid, i) => (
          <div key={i} className="flex items-center justify-between text-[#a8c55a]">
            <span className="font-mono">{bid.price.toFixed(2)}</span>
            <span className="text-[#a4b3a7]">{bid.size}</span>
            <span className="text-[#78887b]">{bid.total}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
