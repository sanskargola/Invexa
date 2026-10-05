import { useEffect, useState } from 'react'
import { marketApi, type MarketQuote } from '../services/marketApi'

export function useMarketData(query = '', intervalMs = 20000) {
  const [items, setItems] = useState<MarketQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true
    const handle = window.setTimeout(async () => {
      try {
        setError(null)
        if (!items.length) setLoading(true)
        const data = await marketApi.searchStocks(query)
        if (isActive) setItems(data)
      } catch (err) {
        if (isActive) setError(err instanceof Error ? err.message : 'Unable to load market data.')
      } finally {
        if (isActive) setLoading(false)
      }
    }, query ? 280 : 0)

    return () => {
      isActive = false
      window.clearTimeout(handle)
    }
  }, [query])

  useEffect(() => {
    if (!intervalMs) return
    const timer = window.setInterval(() => {
      void marketApi.searchStocks(query).then(setItems).catch(() => undefined)
    }, intervalMs)
    return () => window.clearInterval(timer)
  }, [query, intervalMs])

  return { items, loading, error }
}
