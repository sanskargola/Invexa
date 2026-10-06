export interface Position {
  symbol: string
  quantity: number
  avg_cost: number
  market_price: number
  market_value: number
  pnl: number
  pnl_percent: number
}

export interface PortfolioSummary {
  account_value: number
  cash: number
  invested: number
  pnl: number
  daily_return: number
  allocation: {
    equity: number
    cash: number
    options?: number
    crypto?: number
  }
}

export interface PerformancePoint {
  date: string
  value: number
  benchmark: number
}

export interface AllocationItem {
  name: string
  value: number
  percentage: number
  color: string
}

export interface Transaction {
  id: string
  date: string
  type: 'BUY' | 'SELL' | 'DEPOSIT' | 'WITHDRAWAL' | 'DIVIDEND'
  symbol: string
  amount: number
  shares: number
  price: number
  fee: number
}
