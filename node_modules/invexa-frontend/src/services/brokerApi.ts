import { request } from './api'
import type { Broker, BrokerStatus } from '../types/broker'

export const brokerApi = {
  async getBrokers(): Promise<Broker[]> {
    return request<Broker[]>('/brokers')
  },

  async getStatus(): Promise<BrokerStatus> {
    return request<BrokerStatus>('/brokers/status')
  },

  async connectBroker(payload: {
    name: string
    api_key: string
    api_secret: string
    environment?: string
  }): Promise<Broker> {
    return request<Broker>('/brokers/connect', {
      method: 'POST',
      json: payload,
    })
  },

  async disconnectBroker(brokerId: string): Promise<{ status: string; message: string }> {
    return request<{ status: string; message: string }>(`/brokers/${encodeURIComponent(brokerId)}/disconnect`, {
      method: 'POST',
    })
  },
}
