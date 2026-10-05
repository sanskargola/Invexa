import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowDown, ArrowUp, ChevronDown, Clock3, Plus, RefreshCw } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import TradingChart from '../../components/charts/TradingChart'
import { marketApi, type MarketQuote } from '../../services/marketApi'

type Order = {
	id: string
	ticker: string
	side: 'Buy' | 'Sell'
	quantity: number
	type: string
	status: string
}

function money(value: number, currency = 'USD') {
	const prefix = currency === 'INR' ? '₹' : '$'
	return `${prefix}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function TradingTerminal() {
	const [searchParams] = useSearchParams()
	const requestedSymbol = (searchParams.get('symbol') ?? 'NVDA').toUpperCase()
	const [quotes, setQuotes] = useState<MarketQuote[]>([])
	const [symbol, setSymbol] = useState(requestedSymbol)
	const [side, setSide] = useState<'Buy' | 'Sell'>('Buy')
	const [orderType, setOrderType] = useState('Market')
	const [quantity, setQuantity] = useState('10')
	const [limitPrice, setLimitPrice] = useState('')
	const [orders, setOrders] = useState<Order[]>([])
	const [notice, setNotice] = useState('')
	const [activeTab, setActiveTab] = useState<'orders' | 'positions' | 'history'>('orders')
	const [watchlistUpdated, setWatchlistUpdated] = useState('Just now')

	async function loadQuotes() {
		const items = await marketApi.getQuotes()
		setQuotes(items)
		setWatchlistUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
	}

	useEffect(() => {
		void loadQuotes().catch(() => setNotice('Live quotes are unavailable. Chart data may still load.'))
		const timer = window.setInterval(() => {
			void loadQuotes().catch(() => undefined)
		}, 20000)
		return () => window.clearInterval(timer)
	}, [])

	useEffect(() => {
		setSymbol(requestedSymbol)
	}, [requestedSymbol])

	const selected = quotes.find((item) => item.symbol === symbol) ?? quotes[0]
	const price = selected?.price ?? 0
	const currency = selected?.currency ?? 'USD'

	useEffect(() => {
		if (price && !limitPrice) setLimitPrice(price.toFixed(2))
	}, [price, limitPrice])

	const estimatedValue = useMemo(
		() => Number(quantity || 0) * (orderType === 'Limit' ? Number(limitPrice || 0) : price),
		[quantity, orderType, limitPrice, price],
	)
	const visibleOrders = activeTab === 'orders' ? orders.filter((order) => order.status === 'Open') : orders
	const asks = [0.17, 0.13, 0.09, 0.05, 0.02].map((offset, index) => ({
		price: (price + offset).toFixed(2),
		size: String(80 + index * 28),
		total: (4100 + index * 140).toLocaleString(),
	}))
	const bids = [0.01, 0.05, 0.09, 0.13, 0.18].map((offset, index) => ({
		price: Math.max(0, price - offset).toFixed(2),
		size: String(90 + index * 31),
		total: (3900 - index * 120).toLocaleString(),
	}))

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
					<p className="page-subtitle">TradingView charts with live Yahoo Finance quotes and a paper order ticket.</p>
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
							<button className="icon-button" title="Refresh watchlist" aria-label="Refresh watchlist" onClick={() => { void loadQuotes() }}><RefreshCw size={14} /></button>
						</div>
						<div className="watchlist-symbols">
							{(quotes.length ? quotes.slice(0, 8) : [{ symbol, price: 0, percent_change: 0, name: '', exchange: '', change: 0, volume: 0, currency: 'USD' }]).map((item) => (
								<button key={item.symbol} className={`watchlist-item${symbol === item.symbol ? ' selected' : ''}`} onClick={() => setSymbol(item.symbol)}>
									<span><strong>{item.symbol}</strong><small>{item.price ? item.price.toFixed(2) : '—'}</small></span>
									<small className={item.percent_change >= 0 ? 'positive-text' : 'negative-text'}>{item.percent_change >= 0 ? '+' : ''}{item.percent_change.toFixed(2)}%</small>
								</button>
							))}
						</div>
					</div>
					<TradingChart symbol={symbol} />
					<section className="surface terminal-activity">
						<div className="activity-tabs">
							<button className={activeTab === 'orders' ? 'selected' : ''} onClick={() => setActiveTab('orders')}>Open orders <span>{orders.filter((order) => order.status === 'Open').length}</span></button>
							<button className={activeTab === 'positions' ? 'selected' : ''} onClick={() => setActiveTab('positions')}>Positions <span>{quotes.slice(0, 3).length}</span></button>
							<button className={activeTab === 'history' ? 'selected activity-history' : 'activity-history'} onClick={() => setActiveTab('history')}><Clock3 size={13} /> History</button>
						</div>
						{activeTab === 'positions' ? (
							<div className="position-summary">
								{quotes.slice(0, 3).map((item) => (
									<div className="position-pair" key={item.symbol}>
										<span><i className="position-dot" />{item.symbol} <small>{item.name}</small></span>
										<strong>{money(item.price, item.currency)} <small className={item.percent_change >= 0 ? 'positive-text' : 'negative-text'}>{item.percent_change >= 0 ? '+' : ''}{item.percent_change.toFixed(2)}%</small></strong>
									</div>
								))}
							</div>
						) : (
							<div className="table-scroll">
								<table className="data-table terminal-table">
									<thead><tr><th>ORDER</th><th>SYMBOL</th><th>SIDE</th><th>QTY</th><th>TYPE</th><th>STATUS</th></tr></thead>
									<tbody>
										{visibleOrders.length ? visibleOrders.map((order) => (
											<tr key={order.id}><td>{order.id}</td><td><strong>{order.ticker}</strong></td><td className={order.side === 'Buy' ? 'positive-text' : 'negative-text'}>{order.side}</td><td>{order.quantity}</td><td>{order.type}</td><td><span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span></td></tr>
										)) : <tr><td colSpan={6} className="empty-table-cell">{activeTab === 'orders' ? 'No open orders. Submit a limit order to see it here.' : 'No trades yet. Submitted orders will appear here.'}</td></tr>}
									</tbody>
								</table>
							</div>
						)}
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
						<div className="select-wrap">
							<select id="order-symbol" value={symbol} onChange={(event) => setSymbol(event.target.value)}>
								{(quotes.length ? quotes : [{ symbol, price: 0, name: symbol, exchange: '', change: 0, percent_change: 0, volume: 0, currency: 'USD' }]).map((item) => (
									<option key={item.symbol} value={item.symbol}>{item.symbol} · {item.price ? item.price.toFixed(2) : '—'}</option>
								))}
							</select>
							<ChevronDown size={14} />
						</div>
						<label className="field-label" htmlFor="order-type">Order type</label>
						<div className="select-wrap"><select id="order-type" value={orderType} onChange={(event) => setOrderType(event.target.value)}><option>Market</option><option>Limit</option></select><ChevronDown size={14} /></div>
						<label className="field-label" htmlFor="order-quantity">Quantity <span>Shares</span></label>
						<input id="order-quantity" className="order-input" type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
						{orderType === 'Limit' && <><label className="field-label" htmlFor="limit-price">Limit price</label><input id="limit-price" className="order-input" type="number" min="0.01" step="0.01" value={limitPrice} onChange={(event) => setLimitPrice(event.target.value)} /></>}
						<div className="order-estimate"><span>Market price</span><strong>{money(price, currency)}</strong><span>Estimated total</span><strong>{money(estimatedValue, currency)}</strong></div>
						<button className={`submit-order${side === 'Sell' ? ' submit-sell' : ''}`} type="submit">{side} {symbol}</button>
						<p className="ticket-disclaimer">Paper trading · No real funds used</p>
						{notice && <p className={`order-notice${notice.startsWith('Enter') || notice.startsWith('Live') ? ' error' : ''}`} role="status">{notice}</p>}
					</form>

					<section className="order-book">
						<div className="book-heading"><h2>Order book</h2><span>{selected?.exchange ?? 'EXCH'} <i /></span></div>
						<div className="book-columns"><span>PRICE</span><span>SIZE</span><span>TOTAL</span></div>
						<div className="book-levels ask-levels">{asks.map((row) => <div key={row.price}><i style={{ width: `${Math.min(96, Number(row.total.replace(',', '')) / 50)}%` }} /><strong>{row.price}</strong><span>{row.size}</span><span>{row.total}</span></div>)}</div>
						<div className="book-spread"><strong>{money(price, currency)}</strong><span>Indicative book</span></div>
						<div className="book-levels bid-levels">{bids.map((row) => <div key={row.price}><i style={{ width: `${Math.min(96, Number(row.total.replace(',', '')) / 50)}%` }} /><strong>{row.price}</strong><span>{row.size}</span><span>{row.total}</span></div>)}</div>
					</section>
				</aside>
			</div>
		</div>
	)
}
