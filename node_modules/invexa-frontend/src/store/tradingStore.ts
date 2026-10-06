import type { Order, OrderSide, OrderType } from '../types/order'
import type { Position } from '../types/portfolio'
import { tradingApi } from '../services/tradingApi'

let ordersCache: Order[] = []
let positionsCache: Position[] = []
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => listener())
}

export const tradingStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  getOrders(): Order[] {
    return ordersCache
  },

  getPositions(): Position[] {
    return positionsCache
  },

  async fetchAll(): Promise<void> {
    try {
      const [orders, positions] = await Promise.all([
        tradingApi.getOrders(),
        tradingApi.getPositions(),
      ])
      ordersCache = orders
      positionsCache = positions
      notify()
    } catch {
      // Keep cached
    }
  },

  async placeOrder(payload: {
    symbol: string
    side: OrderSide
    quantity: number
    type?: OrderType
    price?: number
  }): Promise<Order> {
    const order = await tradingApi.createOrder(payload)
    ordersCache = [order, ...ordersCache]
    await this.fetchAll()
    return order
  },

  async cancelOrder(orderId: string): Promise<void> {
    await tradingApi.cancelOrder(orderId)
    await this.fetchAll()
  },

  async closePosition(symbol: string): Promise<void> {
    await tradingApi.closePosition(symbol)
    await this.fetchAll()
  },
}
