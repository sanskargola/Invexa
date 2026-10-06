import { request } from './api'
import type { BacktestResult } from '../types/strategy'

export const backtestApi = {
  async getBacktests(): Promise<BacktestResult[]> {
    return request<BacktestResult[]>('/backtesting')
  },

  async getBacktest(id: string): Promise<BacktestResult> {
    return request<BacktestResult>(`/backtesting/${encodeURIComponent(id)}`)
  },

  async runBacktest(payload: {
    strategy: string
    symbol?: string
    timeframe?: string
    initial_capital?: number
    start_date?: string
    end_date?: string
  }): Promise<BacktestResult> {
    return request<BacktestResult>('/backtesting/run', {
      method: 'POST',
      json: payload,
    })
  },

  async getSummary(): Promise<{
    average_return: number
    average_sharpe: number
    average_drawdown: number
    win_rate: number
  }> {
    return request<{
      average_return: number
      average_sharpe: number
      average_drawdown: number
      win_rate: number
    }>('/backtesting/summary')
  },
}
