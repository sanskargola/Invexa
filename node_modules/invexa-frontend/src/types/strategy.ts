export interface Strategy {
  id: string
  name: string
  status: 'active' | 'paused' | 'stopped'
  type: string
  symbols: string[]
  annual_return: number
  win_rate: number
  max_drawdown: number
  trades_count: number
  created_at: string
  description: string
}

export interface BacktestTrade {
  id: string
  date: string
  symbol: string
  side: string
  entry_price: number
  exit_price: number
  pnl: number
  pnl_percent: number
}

export interface BacktestResult {
  id: string
  strategy: string
  symbol: string
  start_date: string
  end_date: string
  initial_capital: number
  final_capital: number
  net_return: number
  sharpe_ratio: number
  max_drawdown: number
  win_rate: number
  total_trades: number
  profit_factor: number
  equity_curve: Array<{ date: string; equity: number }>
  trades: BacktestTrade[]
}

export interface AlgoStatus {
  id: string
  name: string
  state: 'running' | 'idle' | 'stopped'
  health: number
  last_run: string
  symbols: string[]
}
