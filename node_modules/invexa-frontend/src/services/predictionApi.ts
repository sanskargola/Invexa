import { request } from './api'
import type { ModelInfo, Prediction, PredictionHistoryItem } from '../types/prediction'

export const predictionApi = {
  async getPredictions(): Promise<Prediction[]> {
    return request<Prediction[]>('/predictions')
  },

  async getPredictionForSymbol(symbol: string): Promise<Prediction> {
    return request<Prediction>(`/predictions/${encodeURIComponent(symbol)}`)
  },

  async getModels(): Promise<ModelInfo[]> {
    return request<ModelInfo[]>('/predictions/models')
  },

  async getHistory(): Promise<PredictionHistoryItem[]> {
    return request<PredictionHistoryItem[]>('/predictions/history')
  },
}
