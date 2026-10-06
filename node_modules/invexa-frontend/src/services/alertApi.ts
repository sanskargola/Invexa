import { request } from './api'

export interface AlertItem {
  id: string
  symbol: string
  title: string
  severity: 'info' | 'medium' | 'high'
  message: string
  created_at: string
  condition?: string
  target_value?: number
  triggered?: boolean
}

export const alertApi = {
  async getAlerts(): Promise<AlertItem[]> {
    return request<AlertItem[]>('/alerts')
  },

  async createAlert(payload: {
    symbol: string
    title: string
    severity?: string
    message: string
    condition?: string
    target_value?: number
  }): Promise<AlertItem> {
    return request<AlertItem>('/alerts', {
      method: 'POST',
      json: payload,
    })
  },

  async deleteAlert(alertId: string): Promise<{ status: string; message: string }> {
    return request<{ status: string; message: string }>(`/alerts/${encodeURIComponent(alertId)}`, {
      method: 'DELETE',
    })
  },
}
