import { useState } from 'react'
import type { OrderSide, OrderType } from '../../types/order'
import { formatCurrency } from '../../utils/formatters'

interface BuySellPanelProps {
  symbol: string
  currentPrice: number
  onSubmitOrder: (payload: {
    symbol: string
    side: OrderSide
    quantity: number
    type: OrderType
    price?: number
  }) => Promise<void>
}

export default function BuySellPanel({ symbol, currentPrice, onSubmitOrder }: BuySellPanelProps) {
  const [side, setSide] = useState<OrderSide>('Buy')
  const [orderType, setOrderType] = useState<OrderType>('Market')
  const [quantity, setQuantity] = useState('10')
  const [limitPrice, setLimitPrice] = useState(currentPrice ? currentPrice.toFixed(2) : '100.00')
  const [submitting, setSubmitting] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  const execPrice = orderType === 'Limit' ? Number(limitPrice || 0) : currentPrice
  const totalValue = Number(quantity || 0) * execPrice

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!Number(quantity) || Number(quantity) <= 0) {
      setStatusMsg('Please enter a valid quantity.')
      return
    }

    try {
      setSubmitting(true)
      setStatusMsg('')
      await onSubmitOrder({
        symbol,
        side,
        quantity: Number(quantity),
        type: orderType,
        price: orderType === 'Limit' ? Number(limitPrice) : undefined,
      })
      setStatusMsg(`Success: ${side} order placed for ${quantity} ${symbol}!`)
      setTimeout(() => setStatusMsg(''), 4000)
    } catch (err: unknown) {
      setStatusMsg(err instanceof Error ? err.message : 'Order submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
      <div className="mb-3 flex rounded-lg bg-[#0d120f] p-1">
        <button
          type="button"
          onClick={() => setSide('Buy')}
          className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
            side === 'Buy'
              ? 'bg-[#a8c55a] text-[#0d120f] shadow-sm'
              : 'text-[#859689] hover:text-[#e4eae5]'
          }`}
        >
          BUY {symbol}
        </button>
        <button
          type="button"
          onClick={() => setSide('Sell')}
          className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
            side === 'Sell'
              ? 'bg-[#e57373] text-[#0d120f] shadow-sm'
              : 'text-[#859689] hover:text-[#e4eae5]'
          }`}
        >
          SELL {symbol}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-[11px] font-medium text-[#7d8f82]">Order Type</label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as OrderType)}
            className="mt-1 w-full rounded-lg border border-[#263128] bg-[#161e18] px-3 py-1.5 text-xs text-[#e4eae5] focus:border-[#a8c55a] focus:outline-none"
          >
            <option value="Market">Market (Instant Fill)</option>
            <option value="Limit">Limit (Price Trigger)</option>
            <option value="Stop">Stop Loss</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-medium text-[#7d8f82]">Shares / Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#263128] bg-[#161e18] px-3 py-1.5 text-xs text-[#e4eae5] focus:border-[#a8c55a] focus:outline-none"
          />
        </div>

        {orderType === 'Limit' && (
          <div>
            <label className="text-[11px] font-medium text-[#7d8f82]">Limit Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#263128] bg-[#161e18] px-3 py-1.5 text-xs text-[#e4eae5] focus:border-[#a8c55a] focus:outline-none"
            />
          </div>
        )}

        <div className="rounded-lg bg-[#161e18] p-2.5 text-xs text-[#7d8f82]">
          <div className="flex justify-between">
            <span>Market Price</span>
            <span className="font-medium text-[#e4eae5]">{formatCurrency(currentPrice)}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-[#222c24] pt-1">
            <span>Estimated Total</span>
            <span className="font-bold text-[#c0dc7c]">{formatCurrency(totalValue)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full rounded-lg py-2 text-xs font-bold transition-all ${
            side === 'Buy'
              ? 'bg-[#a8c55a] text-[#0d120f] hover:brightness-110'
              : 'bg-[#e57373] text-[#0d120f] hover:brightness-110'
          } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {submitting ? 'Transmitting...' : `Confirm ${side} Order`}
        </button>

        {statusMsg && (
          <p
            className={`text-center text-[11px] font-medium ${
              statusMsg.startsWith('Success') ? 'text-[#a8c55a]' : 'text-[#e57373]'
            }`}
          >
            {statusMsg}
          </p>
        )}
      </form>
    </div>
  )
}
