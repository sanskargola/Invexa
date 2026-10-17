import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { marketApi, type MarketQuote } from '../../services/marketApi'

const frequentStockConfigs = [
	{ symbol: '^NSEI', label: 'NIFTY 50', fallbackPrice: 24852.15, fallbackChange: 142.30, fallbackPct: 0.58 },
	{ symbol: '^BSESN', label: 'SENSEX', fallbackPrice: 81342.80, fallbackChange: 428.10, fallbackPct: 0.53 },
	{ symbol: 'BANKNIFTY', label: 'BANK NIFTY', fallbackPrice: 51280.40, fallbackChange: 210.50, fallbackPct: 0.41 },
	{ symbol: 'RELIANCE', label: 'RELIANCE', fallbackPrice: 2980.50, fallbackChange: 33.10, fallbackPct: 1.12 },
	{ symbol: 'TCS', label: 'TCS', fallbackPrice: 4120.00, fallbackChange: 18.40, fallbackPct: 0.45 },
	{ symbol: 'HDFCBANK', label: 'HDFCBANK', fallbackPrice: 1742.80, fallbackChange: 15.20, fallbackPct: 0.88 },
	{ symbol: 'INFY', label: 'INFY', fallbackPrice: 1895.30, fallbackChange: -11.80, fallbackPct: -0.62 },
	{ symbol: 'ICICIBANK', label: 'ICICIBANK', fallbackPrice: 1264.50, fallbackChange: 9.80, fallbackPct: 0.78 },
	{ symbol: 'SBIN', label: 'SBIN', fallbackPrice: 842.15, fallbackChange: 11.65, fallbackPct: 1.40 },
	{ symbol: 'TATAMOTORS', label: 'TATAMOTORS', fallbackPrice: 968.40, fallbackChange: 14.20, fallbackPct: 1.49 },
	{ symbol: 'BHARTIARTL', label: 'BHARTIARTL', fallbackPrice: 1685.00, fallbackChange: -8.50, fallbackPct: -0.50 },
	{ symbol: 'ITC', label: 'ITC', fallbackPrice: 482.30, fallbackChange: 3.10, fallbackPct: 0.65 },
]

function formatIndexValue(value: number) {
	return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function Header() {
	const navigate = useNavigate()
	const [quotesMap, setQuotesMap] = useState<Record<string, MarketQuote>>({})
	const [notificationsOpen, setNotificationsOpen] = useState(false)

	useEffect(() => {
		let isActive = true

		async function refreshQuotes() {
			try {
				// Fetch bulk quotes and index quotes in parallel
				const [generalQuotes, nseiQuote, bsesnQuote] = await Promise.allSettled([
					marketApi.getQuotes(),
					marketApi.getStock('^NSEI'),
					marketApi.getStock('^BSESN'),
				])

				if (!isActive) return

				const map: Record<string, MarketQuote> = {}
				if (generalQuotes.status === 'fulfilled' && Array.isArray(generalQuotes.value)) {
					for (const q of generalQuotes.value) {
						map[q.symbol] = q
					}
				}
				if (nseiQuote.status === 'fulfilled' && nseiQuote.value) {
					map['^NSEI'] = nseiQuote.value
				}
				if (bsesnQuote.status === 'fulfilled' && bsesnQuote.value) {
					map['^BSESN'] = bsesnQuote.value
				}

				setQuotesMap(map)
			} catch {
				// Fallback data is automatically used
			}
		}

		void refreshQuotes()
		const timer = window.setInterval(() => void refreshQuotes(), 20000)
		return () => {
			isActive = false
			window.clearInterval(timer)
		}
	}, [])

	const tickerItems = frequentStockConfigs.map((config) => {
		const live = quotesMap[config.symbol]
		const price = live?.price && live.price > 0 ? live.price : config.fallbackPrice
		const change = live?.change !== undefined && live.change !== 0 ? live.change : config.fallbackChange
		const pct = live?.percent_change !== undefined && live.percent_change !== 0 ? live.percent_change : config.fallbackPct
		const positive = change >= 0

		return {
			key: config.symbol,
			label: config.label,
			price: formatIndexValue(price),
			change: `${positive ? '+' : ''}${change.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
			percent: `${positive ? '+' : ''}${pct.toFixed(2)}%`,
			positive,
		}
	})

	return (
		<header className="topbar">
			<div className="index-ticker" aria-label="Live Indian stock indices and frequent stocks">
				<div className="index-ticker-track">
					{[0, 1].map((copy) => (
						<div className="index-ticker-group" key={copy} aria-hidden={copy === 1}>
							{tickerItems.map((item) => (
								<div
									className="index-ticker-item cursor-pointer"
									key={`${copy}-${item.key}`}
									onClick={() => navigate(`/terminal?symbol=${item.key.replace('^', '')}`)}
									title={`View ${item.label} chart`}
								>
									<span className="index-ticker-name">{item.label}</span>
									<strong>{item.price}</strong>
									<span className={item.positive ? 'index-ticker-change positive-text' : 'index-ticker-change negative-text'}>
										{item.change} ({item.percent})
									</span>
								</div>
							))}
						</div>
					))}
				</div>
			</div>
			<div className="topbar-actions">
				<button
					className="icon-button notification-button"
					aria-label="Notifications"
					aria-expanded={notificationsOpen}
					onClick={() => setNotificationsOpen((open) => !open)}
				>
					<Bell size={17} />
					<i />
				</button>
			</div>
			{notificationsOpen && (
				<div className="header-popover notification-popover">
					<div className="popover-heading"><strong>Notifications</strong><button onClick={() => setNotificationsOpen(false)}>Close</button></div>
					<button className="notification-item" onClick={() => { navigate('/alerts'); setNotificationsOpen(false) }}>
						<i className="notice-dot" />
						<span><strong>NVDA is up 3.42%</strong><small>Your watchlist moved today · 12 min ago</small></span>
					</button>
					<button className="notification-item" onClick={() => { navigate('/portfolio'); setNotificationsOpen(false) }}>
						<i className="notice-dot notice-dot-muted" />
						<span><strong>Portfolio summary is ready</strong><small>Daily performance report · 1 hr ago</small></span>
					</button>
					<button className="notification-footer" onClick={() => { navigate('/alerts'); setNotificationsOpen(false) }}>View all alerts</button>
				</div>
			)}
		</header>
	)
}
