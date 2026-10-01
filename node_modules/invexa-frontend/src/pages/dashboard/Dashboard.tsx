import { useState } from 'react'
import { ArrowDownRight, ArrowRight, ArrowUpRight, Download, MoreHorizontal, Plus, Sparkles } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const movers = [
	{ ticker: 'NVDA', name: 'NVIDIA Corporation', price: '$142.87', change: '+3.42%', positive: true, values: '0,20 10,15 20,18 30,8 40,13 50,6 60,10 70,2' },
	{ ticker: 'AAPL', name: 'Apple Inc.', price: '$232.61', change: '+1.18%', positive: true, values: '0,17 10,12 20,16 30,7 40,10 50,3 60,9 70,4' },
	{ ticker: 'TSLA', name: 'Tesla, Inc.', price: '$352.56', change: '-2.71%', positive: false, values: '0,3 10,8 20,5 30,14 40,9 50,18 60,11 70,20' },
]

const holdings = [
	{ ticker: 'NVDA', name: 'NVIDIA Corporation', shares: '42 shares', price: '$142.87', value: '$6,000.54', change: '+8.42%', positive: true, color: '#a8c55a' },
	{ ticker: 'AAPL', name: 'Apple Inc.', shares: '18 shares', price: '$232.61', value: '$4,186.98', change: '+2.11%', positive: true, color: '#78a9d2' },
	{ ticker: 'MSFT', name: 'Microsoft Corporation', shares: '9 shares', price: '$428.76', value: '$3,858.84', change: '-0.84%', positive: false, color: '#d58e6c' },
	{ ticker: 'AMZN', name: 'Amazon.com, Inc.', shares: '21 shares', price: '$225.94', value: '$4,744.74', change: '+1.36%', positive: true, color: '#d5bd73' },
]

function PerformanceChart() {
	const line = '0,102 14,95 27,98 40,82 53,88 66,75 79,78 92,60 105,65 118,54 131,62 144,47 157,52 170,37 183,45 196,33 209,39 222,22 235,31 248,12 261,18 274,5 287,13 300,0'
	return <svg className="performance-chart" viewBox="0 0 300 116" preserveAspectRatio="none" role="img" aria-label="Portfolio value performance chart">
		<defs><linearGradient id="area-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#b6d672" stopOpacity=".2" /><stop offset="100%" stopColor="#b6d672" stopOpacity="0" /></linearGradient></defs>
		{[20, 48, 76, 104].map((y) => <line key={y} x1="0" x2="300" y1={y} y2={y} stroke="#29312b" strokeDasharray="3 5" />)}
		<polygon points={`0,116 ${line} 300,116`} fill="url(#area-fill)" />
		<polyline points={line} fill="none" stroke="#c0dc7c" strokeWidth="2" vectorEffect="non-scaling-stroke" />
	</svg>
}

export default function Dashboard() {
	const navigate = useNavigate()
	const location = useLocation()
	const { user } = useAuth()
	const [portfolioMenuOpen, setPortfolioMenuOpen] = useState(false)
	const [notice, setNotice] = useState(typeof location.state?.notice === 'string' ? location.state.notice : '')

	function exportPortfolio() {
		const csv = ['Symbol,Shares,Price,Market value,Return', ...holdings.map((holding) => `${holding.ticker},${holding.shares.replace(' shares', '')},${holding.price},${holding.value},${holding.change}`)].join('\n')
		const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
		const link = document.createElement('a')
		link.href = url
		link.download = 'invexa-portfolio.csv'
		link.click()
		URL.revokeObjectURL(url)
		setPortfolioMenuOpen(false)
	}
	return (
		<div className="dashboard-page">
			<div className="page-heading">
				<div>
					<p className="eyebrow">{new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()).toUpperCase()} <span className="eyebrow-dot">·</span> MARKET OPEN</p>
					<h1>Good morning, {user?.name.split(/\s+/)[0] ?? 'Trader'} <span className="wave">↗</span></h1>
					<p className="page-subtitle">Here’s what’s happening with your portfolio today.</p>
				</div>
				<button className="button button-primary" onClick={() => navigate('/terminal')}><Plus size={16} /> New trade</button>
			</div>
			{notice && <div className="workspace-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss">×</button></div>}
			<section className="metric-grid" aria-label="Portfolio summary">
				<article className="metric-panel portfolio-value">
					<div className="metric-top"><span>Total portfolio value</span><button className="icon-button" aria-label="More portfolio options" aria-expanded={portfolioMenuOpen} onClick={() => setPortfolioMenuOpen((open) => !open)}><MoreHorizontal size={18} /></button>
						{portfolioMenuOpen && <div className="dashboard-action-menu"><button onClick={exportPortfolio}><Download size={14} /> Download holdings CSV</button><button onClick={() => { setPortfolioMenuOpen(false); navigate('/portfolio') }}>Open portfolio</button></div>}
					</div>
					<div className="metric-value">$48,294<span className="metric-cents">.82</span></div>
					<div className="metric-foot"><span className="change-pill positive"><ArrowUpRight size={13} /> 2.84%</span><span>+$1,337.21 today</span><span className="muted-separator">·</span><span className="muted">vs. last close</span></div>
					<div className="portfolio-chart-wrap"><PerformanceChart /><div className="chart-xlabels"><span>9:30 AM</span><span>11:00 AM</span><span>12:30 PM</span><span>2:00 PM</span><span>4:00 PM</span></div></div>
				</article>
				<article className="metric-panel"><div className="metric-top"><span>Buying power</span><span className="metric-icon green-icon"><ArrowUpRight size={16} /></span></div><div className="metric-value">$12,840<span className="metric-cents">.00</span></div><div className="metric-foot"><span className="muted">Available to invest</span></div><div className="buying-power-track"><span /></div><div className="metric-small-row"><span>Invested</span><strong>$35,454.82</strong></div></article>
				<article className="metric-panel"><div className="metric-top"><span>Day’s return</span><span className="metric-icon green-icon"><ArrowUpRight size={16} /></span></div><div className="metric-value positive-text">+$1,337<span className="metric-cents">.21</span></div><div className="metric-foot"><span className="change-pill positive"><ArrowUpRight size={13} /> 2.84%</span><span className="muted">today</span></div><div className="mini-bars" aria-label="Daily returns">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</div><div className="metric-small-row"><span>Best performer</span><strong className="positive-text">NVDA +8.42%</strong></div></article>
			</section>
			<section className="dashboard-columns">
				<article className="surface holdings-panel">
					<div className="section-heading"><div><h2>Your holdings</h2><p>Track your active positions</p></div><button className="text-button" onClick={() => navigate('/portfolio')}>View portfolio <ArrowRight size={14} /></button></div>
					<div className="table-scroll"><table className="data-table"><thead><tr><th>ASSET</th><th>PRICE</th><th>MARKET VALUE</th><th>24H</th><th /></tr></thead><tbody>{holdings.map((holding) => <tr key={holding.ticker}><td><div className="asset-cell"><span className="asset-icon" style={{ '--asset-color': holding.color } as React.CSSProperties}>{holding.ticker.slice(0, 1)}</span><span><strong>{holding.ticker}</strong><small>{holding.shares}</small></span></div></td><td>{holding.price}</td><td><strong>{holding.value}</strong></td><td><span className={`table-change ${holding.positive ? 'positive-text' : 'negative-text'}`}>{holding.positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{holding.change}</span></td><td><button className="icon-button row-menu" aria-label={`Open ${holding.ticker} in terminal`} onClick={() => navigate(`/terminal?symbol=${holding.ticker}`)}><MoreHorizontal size={17} /></button></td></tr>)}</tbody></table></div>
				</article>
				<article className="surface movers-panel">
					<div className="section-heading"><div><h2>Market movers</h2><p>Stocks on your watchlist</p></div><button className="icon-button" aria-label="Add to watchlist" onClick={() => navigate('/market/search')}><Plus size={17} /></button></div>
					<div className="movers-list">{movers.map((stock) => <div className="mover-row" key={stock.ticker}><span className="mover-symbol">{stock.ticker.slice(0, 1)}</span><span className="mover-name"><strong>{stock.ticker}</strong><small>{stock.name}</small></span><svg className={`sparkline ${stock.positive ? 'spark-positive' : 'spark-negative'}`} viewBox="0 0 72 24" preserveAspectRatio="none" aria-hidden="true"><polyline points={stock.values} fill="none" stroke="currentColor" strokeWidth="1.7" /></svg><span className="mover-price"><strong>{stock.price}</strong><small className={stock.positive ? 'positive-text' : 'negative-text'}>{stock.change}</small></span></div>)}</div>
					<button className="movers-footer" onClick={() => navigate('/market')}>Explore markets <ArrowRight size={14} /></button>
				</article>
			</section>
			<section className="insight-banner"><span className="insight-icon"><Sparkles size={17} /></span><div><strong>Your portfolio is outperforming the S&amp;P 500</strong><p>You’re ahead by 1.2% this week. See what’s driving your gains.</p></div><button className="insight-action" onClick={() => navigate('/ai')}>View insights <ArrowRight size={14} /></button></section>
		</div>
	)
}
