import { useMemo, useState, type FormEvent } from 'react'
import { ArrowDown, ArrowUp, ChevronDown, Clock3, Plus, RefreshCw } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import TradingChart from '../../components/charts/TradingChart'

const symbols = [
	{ ticker: 'NVDA', price: 142.87, change: '+3.42%', positive: true },
	{ ticker: 'AAPL', price: 232.61, change: '+1.18%', positive: true },
	{ ticker: 'TSLA', price: 352.56, change: '-2.71%', positive: false },
	{ ticker: 'MSFT', price: 428.76, change: '+0.64%', positive: true },
]

const asks = [
	{ price: '143.04', size: '124', total: '4,623' },
	{ price: '143.01', size: '86', total: '4,499' },
	{ price: '142.98', size: '210', total: '4,413' },
	{ price: '142.94', size: '158', total: '4,203' },
	{ price: '142.91', size: '94', total: '4,045' },
]

const bids = [
	{ price: '142.87', size: '142', total: '3,951' },
	{ price: '142.83', size: '98', total: '3,809' },
	{ price: '142.79', size: '174', total: '3,711' },
	{ price: '142.75', size: '203', total: '3,537' },
	{ price: '142.71', size: '117', total: '3,334' },
]

type Order = {
	id: string
	ticker: string
	side: 'Buy' | 'Sell'
	quantity: number
	type: string
	status: string
}

export default function TradingTerminal() {
	const [searchParams] = useSearchParams()
	const requestedSymbol = searchParams.get('symbol')
	const initialSymbol = symbols.some((item) => item.ticker === requestedSymbol) ? requestedSymbol! : 'NVDA'
	const [symbol, setSymbol] = useState(initialSymbol)
	const [side, setSide] = useState<'Buy' | 'Sell'>('Buy')
	const [orderType, setOrderType] = useState('Market')
	const [quantity, setQuantity] = useState('10')
	const [limitPrice, setLimitPrice] = useState('142.87')
	const [orders, setOrders] = useState<Order[]>([])
	const [notice, setNotice] = useState('')
	const [activeTab, setActiveTab] = useState<'orders' | 'positions' | 'history'>('orders')
	const [watchlistUpdated, setWatchlistUpdated] = useState('Just now')
	const selected = symbols.find((item) => item.ticker === symbol) ?? symbols[0]
	const estimatedValue = useMemo(
		() => Number(quantity || 0) * (orderType === 'Limit' ? Number(limitPrice || 0) : selected.price),
		[quantity, orderType, limitPrice, selected.price],
	)
	const visibleOrders = activeTab === 'orders' ? orders.filter((order) => order.status === 'Open') : orders

	function submitOrder(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		if (!Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
			setNotice('Enter a quantity greater than zero.')
			return
		}
		if (orderType === 'Limit' && (!Number.isFinite(Number(limitPrice)) || Number(limitPrice) <= 0)) {
			setNotice('Enter a valid limit price.')
			return
		}
		const nextOrder: Order = {
			id: `ORD-${Date.now().toString().slice(-6)}`,
			ticker: symbol,
			side,
			quantity: Number(quantity),
			type: orderType,
			status: orderType === 'Market' ? 'Filled' : 'Open',
		}
		setOrders((current) => [nextOrder, ...current])
		setActiveTab(orderType === 'Market' ? 'history' : 'orders')
		setNotice(`${side} order for ${quantity} ${symbol} ${orderType === 'Market' ? 'filled' : 'placed'}.`)
	}

	return (
		<div className="terminal-page">
			<div className="page-heading terminal-heading">
				<div>
					<p className="eyebrow">EXECUTION <span className="eyebrow-dot">·</span> PAPER ACCOUNT</p>
					<h1>Trading terminal</h1>
					<p className="page-subtitle">A focused workspace for your next move.</p>
				</div>
				<div className="terminal-heading-actions">
					<span className="account-equity">Buying power <strong>$12,840.00</strong></span>
					<Link className="button button-primary" to="/settings/brokers"><Plus size={15} /> Connect broker</Link>
				</div>
			</div>

			<div className="terminal-layout">
				<div className="terminal-main-column">
					<div className="watchlist-strip">
						<div className="watchlist-title">
							<span>WATCHLIST <small>Updated {watchlistUpdated}</small></span>
							<button className="icon-button" title="Refresh watchlist" aria-label="Refresh watchlist" onClick={() => setWatchlistUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}><RefreshCw size={14} /></button>
						</div>
						<div className="watchlist-symbols">
							{symbols.map((item) => <button key={item.ticker} className={`watchlist-item${symbol === item.ticker ? ' selected' : ''}`} onClick={() => setSymbol(item.ticker)}><span><strong>{item.ticker}</strong><small>{item.price.toFixed(2)}</small></span><small className={item.positive ? 'positive-text' : 'negative-text'}>{item.change}</small></button>)}
						</div>
					</div>
					<TradingChart symbol={symbol} />
					<section className="surface terminal-activity">
						<div className="activity-tabs">
							<button className={activeTab === 'orders' ? 'selected' : ''} onClick={() => setActiveTab('orders')}>Open orders <span>{orders.filter((order) => order.status === 'Open').length}</span></button>
							<button className={activeTab === 'positions' ? 'selected' : ''} onClick={() => setActiveTab('positions')}>Positions <span>3</span></button>
							<button className={activeTab === 'history' ? 'selected activity-history' : 'activity-history'} onClick={() => setActiveTab('history')}><Clock3 size={13} /> History</button>
						</div>
						{activeTab === 'positions' ? <div className="position-summary"><span><i className="position-dot" />NVDA <small>42 shares</small></span><strong>$6,000.54 <small className="positive-text">+8.42%</small></strong><span><i className="position-dot blue-dot" />AAPL <small>18 shares</small></span><strong>$4,186.98 <small className="positive-text">+2.11%</small></strong><span><i className="position-dot orange-dot" />MSFT <small>9 shares</small></span><strong>$3,858.84 <small className="negative-text">-0.84%</small></strong></div> : <div className="table-scroll"><table className="data-table terminal-table"><thead><tr><th>ORDER</th><th>SYMBOL</th><th>SIDE</th><th>QTY</th><th>TYPE</th><th>STATUS</th></tr></thead><tbody>{visibleOrders.length ? visibleOrders.map((order) => <tr key={order.id}><td>{order.id}</td><td><strong>{order.ticker}</strong></td><td className={order.side === 'Buy' ? 'positive-text' : 'negative-text'}>{order.side}</td><td>{order.quantity}</td><td>{order.type}</td><td><span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span></td></tr>) : <tr><td colSpan={6} className="empty-table-cell">{activeTab === 'orders' ? 'No open orders. Submit a limit order to see it here.' : 'No trades yet. Submitted orders will appear here.'}</td></tr>}</tbody></table></div>}
					</section>
				</div>

				<aside className="terminal-side-column">
					<form className="order-ticket" onSubmit={submitOrder}>
						<div className="ticket-heading">
							<div><h2>Place order</h2><p>Paper trading account</p></div>
							<button type="button" className="icon-button" aria-label="Toggle market or limit order" title="Toggle market or limit order" onClick={() => setOrderType((current) => current === 'Market' ? 'Limit' : 'Market')}><ChevronDown size={16} /></button>
						</div>
						<div className="side-toggle"><button type="button" className={side === 'Buy' ? 'buy-selected' : ''} onClick={() => setSide('Buy')}><ArrowUp size={14} /> Buy</button><button type="button" className={side === 'Sell' ? 'sell-selected' : ''} onClick={() => setSide('Sell')}><ArrowDown size={14} /> Sell</button></div>
						<label className="field-label" htmlFor="order-symbol">Symbol</label>
						<div className="select-wrap"><select id="order-symbol" value={symbol} onChange={(event) => setSymbol(event.target.value)}>{symbols.map((item) => <option key={item.ticker} value={item.ticker}>{item.ticker} · {item.price.toFixed(2)}</option>)}</select><ChevronDown size={14} /></div>
						<label className="field-label" htmlFor="order-type">Order type</label>
						<div className="select-wrap"><select id="order-type" value={orderType} onChange={(event) => setOrderType(event.target.value)}><option>Market</option><option>Limit</option></select><ChevronDown size={14} /></div>
						<label className="field-label" htmlFor="order-quantity">Quantity <span>Shares</span></label>
						<input id="order-quantity" className="order-input" type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
						{orderType === 'Limit' && <><label className="field-label" htmlFor="limit-price">Limit price <span>USD</span></label><input id="limit-price" className="order-input" type="number" min="0.01" step="0.01" value={limitPrice} onChange={(event) => setLimitPrice(event.target.value)} /></>}
						<div className="order-estimate"><span>Market price</span><strong>${selected.price.toFixed(2)}</strong><span>Estimated total</span><strong>${estimatedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
						<button className={`submit-order${side === 'Sell' ? ' submit-sell' : ''}`} type="submit">{side} {symbol}</button>
						<p className="ticket-disclaimer">Paper trading · No real funds used</p>
						{notice && <p className={`order-notice${notice.startsWith('Enter') ? ' error' : ''}`} role="status">{notice}</p>}
					</form>

					<section className="order-book">
						<div className="book-heading"><h2>Order book</h2><span>NASDAQ <i /></span></div>
						<div className="book-columns"><span>PRICE (USD)</span><span>SIZE</span><span>TOTAL</span></div>
						<div className="book-levels ask-levels">{asks.map((row) => <div key={row.price}><i style={{ width: `${Math.min(96, Number(row.total.replace(',', '')) / 50)}%` }} /><strong>{row.price}</strong><span>{row.size}</span><span>{row.total}</span></div>)}</div>
						<div className="book-spread"><strong>${selected.price.toFixed(2)}</strong><span>Spread 0.04 <i /> 0.03%</span></div>
						<div className="book-levels bid-levels">{bids.map((row) => <div key={row.price}><i style={{ width: `${Math.min(96, Number(row.total.replace(',', '')) / 50)}%` }} /><strong>{row.price}</strong><span>{row.size}</span><span>{row.total}</span></div>)}</div>
					</section>
				</aside>
			</div>
		</div>
	)
}