export interface Broker {
  id: string
  name: string
  status: 'connected' | 'active' | 'disconnected'
  type: string
  account_number: string
  connected_at: string
}

export interface BrokerStatus {
  connected_brokers: number
  demo_mode: boolean
  primary_gateway: string
  last_sync: string
  latency_ms: number
}
