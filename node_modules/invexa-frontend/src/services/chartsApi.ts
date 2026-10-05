import { request } from './api'
import type { Timeframe } from '../components/charts/TimeframeSelector'
import type { MarketQuote } from './marketApi'

export type Candle = {
  time: number | string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type ChartSeries = MarketQuote & {
  yahoo_symbol: string
  timeframe: string
  last_price: number
  candles: Candle[]
}

export const chartsApi = {
  getCandles(symbol: string, timeframe: Timeframe) {
    const params = new URLSearchParams({ timeframe })
    return request<ChartSeries>(`/charts/candles/${encodeURIComponent(symbol)}?${params.toString()}`)
  },
}
