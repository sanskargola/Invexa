import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, CrosshairMode, type IPriceLine, type Time } from 'lightweight-charts'
import { Plus, Settings2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ChartToolbar, { type ChartType } from './ChartToolbar'
import DrawingToolbar, { type DrawingTool } from './DrawingToolbar'
import TimeframeSelector, { type Timeframe } from './TimeframeSelector'

type CandlePoint = { time: Time; open: number; high: number; low: number; close: number }
type Indicator = 'SMA 20' | 'EMA 9' | 'Bollinger'
const intervals: Record<Timeframe, number> = { '1m': 60, '5m': 300, '15m': 900, '30m': 1800, '1H': 3600, '4H': 14400, '1D': 86400, '1W': 604800, '1M': 2592000 }

function createSeries(timeframe: Timeframe, symbol: string) {
	const interval = intervals[timeframe]
	const now = Math.floor(Date.now() / 1000 / interval) * interval
	let previous = symbol === 'NVDA' ? 140.9 : symbol === 'AAPL' ? 230.5 : symbol === 'TSLA' ? 354.2 : 421.8
	return Array.from({ length: 120 }, (_, index) => {
		const wave = Math.sin(index * 0.49) * 0.57 + Math.sin(index * 0.17) * 0.9 + (index % 7 - 3) * 0.14
		const open = previous
		const close = Math.max(1, open + wave)
		const candle: CandlePoint = { time: (now - (119 - index) * interval) as Time, open, close, high: Math.max(open, close) + 0.25 + Math.abs(wave) * 0.42, low: Math.min(open, close) - 0.2 - Math.abs(wave) * 0.38 }
		previous = close
		return candle
	})
}

function averageData(candles: CandlePoint[], period: number, exponential = false) {
	let average = candles[0].close
	return candles.map((candle, index) => {
		if (exponential) average = index === 0 ? candle.close : candle.close * (2 / (period + 1)) + average * (1 - 2 / (period + 1))
		else average = candles.slice(Math.max(0, index - period + 1), index + 1).reduce((sum, item) => sum + item.close, 0) / Math.min(index + 1, period)
		return { time: candle.time, value: average }
	})
}

type TradingChartProps = { symbol?: string }

export default function TradingChart({ symbol = 'NVDA' }: TradingChartProps) {
	const navigate = useNavigate()
	const chartElement = useRef<HTMLDivElement>(null)
	const [timeframe, setTimeframe] = useState<Timeframe>('1D')
	const [chartType, setChartType] = useState<ChartType>('candles')
	const [volume, setVolume] = useState(true)
	const [indicators, setIndicators] = useState<Indicator[]>(['SMA 20'])
	const [activeTool, setActiveTool] = useState<DrawingTool>('cursor')
	const activeToolRef = useRef(activeTool)
	activeToolRef.current = activeTool
	const [lastPrice, setLastPrice] = useState(0)
	const [change, setChange] = useState(0)

	useEffect(() => {
		const element = chartElement.current
		if (!element) return
		const candles = createSeries(timeframe, symbol)
		const chart = createChart(element, {
			width: element.clientWidth,
			height: element.clientHeight,
			layout: { background: { type: ColorType.Solid, color: '#171d19' }, textColor: '#839087', fontFamily: 'DM Sans, sans-serif', fontSize: 10 },
			grid: { vertLines: { color: '#222a24' }, horzLines: { color: '#222a24' } },
			crosshair: { mode: CrosshairMode.Normal, vertLine: { color: '#84966a', width: 1, style: 2, labelBackgroundColor: '#39452f' }, horzLine: { color: '#84966a', width: 1, style: 2, labelBackgroundColor: '#39452f' } },
			rightPriceScale: { borderColor: '#2b342d', scaleMargins: { top: 0.12, bottom: volume ? 0.24 : 0.08 } },
			timeScale: { borderColor: '#2b342d', timeVisible: ['1m', '5m', '15m', '30m', '1H', '4H'].includes(timeframe), secondsVisible: false, rightOffset: 7, barSpacing: 8 },
			handleScroll: true,
			handleScale: true,
		})

		let priceSeries: ReturnType<typeof chart.addCandlestickSeries>
		if (chartType === 'bars') {
			const bars = chart.addBarSeries({ upColor: '#9dbf69', downColor: '#d8736a' })
			bars.setData(candles)
			priceSeries = bars as unknown as typeof priceSeries
		} else if (chartType === 'candles') {
			priceSeries = chart.addCandlestickSeries({ upColor: '#9dbf69', downColor: '#d8736a', borderVisible: false, wickUpColor: '#9dbf69', wickDownColor: '#d8736a', priceLineColor: '#a8cf72' })
			priceSeries.setData(candles)
		} else {
			priceSeries = chart.addCandlestickSeries({ upColor: '#9dbf69', downColor: '#d8736a', borderVisible: false, wickUpColor: '#9dbf69', wickDownColor: '#d8736a' })
			priceSeries.setData(candles)
			chart.removeSeries(priceSeries)
			const line = chartType === 'area'
				? chart.addAreaSeries({ lineColor: '#b7d878', topColor: 'rgba(183, 216, 120, 0.22)', bottomColor: 'rgba(183, 216, 120, 0.01)', lineWidth: 2, priceLineColor: '#a8cf72' })
				: chart.addLineSeries({ color: '#b7d878', lineWidth: 2, priceLineColor: '#a8cf72' })
			line.setData(candles.map(({ time, close }) => ({ time, value: close })))
			priceSeries = line as unknown as typeof priceSeries
		}

		if (volume) {
			const volumeSeries = chart.addHistogramSeries({ priceFormat: { type: 'volume' }, priceScaleId: '', lastValueVisible: false, priceLineVisible: false, color: '#6a855342' })
			volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } })
			volumeSeries.setData(candles.map((candle, index) => ({ time: candle.time, value: 70 + ((index * 37) % 110) + Math.abs(candle.close - candle.open) * 70, color: candle.close >= candle.open ? '#829d5545' : '#ba62554a' })))
		}

		indicators.forEach((indicator) => {
			if (indicator === 'SMA 20') chart.addLineSeries({ color: '#d7bc72', lineWidth: 1, priceLineVisible: false, lastValueVisible: false }).setData(averageData(candles, 20))
			if (indicator === 'EMA 9') chart.addLineSeries({ color: '#7db6bb', lineWidth: 1, priceLineVisible: false, lastValueVisible: false }).setData(averageData(candles, 9, true))
			if (indicator === 'Bollinger') {
				const mean = averageData(candles, 20)
				const upper = mean.map((point, index) => ({ time: point.time, value: point.value + 1.6 + (index % 5) * 0.09 }))
				const lower = mean.map((point, index) => ({ time: point.time, value: point.value - 1.6 - (index % 5) * 0.09 }))
				chart.addLineSeries({ color: '#8292bb', lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false }).setData(upper)
				chart.addLineSeries({ color: '#8292bb', lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false }).setData(lower)
			}
		})

		const last = candles[candles.length - 1]
		setLastPrice(last.close)
		setChange(((last.close - candles[0].open) / candles[0].open) * 100)
		const lines: IPriceLine[] = []
		const clickHandler = (param: Parameters<typeof chart.subscribeClick>[0] extends (arg: infer P) => void ? P : never) => {
			if (activeToolRef.current === 'cursor' || !param.point) return
			const price = priceSeries.coordinateToPrice(param.point.y)
			if (price === null) return
			const tool = activeToolRef.current
			lines.push(priceSeries.createPriceLine({ price, color: tool === 'trend' ? '#c7a76f' : '#88a96b', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: tool === 'trend' ? 'Trend' : 'Level' }))
			setActiveTool('cursor')
		}
		chart.subscribeClick(clickHandler)
		const observer = new ResizeObserver(() => chart.applyOptions({ width: element.clientWidth, height: element.clientHeight }))
		observer.observe(element)
		chart.timeScale().fitContent()
		return () => { observer.disconnect(); chart.unsubscribeClick(clickHandler); chart.remove() }
	}, [timeframe, chartType, volume, indicators, symbol])

	function toggleIndicator(indicator: Indicator) {
		setIndicators((current) => current.includes(indicator) ? current.filter((item) => item !== indicator) : [...current, indicator])
	}

	return <section className="trading-chart-panel">
		<div className="chart-instrument-bar"><div className="chart-instrument"><span className="instrument-avatar">{symbol.slice(0, 1)}</span><div><strong>{symbol} <span className="instrument-market">NASDAQ</span></strong><small>{symbol === 'NVDA' ? 'NVIDIA Corporation' : symbol === 'AAPL' ? 'Apple Inc.' : symbol === 'TSLA' ? 'Tesla, Inc.' : 'Microsoft Corporation'}</small></div><button className="chart-add-button" aria-label="Add comparison symbol" title="Find a comparison symbol" onClick={() => navigate('/market/search')}><Plus size={15} /></button></div><div className="chart-quote"><strong>${lastPrice.toFixed(2)}</strong><span className={change >= 0 ? 'positive-text' : 'negative-text'}>{change >= 0 ? '+' : ''}{change.toFixed(2)}%</span></div><button className="icon-button chart-settings" aria-label="Chart settings" title="Chart settings" onClick={() => navigate('/settings/chart')}><Settings2 size={16} /></button></div>
		<div className="chart-controls"><TimeframeSelector value={timeframe} onChange={setTimeframe} /><ChartToolbar type={chartType} onTypeChange={setChartType} volume={volume} onVolumeChange={() => setVolume((current) => !current)} /></div>
		<div className="chart-indicators"><span>Indicators</span>{(['SMA 20', 'EMA 9', 'Bollinger'] as Indicator[]).map((indicator) => <button key={indicator} onClick={() => toggleIndicator(indicator)} className={indicators.includes(indicator) ? 'active-indicator' : ''} aria-pressed={indicators.includes(indicator)}>{indicator}{indicators.includes(indicator) && <i />}</button>)}<span className="chart-indicator-spacer" /><DrawingToolbar activeTool={activeTool} onToolChange={setActiveTool} /></div>
		<div className="chart-plot"><div className="chart-ohlc"><strong>O</strong> 140.90 <strong>H</strong> 143.21 <strong>L</strong> 140.12 <strong>C</strong> {lastPrice.toFixed(2)} <span className={change >= 0 ? 'positive-text' : 'negative-text'}>{change >= 0 ? '+' : ''}{change.toFixed(2)}%</span></div><div ref={chartElement} className="chart-canvas" /><div className={`chart-drawing-hint${activeTool === 'cursor' ? ' hidden' : ''}`}>Click the chart to place a {activeTool === 'trend' ? 'trend marker' : 'price level'}</div></div>
		<div className="chart-footer"><span>Data delayed by 15 min</span><span>USD <i /> NASDAQ</span></div>
	</section>
}
