import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ExternalLink, Plus, Settings2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import ChartToolbar, { type ChartType } from './ChartToolbar'
import TimeframeSelector, { type Timeframe } from './TimeframeSelector'
import { marketApi, type MarketQuote } from '../../services/marketApi'
import { useTheme } from '../../store/themeStore'

const INTERVALS: Record<Timeframe, string> = {
	'1m': '1',
	'5m': '5',
	'15m': '15',
	'30m': '30',
	'1H': '60',
	'4H': '240',
	'1D': 'D',
	'1W': 'W',
	'1M': 'M',
}

const STYLES: Record<ChartType, string> = {
	bars: '0',
	candles: '1',
	line: '2',
	area: '3',
}

function money(value: number, currency: string) {
	const prefix = currency === 'INR' ? '₹' : '$'
	return `${prefix}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fallbackTvSymbol(symbol: string) {
	const indian = new Set(['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'SBIN', 'ITC', 'WIPRO', 'ICICIBANK', 'AXISBANK', 'BHARTIARTL', 'HINDUNILVR', 'KOTAKBANK', 'BAJFINANCE', 'LTIM'])
	return indian.has(symbol.toUpperCase()) ? `NSE:${symbol.toUpperCase()}` : `NASDAQ:${symbol.toUpperCase()}`
}

type TradingChartProps = { symbol?: string; fullScreen?: boolean }

export default function TradingChart({ symbol = 'NVDA', fullScreen = false }: TradingChartProps) {
	const navigate = useNavigate()
	const { theme } = useTheme()
	const widgetHost = useRef<HTMLDivElement>(null)
	const [timeframe, setTimeframe] = useState<Timeframe>('1D')
	const [chartType, setChartType] = useState<ChartType>('candles')
	const [volume, setVolume] = useState(true)
	const [quote, setQuote] = useState<MarketQuote | null>(null)

	useEffect(() => {
		let cancelled = false
		void marketApi.getStock(symbol).then((item) => {
			if (!cancelled) setQuote(item)
		}).catch(() => undefined)
		const timer = window.setInterval(() => {
			void marketApi.getStock(symbol).then((item) => {
				if (!cancelled) setQuote(item)
			}).catch(() => undefined)
		}, 15000)
		return () => {
			cancelled = true
			window.clearInterval(timer)
		}
	}, [symbol])

	useEffect(() => {
		const element = widgetHost.current
		if (!element) return
		element.innerHTML = ''
		const widget = document.createElement('div')
		widget.className = 'tradingview-widget-container__widget'
		element.appendChild(widget)
		const script = document.createElement('script')
		script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
		script.async = true
		script.type = 'text/javascript'
		const tvTheme = theme === 'light' ? 'light' : 'dark'
		script.text = JSON.stringify({
			autosize: true,
			symbol: fallbackTvSymbol(symbol),
			interval: INTERVALS[timeframe],
			timezone: 'Etc/UTC',
			theme: tvTheme,
			style: STYLES[chartType],
			locale: 'en',
			backgroundColor: theme === 'light' ? '#ffffff' : theme === 'midnight' ? '#12182a' : '#171d19',
			gridColor: theme === 'light' ? 'rgba(42, 46, 57, 0.08)' : 'rgba(242, 242, 242, 0.06)',
			hide_top_toolbar: false,
			hide_legend: false,
			allow_symbol_change: false,
			calendar: false,
			hide_volume: !volume,
			support_host: 'https://www.tradingview.com',
		})
		element.appendChild(script)
		return () => {
			element.innerHTML = ''
		}
	}, [symbol, timeframe, chartType, volume, theme])

	return (
		<section className={`trading-chart-panel${fullScreen ? ' is-full-screen' : ''}`}>
			<div className="chart-instrument-bar">
				<div className="chart-instrument">
					<span className="instrument-avatar">{symbol.slice(0, 1)}</span>
					<div>
						<strong>{symbol} <span className="instrument-market">{quote?.exchange ?? 'EXCH'}</span></strong>
						<small>{quote?.name || 'Live TradingView chart'}</small>
					</div>
					<button className="chart-add-button" aria-label="Find a symbol" title="Find a symbol" onClick={() => navigate('/market/search')}><Plus size={15} /></button>
				</div>
				<div className="chart-quote">
					<strong>{quote ? money(quote.price, quote.currency) : '—'}</strong>
					{quote && <span className={quote.percent_change >= 0 ? 'positive-text' : 'negative-text'}>{quote.percent_change >= 0 ? '+' : ''}{quote.percent_change.toFixed(2)}%</span>}
				</div>
				<button className="icon-button chart-settings" aria-label="Chart settings" title="Chart settings" onClick={() => navigate('/settings')}><Settings2 size={16} /></button>
				{fullScreen ? (
					<Link className="icon-button chart-expand-button" to={`/terminal?symbol=${encodeURIComponent(symbol)}`} aria-label="Return to trading terminal" title="Return to trading terminal"><ArrowLeft size={16} /></Link>
				) : (
					<Link className="icon-button chart-expand-button" to={`/trading/chart?symbol=${encodeURIComponent(symbol)}`} target="_blank" rel="noopener noreferrer" aria-label="Open chart in a new tab" title="Open full-screen chart in a new tab"><ExternalLink size={16} /></Link>
				)}
			</div>
			<div className="chart-controls">
				<TimeframeSelector value={timeframe} onChange={setTimeframe} />
				<ChartToolbar type={chartType} onTypeChange={setChartType} volume={volume} onVolumeChange={() => setVolume((current) => !current)} />
			</div>
			<div className="chart-plot">
				<div ref={widgetHost} className="chart-canvas tradingview-widget-container" />
			</div>
			<div className="chart-footer">
				<span>TradingView chart · yfinance quotes</span>
				<span>{quote?.currency ?? 'USD'} <i /> {quote?.exchange ?? 'LIVE'}</span>
			</div>
		</section>
	)
}
