import { useEffect, useState } from 'react'
import type { CreateOrderPayload, Order } from '../types/order'
import type { Position } from '../types/portfolio'
import { tradingStore } from '../store/tradingStore'

export function useTrading() {
  const [orders, setOrders] = useState<Order[]>(tradingStore.getOrders())
  const [positions, setPositions] = useState<Position[]>(tradingStore.getPositions())
  const [loading, setLoading] = useState(orders.length === 0)

  useEffect(() => {
    const unsubscribe = tradingStore.subscribe(() => {
      setOrders(tradingStore.getOrders())
      setPositions(tradingStore.getPositions())
      setLoading(false)
    })

    void tradingStore.fetchAll().finally(() => setLoading(false))

    const timer = window.setInterval(() => {
      void tradingStore.fetchAll()
    }, 15000)

    return () => {
      unsubscribe()
      window.clearInterval(timer)
    }
  }, [])

  return {
    orders,
    positions,
    loading,
    placeOrder: (payload: CreateOrderPayload) => tradingStore.placeOrder(payload),
    cancelOrder: (orderId: string) => tradingStore.cancelOrder(orderId),
    closePosition: (symbol: string) => tradingStore.closePosition(symbol),
    refresh: () => tradingStore.fetchAll(),
  }
}
