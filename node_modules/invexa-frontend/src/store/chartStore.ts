import type { ChartSeries } from '../types/chart'
import { chartApi } from '../services/chartApi'

let activeSeries: ChartSeries | null = null
let currentTimeframe = '1D'
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => listener())
}

export const chartStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  getSeries(): ChartSeries | null {
    return activeSeries
  },

  getTimeframe(): string {
    return currentTimeframe
  },

  setTimeframe(tf: string) {
    currentTimeframe = tf
    notify()
  },

  async fetchCandles(symbol: string, timeframe = currentTimeframe): Promise<ChartSeries | null> {
    try {
      currentTimeframe = timeframe
      const data = await chartApi.getCandles(symbol, timeframe)
      activeSeries = data
      notify()
      return data
    } catch {
      return activeSeries
    }
  },
}
