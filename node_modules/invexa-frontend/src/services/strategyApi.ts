import { request } from './api'
import type { AlgoStatus, Strategy } from '../types/strategy'

export const strategyApi = {
  async getStrategies(): Promise<Strategy[]> {
    return request<Strategy[]>('/strategies')
  },

  async createStrategy(payload: {
    name: string
    type?: string
    symbols?: string[]
    description?: string
  }): Promise<Strategy> {
    return request<Strategy>('/strategies', {
      method: 'POST',
      json: payload,
    })
  },

  async getStrategy(id: string): Promise<Strategy> {
    return request<Strategy>(`/strategies/${encodeURIComponent(id)}`)
  },

  async toggleStrategy(id: string): Promise<Strategy> {
    return request<Strategy>(`/strategies/${encodeURIComponent(id)}/toggle`, {
      method: 'POST',
    })
  },

  async deleteStrategy(id: string): Promise<{ status: string; message: string }> {
    return request<{ status: string; message: string }>(`/strategies/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  },

  async getAlgoStatuses(): Promise<AlgoStatus[]> {
    return request<AlgoStatus[]>('/algo')
  },

  async getAlgoSummary(): Promise<Record<string, unknown>> {
    return request<Record<string, unknown>>('/algo/summary')
  },
}
