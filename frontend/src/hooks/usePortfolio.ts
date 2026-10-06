import { useEffect, useState } from 'react'
import type { AllocationItem, PerformancePoint, PortfolioSummary, Transaction } from '../types/portfolio'
import { portfolioStore } from '../store/portfolioStore'

export function usePortfolio() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(portfolioStore.getSummary())
  const [performance, setPerformance] = useState<PerformancePoint[]>(portfolioStore.getPerformance())
  const [allocation, setAllocation] = useState<AllocationItem[]>(portfolioStore.getAllocation())
  const [transactions, setTransactions] = useState<Transaction[]>(portfolioStore.getTransactions())
  const [loading, setLoading] = useState(!summary)

  useEffect(() => {
    const unsubscribe = portfolioStore.subscribe(() => {
      setSummary(portfolioStore.getSummary())
      setPerformance(portfolioStore.getPerformance())
      setAllocation(portfolioStore.getAllocation())
      setTransactions(portfolioStore.getTransactions())
      setLoading(false)
    })

    void portfolioStore.fetchAll().finally(() => setLoading(false))

    return unsubscribe
  }, [])

  return {
    summary,
    performance,
    allocation,
    transactions,
    loading,
    refresh: () => portfolioStore.fetchAll(),
  }
}
