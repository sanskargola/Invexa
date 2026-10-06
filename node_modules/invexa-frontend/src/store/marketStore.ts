import type { MarketQuote } from '../services/marketApi'
import { marketApi } from '../services/marketApi'

let quotesCache: MarketQuote[] = []
let activeSymbol: string = 'NVDA'
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => listener())
}

export const marketStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  getQuotes(): MarketQuote[] {
    return quotesCache
  },

  getActiveSymbol(): string {
    return activeSymbol
  },

  setActiveSymbol(symbol: string) {
    activeSymbol = symbol.toUpperCase()
    notify()
  },

  async fetchQuotes(): Promise<MarketQuote[]> {
    try {
      const quotes = await marketApi.getQuotes()
      quotesCache = quotes
      notify()
      return quotes
    } catch {
      return quotesCache
    }
  },
}
