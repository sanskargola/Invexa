export interface Stock {
  symbol: string
  yahoo_symbol?: string
  tradingview_symbol?: string
  name: string
  exchange: string
  price: number
  change: number
  percent_change: number
  volume: number
  market_cap?: number
  currency: string
}

export interface StockFundamental {
  symbol: string
  yahoo_symbol?: string
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

export interface StockTechnicals {
  symbol: string
  rsi: number
  macd: number
  moving_average_20: number
  moving_average_50: number
  last_price: number
  trend: 'Bullish' | 'Bearish' | 'Neutral'
}

export interface StockNewsItem {
  title: string
  publisher: string
  link: string
  published: string
  symbol: string
}

export interface StockSentiment {
  symbol: string
  score: number
  label: 'Bullish' | 'Bearish' | 'Neutral'
  percent_change: number
  headline_count: number
}
