export function calculatePnL(quantity: number, avgCost: number, currentPrice: number): {
  pnl: number
  pnlPercent: number
} {
  const cost = quantity * avgCost
  const marketValue = quantity * currentPrice
  const pnl = marketValue - cost
  const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0
  return { pnl, pnlPercent }
}

export function calculateEstimatedOrderValue(quantity: number, price: number): number {
  return (quantity || 0) * (price || 0)
}

export function calculateSharpeRatio(returns: number[], riskFreeRate = 0.04): number {
  if (returns.length < 2) return 1.5
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1)
  const std = Math.sqrt(variance)
  if (std === 0) return 0
  return (mean - riskFreeRate) / std
}
