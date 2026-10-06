import type { AllocationItem, PerformancePoint, PortfolioSummary, Transaction } from '../types/portfolio'
import { portfolioApi } from '../services/portfolioApi'

let summaryCache: PortfolioSummary | null = null
let performanceCache: PerformancePoint[] = []
let allocationCache: AllocationItem[] = []
let transactionsCache: Transaction[] = []
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => listener())
}

export const portfolioStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  getSummary(): PortfolioSummary | null {
    return summaryCache
  },

  getPerformance(): PerformancePoint[] {
    return performanceCache
  },

  getAllocation(): AllocationItem[] {
    return allocationCache
  },

  getTransactions(): Transaction[] {
    return transactionsCache
  },

  async fetchAll(): Promise<void> {
    try {
      const [sum, perf, alloc, txs] = await Promise.all([
        portfolioApi.getSummary(),
        portfolioApi.getPerformance(),
        portfolioApi.getAllocation(),
        portfolioApi.getTransactions(),
      ])
      summaryCache = sum
      performanceCache = perf
      allocationCache = alloc
      transactionsCache = txs
      notify()
    } catch {
      // Keep cached
    }
  },
}
