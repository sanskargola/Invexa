import type { Strategy } from '../types/strategy'
import { strategyApi } from '../services/strategyApi'

let strategiesCache: Strategy[] = []
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => listener())
}

export const strategyStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  getStrategies(): Strategy[] {
    return strategiesCache
  },

  async fetchStrategies(): Promise<Strategy[]> {
    try {
      const items = await strategyApi.getStrategies()
      strategiesCache = items
      notify()
      return items
    } catch {
      return strategiesCache
    }
  },

  async toggleStrategy(id: string): Promise<void> {
    await strategyApi.toggleStrategy(id)
    await this.fetchStrategies()
  },

  async createStrategy(payload: { name: string; type?: string; symbols?: string[]; description?: string }): Promise<Strategy> {
    const strat = await strategyApi.createStrategy(payload)
    await this.fetchStrategies()
    return strat
  },

  async deleteStrategy(id: string): Promise<void> {
    await strategyApi.deleteStrategy(id)
    await this.fetchStrategies()
  },
}
