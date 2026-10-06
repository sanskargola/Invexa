export interface Prediction {
  symbol: string
  sentiment: number
  expected_return: number
  confidence: number
  horizon: string
  target_price: number
  current_price: number
  direction: 'Bullish' | 'Bearish' | 'Neutral'
  model: string
}

export interface ModelInfo {
  id: string
  name: string
  architecture: string
  accuracy: number
  sharpe: number
  status: string
  last_trained: string
  features_count: number
}

export interface PredictionHistoryItem {
  id: string
  date: string
  symbol: string
  predicted_direction: string
  predicted_return: number
  actual_return: number
  success: boolean
  confidence: number
}
