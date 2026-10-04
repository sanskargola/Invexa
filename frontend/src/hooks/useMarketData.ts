import { useEffect, useState } from 'react'
import { marketApi, type MarketQuote } from '../services/marketApi'

export function useMarketData(query = '') {
  const [items, setItems] = useState<MarketQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const data = await marketApi.searchStocks(query)
        if (isActive) {
          setItems(data)
        }
      } catch (err) {
        if (isActive) {
          setError(err instanceof Error ? err.message : 'Unable to load market data.')
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    fetchData()
    return () => {
      isActive = false
    }
  }, [query])

  return { items, loading, error }
}
