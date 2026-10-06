import { request } from './api'
import type { ChartSeries } from '../types/chart'

export const chartApi = {
  async getCandles(symbol: string, timeframe = '1D'): Promise<ChartSeries> {
    return request<ChartSeries>(`/charts/candles/${encodeURIComponent(symbol)}?timeframe=${encodeURIComponent(timeframe)}`)
  },
}
