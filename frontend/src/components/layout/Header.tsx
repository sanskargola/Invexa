import { Bell, Command, Search, SlidersHorizontal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const titles: Record<string, string> = {
	'/dashboard': 'Overview', '/market': 'Markets', '/terminal': 'Trading terminal',
	'/trading/terminal': 'Trading terminal', '/portfolio': 'Portfolio', '/algo/strategies': 'Algorithms', '/prediction': 'AI predictions',
	'/alerts': 'Alerts', '/settings': 'Settings', '/ai': 'AI assistant', '/reports': 'Reports', '/admin': 'Administration',
}

export default function Header() {
	const { pathname } = useLocation()
	const navigate = useNavigate()
	const [searchOpen, setSearchOpen] = useState(false)
	const [notificationsOpen, setNotificationsOpen] = useState(false)
	const [query, setQuery] = useState('')
	const routeParts = pathname.split('/').filter(Boolean)
	const routeName = routeParts[routeParts.length - 1]?.replace(/-/g, ' ')
	const currentTitle = titles[pathname] ?? routeName?.replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? 'Overview'
	const destinations = [
		{ label: 'Overview', detail: 'Portfolio dashboard', path: '/dashboard' },
		{ label: 'Markets', detail: 'Browse stocks and market data', path: '/market' },
		{ label: 'Trading terminal', detail: 'Open chart and order ticket', path: '/terminal' },
		{ label: 'Portfolio', detail: 'Holdings and performance', path: '/portfolio' },
		{ label: 'Strategies', detail: 'Algorithm workspace', path: '/algo/strategies' },
		{ label: 'AI predictions', detail: 'Forecasts and models', path: '/prediction' },
		{ label: 'Alerts', detail: 'Price and market alerts', path: '/alerts' },
		{ label: 'Settings', detail: 'Account preferences', path: '/settings' },
	]
	const results = useMemo(() => destinations.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(query.toLowerCase())), [query])

	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
				event.preventDefault()
				setSearchOpen(true)
				setNotificationsOpen(false)
			}
			if (event.key === 'Escape') {
				setSearchOpen(false)
				setNotificationsOpen(false)
			}
		}
		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [])

	return (
		<header className="topbar">
			<div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-divider">/</span><strong>{currentTitle}</strong></div>
			<div className="topbar-actions">
				<button className="search-trigger" aria-expanded={searchOpen} onClick={() => { setSearchOpen((open) => !open); setNotificationsOpen(false) }}><Search size={16} /><span>Search pages...</span><kbd><Command size={11} /> K</kbd></button>
				<button className="icon-button topbar-filter" aria-label="Open market search" title="Open market search" onClick={() => navigate('/market/search')}><SlidersHorizontal size={17} /></button>
				<button className="icon-button notification-button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => { setNotificationsOpen((open) => !open); setSearchOpen(false) }}><Bell size={17} /><i /></button>
				<span className="topbar-divider" />
				<span className="market-status"><i /> Market open</span>
			</div>
			{searchOpen && <div className="header-popover search-popover"><label className="popover-search"><Search size={15} /><input autoFocus placeholder="Search pages..." value={query} onChange={(event) => setQuery(event.target.value)} /></label><span className="popover-label">NAVIGATION</span>{results.map((result) => <button key={result.path} className="search-result" onClick={() => { navigate(result.path); setSearchOpen(false); setQuery('') }}><span><strong>{result.label}</strong><small>{result.detail}</small></span><kbd>↵</kbd></button>)}{!results.length && <p className="popover-empty">No matching pages.</p>}</div>}
			{notificationsOpen && <div className="header-popover notification-popover"><div className="popover-heading"><strong>Notifications</strong><button onClick={() => setNotificationsOpen(false)}>Close</button></div><button className="notification-item" onClick={() => { navigate('/alerts'); setNotificationsOpen(false) }}><i className="notice-dot" /><span><strong>NVDA is up 3.42%</strong><small>Your watchlist moved today · 12 min ago</small></span></button><button className="notification-item" onClick={() => { navigate('/portfolio'); setNotificationsOpen(false) }}><i className="notice-dot notice-dot-muted" /><span><strong>Portfolio summary is ready</strong><small>Daily performance report · 1 hr ago</small></span></button><button className="notification-footer" onClick={() => { navigate('/alerts'); setNotificationsOpen(false) }}>View all alerts</button></div>}
		</header>
	)
}
