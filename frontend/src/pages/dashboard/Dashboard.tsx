import { useEffect, useMemo, useState } from 'react'
import {
	ArrowDownRight,
	ArrowRight,
	ArrowUpRight,
	BarChart3,
	Download,
	MoreHorizontal,
	Plus,
	TrendingDown,
	TrendingUp,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { marketApi, type MarketQuote } from '../../services/marketApi'
import { formatCurrency } from '../../utils/formatters'

const paperHoldings = [
	{ ticker: 'RELIANCE', name: 'Reliance Industries Limited', shares: 12, color: '#a8c55a' },
	{ ticker: 'TCS', name: 'Tata Consultancy Services', shares: 8, color: '#78a9d2' },
	{ ticker: 'INFY', name: 'Infosys Limited', shares: 20, color: '#d58e6c' },
	{ ticker: 'HDFCBANK', name: 'HDFC Bank Limited', shares: 15, color: '#d5bd73' },
	{ ticker: 'SBIN', name: 'State Bank of India', shares: 20, color: '#82b8a2' },
]

// Historical trading day return records for the interactive Day's return chart
interface DayReturnRecord {
	id: string
	dayOfWeek: string
	dateLabel: string
	fullDate: string
	amount: number
	percent: number
	isMonday: boolean
	isCurrent?: boolean
}

const dailyReturnHistory: DayReturnRecord[] = [
	{ id: 'd1', dayOfWeek: 'Mon', dateLabel: '29 Sep', fullDate: 'Monday, 29 Sep 2026', amount: 840.50, percent: 0.55, isMonday: true },
	{ id: 'd2', dayOfWeek: 'Tue', dateLabel: '30 Sep', fullDate: 'Tuesday, 30 Sep 2026', amount: 420.10, percent: 0.28, isMonday: false },
	{ id: 'd3', dayOfWeek: 'Wed', dateLabel: '01 Oct', fullDate: 'Wednesday, 01 Oct 2026', amount: -610.40, percent: -0.40, isMonday: false },
	{ id: 'd4', dayOfWeek: 'Thu', dateLabel: '02 Oct', fullDate: 'Thursday, 02 Oct 2026', amount: 980.20, percent: 0.64, isMonday: false },
	{ id: 'd5', dayOfWeek: 'Fri', dateLabel: '03 Oct', fullDate: 'Friday, 03 Oct 2026', amount: 1350.00, percent: 0.89, isMonday: false },
	{ id: 'd6', dayOfWeek: 'Mon', dateLabel: '06 Oct', fullDate: 'Monday, 06 Oct 2026', amount: -480.60, percent: -0.31, isMonday: true },
	{ id: 'd7', dayOfWeek: 'Tue', dateLabel: '07 Oct', fullDate: 'Tuesday, 07 Oct 2026', amount: 1120.40, percent: 0.73, isMonday: false },
	{ id: 'd8', dayOfWeek: 'Wed', dateLabel: '08 Oct', fullDate: 'Wednesday, 08 Oct 2026', amount: 690.30, percent: 0.45, isMonday: false },
	{ id: 'd9', dayOfWeek: 'Thu', dateLabel: '09 Oct', fullDate: 'Thursday, 09 Oct 2026', amount: -320.00, percent: -0.21, isMonday: false },
	{ id: 'd10', dayOfWeek: 'Fri', dateLabel: '10 Oct', fullDate: 'Friday, 10 Oct 2026', amount: 1540.80, percent: 1.01, isMonday: false },
	{ id: 'd11', dayOfWeek: 'Mon', dateLabel: '13 Oct', fullDate: 'Monday, 13 Oct 2026', amount: 1260.40, percent: 0.82, isMonday: true },
	{ id: 'd12', dayOfWeek: 'Tue', dateLabel: '14 Oct', fullDate: 'Tuesday, 14 Oct 2026', amount: -540.20, percent: -0.35, isMonday: false },
	{ id: 'd13', dayOfWeek: 'Wed', dateLabel: '15 Oct', fullDate: 'Wednesday, 15 Oct 2026', amount: 910.70, percent: 0.59, isMonday: false },
	{ id: 'd14', dayOfWeek: 'Thu', dateLabel: '16 Oct', fullDate: 'Thursday, 16 Oct 2026', amount: 620.00, percent: 0.41, isMonday: false },
	{ id: 'd15', dayOfWeek: 'Fri', dateLabel: '17 Oct', fullDate: 'Saturday, 17 Oct 2026 (Live)', amount: 769.20, percent: 0.51, isMonday: false, isCurrent: true },
]

function sparkline(positive: boolean) {
	return positive ? '0,20 10,15 20,18 30,8 40,13 50,6 60,10 70,2' : '0,3 10,8 20,5 30,14 40,9 50,18 60,11 70,20'
}

function PerformanceChart() {
	const line = '0,102 14,95 27,98 40,82 53,88 66,75 79,78 92,60 105,65 118,54 131,62 144,47 157,52 170,37 183,45 196,33 209,39 222,22 235,31 248,12 261,18 274,5 287,13 300,0'
	return (
		<svg className="performance-chart" viewBox="0 0 300 116" preserveAspectRatio="none" role="img" aria-label="Portfolio value performance chart">
			<defs>
				<linearGradient id="area-fill" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0%" stopColor="#b6d672" stopOpacity=".2" />
					<stop offset="100%" stopColor="#b6d672" stopOpacity="0" />
				</linearGradient>
			</defs>
			{[20, 48, 76, 104].map((y) => (
				<line key={y} x1="0" x2="300" y1={y} y2={y} stroke="#29312b" strokeDasharray="3 5" />
			))}
			<polygon points={`0,116 ${line} 300,116`} fill="url(#area-fill)" />
			<polyline points={line} fill="none" stroke="#c0dc7c" strokeWidth="2" vectorEffect="non-scaling-stroke" />
		</svg>
	)
}

export default function Dashboard() {
	const navigate = useNavigate()
	const location = useLocation()
	const { user } = useAuth()
	const [portfolioMenuOpen, setPortfolioMenuOpen] = useState(false)
	const [quotes, setQuotes] = useState<MarketQuote[]>([])
	const [notice, setNotice] = useState(typeof location.state?.notice === 'string' ? location.state.notice : '')

	// Market movers section tab: top gainers vs top losers
	const [moverTab, setMoverTab] = useState<'gainers' | 'losers'>('gainers')

	// Interactive Day Return Bar hover state
	const [hoveredBar, setHoveredBar] = useState<DayReturnRecord | null>(null)

	useEffect(() => {
		void marketApi.getQuotes().then(setQuotes).catch(() => undefined)
		const timer = window.setInterval(() => {
			void marketApi.getQuotes().then(setQuotes).catch(() => undefined)
		}, 20000)
		return () => window.clearInterval(timer)
	}, [])

	const quoteMap = useMemo(() => new Map(quotes.map((item) => [item.symbol, item])), [quotes])

	const holdings = paperHoldings.map((holding) => {
		const quote = quoteMap.get(holding.ticker)
		const price = quote?.price ?? (holding.ticker === 'RELIANCE' ? 2980.50 : holding.ticker === 'TCS' ? 4120.00 : holding.ticker === 'INFY' ? 1895.30 : holding.ticker === 'HDFCBANK' ? 1742.80 : 842.15)
		const value = price * holding.shares
		const change = quote?.percent_change ?? (holding.ticker === 'INFY' ? -0.62 : holding.ticker === 'SBIN' ? 1.40 : holding.ticker === 'RELIANCE' ? 1.12 : holding.ticker === 'HDFCBANK' ? 0.88 : 0.45)
		return {
			ticker: holding.ticker,
			name: quote?.name ?? holding.name,
			shares: holding.shares,
			price: formatCurrency(price, quote?.currency ?? 'INR'),
			value: formatCurrency(value, quote?.currency ?? 'INR'),
			change: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
			positive: change >= 0,
			color: holding.color,
		}
	})

	// Top Gainers and Top Losers lists
	const gainersList = useMemo(() => {
		const positiveQuotes = quotes.filter((q) => q.percent_change > 0)
		if (positiveQuotes.length >= 2) {
			return positiveQuotes.sort((a, b) => b.percent_change - a.percent_change)
		}
		// High quality fallback gainers if quotes list is still loading
		return [
			{ symbol: 'TATAMOTORS', name: 'Tata Motors Limited', price: 968.40, percent_change: 1.49, currency: 'INR' },
			{ symbol: 'SBIN', name: 'State Bank of India', price: 842.15, percent_change: 1.40, currency: 'INR' },
			{ symbol: 'RELIANCE', name: 'Reliance Industries Limited', price: 2980.50, percent_change: 1.12, currency: 'INR' },
			{ symbol: 'ICICIBANK', name: 'ICICI Bank Limited', price: 1264.50, percent_change: 0.78, currency: 'INR' },
			{ symbol: 'ITC', name: 'ITC Limited', price: 482.30, percent_change: 0.65, currency: 'INR' },
			{ symbol: 'TCS', name: 'Tata Consultancy Services', price: 4120.00, percent_change: 0.45, currency: 'INR' },
		]
	}, [quotes])

	const losersList = useMemo(() => {
		const negativeQuotes = quotes.filter((q) => q.percent_change < 0)
		if (negativeQuotes.length >= 2) {
			return negativeQuotes.sort((a, b) => a.percent_change - b.percent_change)
		}
		// High quality fallback losers if quotes list is still loading
		return [
			{ symbol: 'WIPRO', name: 'Wipro Limited', price: 546.20, percent_change: -0.94, currency: 'INR' },
			{ symbol: 'BAJFINANCE', name: 'Bajaj Finance Limited', price: 6940.00, percent_change: -0.69, currency: 'INR' },
			{ symbol: 'INFY', name: 'Infosys Limited', price: 1895.30, percent_change: -0.62, currency: 'INR' },
			{ symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited', price: 1685.00, percent_change: -0.50, currency: 'INR' },
			{ symbol: 'HINDUNILVR', name: 'Hindustan Unilever Limited', price: 2540.00, percent_change: -0.48, currency: 'INR' },
		]
	}, [quotes])

	const currentMovers = moverTab === 'gainers' ? gainersList : losersList
	const movers = currentMovers.slice(0, 4).map((item) => ({
		ticker: item.symbol,
		name: item.name,
		price: formatCurrency(item.price, item.currency ?? 'INR'),
		change: `${item.percent_change >= 0 ? '+' : ''}${item.percent_change.toFixed(2)}%`,
		positive: item.percent_change >= 0,
		values: sparkline(item.percent_change >= 0),
	}))

	const invested = paperHoldings.reduce((sum, holding) => {
		const quote = quoteMap.get(holding.ticker)
		const fallbackPrice = holding.ticker === 'RELIANCE' ? 2980.50 : holding.ticker === 'TCS' ? 4120.00 : holding.ticker === 'INFY' ? 1895.30 : holding.ticker === 'HDFCBANK' ? 1742.80 : 842.15
		return sum + (quote?.price ?? fallbackPrice) * holding.shares
	}, 0)

	const dayPnl = paperHoldings.reduce((sum, holding) => {
		const quote = quoteMap.get(holding.ticker)
		if (!quote) {
			const fallbackChange = holding.ticker === 'INFY' ? -11.80 : holding.ticker === 'SBIN' ? 11.60 : holding.ticker === 'RELIANCE' ? 33.10 : holding.ticker === 'HDFCBANK' ? 15.20 : 18.50
			return sum + fallbackChange * holding.shares
		}
		return sum + quote.change * holding.shares
	}, 0)

	const buyingPower = 12840
	const portfolioValue = invested + buyingPower
	const dayPercent = invested ? (dayPnl / invested) * 100 : 0
	const bestQuote = useMemo(
		() => [...quotes].sort((left, right) => right.percent_change - left.percent_change)[0] ?? { symbol: 'SBIN', percent_change: 1.40 },
		[quotes],
	)
	const [portfolioWhole, portfolioCents] = portfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).split('.')

	// Active bar info or default to today's return
	const activeReturnAmount = hoveredBar ? hoveredBar.amount : dayPnl
	const activeReturnPercent = hoveredBar ? hoveredBar.percent : dayPercent
	const [pnlWhole, pnlCents] = Math.abs(activeReturnAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).split('.')

	function exportPortfolio() {
		const csv = ['Symbol,Company,Shares,Price,Market value,24H Change', ...holdings.map((h) => `${h.ticker},"${h.name}",${h.shares},${h.price},${h.value},${h.change}`)].join('\n')
		const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
		const link = document.createElement('a')
		link.href = url
		link.download = 'invexia-portfolio.csv'
		link.click()
		URL.revokeObjectURL(url)
		setPortfolioMenuOpen(false)
	}

	function openDayBreakdown(bar?: DayReturnRecord) {
		const target = bar || hoveredBar || dailyReturnHistory[dailyReturnHistory.length - 1]
		window.open(`/portfolio/day-breakdown?id=${target.id}&date=${encodeURIComponent(target.dateLabel)}`, '_blank')
	}

	return (
		<div className="dashboard-page">
			{/* Page Heading: middle vacant space filled with rich market & portfolio indicators */}
			<div className="page-heading">
				<div className="page-heading-user">
					<p className="eyebrow">
						{new Intl.DateTimeFormat('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()).toUpperCase()}{' '}
						<span className="eyebrow-dot">·</span> NSE MARKET
					</p>
					<h1>
						Good morning, {user?.name.split(/\s+/)[0] ?? 'Trader'} <span className="wave">↗</span>
					</h1>
					<p className="page-subtitle">Here’s what’s happening with your portfolio today.</p>
				</div>

				{/* Middle part: filling the vacant space with live market metrics */}
				<div className="heading-middle-space">
					<div className="market-pulse-pill" title="NSE Live Market Trading Session">
						<span className="live-status-dot" />
						<div className="pulse-text-group">
							<span className="pulse-label">NSE Live</span>
							<span className="pulse-sub">09:15 - 15:30 IST</span>
						</div>
					</div>
					<div className="heading-stat-box" title="NSE Volatility Index">
						<span className="stat-box-label">INDIA VIX</span>
						<span className="stat-box-value negative-text">13.42 (-1.28%)</span>
					</div>
					<div className="heading-stat-box" title="Portfolio Session Range">
						<span className="stat-box-label">DAY'S RANGE</span>
						<span className="stat-box-value">₹1,61,680 - ₹1,63,240</span>
					</div>
					<div className="heading-stat-box" title="Risk & Sensitivity Index">
						<span className="stat-box-label">PORTFOLIO BETA</span>
						<span className="stat-box-value positive-text">0.94 (Low risk)</span>
					</div>
				</div>

				<div className="page-heading-actions">
					<button className="button button-secondary" onClick={() => navigate('/portfolio')} title="View detailed portfolio analytics">
						<BarChart3 size={15} /> Analytics
					</button>
					<button className="button button-primary" onClick={() => navigate('/terminal')}>
						<Plus size={16} /> New trade
					</button>
				</div>
			</div>

			{notice && (
				<div className="workspace-notice" role="status">
					{notice}
					<button onClick={() => setNotice('')} aria-label="Dismiss">
						×
					</button>
				</div>
			)}

			<section className="metric-grid" aria-label="Portfolio summary">
				{/* Total portfolio value panel */}
				<article className="metric-panel portfolio-value">
					<div className="metric-top">
						<span>Total portfolio value</span>
						<button
							className="icon-button"
							aria-label="More portfolio options"
							aria-expanded={portfolioMenuOpen}
							onClick={() => setPortfolioMenuOpen((open) => !open)}
						>
							<MoreHorizontal size={18} />
						</button>
						{portfolioMenuOpen && (
							<div className="dashboard-action-menu">
								<button onClick={exportPortfolio}>
									<Download size={14} /> Download holdings CSV
								</button>
								<button
									onClick={() => {
										setPortfolioMenuOpen(false)
										navigate('/portfolio')
									}}
								>
									Open portfolio
								</button>
							</div>
						)}
					</div>
					<div className="metric-value">
						₹{portfolioWhole}
						<span className="metric-cents">.{portfolioCents}</span>
					</div>
					<div className="metric-foot">
						<span className={`change-pill ${dayPnl >= 0 ? 'positive' : 'negative'}`}>
							{dayPnl >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />} {Math.abs(dayPercent).toFixed(2)}%
						</span>
						<span>
							{dayPnl >= 0 ? '+' : '-'}
							{formatCurrency(Math.abs(dayPnl))} today
						</span>
						<span className="muted-separator">·</span>
						<span className="muted">vs. previous close</span>
					</div>
					<div className="portfolio-chart-wrap">
						<PerformanceChart />
						<div className="chart-xlabels">
							<span>9:15 AM</span>
							<span>11:00 AM</span>
							<span>12:30 PM</span>
							<span>2:00 PM</span>
							<span>3:30 PM</span>
						</div>
					</div>
				</article>

				{/* Buying power panel */}
				<article className="metric-panel">
					<div className="metric-top">
						<span>Buying power</span>
						<span className="metric-icon green-icon">
							<ArrowUpRight size={16} />
						</span>
					</div>
					<div className="metric-value">{formatCurrency(buyingPower)}</div>
					<div className="metric-foot">
						<span className="muted">Available to invest</span>
					</div>
					<div className="buying-power-track">
						<span />
					</div>
					<div className="metric-small-row">
						<span>Invested</span>
						<strong>{formatCurrency(invested)}</strong>
					</div>
				</article>

				{/* Day's return panel with interactive working bars & Monday dates */}
				<article className="metric-panel days-return-panel">
					<div className="metric-top">
						<span>Day’s return</span>
						<button
							className={`metric-icon ${activeReturnAmount >= 0 ? 'green-icon' : 'red-icon'} cursor-pointer hover:scale-105 transition-transform`}
							onClick={() => openDayBreakdown()}
							title="Open day orders & profit conduct in new tab ↗"
							aria-label="Open day orders & profit conduct in new tab"
						>
							<ArrowUpRight size={16} />
						</button>
					</div>
					<div className={`metric-value ${activeReturnAmount >= 0 ? 'positive-text' : 'negative-text'}`}>
						{activeReturnAmount >= 0 ? '+' : '-'}₹{pnlWhole}
						<span className="metric-cents">.{pnlCents}</span>
					</div>
					<div className="metric-foot">
						<span className={`change-pill ${activeReturnAmount >= 0 ? 'positive' : 'negative'}`}>
							{activeReturnAmount >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{' '}
							{Math.abs(activeReturnPercent).toFixed(2)}%
						</span>
						<span className="muted return-context-label">{hoveredBar ? hoveredBar.fullDate : 'today'}</span>
					</div>

					{/* Interactive Daily Return Bars: Touching opens new tab with day orders & profit conduct */}
					<div className="mini-bars-wrapper" onMouseLeave={() => setHoveredBar(null)}>
						<div className="mini-bars-interactive" role="region" aria-label="Daily returns history with Monday dates">
							{dailyReturnHistory.map((bar) => {
								const maxAbs = 1600
								const heightPct = Math.min(100, Math.max(22, (Math.abs(bar.amount) / maxAbs) * 100))
								const isPos = bar.amount >= 0
								const isSelected = hoveredBar?.id === bar.id

								return (
									<div
										key={bar.id}
										className={`mini-bar-col ${bar.isMonday ? 'is-monday' : ''} ${isSelected ? 'active-bar' : ''}`}
										onMouseEnter={() => setHoveredBar(bar)}
										onClick={() => openDayBreakdown(bar)}
										tabIndex={0}
										role="button"
										aria-label={`${bar.fullDate}: ${isPos ? '+' : ''}₹${bar.amount.toFixed(2)} (${isPos ? '+' : ''}${bar.percent}%) — Click to open day orders in new tab`}
										title={`${bar.fullDate}: ${isPos ? '+' : ''}₹${bar.amount.toFixed(2)} (${isPos ? '+' : ''}${bar.percent}%) — Click to open day orders & profit conduct in new tab ↗`}
									>
										{/* Floating tooltip on hover */}
										{isSelected && (
											<div className="bar-tooltip">
												<div className="flex items-center gap-1 font-bold">
													<span>{isPos ? '+' : ''}₹{bar.amount.toFixed(2)}</span>
													<span className={isPos ? 'positive-text' : 'negative-text'}>({bar.percent}%)</span>
												</div>
												<div className="bar-tooltip-sub text-[#b9d77e]">
													<span>{bar.dateLabel}</span> · <span>Touch to open orders & profit conduct ↗</span>
												</div>
											</div>
										)}

										<div
											className={`mini-bar-fill ${isPos ? 'bar-positive' : 'bar-negative'}`}
											style={{ height: `${heightPct}%` }}
										/>

										{/* Explicit Date indicator directly on Monday bar */}
										{bar.isMonday && (
											<span className="monday-date-label" title={`Monday ${bar.dateLabel}`}>
												{bar.dateLabel}
											</span>
										)}
									</div>
								)
							})}
						</div>
					</div>

					<div className="metric-small-row">
						<span>Best performer</span>
						<strong className={(bestQuote?.percent_change ?? 0) >= 0 ? 'positive-text' : 'negative-text'}>
							{bestQuote ? `${bestQuote.symbol} ${bestQuote.percent_change >= 0 ? '+' : ''}${bestQuote.percent_change.toFixed(2)}%` : '—'}
						</strong>
					</div>
				</article>
			</section>

			<section className="dashboard-columns">
				{/* Your holdings: Correct dimensions, modern typography, crisp proportions */}
				<article className="surface holdings-panel">
					<div className="section-heading holdings-heading">
						<div>
							<h2>Your holdings</h2>
							<p>Track your active portfolio positions</p>
						</div>
						<button className="text-button" onClick={() => navigate('/portfolio')}>
							View portfolio <ArrowRight size={14} />
						</button>
					</div>

					<div className="table-scroll">
						<table className="data-table">
							<thead>
								<tr>
									<th>ASSET</th>
									<th>PRICE</th>
									<th>MARKET VALUE</th>
									<th>24H RETURN</th>
									<th />
								</tr>
							</thead>
							<tbody>
								{holdings.map((holding) => (
									<tr key={holding.ticker} onClick={() => navigate(`/terminal?symbol=${holding.ticker}`)}>
										<td>
											<div className="asset-cell">
												<span className="asset-icon" style={{ '--asset-color': holding.color } as React.CSSProperties}>
													{holding.ticker.slice(0, 1)}
												</span>
												<div className="asset-meta">
													<strong>{holding.ticker}</strong>
													<small>{holding.shares} shares · NSE</small>
												</div>
											</div>
										</td>
										<td className="price-cell">
											<strong>{holding.price}</strong>
										</td>
										<td className="value-cell">
											<strong>{holding.value}</strong>
										</td>
										<td>
											<span className={`table-change ${holding.positive ? 'positive-text' : 'negative-text'}`}>
												{holding.positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
												{holding.change}
											</span>
										</td>
										<td>
											<button
												className="icon-button row-menu"
												aria-label={`Open ${holding.ticker} in terminal`}
												onClick={(e) => {
													e.stopPropagation()
													navigate(`/terminal?symbol=${holding.ticker}`)
												}}
												title="Trade in terminal"
											>
												<MoreHorizontal size={17} />
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</article>

				{/* Market movers: Two sections (Top Gainers & Top Losers) */}
				<article className="surface movers-panel">
					<div className="section-heading movers-heading">
						<div className="movers-heading-top">
							<div>
								<h2>Market movers</h2>
								<p>Top NSE leaders & laggards</p>
							</div>
							<button className="icon-button" aria-label="Add to watchlist" onClick={() => navigate('/market/search')}>
								<Plus size={17} />
							</button>
						</div>

						{/* Two sections segmented control tabs */}
						<div className="mover-tabs-toggle" role="tablist">
							<button
								role="tab"
								aria-selected={moverTab === 'gainers'}
								className={`mover-tab-button ${moverTab === 'gainers' ? 'active-gainer' : ''}`}
								onClick={() => setMoverTab('gainers')}
							>
								<TrendingUp size={14} /> Top Gainers
								<span className="tab-count">{gainersList.length}</span>
							</button>
							<button
								role="tab"
								aria-selected={moverTab === 'losers'}
								className={`mover-tab-button ${moverTab === 'losers' ? 'active-loser' : ''}`}
								onClick={() => setMoverTab('losers')}
							>
								<TrendingDown size={14} /> Top Losers
								<span className="tab-count">{losersList.length}</span>
							</button>
						</div>
					</div>

					<div className="movers-list">
						{movers.map((stock) => (
							<div
								className="mover-row cursor-pointer"
								key={stock.ticker}
								onClick={() => navigate(`/terminal?symbol=${stock.ticker}`)}
								title={`Open ${stock.ticker} chart`}
							>
								<span className="mover-symbol">{stock.ticker.slice(0, 1)}</span>
								<span className="mover-name">
									<strong>{stock.ticker}</strong>
									<small>{stock.name}</small>
								</span>
								<svg
									className={`sparkline ${stock.positive ? 'spark-positive' : 'spark-negative'}`}
									viewBox="0 0 72 24"
									preserveAspectRatio="none"
									aria-hidden="true"
								>
									<polyline points={stock.values} fill="none" stroke="currentColor" strokeWidth="1.7" />
								</svg>
								<span className="mover-price">
									<strong>{stock.price}</strong>
									<small className={stock.positive ? 'positive-text' : 'negative-text'}>{stock.change}</small>
								</span>
							</div>
						))}
					</div>

					<button className="movers-footer" onClick={() => navigate('/market')}>
						Explore all NSE markets <ArrowRight size={14} />
					</button>
				</article>
			</section>
		</div>
	)
}
