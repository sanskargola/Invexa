import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, RefreshCw } from 'lucide-react'
import { useTrading } from '../../hooks/useTrading'
import OrderHistory from '../../components/trading/OrderHistory'

export default function Orders() {
  const { orders, loading, cancelOrder, refresh } = useTrading()
  const [filter, setFilter] = useState<'all' | 'Open' | 'Filled' | 'Cancelled'>('all')

  const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#e4eae5]">Orders Management</h1>
          <p className="text-xs text-[#7d8f82]">
            Monitor submitted, active, and filled market and limit orders.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refresh()}
            className="flex items-center gap-1.5 rounded-lg border border-[#2a342d] bg-[#161d18] px-3 py-1.5 text-xs text-[#a4b3a8] transition-colors hover:border-[#3d4d42] hover:text-[#fff]"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
          <Link
            to="/terminal"
            className="flex items-center gap-1.5 rounded-lg bg-[#a8c55a] px-3 py-1.5 text-xs font-semibold text-[#0d120f] transition-all hover:brightness-110"
          >
            <Plus size={14} />
            New Order
          </Link>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-lg border border-[#232c25] bg-[#121814] p-1 w-fit">
        {(['all', 'Open', 'Filled', 'Cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              filter === tab
                ? 'bg-[#202922] text-[#c0dc7c]'
                : 'text-[#7d8f82] hover:text-[#e4eae5]'
            }`}
          >
            {tab === 'all' ? 'All Orders' : tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#232c25] bg-[#121814] p-5 shadow-sm">
        {loading ? (
          <div className="py-8 text-center text-xs text-[#7d8f82]">Loading orders...</div>
        ) : (
          <OrderHistory orders={filteredOrders} onCancel={cancelOrder} />
        )}
      </div>
    </div>
  )
}
