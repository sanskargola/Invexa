import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { marketApi, type MarketQuote } from '../../services/marketApi'

const indexSymbols = [
	{ symbol: '^NSEI', label: 'NIFTY 50' },
	{ symbol: '^BSESN', label: 'SENSEX' },
]

function formatIndexValue(value: number) {
	return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function Header() {
	const navigate = useNavigate()
	const [indices, setIndices] = useState<MarketQuote[]>([])
	const [indexError, setIndexError] = useState<string | null>(null)
	const [notificationsOpen, setNotificationsOpen] = useState(false)

	useEffect(() => {
		let isActive = true

		async function refreshIndices() {
			try {
				const quotes = await Promise.all(indexSymbols.map(({ symbol }) => marketApi.getStock(symbol)))
				if (isActive) {
					setIndices(quotes)
					setIndexError(null)
				}
			} catch (error) {
				if (isActive) {
					setIndices([])
					setIndexError(error instanceof Error ? error.message : 'Unable to load Indian index data.')
				}
			}
		}

		void refreshIndices()
		const timer = window.setInterval(() => void refreshIndices(), 20000)
		return () => {
			isActive = false
			window.clearInterval(timer)
		}
	}, [])

	const tickerItems = indices.map((quote) => {
		const index = indexSymbols.find(({ symbol }) => symbol === quote.yahoo_symbol || symbol === quote.symbol)
		return {
			key: quote.yahoo_symbol ?? quote.symbol,
			label: index?.label ?? quote.name,
			price: formatIndexValue(quote.price),
			change: `${quote.change >= 0 ? '+' : ''}${quote.change.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
			percent: `${quote.percent_change >= 0 ? '+' : ''}${quote.percent_change.toFixed(2)}%`,
			positive: quote.percent_change >= 0,
		}
	})

	return (
		<header className="topbar">
			<div className="index-ticker" aria-label="Live Indian stock indices">
				{indexError ? (
					<span className="index-ticker-error" role="status" title={indexError}>Indian index data unavailable</span>
				) : tickerItems.length ? (
					<div className="index-ticker-track">
						{[0, 1].map((copy) => (
							<div className="index-ticker-group" key={copy} aria-hidden={copy === 1}>
								{tickerItems.map((item) => (
									<div className="index-ticker-item" key={`${copy}-${item.key}`}>
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
				) : (
					<span className="index-ticker-loading" role="status">Loading Indian indices…</span>
				)}
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
