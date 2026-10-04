import { request } from './api'

export type MarketQuote = {
  symbol: string
  name: string
  exchange: string
  price: number
  change: number
  percent_change: number
  volume: number
  market_cap?: number
  currency: string
}

export const marketApi = {
  async getOverview() {
    try {
      return await request<{ market_status: string; markets: string[]; total_volume: number }>('/market/overview')
    } catch {
      return {
        market_status: 'open',
        advancers: 1684,
        decliners: 922,
        volatility_index: 14.2,
        total_volume: 230000000,
        markets: ['NASDAQ', 'NSE', 'BSE'],
      }
    }
  },

  async getQuotes(): Promise<MarketQuote[]> {
    try {
      return await request<MarketQuote[]>('/market/quotes')
    } catch {
      return [
        { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', price: 214.88, change: 3.42, percent_change: 1.62, volume: 5810000, market_cap: 3200000000000, currency: 'USD' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', price: 456.12, change: 4.1, percent_change: 0.91, volume: 4900000, market_cap: 3390000000000, currency: 'USD' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', price: 132.45, change: 7.8, percent_change: 6.25, volume: 8900000, market_cap: 3200000000000, currency: 'USD' },
        { symbol: 'RELIANCE', name: 'Reliance Industries', exchange: 'NSE', price: 3098.65, change: 74.4, percent_change: 2.46, volume: 8200000, market_cap: 2120000000000, currency: 'INR' },
        { symbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE', price: 3921.15, change: 44.9, percent_change: 1.16, volume: 6400000, market_cap: 1450000000000, currency: 'INR' },
        { symbol: 'INFY', name: 'Infosys', exchange: 'NSE', price: 1844.2, change: -18.55, percent_change: -0.99, volume: 5200000, market_cap: 930000000000, currency: 'INR' },
      ]
    }
  },

  async searchStocks(query = ''): Promise<MarketQuote[]> {
    try {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      return await request<MarketQuote[]>(`/market/search?${params.toString()}`)
    } catch {
      const items = await this.getQuotes()
      if (!query) return items
      const normalized = query.toLowerCase()
      return items.filter((item) => item.symbol.toLowerCase().includes(normalized) || item.name.toLowerCase().includes(normalized) || item.exchange.toLowerCase().includes(normalized))
    }
  },

  async getStock(symbol: string): Promise<MarketQuote | null> {
    try {
      return await request<MarketQuote>(`/market/quotes/${encodeURIComponent(symbol)}`)
    } catch {
      const list = await this.getQuotes()
      return list.find((item) => item.symbol.toLowerCase() === symbol.toLowerCase()) ?? null
    }
  },
}
