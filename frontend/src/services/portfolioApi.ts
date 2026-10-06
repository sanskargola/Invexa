import { request } from './api'
import type { AllocationItem, PerformancePoint, PortfolioSummary, Transaction } from '../types/portfolio'

export const portfolioApi = {
  async getSummary(): Promise<PortfolioSummary> {
    return request<PortfolioSummary>('/portfolio/summary')
  },

  async getPerformance(): Promise<PerformancePoint[]> {
    return request<PerformancePoint[]>('/portfolio/performance')
  },

  async getAllocation(): Promise<AllocationItem[]> {
    return request<AllocationItem[]>('/portfolio/allocation')
  },

  async getTransactions(): Promise<Transaction[]> {
    return request<Transaction[]>('/portfolio/transactions')
  },
}
