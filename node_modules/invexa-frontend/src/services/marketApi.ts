import { request } from './api'

export type MarketQuote = {
  symbol: string
  yahoo_symbol?: string
  tradingview_symbol?: string
  name: string
  exchange: string
  price: number
  change: number
  percent_change: number
  volume: number
  market_cap?: number | null
  currency: string
}

export type MarketOverview = {
  market_status: string
  advancers: number
  decliners: number
  unchanged?: number
  volatility_index: number
  total_volume: number
  markets: string[]
  quotes?: MarketQuote[]
}

export type NewsItem = {
  title: string
  publisher: string
  link: string
  published: string
  symbol: string
}

export type SentimentSignal = {
  symbol: string
  score: number
  label: string
  percent_change: number
  headline_count: number
}

export type Fundamentals = {
  symbol: string
  name: string
  sector: string
  industry: string
  pe_ratio: number
  forward_pe: number
  market_cap: number
  revenue_growth: number
  profit_margin: number
  eps: number
  dividend_yield: number
  beta: number
  fifty_two_week_high: number
  fifty_two_week_low: number
  summary: string
}

export type Technicals = {
  symbol: string
  rsi: number
  macd: number
  moving_average_20: number
  moving_average_50: number
  last_price: number
  trend: string
}

export const marketApi = {
  getOverview() {
    return request<MarketOverview>('/market/overview')
  },

  getQuotes() {
    return request<MarketQuote[]>('/market/quotes')
  },

  searchStocks(query = '') {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    return request<MarketQuote[]>(`/market/search?${params.toString()}`)
  },

  getStock(symbol: string) {
    return request<MarketQuote>(`/market/quotes/${encodeURIComponent(symbol)}`)
  },

  getNews(symbol: string) {
    return request<NewsItem[]>(`/market/news/${encodeURIComponent(symbol)}`)
  },

  getSentiment(symbol: string) {
    return request<SentimentSignal>(`/market/sentiment/${encodeURIComponent(symbol)}`)
  },

  getFundamentals(symbol: string) {
    return request<Fundamentals>(`/fundamentals/${encodeURIComponent(symbol)}`)
  },

  getTechnicals(symbol: string) {
    return request<Technicals>(`/technical/${encodeURIComponent(symbol)}`)
  },
}
