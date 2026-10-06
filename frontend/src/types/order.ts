export type OrderSide = 'Buy' | 'Sell'
export type OrderType = 'Market' | 'Limit' | 'Stop'
export type OrderStatus = 'Filled' | 'Open' | 'Pending' | 'Cancelled' | 'Rejected'

export interface Order {
  id: string
  symbol: string
  side: OrderSide
  quantity: number
  type: OrderType
  price: number
  status: OrderStatus
  created_at: string
  filled_at?: string
}

export interface CreateOrderPayload {
  symbol: string
  side: OrderSide
  quantity: number
  type?: OrderType
  price?: number
}
