import { request } from './api'
import type { CreateOrderPayload, Order } from '../types/order'
import type { Position } from '../types/portfolio'

export const tradingApi = {
  async getOrders(statusFilter?: string): Promise<Order[]> {
    const query = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : ''
    return request<Order[]>(`/orders${query}`)
  },

  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    return request<Order>('/orders', {
      method: 'POST',
      json: payload,
    })
  },

  async cancelOrder(orderId: string): Promise<{ status: string; message: string }> {
    return request<{ status: string; message: string }>(`/orders/${encodeURIComponent(orderId)}`, {
      method: 'DELETE',
    })
  },

  async getPositions(): Promise<Position[]> {
    return request<Position[]>('/positions')
  },

  async closePosition(symbol: string): Promise<{ status: string; message: string }> {
    return request<{ status: string; message: string }>(`/positions/${encodeURIComponent(symbol)}/close`, {
      method: 'POST',
    })
  },
}
