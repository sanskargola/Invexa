export interface Candle {
  time: number | string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface ChartSeries {
  symbol: string
  yahoo_symbol: string
  tradingview_symbol?: string
  name: string
  exchange: string
  currency: string
  timeframe: string
  last_price: number
  change: number
  percent_change: number
  candles: Candle[]
}
