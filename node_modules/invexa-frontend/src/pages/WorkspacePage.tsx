import { useMemo, useState } from 'react'
import { ArrowDownToLine, ArrowRight, ChevronDown, Plus, Search, SlidersHorizontal } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

type RecordRow = Record<string, string>
type RoutePage = { path: string; title: string; section: string; description: string; action: string }

const routePages: RoutePage[] = [
  { path: '/market', title: 'Market overview', section: 'Markets', description: 'A clear view of the sessions and symbols moving today.', action: 'Add symbol' },
  { path: '/market/search', title: 'Stock search', section: 'Markets', description: 'Find listed companies and compare live market data.', action: 'Create watchlist' },
  { path: '/market/technical', title: 'Technical analysis', section: 'Markets', description: 'Review trend, momentum, and key technical levels.', action: 'Open chart' },
  { path: '/market/fundamentals', title: 'Fundamental analysis', section: 'Markets', description: 'Compare financial strength, valuation, and growth.', action: 'Compare stocks' },
  { path: '/market/sentiment', title: 'Sentiment analysis', section: 'Markets', description: 'Follow analyst consensus and changes in market sentiment.', action: 'View sentiment' },
  { path: '/trading/orders', title: 'Orders', section: 'Trading', description: 'Review submitted, open, and completed orders.', action: 'New order' },
  { path: '/trading/order-details', title: 'Order details', section: 'Trading', description: 'Inspect execution status and order activity.', action: 'New order' },
  { path: '/trading/positions', title: 'Positions', section: 'Trading', description: 'Monitor active positions and unrealized performance.', action: 'Manage positions' },
  { path: '/trading/holdings', title: 'Holdings', section: 'Trading', description: 'See the assets currently held in your account.', action: 'View portfolio' },
  { path: '/trading/history', title: 'Trade history', section: 'Trading', description: 'Browse past executions across your account.', action: 'Export history' },
  { path: '/portfolio', title: 'Portfolio overview', section: 'Portfolio', description: 'Track portfolio value, returns, and your largest positions.', action: 'Add investment' },
  { path: '/portfolio/performance', title: 'Portfolio performance', section: 'Portfolio', description: 'Compare returns over time and against the market.', action: 'View report' },
  { path: '/portfolio/allocation', title: 'Asset allocation', section: 'Portfolio', description: 'Understand how your capital is distributed.', action: 'Rebalance' },
  { path: '/portfolio/transactions', title: 'Transactions', section: 'Portfolio', description: 'Review deposits, withdrawals, dividends, and fees.', action: 'Export transactions' },
  { path: '/algo', title: 'Algorithm dashboard', section: 'Algorithms', description: 'Monitor automated strategies and recent activity.', action: 'New strategy' },
  { path: '/algo/strategies', title: 'Strategies', section: 'Algorithms', description: 'Build, compare, and manage your trading strategies.', action: 'Create strategy' },
  { path: '/algo/builder', title: 'Strategy builder', section: 'Algorithms', description: 'Compose a rules-based strategy for your market thesis.', action: 'Save strategy' },
  { path: '/algo/strategy-details', title: 'Strategy details', section: 'Algorithms', description: 'Inspect signals, configuration, and strategy activity.', action: 'Edit strategy' },
  { path: '/algo/backtesting', title: 'Backtesting', section: 'Algorithms', description: 'Test a strategy against historical market data.', action: 'Run backtest' },
  { path: '/algo/backtest-results', title: 'Backtest results', section: 'Algorithms', description: 'Review historical returns, drawdown, and trade quality.', action: 'Export results' },
  { path: '/algo/paper-trading', title: 'Paper trading', section: 'Algorithms', description: 'Validate a strategy in a simulated live environment.', action: 'Start simulation' },
  { path: '/algo/live-algo', title: 'Live algorithms', section: 'Algorithms', description: 'Control strategies connected to your brokerage.', action: 'Connect broker' },
  { path: '/prediction', title: 'AI predictions', section: 'Predictions', description: 'Explore model forecasts and confidence for tracked assets.', action: 'Run prediction' },
  { path: '/prediction/history', title: 'Prediction history', section: 'Predictions', description: 'Compare forecasts with observed market outcomes.', action: 'Export history' },
  { path: '/prediction/models', title: 'Model comparison', section: 'Predictions', description: 'Compare model coverage, accuracy, and recent performance.', action: 'Compare models' },
  { path: '/prediction/performance', title: 'Model performance', section: 'Predictions', description: 'Measure forecast accuracy across time horizons.', action: 'View methodology' },
  { path: '/alerts', title: 'Alerts', section: 'Alerts', description: 'Get notified when a price or technical condition is met.', action: 'Create alert' },
  { path: '/alerts/create', title: 'Create alert', section: 'Alerts', description: 'Set a price target or indicator condition for an asset.', action: 'Save alert' },
  { path: '/ai', title: 'AI assistant', section: 'Intelligence', description: 'Ask questions about markets, portfolio exposure, and strategy.', action: 'Start a conversation' },
  { path: '/reports', title: 'Reports', section: 'Reports', description: 'Find portfolio, performance, and tax documents.', action: 'Generate report' },
  { path: '/reports/details', title: 'Report details', section: 'Reports', description: 'Review report scope, data, and generated results.', action: 'Download report' },
  { path: '/settings', title: 'Settings', section: 'Settings', description: 'Manage your account, preferences, and connected services.', action: 'Save changes' },
  { path: '/settings/profile', title: 'Profile', section: 'Settings', description: 'Update your personal and contact information.', action: 'Save profile' },
  { path: '/settings/security', title: 'Security', section: 'Settings', description: 'Manage sign-in protection and active sessions.', action: 'Review sessions' },
  { path: '/settings/brokers', title: 'Broker accounts', section: 'Settings', description: 'Connect and manage brokerage integrations.', action: 'Connect broker' },
  { path: '/settings/notifications', title: 'Notifications', section: 'Settings', description: 'Choose which market and account events reach you.', action: 'Save preferences' },
  { path: '/settings/chart', title: 'Chart settings', section: 'Settings', description: 'Set chart appearance and default indicators.', action: 'Save settings' },
  { path: '/admin', title: 'Admin dashboard', section: 'Administration', description: 'Monitor users, execution, models, and system availability.', action: 'Review system' },
  { path: '/admin/users', title: 'Users', section: 'Administration', description: 'Review account status and access levels.', action: 'Invite user' },
  { path: '/admin/orders', title: 'Order oversight', section: 'Administration', description: 'Review platform-wide order processing and exceptions.', action: 'Export orders' },
  { path: '/admin/strategies', title: 'Strategy oversight', section: 'Administration', description: 'Review deployed strategies and their current state.', action: 'Review strategies' },
  { path: '/admin/models', title: 'Models', section: 'Administration', description: 'Manage available prediction models and deployments.', action: 'Deploy model' },
  { path: '/admin/audit-logs', title: 'Audit logs', section: 'Administration', description: 'Search administrative and account activity.', action: 'Export logs' },
  { path: '/admin/system-health', title: 'System health', section: 'Administration', description: 'Monitor services, queues, and market data connections.', action: 'Refresh status' },
]

const marketRows: RecordRow[] = [
  { Asset: 'NVDA · NVIDIA Corporation', Price: '$142.87', '24h change': '+3.42%', Volume: '42.8M', 'Market cap': '$3.49T', Signal: 'Strong buy' },
  { Asset: 'AAPL · Apple Inc.', Price: '$232.61', '24h change': '+1.18%', Volume: '28.1M', 'Market cap': '$3.55T', Signal: 'Buy' },
  { Asset: 'MSFT · Microsoft Corporation', Price: '$428.76', '24h change': '+0.64%', Volume: '16.3M', 'Market cap': '$3.19T', Signal: 'Neutral' },
  { Asset: 'TSLA · Tesla, Inc.', Price: '$352.56', '24h change': '-2.71%', Volume: '73.6M', 'Market cap': '$1.13T', Signal: 'Watch' },
  { Asset: 'AMZN · Amazon.com, Inc.', Price: '$225.94', '24h change': '+1.36%', Volume: '19.7M', 'Market cap': '$2.37T', Signal: 'Buy' },
  { Asset: 'GOOGL · Alphabet Inc.', Price: '$249.48', '24h change': '-0.42%', Volume: '14.2M', 'Market cap': '$3.01T', Signal: 'Neutral' },
]
const portfolioRows: RecordRow[] = [
  { Asset: 'NVDA · NVIDIA Corporation', Quantity: '42 shares', 'Avg. cost': '$131.78', Price: '$142.87', Value: '$6,000.54', Return: '+8.42%' },
  { Asset: 'AAPL · Apple Inc.', Quantity: '18 shares', 'Avg. cost': '$227.80', Price: '$232.61', Value: '$4,186.98', Return: '+2.11%' },
  { Asset: 'MSFT · Microsoft Corporation', Quantity: '9 shares', 'Avg. cost': '$432.39', Price: '$428.76', Value: '$3,858.84', Return: '-0.84%' },
  { Asset: 'AMZN · Amazon.com, Inc.', Quantity: '21 shares', 'Avg. cost': '$222.91', Price: '$225.94', Value: '$4,744.74', Return: '+1.36%' },
]
const orderRows: RecordRow[] = [
  { Order: 'ORD-849271', Asset: 'NVDA', Side: 'Buy', Quantity: '10', Type: 'Limit', Status: 'Open', Time: '10:42:18 AM' },
  { Order: 'ORD-849208', Asset: 'AAPL', Side: 'Sell', Quantity: '4', Type: 'Market', Status: 'Filled', Time: '10:18:43 AM' },
  { Order: 'ORD-848996', Asset: 'MSFT', Side: 'Buy', Quantity: '8', Type: 'Limit', Status: 'Partial', Time: '9:56:07 AM' },
  { Order: 'ORD-848831', Asset: 'AMZN', Side: 'Buy', Quantity: '12', Type: 'Market', Status: 'Filled', Time: 'Yesterday' },
]
const strategyRows: RecordRow[] = [
  { Strategy: 'Momentum breakout', Asset: 'NVDA · 1D', Type: 'Trend following', '30D return': '+8.64%', Status: 'Running', Updated: '2 min ago' },
  { Strategy: 'Mean reversion', Asset: 'SPY · 1H', Type: 'Statistical', '30D return': '+3.18%', Status: 'Paper', Updated: '18 min ago' },
  { Strategy: 'Earnings drift', Asset: 'US Large Cap · 1D', Type: 'Event driven', '30D return': '+5.72%', Status: 'Paused', Updated: 'Yesterday' },
]
const predictionRows: RecordRow[] = [
  { Asset: 'NVDA', Forecast: '$151.20', Horizon: '7 days', Confidence: '84%', Direction: 'Bullish', Model: 'Momentum v2.4' },
  { Asset: 'AAPL', Forecast: '$239.40', Horizon: '7 days', Confidence: '76%', Direction: 'Bullish', Model: 'Ensemble v1.8' },
  { Asset: 'TSLA', Forecast: '$338.15', Horizon: '7 days', Confidence: '68%', Direction: 'Bearish', Model: 'Momentum v2.4' },
]
const genericRows: RecordRow[] = [
  { Name: 'Quarterly portfolio review', Category: 'Portfolio', Status: 'Ready', Updated: 'Today, 9:32 AM' },
  { Name: 'Market exposure summary', Category: 'Markets', Status: 'Ready', Updated: 'Yesterday' },
  { Name: 'Strategy performance', Category: 'Algorithms', Status: 'Processing', Updated: 'Sep 29, 2026' },
  { Name: 'Account activity', Category: 'Account', Status: 'Ready', Updated: 'Sep 28, 2026' },
]

const actionRoutes: Record<string, string> = {
  'New trade': '/terminal', 'New order': '/terminal', 'Add investment': '/terminal', 'Manage positions': '/terminal',
  'Add symbol': '/market/search', 'Create watchlist': '/market/search', 'Compare stocks': '/market/search', 'Compare stock': '/market/search',
  'Open chart': '/terminal', 'View portfolio': '/portfolio', 'Rebalance': '/portfolio/allocation', 'Create strategy': '/algo/builder',
  'New strategy': '/algo/builder', 'Edit strategy': '/algo/builder', 'Run backtest': '/algo/backtest-results', 'Start simulation': '/algo/paper-trading',
  'Run prediction': '/prediction/history', 'Create alert': '/alerts/create', 'Connect broker': '/settings/brokers', 'Invite user': '/admin/users',
  'Compare models': '/prediction/models', 'Review system': '/admin/system-health', 'Review sessions': '/settings/security',
}

const sectionTabs: Record<string, { label: string; to: string }[]> = {
  Markets: [{ label: 'Overview', to: '/market' }, { label: 'Search', to: '/market/search' }, { label: 'Technical', to: '/market/technical' }, { label: 'Fundamentals', to: '/market/fundamentals' }, { label: 'Sentiment', to: '/market/sentiment' }],
  Trading: [{ label: 'Terminal', to: '/terminal' }, { label: 'Orders', to: '/trading/orders' }, { label: 'Positions', to: '/trading/positions' }, { label: 'Holdings', to: '/trading/holdings' }, { label: 'Trade history', to: '/trading/history' }],
  Portfolio: [{ label: 'Overview', to: '/portfolio' }, { label: 'Performance', to: '/portfolio/performance' }, { label: 'Allocation', to: '/portfolio/allocation' }, { label: 'Transactions', to: '/portfolio/transactions' }],
  Algorithms: [{ label: 'Dashboard', to: '/algo' }, { label: 'Strategies', to: '/algo/strategies' }, { label: 'Builder', to: '/algo/builder' }, { label: 'Backtesting', to: '/algo/backtesting' }, { label: 'Paper trading', to: '/algo/paper-trading' }, { label: 'Live', to: '/algo/live-algo' }],
  Predictions: [{ label: 'Overview', to: '/prediction' }, { label: 'History', to: '/prediction/history' }, { label: 'Models', to: '/prediction/models' }, { label: 'Performance', to: '/prediction/performance' }],
  Alerts: [{ label: 'All alerts', to: '/alerts' }, { label: 'Create alert', to: '/alerts/create' }],
  Reports: [{ label: 'Reports', to: '/reports' }, { label: 'Report details', to: '/reports/details' }],
  Settings: [{ label: 'General', to: '/settings' }, { label: 'Profile', to: '/settings/profile' }, { label: 'Security', to: '/settings/security' }, { label: 'Brokers', to: '/settings/brokers' }, { label: 'Notifications', to: '/settings/notifications' }, { label: 'Chart', to: '/settings/chart' }],
  Administration: [{ label: 'Overview', to: '/admin' }, { label: 'Users', to: '/admin/users' }, { label: 'Orders', to: '/admin/orders' }, { label: 'Strategies', to: '/admin/strategies' }, { label: 'Models', to: '/admin/models' }, { label: 'Audit logs', to: '/admin/audit-logs' }, { label: 'System health', to: '/admin/system-health' }],
}

function rowFor(page: RoutePage): RecordRow[] {
  if (page.section === 'Markets') return marketRows
  if (page.section === 'Trading') return orderRows
  if (page.section === 'Portfolio') return portfolioRows
  if (page.section === 'Algorithms') return strategyRows
  if (page.section === 'Predictions') return predictionRows
  if (page.section === 'Alerts') return [{ Name: 'NVDA crosses above $145', Condition: 'Price above $145.00', Channel: 'In-app, email', Status: 'Active', Updated: 'Today, 10:08 AM' }, { Name: 'RSI below 30', Condition: 'AAPL · 1H', Channel: 'In-app', Status: 'Active', Updated: 'Yesterday' }]
  if (page.section === 'Administration') return [{ Name: 'API gateway', Category: 'Service', Status: 'Operational', Updated: '99.98% uptime' }, { Name: 'Market data stream', Category: 'Data', Status: 'Operational', Updated: '43 ms latency' }, { Name: 'Order processor', Category: 'Execution', Status: 'Operational', Updated: '1.2k req/min' }, { Name: 'Prediction workers', Category: 'ML', Status: 'Degraded', Updated: 'Queue: 14' }]
  return genericRows
}

export default function WorkspacePage() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterMode, setFilterMode] = useState<'all' | 'positive' | 'attention'>('all')
  const pathParts = pathname.split('/').filter(Boolean)
  const page = routePages.find((item) => item.path === pathname) ?? { path: pathname, title: pathParts[pathParts.length - 1]?.replace(/-/g, ' ') ?? 'Workspace', section: 'Workspace', description: 'Manage your workspace and review the latest activity.', action: 'Create new' }
  const rows = useMemo(() => rowFor(page), [page])
  const visibleRows = useMemo(() => rows.filter((row) => {
    if (!Object.values(row).join(' ').toLowerCase().includes(query.toLowerCase())) return false
    if (filterMode === 'all') return true
    const status = (row.Status ?? row.Signal ?? row.Direction ?? row.Return ?? row['24h change'] ?? '').toLowerCase()
    return filterMode === 'positive' ? /active|running|filled|ready|operational|buy|bullish|\+/.test(status) : /degraded|paused|open|partial|bearish|watch|-/.test(status)
  }), [rows, query, filterMode])
  const columns = Object.keys(rows[0] ?? {})
  const tabs = sectionTabs[page.section] ?? []

  function exportRows() {
    const csv = [columns.join(','), ...visibleRows.map((row) => columns.map((column) => `"${(row[column] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    link.download = `${page.title.toLowerCase().replace(/ /g, '-')}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  function runAction() {
    const destination = actionRoutes[page.action]
    if (destination) {
      navigate(destination)
      return
    }
    if (page.action.toLowerCase().includes('export') || page.action.toLowerCase().includes('download')) {
      exportRows()
      setNotice(`${page.title} exported.`)
      return
    }
    localStorage.setItem(`invexa.demo.action.${pathname}`, new Date().toISOString())
    setNotice(`${page.action} saved in this demo workspace.`)
  }

  return <div className="workspace-page">
    <div className="page-heading"><div><p className="eyebrow">{page.section.toUpperCase()} <span className="eyebrow-dot">·</span> INVEXA WORKSPACE</p><h1>{page.title}</h1><p className="page-subtitle">{page.description}</p></div><button className="button button-primary" onClick={runAction}><Plus size={15} /> {page.action}</button></div>
    {tabs.length > 0 && <nav className="workspace-tabs" aria-label={`${page.section} pages`}>{tabs.map((tab) => <Link key={tab.to} className={pathname === tab.to || (tab.to === '/terminal' && pathname === '/trading/terminal') ? 'selected' : ''} to={tab.to}>{tab.label}</Link>)}</nav>}
    <section className="workspace-summary-grid"><article><span>Account value</span><strong>$48,294.82</strong><small className="positive-text">+2.84% <i>today</i></small></article><article><span>{page.section === 'Markets' ? 'S&P 500' : 'Active items'}</span><strong>{page.section === 'Markets' ? '5,842.47' : `${rows.length.toString().padStart(2, '0')}`}</strong><small className="positive-text">{page.section === 'Markets' ? '+0.68% today' : 'Updated just now'}</small></article><article><span>{page.section === 'Predictions' ? 'Avg. confidence' : 'Buying power'}</span><strong>{page.section === 'Predictions' ? '76%' : '$12,840.00'}</strong><small>Paper account</small></article><article><span>Last synced</span><strong>10:42 AM</strong><small>All systems operational</small></article></section>
    {notice && <div className="workspace-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss">×</button></div>}
    <section className="surface workspace-table-panel"><div className="workspace-table-heading"><div><h2>{page.section === 'Markets' ? 'Market watch' : page.section === 'Trading' ? 'Recent activity' : page.section === 'Portfolio' ? 'Your holdings' : page.section === 'Algorithms' ? 'Strategy library' : page.section === 'Predictions' ? 'Latest forecasts' : page.section === 'Alerts' ? 'Active alerts' : page.section === 'Administration' ? 'System status' : 'Recent activity'}</h2><p>{visibleRows.length} records <span>·</span> refreshed moments ago</p></div><button className="button button-secondary" onClick={exportRows}><ArrowDownToLine size={14} /> Export</button></div><div className="workspace-table-toolbar"><label className="workspace-search"><Search size={15} /><input aria-label="Filter records" placeholder={`Search ${page.section.toLowerCase()}...`} value={query} onChange={(event) => setQuery(event.target.value)} /></label><div className="workspace-filter-wrap"><button className="button button-secondary" aria-expanded={filterOpen} onClick={() => setFilterOpen((open) => !open)}><SlidersHorizontal size={14} /> Filters <ChevronDown size={13} /></button>{filterOpen && <div className="workspace-filter-menu"><span>SHOW RECORDS</span><button className={filterMode === 'all' ? 'selected' : ''} onClick={() => { setFilterMode('all'); setFilterOpen(false) }}>All records</button><button className={filterMode === 'positive' ? 'selected' : ''} onClick={() => { setFilterMode('positive'); setFilterOpen(false) }}>Active / positive</button><button className={filterMode === 'attention' ? 'selected' : ''} onClick={() => { setFilterMode('attention'); setFilterOpen(false) }}>Needs attention</button></div>}</div></div><div className="table-scroll"><table className="data-table workspace-data-table"><thead><tr>{columns.map((column) => <th key={column}>{column.toUpperCase()}</th>)}<th /></tr></thead><tbody>{visibleRows.map((row, index) => <tr key={`${row[columns[0]]}-${index}`}>{columns.map((column, columnIndex) => <td key={column}>{columnIndex === 0 ? <strong className="workspace-primary-cell">{row[column]}</strong> : <span className={/change|return|direction|confidence|status|signal/i.test(column) ? /negative|bearish|degraded|watch/i.test(row[column]) ? 'negative-text' : /positive|bullish|buy|active|running|filled|ready|operational/i.test(row[column]) ? 'positive-text' : '' : ''}>{row[column]}</span>}</td>)}<td><button className="row-open-button" title="Open details" aria-label={`Open ${row[columns[0]]}`} onClick={() => setNotice(`${row[columns[0]]} selected.`)}><ArrowRight size={15} /></button></td></tr>)}</tbody></table>{visibleRows.length === 0 && <div className="workspace-empty">No matching records. Try another search.</div>}</div></section>
    <div className="workspace-footnote">Market data is simulated for this frontend preview. Connect your API to display live account and exchange data.</div>
  </div>
}