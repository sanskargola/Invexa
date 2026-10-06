import { useTrading } from '../../hooks/useTrading'
import OrderHistory from '../../components/trading/OrderHistory'

export default function TradeHistory() {
  const { orders, loading } = useTrading()
  const filledOrders = orders.filter((o) => o.status === 'Filled')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#e4eae5]">Execution Trade History</h1>
        <p className="text-xs text-[#7d8f82]">
          Complete historical record of executed buy and sell orders.
        </p>
      </div>

      <div className="rounded-xl border border-[#232c25] bg-[#121814] p-5">
        {loading ? (
          <div className="py-8 text-center text-xs text-[#7d8f82]">Loading history...</div>
        ) : (
          <OrderHistory orders={filledOrders} />
        )}
      </div>
    </div>
  )
}
