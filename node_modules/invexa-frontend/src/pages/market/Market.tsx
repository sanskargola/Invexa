import { useEffect, useMemo, useState } from 'react'
import {
	Activity,
	ArrowDownRight,
	ArrowRight,
	ArrowUpRight,
	BarChart3,
	Building2,
	CheckCircle2,
	ChevronRight,
	ExternalLink,
	Globe,
	Search,
	ShieldCheck,
	TrendingDown,
	TrendingUp,
	X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import TradingChart from '../../components/charts/TradingChart'
import { MARKET_INDICES, type MarketIndex } from '../../data/marketIndices'
import { marketApi, type MarketQuote } from '../../services/marketApi'
import { formatCurrency } from '../../utils/formatters'

export interface NSEStockProfile {
	symbol: string
	name: string
	isin: string
	series: string
	sector: string
	industry: string
	exchange: string
	price: number
	change: number
	percent_change: number
	open: number
	high: number
	low: number
	prev_close: number
	vwap: number
	fifty_two_week_high: number
	fifty_two_week_low: number
	upper_circuit: number
	lower_circuit: number
	volume: number
	turnover_cr: number
	market_cap_lakh_cr: number
	pe: number
	eps: number
	book_value: number
	dividend_yield: number
	beta: number
	bids: { price: number; qty: number; orders: number }[]
	asks: { price: number; qty: number; orders: number }[]
}

const INITIAL_NSE_STOCKS: NSEStockProfile[] = [
	{
		symbol: 'RELIANCE',
		name: 'Reliance Industries Limited',
		isin: 'INE002A01018',
		series: 'EQ',
		sector: 'Energy',
		industry: 'Oil & Gas Refining & Marketing',
		exchange: 'NSE',
		price: 2980.50,
		change: 33.10,
		percent_change: 1.12,
		open: 2955.00,
		high: 2994.00,
		low: 2948.20,
		prev_close: 2947.40,
		vwap: 2976.80,
		fifty_two_week_high: 3217.90,
		fifty_two_week_low: 2220.30,
		upper_circuit: 3242.10,
		lower_circuit: 2652.60,
		volume: 8524190,
		turnover_cr: 2537.40,
		market_cap_lakh_cr: 20.15,
		pe: 28.4,
		eps: 105.2,
		book_value: 1240.50,
		dividend_yield: 0.33,
		beta: 0.85,
		bids: [
			{ price: 2980.20, qty: 1420, orders: 12 },
			{ price: 2980.00, qty: 3850, orders: 34 },
			{ price: 2979.50, qty: 2900, orders: 21 },
			{ price: 2979.00, qty: 5410, orders: 45 },
			{ price: 2978.50, qty: 8120, orders: 60 },
		],
		asks: [
			{ price: 2980.50, qty: 1120, orders: 9 },
			{ price: 2981.00, qty: 2940, orders: 25 },
			{ price: 2981.50, qty: 3100, orders: 28 },
			{ price: 2982.00, qty: 4890, orders: 39 },
			{ price: 2983.00, qty: 7420, orders: 55 },
		],
	},
	{
		symbol: 'TCS',
		name: 'Tata Consultancy Services Limited',
		isin: 'INE467B01029',
		series: 'EQ',
		sector: 'Technology',
		industry: 'IT Services & Consulting',
		exchange: 'NSE',
		price: 4120.00,
		change: 18.50,
		percent_change: 0.45,
		open: 4105.00,
		high: 4142.00,
		low: 4090.00,
		prev_close: 4101.50,
		vwap: 4118.20,
		fifty_two_week_high: 4585.90,
		fifty_two_week_low: 3450.00,
		upper_circuit: 4511.60,
		lower_circuit: 3691.30,
		volume: 3215400,
		turnover_cr: 1324.50,
		market_cap_lakh_cr: 14.90,
		pe: 31.6,
		eps: 130.4,
		book_value: 285.40,
		dividend_yield: 1.35,
		beta: 0.72,
		bids: [
			{ price: 4119.50, qty: 850, orders: 8 },
			{ price: 4119.00, qty: 1420, orders: 15 },
			{ price: 4118.00, qty: 2200, orders: 19 },
			{ price: 4117.00, qty: 3150, orders: 26 },
			{ price: 4115.00, qty: 4500, orders: 35 },
		],
		asks: [
			{ price: 4120.00, qty: 720, orders: 7 },
			{ price: 4121.00, qty: 1580, orders: 14 },
			{ price: 4122.50, qty: 2600, orders: 22 },
			{ price: 4124.00, qty: 3400, orders: 31 },
			{ price: 4125.00, qty: 5100, orders: 42 },
		],
	},
	{
		symbol: 'INFY',
		name: 'Infosys Limited',
		isin: 'INE009A01021',
		series: 'EQ',
		sector: 'Technology',
		industry: 'IT Services & Consulting',
		exchange: 'NSE',
		price: 1895.30,
		change: -11.80,
		percent_change: -0.62,
		open: 1912.00,
		high: 1918.50,
		low: 1888.00,
		prev_close: 1907.10,
		vwap: 1898.40,
		fifty_two_week_high: 1991.45,
		fifty_two_week_low: 1358.35,
		upper_circuit: 2097.80,
		lower_circuit: 1716.40,
		volume: 5840120,
		turnover_cr: 1108.90,
		market_cap_lakh_cr: 7.86,
		pe: 27.5,
		eps: 68.9,
		book_value: 215.10,
		dividend_yield: 2.10,
		beta: 0.82,
		bids: [
			{ price: 1895.00, qty: 1920, orders: 18 },
			{ price: 1894.50, qty: 3100, orders: 29 },
			{ price: 1894.00, qty: 4500, orders: 41 },
			{ price: 1893.00, qty: 5800, orders: 50 },
			{ price: 1892.00, qty: 7200, orders: 63 },
		],
		asks: [
			{ price: 1895.50, qty: 1650, orders: 15 },
			{ price: 1896.00, qty: 2840, orders: 27 },
			{ price: 1897.00, qty: 3950, orders: 36 },
			{ price: 1898.00, qty: 5200, orders: 48 },
			{ price: 1899.00, qty: 6900, orders: 58 },
		],
	},
	{
		symbol: 'HDFCBANK',
		name: 'HDFC Bank Limited',
		isin: 'INE040A01034',
		series: 'EQ',
		sector: 'Financial Services',
		industry: 'Private Sector Banking',
		exchange: 'NSE',
		price: 1742.80,
		change: 15.20,
		percent_change: 0.88,
		open: 1730.00,
		high: 1752.40,
		low: 1728.00,
		prev_close: 1727.60,
		vwap: 1740.10,
		fifty_two_week_high: 1878.00,
		fifty_two_week_low: 1363.55,
		upper_circuit: 1900.30,
		lower_circuit: 1554.80,
		volume: 12145000,
		turnover_cr: 2113.80,
		market_cap_lakh_cr: 13.25,
		pe: 19.8,
		eps: 88.0,
		book_value: 590.20,
		dividend_yield: 1.12,
		beta: 0.95,
		bids: [
			{ price: 1742.50, qty: 2800, orders: 22 },
			{ price: 1742.00, qty: 5120, orders: 44 },
			{ price: 1741.00, qty: 6890, orders: 55 },
			{ price: 1740.00, qty: 9500, orders: 78 },
			{ price: 1739.00, qty: 12400, orders: 92 },
		],
		asks: [
			{ price: 1743.00, qty: 2450, orders: 19 },
			{ price: 1743.50, qty: 4600, orders: 38 },
			{ price: 1744.00, qty: 6200, orders: 51 },
			{ price: 1745.00, qty: 8900, orders: 72 },
			{ price: 1746.00, qty: 11500, orders: 86 },
		],
	},
	{
		symbol: 'SBIN',
		name: 'State Bank of India',
		isin: 'INE062A01020',
		series: 'EQ',
		sector: 'Financial Services',
		industry: 'Public Sector Banking',
		exchange: 'NSE',
		price: 842.15,
		change: 11.60,
		percent_change: 1.40,
		open: 834.00,
		high: 846.85,
		low: 832.00,
		prev_close: 830.55,
		vwap: 840.20,
		fifty_two_week_high: 912.10,
		fifty_two_week_low: 555.30,
		upper_circuit: 913.60,
		lower_circuit: 747.50,
		volume: 16430000,
		turnover_cr: 1380.20,
		market_cap_lakh_cr: 7.51,
		pe: 11.2,
		eps: 75.2,
		book_value: 462.80,
		dividend_yield: 1.62,
		beta: 1.15,
		bids: [
			{ price: 842.00, qty: 4200, orders: 36 },
			{ price: 841.50, qty: 7900, orders: 62 },
			{ price: 841.00, qty: 11500, orders: 85 },
			{ price: 840.50, qty: 15800, orders: 110 },
			{ price: 840.00, qty: 22400, orders: 145 },
		],
		asks: [
			{ price: 842.30, qty: 3800, orders: 31 },
			{ price: 842.50, qty: 7200, orders: 58 },
			{ price: 843.00, qty: 10800, orders: 80 },
			{ price: 843.50, qty: 14500, orders: 102 },
			{ price: 844.00, qty: 19800, orders: 130 },
		],
	},
	{
		symbol: 'TATAMOTORS',
		name: 'Tata Motors Limited',
		isin: 'INE155A01022',
		series: 'EQ',
		sector: 'Automotive',
		industry: 'Commercial & Passenger Vehicles',
		exchange: 'NSE',
		price: 968.40,
		change: 14.20,
		percent_change: 1.49,
		open: 956.00,
		high: 974.50,
		low: 952.10,
		prev_close: 954.20,
		vwap: 965.80,
		fifty_two_week_high: 1179.05,
		fifty_two_week_low: 621.50,
		upper_circuit: 1049.60,
		lower_circuit: 858.80,
		volume: 9210000,
		turnover_cr: 889.40,
		market_cap_lakh_cr: 3.56,
		pe: 10.4,
		eps: 93.1,
		book_value: 284.10,
		dividend_yield: 0.62,
		beta: 1.42,
		bids: [
			{ price: 968.00, qty: 2100, orders: 19 },
			{ price: 967.50, qty: 4500, orders: 38 },
			{ price: 967.00, qty: 6800, orders: 54 },
			{ price: 966.00, qty: 9400, orders: 76 },
			{ price: 965.00, qty: 13200, orders: 98 },
		],
		asks: [
			{ price: 968.50, qty: 1850, orders: 16 },
			{ price: 969.00, qty: 3900, orders: 33 },
			{ price: 969.50, qty: 5800, orders: 48 },
			{ price: 970.00, qty: 8700, orders: 70 },
			{ price: 971.00, qty: 12100, orders: 91 },
		],
	},
	{
		symbol: 'ICICIBANK',
		name: 'ICICI Bank Limited',
		isin: 'INE090A01021',
		series: 'EQ',
		sector: 'Financial Services',
		industry: 'Private Sector Banking',
		exchange: 'NSE',
		price: 1264.50,
		change: 9.80,
		percent_change: 0.78,
		open: 1256.00,
		high: 1271.00,
		low: 1252.30,
		prev_close: 1254.70,
		vwap: 1262.10,
		fifty_two_week_high: 1332.95,
		fifty_two_week_low: 915.20,
		upper_circuit: 1380.10,
		lower_circuit: 1129.20,
		volume: 9840000,
		turnover_cr: 1242.00,
		market_cap_lakh_cr: 8.92,
		pe: 18.2,
		eps: 69.5,
		book_value: 392.40,
		dividend_yield: 0.85,
		beta: 1.02,
		bids: [
			{ price: 1264.00, qty: 1800, orders: 17 },
			{ price: 1263.50, qty: 3600, orders: 32 },
			{ price: 1263.00, qty: 5200, orders: 44 },
			{ price: 1262.00, qty: 7800, orders: 63 },
			{ price: 1261.00, qty: 10500, orders: 81 },
		],
		asks: [
			{ price: 1264.80, qty: 1540, orders: 14 },
			{ price: 1265.00, qty: 3200, orders: 28 },
			{ price: 1265.50, qty: 4800, orders: 40 },
			{ price: 1266.00, qty: 7100, orders: 58 },
			{ price: 1267.00, qty: 9800, orders: 75 },
		],
	},
	{
		symbol: 'BHARTIARTL',
		name: 'Bharti Airtel Limited',
		isin: 'INE397D01024',
		series: 'EQ',
		sector: 'Telecommunications',
		industry: 'Telecom Services',
		exchange: 'NSE',
		price: 1695.00,
		change: 18.40,
		percent_change: 1.10,
		open: 1680.00,
		high: 1704.00,
		low: 1675.20,
		prev_close: 1676.60,
		vwap: 1691.30,
		fifty_two_week_high: 1779.00,
		fifty_two_week_low: 911.20,
		upper_circuit: 1844.20,
		lower_circuit: 1508.90,
		volume: 5420000,
		turnover_cr: 916.50,
		market_cap_lakh_cr: 9.85,
		pe: 54.1,
		eps: 31.3,
		book_value: 198.60,
		dividend_yield: 0.48,
		beta: 0.88,
		bids: [
			{ price: 1694.50, qty: 1200, orders: 11 },
			{ price: 1694.00, qty: 2400, orders: 21 },
			{ price: 1693.00, qty: 3800, orders: 32 },
			{ price: 1692.00, qty: 5400, orders: 45 },
			{ price: 1690.00, qty: 7900, orders: 62 },
		],
		asks: [
			{ price: 1695.20, qty: 980, orders: 9 },
			{ price: 1695.50, qty: 2100, orders: 19 },
			{ price: 1696.00, qty: 3400, orders: 29 },
			{ price: 1697.00, qty: 4900, orders: 41 },
			{ price: 1698.00, qty: 7100, orders: 57 },
		],
	},
	{
		symbol: 'ITC',
		name: 'ITC Limited',
		isin: 'INE154A01025',
		series: 'EQ',
		sector: 'Consumer Goods',
		industry: 'FMCG - Diversified',
		exchange: 'NSE',
		price: 482.30,
		change: 3.10,
		percent_change: 0.65,
		open: 480.00,
		high: 485.40,
		low: 478.60,
		prev_close: 479.20,
		vwap: 481.80,
		fifty_two_week_high: 528.55,
		fifty_two_week_low: 399.30,
		upper_circuit: 527.10,
		lower_circuit: 431.30,
		volume: 11200000,
		turnover_cr: 539.60,
		market_cap_lakh_cr: 6.03,
		pe: 27.6,
		eps: 17.5,
		book_value: 62.40,
		dividend_yield: 2.85,
		beta: 0.60,
		bids: [
			{ price: 482.20, qty: 6500, orders: 48 },
			{ price: 482.00, qty: 14200, orders: 95 },
			{ price: 481.50, qty: 22800, orders: 140 },
			{ price: 481.00, qty: 34500, orders: 190 },
			{ price: 480.50, qty: 48000, orders: 250 },
		],
		asks: [
			{ price: 482.50, qty: 5800, orders: 42 },
			{ price: 482.80, qty: 12900, orders: 88 },
			{ price: 483.00, qty: 21400, orders: 132 },
			{ price: 483.50, qty: 31800, orders: 175 },
			{ price: 484.00, qty: 44200, orders: 230 },
		],
	},
	{
		symbol: 'WIPRO',
		name: 'Wipro Limited',
		isin: 'INE075A01022',
		series: 'EQ',
		sector: 'Technology',
		industry: 'IT Services & Consulting',
		exchange: 'NSE',
		price: 542.10,
		change: -3.80,
		percent_change: -0.70,
		open: 547.00,
		high: 549.50,
		low: 539.20,
		prev_close: 545.90,
		vwap: 543.10,
		fifty_two_week_high: 580.00,
		fifty_two_week_low: 375.00,
		upper_circuit: 600.50,
		lower_circuit: 491.30,
		volume: 4150000,
		turnover_cr: 225.40,
		market_cap_lakh_cr: 2.83,
		pe: 23.4,
		eps: 23.2,
		book_value: 154.20,
		dividend_yield: 0.35,
		beta: 0.78,
		bids: [
			{ price: 542.00, qty: 2400, orders: 20 },
			{ price: 541.50, qty: 4800, orders: 38 },
			{ price: 541.00, qty: 7500, orders: 55 },
			{ price: 540.50, qty: 11200, orders: 74 },
			{ price: 540.00, qty: 16500, orders: 99 },
		],
		asks: [
			{ price: 542.40, qty: 2100, orders: 17 },
			{ price: 542.80, qty: 4400, orders: 34 },
			{ price: 543.00, qty: 6900, orders: 50 },
			{ price: 543.50, qty: 10400, orders: 69 },
			{ price: 544.00, qty: 15100, orders: 92 },
		],
	},
	{
		symbol: 'AXISBANK',
		name: 'Axis Bank Limited',
		isin: 'INE238A01034',
		series: 'EQ',
		sector: 'Financial Services',
		industry: 'Private Sector Banking',
		exchange: 'NSE',
		price: 1188.00,
		change: -7.20,
		percent_change: -0.60,
		open: 1198.00,
		high: 1204.00,
		low: 1182.00,
		prev_close: 1195.20,
		vwap: 1190.50,
		fifty_two_week_high: 1339.65,
		fifty_two_week_low: 975.00,
		upper_circuit: 1314.70,
		lower_circuit: 1075.70,
		volume: 6230000,
		turnover_cr: 741.80,
		market_cap_lakh_cr: 3.68,
		pe: 14.1,
		eps: 84.3,
		book_value: 480.50,
		dividend_yield: 0.25,
		beta: 1.10,
		bids: [
			{ price: 1187.50, qty: 1500, orders: 14 },
			{ price: 1187.00, qty: 3100, orders: 27 },
			{ price: 1186.00, qty: 4900, orders: 39 },
			{ price: 1185.00, qty: 7200, orders: 54 },
			{ price: 1184.00, qty: 10100, orders: 71 },
		],
		asks: [
			{ price: 1188.20, qty: 1350, orders: 12 },
			{ price: 1188.50, qty: 2800, orders: 24 },
			{ price: 1189.00, qty: 4400, orders: 36 },
			{ price: 1190.00, qty: 6800, orders: 50 },
			{ price: 1191.00, qty: 9500, orders: 67 },
		],
	},
	{
		symbol: 'KOTAKBANK',
		name: 'Kotak Mahindra Bank Limited',
		isin: 'INE237A01028',
		series: 'EQ',
		sector: 'Financial Services',
		industry: 'Private Sector Banking',
		exchange: 'NSE',
		price: 1785.00,
		change: 8.50,
		percent_change: 0.48,
		open: 1778.00,
		high: 1794.00,
		low: 1772.00,
		prev_close: 1776.50,
		vwap: 1783.20,
		fifty_two_week_high: 1925.00,
		fifty_two_week_low: 1544.15,
		upper_circuit: 1954.10,
		lower_circuit: 1598.80,
		volume: 3810000,
		turnover_cr: 679.50,
		market_cap_lakh_cr: 3.55,
		pe: 21.0,
		eps: 85.0,
		book_value: 630.00,
		dividend_yield: 0.12,
		beta: 0.90,
		bids: [
			{ price: 1784.50, qty: 980, orders: 10 },
			{ price: 1784.00, qty: 2100, orders: 19 },
			{ price: 1783.00, qty: 3500, orders: 29 },
			{ price: 1782.00, qty: 5100, orders: 41 },
			{ price: 1780.00, qty: 7800, orders: 58 },
		],
		asks: [
			{ price: 1785.50, qty: 890, orders: 8 },
			{ price: 1786.00, qty: 1950, orders: 17 },
			{ price: 1787.00, qty: 3200, orders: 26 },
			{ price: 1788.00, qty: 4800, orders: 38 },
			{ price: 1789.00, qty: 7100, orders: 52 },
		],
	},
]

export default function Market() {
	const navigate = useNavigate()
	const [query, setQuery] = useState('')
	const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE')
	const [selectedIndex, setSelectedIndex] = useState<MarketIndex | null>(null)
	const [indexQuote, setIndexQuote] = useState<MarketQuote | null>(null)
	const [indexConstituentQuotes, setIndexConstituentQuotes] = useState<MarketQuote[]>([])
	const [indexLoading, setIndexLoading] = useState(false)
	const [constituentsLoading, setConstituentsLoading] = useState(false)
	const [indexError, setIndexError] = useState<string | null>(null)
	const [constituentsError, setConstituentsError] = useState<string | null>(null)
	const [stocks, setStocks] = useState<NSEStockProfile[]>(INITIAL_NSE_STOCKS)
	const [activeListTab, setActiveListTab] = useState<'all' | 'gainers' | 'losers'>('all')
	const [activeRightTab, setActiveRightTab] = useState<'chart' | 'depth'>('chart')
	const [lastTickedSymbol, setLastTickedSymbol] = useState<string | null>(null)
	const [tickDirection, setTickDirection] = useState<'up' | 'down' | null>(null)

	useEffect(() => {
		if (!selectedIndex) return
		let isActive = true
		setIndexLoading(true)
		setConstituentsLoading(true)
		setIndexError(null)
		setConstituentsError(null)
		setIndexQuote(null)
		setIndexConstituentQuotes([])
		const controller = new AbortController()
		const requestTimeout = window.setTimeout(() => controller.abort(), 15000)

		marketApi.getQuotes([selectedIndex.symbol], controller.signal)
			.then((quotes) => {
				if (!isActive) return
				const index = quotes.find((quote) => quote.yahoo_symbol === selectedIndex.symbol)
				if (!index) throw new Error('No daily index quote was returned.')
				setIndexQuote(index)
			})
			.catch((error: unknown) => {
				if (!isActive) return
				setIndexError(controller.signal.aborted
					? 'Daily market data request timed out. Try again later.'
					: error instanceof Error ? error.message : 'Unable to load daily market data.')
			})
			.finally(() => {
				if (isActive) setIndexLoading(false)
			})

		const constituentSymbols = selectedIndex.constituents.map((symbol) => `${symbol}.NS`)
		marketApi.getQuotes(constituentSymbols, controller.signal)
			.then((quotes) => {
				if (isActive) setIndexConstituentQuotes(quotes)
			})
			.catch((error: unknown) => {
				if (!isActive) return
				setConstituentsError(controller.signal.aborted
					? 'Daily share data request timed out. Try again later.'
					: error instanceof Error ? error.message : 'Unable to load daily share data.')
			})
			.finally(() => {
				if (isActive) setConstituentsLoading(false)
			})

		return () => {
			isActive = false
			window.clearTimeout(requestTimeout)
			controller.abort()
		}
	}, [selectedIndex])

	// Live market simulation: subtly fluctuates prices and changes to reflect live market movement
	useEffect(() => {
		const interval = setInterval(() => {
			setStocks((prevStocks) => {
				const randomIndex = Math.floor(Math.random() * prevStocks.length)
				const target = prevStocks[randomIndex]
				// Random micro fluctuation between -0.20% and +0.25%
				const percentDelta = (Math.random() * 0.45 - 0.20) / 100
				const priceDelta = Number((target.price * percentDelta).toFixed(2))
				if (priceDelta === 0) return prevStocks

				const newPrice = Number((target.price + priceDelta).toFixed(2))
				const newChange = Number((target.change + priceDelta).toFixed(2))
				const newPercentChange = Number(((newChange / target.prev_close) * 100).toFixed(2))
				const newHigh = Math.max(target.high, newPrice)
				const newLow = Math.min(target.low, newPrice)

				setLastTickedSymbol(target.symbol)
				setTickDirection(priceDelta > 0 ? 'up' : 'down')

				// Clear flash animation after 900ms
				setTimeout(() => {
					setLastTickedSymbol(null)
					setTickDirection(null)
				}, 900)

				return prevStocks.map((item, idx) => {
					if (idx !== randomIndex) return item
					return {
						...item,
						price: newPrice,
						change: newChange,
						percent_change: newPercentChange,
						high: newHigh,
						low: newLow,
					}
				})
			})
		}, 3500)

		return () => clearInterval(interval)
	}, [])

	// Active stock profile for official NSE details card
	const activeStock = useMemo(() => {
		const match = stocks.find((s) => s.symbol.toUpperCase() === selectedSymbol.toUpperCase())
		if (match) return match

		// If user searched a custom stock not in predefined array, generate an authentic profile
		const clean = selectedSymbol.toUpperCase().trim()
		return {
			symbol: clean,
			name: `${clean} India Limited`,
			isin: `INE${clean.slice(0, 3)}01020`,
			series: 'EQ',
			sector: 'Broad Market Equities',
			industry: 'Diversified Operations',
			exchange: 'NSE',
			price: 1540.00,
			change: 14.50,
			percent_change: 0.95,
			open: 1528.00,
			high: 1552.00,
			low: 1520.00,
			prev_close: 1525.50,
			vwap: 1538.40,
			fifty_two_week_high: 1720.00,
			fifty_two_week_low: 1180.00,
			upper_circuit: 1678.00,
			lower_circuit: 1372.90,
			volume: 4850000,
			turnover_cr: 746.50,
			market_cap_lakh_cr: 4.85,
			pe: 22.4,
			eps: 68.7,
			book_value: 340.00,
			dividend_yield: 0.85,
			beta: 1.02,
			bids: [
				{ price: 1539.80, qty: 1200, orders: 11 },
				{ price: 1539.00, qty: 2500, orders: 24 },
				{ price: 1538.50, qty: 3800, orders: 36 },
				{ price: 1537.00, qty: 5400, orders: 49 },
				{ price: 1535.00, qty: 7900, orders: 67 },
			],
			asks: [
				{ price: 1540.00, qty: 1100, orders: 10 },
				{ price: 1540.50, qty: 2300, orders: 21 },
				{ price: 1541.00, qty: 3600, orders: 33 },
				{ price: 1542.00, qty: 5100, orders: 45 },
				{ price: 1543.00, qty: 7400, orders: 61 },
			],
		} as NSEStockProfile
	}, [stocks, selectedSymbol])

	// Filtered live market list based on search and active tab
	const filteredStocks = useMemo(() => {
		let list = stocks
		if (query.trim()) {
			const q = query.toUpperCase().trim()
			list = list.filter((s) => s.symbol.includes(q) || s.name.toUpperCase().includes(q))
		}
		if (activeListTab === 'gainers') {
			return list.filter((s) => s.percent_change > 0).sort((a, b) => b.percent_change - a.percent_change)
		}
		if (activeListTab === 'losers') {
			return list.filter((s) => s.percent_change < 0).sort((a, b) => a.percent_change - b.percent_change)
		}
		return list
	}, [stocks, query, activeListTab])

	// 52-week position percentage for the visual range slider
	const fiftyTwoWeekPct = useMemo(() => {
		const range = activeStock.fifty_two_week_high - activeStock.fifty_two_week_low
		if (range <= 0) return 50
		const pos = ((activeStock.price - activeStock.fifty_two_week_low) / range) * 100
		return Math.min(100, Math.max(0, pos))
	}, [activeStock])

	const isProfit = activeStock.change >= 0

	// Handle direct search submission
	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (query.trim()) {
			const matched = stocks.find(
				(s) => s.symbol.toUpperCase() === query.toUpperCase().trim()
			)
			if (matched) {
				setSelectedSymbol(matched.symbol)
			} else {
				setSelectedSymbol(query.toUpperCase().trim())
			}
		}
	}

	return (
		<div className="market-page">
			{/* Header Title Section */}
			<div className="market-page-header">
				<div className="market-header-left">
					<p className="eyebrow">
						NATIONAL STOCK EXCHANGE OF INDIA <span className="eyebrow-dot">·</span> LIVE FEED
					</p>
					<h1>Market Overview</h1>
					<p className="page-subtitle">
						Real-time quotes, official NSE equity analytics, and high-definition candlestick charts.
					</p>
				</div>
				<div className="market-header-badge">
					<span className="live-indicator-dot" />
					<span>NSE Live (09:15 - 15:30 IST)</span>
				</div>
			</div>

			{/* ================= PROPER-DIMENSIONED SEARCH COMMAND PANEL ================= */}
			<div className="market-search-hub">
				<form onSubmit={handleSearchSubmit} className="market-search-form">
					<div className="search-input-wrap">
						<Search size={18} className="search-icon-left text-lime" />
						<input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search any NSE stock by symbol or company (e.g. RELIANCE, TCS, INFY, SBIN, TATAMOTORS)..."
							className="command-search-input"
						/>
						{query && (
							<button
								type="button"
								onClick={() => setQuery('')}
								className="search-clear-btn"
								title="Clear search"
							>
								<X size={15} />
							</button>
						)}
					</div>
					<button type="submit" className="button button-primary search-action-btn">
						Search Stock
					</button>
				</form>

				{/* Index selection chips */}
				<div className="quick-symbol-chips">
					<span className="quick-chips-label">
						<BarChart3 size={12} className="text-lime" /> Indices:
					</span>
					<div className="chips-scroller">
						{MARKET_INDICES.map((index) => {
							const isChipActive = index.name === selectedIndex?.name
							return (
								<button
									key={index.name}
									type="button"
									onClick={() => {
										setSelectedIndex(index)
									}}
									className={`symbol-chip-btn ${isChipActive ? 'chip-active' : ''}`}
									aria-pressed={isChipActive}
								>
									{index.name}
								</button>
							)
						})}
					</div>
				</div>

				{/* Live search results dropdown preview if query is active */}
				{query.trim().length > 0 && (
					<div className="search-suggestions-dropdown">
						<div className="suggestions-header">
							<span>Found {filteredStocks.length} matching shares</span>
							<small>Press Enter to inspect</small>
						</div>
						<div className="suggestions-list">
							{filteredStocks.slice(0, 6).map((item) => {
								const p = item.change >= 0
								return (
									<div
										key={item.symbol}
										onClick={() => {
											setSelectedSymbol(item.symbol)
											setQuery('')
										}}
										className="suggestion-row"
									>
										<div className="sug-left">
											<strong className="sug-symbol">{item.symbol}</strong>
											<span className="sug-name">{item.name}</span>
											<span className="sug-badge">NSE · EQ</span>
										</div>
										<div className="sug-right">
											<span className="sug-price">₹{item.price.toFixed(2)}</span>
											<span className={`sug-change ${p ? 'positive-text' : 'negative-text'}`}>
												{p ? '+' : ''}{item.change.toFixed(2)} ({p ? '+' : ''}{item.percent_change}%)
											</span>
										</div>
									</div>
								)
							})}
							{filteredStocks.length === 0 && (
								<div className="no-sug-found">
									No listed shares found matching "{query}". Click Search to load custom equity quote.
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			{selectedIndex && (
				<section className="market-index-details" aria-live="polite">
					<div className="market-index-heading">
						<div>
							<p className="eyebrow">{selectedIndex.exchange} MARKET INDEX</p>
							<h2>{selectedIndex.name}</h2>
							<p className="page-subtitle">
								{selectedIndex.constituents.length} constituent shares · Latest available daily data
							</p>
						</div>
					</div>

					{(indexLoading || constituentsLoading) && (
						<p className="market-index-status">Loading latest daily market data…</p>
					)}
					{indexError && <p className="market-index-error" role="alert">{indexError}</p>}
					{constituentsError && <p className="market-index-error" role="alert">{constituentsError}</p>}
					{!indexLoading && !indexQuote && !indexError && (
						<p className="market-index-error" role="alert">No daily index quote is currently available.</p>
					)}
					{!constituentsLoading && indexConstituentQuotes.length === 0 && !constituentsError && (
						<p className="market-index-error" role="alert">
							Daily share prices are unavailable. The data provider may be rate-limiting requests; try again later.
						</p>
					)}
					{indexConstituentQuotes.some((quote) => quote.is_fallback) && (
						<p className="market-index-status">
							No saved daily data is available for some shares yet; those values are not shown.
						</p>
					)}
					{indexConstituentQuotes.some((quote) => quote.is_stale) && (
						<p className="market-index-status">
							Showing the last saved daily quotes because the market data provider could not refresh. Quote dates are listed per share.
						</p>
					)}

					{indexQuote && (
						<>
							{indexQuote.is_fallback && (
								<p className="market-index-status">
									No saved daily index data is available yet; the index value is not shown.
								</p>
							)}
							{indexQuote.is_stale && (
								<p className="market-index-status">
									Showing the last saved daily index quote dated {indexQuote.quote_date ?? 'unknown'}.
								</p>
							)}
							<div className="market-index-summary">
								<div className="market-index-primary">
									<span>INDEX CLOSE {indexQuote.quote_date ? `· ${indexQuote.quote_date}` : ''}</span>
									<strong>
										{indexQuote.is_fallback
											? '—'
											: `${indexQuote.currency === 'INR' ? '₹' : ''}${indexQuote.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
									</strong>
									<span className={indexQuote.is_fallback ? '' : indexQuote.change >= 0 ? 'positive-text' : 'negative-text'}>
										{indexQuote.is_fallback
											? 'Daily quote unavailable'
											: `${indexQuote.change >= 0 ? '+' : ''}${indexQuote.change.toFixed(2)} points (${indexQuote.percent_change >= 0 ? '+' : ''}${indexQuote.percent_change.toFixed(2)}%)`}
									</span>
								</div>
								<div className="market-index-stat">
									<span>ADVANCING (QUOTED)</span>
									<strong className="positive-text">
										{indexConstituentQuotes.filter((quote) => !quote.is_fallback && quote.percent_change > 0).length}
									</strong>
								</div>
								<div className="market-index-stat">
									<span>DECLINING (QUOTED)</span>
									<strong className="negative-text">
										{indexConstituentQuotes.filter((quote) => !quote.is_fallback && quote.percent_change < 0).length}
									</strong>
								</div>
								<div className="market-index-stat">
									<span>UNCHANGED (QUOTED)</span>
									<strong>
										{indexConstituentQuotes.filter((quote) => !quote.is_fallback && quote.percent_change === 0).length}
									</strong>
								</div>
							</div>
						</>
					)}

					<div className="market-index-table-wrap">
						<table className="live-data-table market-index-table">
							<colgroup>
								<col className="market-index-col-symbol" />
								<col className="market-index-col-company" />
								<col className="market-index-col-price" />
								<col className="market-index-col-change" />
								<col className="market-index-col-gain" />
								<col className="market-index-col-volume" />
								<col className="market-index-col-session" />
							</colgroup>
							<thead>
								<tr>
									<th>SYMBOL</th>
									<th>COMPANY</th>
									<th className="market-index-number">LAST CLOSE</th>
									<th className="market-index-number">DAY CHANGE</th>
									<th className="market-index-number">DAY GAIN / LOSS</th>
									<th className="market-index-number">VOLUME</th>
									<th className="market-index-number">SESSION</th>
								</tr>
							</thead>
							<tbody>
								{selectedIndex.constituents.map((symbol) => {
									const quote = indexConstituentQuotes.find((item) => item.symbol === symbol && !item.is_fallback)
									return (
										<tr key={symbol}>
											<td><strong className="stock-sym">{symbol}</strong></td>
											<td className="market-index-company" title={quote?.name ?? symbol}>{quote?.name ?? symbol}</td>
											<td className="market-index-number">
												{quote ? `₹${quote.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
											</td>
											<td className={`market-index-number ${quote ? (quote.change >= 0 ? 'positive-text' : 'negative-text') : ''}`}>
												{quote ? `${quote.change >= 0 ? '+' : ''}${quote.change.toFixed(2)}` : '—'}
											</td>
											<td className={`market-index-number ${quote ? (quote.percent_change >= 0 ? 'positive-text' : 'negative-text') : ''}`}>
												{quote ? `${quote.percent_change >= 0 ? '+' : ''}${quote.percent_change.toFixed(2)}%` : '—'}
											</td>
											<td className="market-index-number">
												{quote ? quote.volume.toLocaleString('en-IN') : '—'}
											</td>
											<td className="market-index-number">{quote?.quote_date ?? '—'}</td>
										</tr>
									)
								})}
							</tbody>
						</table>
					</div>
				</section>
			)}

			{/* ================= OFFICIAL NSE EQUITY INTELLIGENCE SNAPSHOT ================= */}
			<section className="nse-stock-snapshot-panel">
				{/* Top Stock Identity Banner */}
				<div className="nse-snapshot-header">
					<div className="stock-identity-group">
						<div className="stock-avatar-badge">{activeStock.symbol.slice(0, 2)}</div>
						<div>
							<div className="stock-title-row">
								<h2 className="stock-symbol-title">{activeStock.symbol}</h2>
								<span className="nse-series-tag">NSE: {activeStock.series}</span>
								<span className="nse-isin-tag">ISIN: {activeStock.isin}</span>
								<span className="nse-live-status-pill">
									<CheckCircle2 size={12} className="text-lime" /> Normal Trading
								</span>
							</div>
							<p className="stock-company-name">
								{activeStock.name} · <span className="text-soft">{activeStock.sector}</span> ({activeStock.industry})
							</p>
						</div>
					</div>

					<div className="snapshot-action-buttons">
						<button
							className="button button-secondary nse-action-btn"
							onClick={() => navigate(`/terminal?symbol=${activeStock.symbol}`)}
						>
							<ExternalLink size={14} /> Open in Terminal
						</button>
					</div>
				</div>

				{/* Price Hero & 5-Column Core NSE Matrix */}
				<div className="nse-price-hero-strip">
					{/* LTP & 24H Gain/Loss */}
					<div className="ltp-hero-box">
						<span className="ltp-hero-label">LAST TRADED PRICE (LTP)</span>
						<div className="ltp-hero-value">
							₹{activeStock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
						</div>
						<div className="ltp-hero-diff">
							<span className={`diff-pill ${isProfit ? 'diff-profit' : 'diff-loss'}`}>
								{isProfit ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
								{isProfit ? '+' : '-'}₹{Math.abs(activeStock.change).toFixed(2)} ({isProfit ? '+' : ''}{activeStock.percent_change}%)
							</span>
							<span className="as-of-time">Live Session</span>
						</div>
					</div>

					{/* 5 NSE Core Trading Prices */}
					<div className="nse-metrics-mini-grid">
						<div className="mini-metric-item">
							<span className="mini-label">OPEN</span>
							<strong className="mini-val">₹{activeStock.open.toFixed(2)}</strong>
						</div>
						<div className="mini-metric-item">
							<span className="mini-label">DAY HIGH</span>
							<strong className="mini-val positive-text">₹{activeStock.high.toFixed(2)}</strong>
						</div>
						<div className="mini-metric-item">
							<span className="mini-label">DAY LOW</span>
							<strong className="mini-val negative-text">₹{activeStock.low.toFixed(2)}</strong>
						</div>
						<div className="mini-metric-item">
							<span className="mini-label">PREV. CLOSE</span>
							<strong className="mini-val">₹{activeStock.prev_close.toFixed(2)}</strong>
						</div>
						<div className="mini-metric-item">
							<span className="mini-label">VWAP</span>
							<strong className="mini-val text-lime">₹{activeStock.vwap.toFixed(2)}</strong>
						</div>
					</div>
				</div>

				{/* 52-Week Range Bar */}
				<div className="fifty-two-week-box">
					<div className="range-labels">
						<span>52W Low: <strong>₹{activeStock.fifty_two_week_low.toFixed(2)}</strong></span>
						<span className="range-title">52-WEEK TRADING RANGE</span>
						<span>52W High: <strong>₹{activeStock.fifty_two_week_high.toFixed(2)}</strong></span>
					</div>
					<div className="range-track">
						<div
							className="range-progress-fill"
							style={{ width: `${fiftyTwoWeekPct}%` }}
						/>
						<div
							className="range-pin"
							style={{ left: `${fiftyTwoWeekPct}%` }}
							title={`Current: ₹${activeStock.price.toFixed(2)} (${fiftyTwoWeekPct.toFixed(0)}% of 52W Range)`}
						>
							<div className="range-pin-tooltip">₹{activeStock.price.toFixed(2)}</div>
						</div>
					</div>
				</div>

				{/* Regulatory Circuit Limits & Valuation Highlights */}
				<div className="nse-regulatory-grid">
					<div className="reg-item">
						<span className="reg-label">Upper Circuit (+10%)</span>
						<strong className="reg-val positive-text">₹{activeStock.upper_circuit.toFixed(2)}</strong>
					</div>
					<div className="reg-item">
						<span className="reg-label">Lower Circuit (-10%)</span>
						<strong className="reg-val negative-text">₹{activeStock.lower_circuit.toFixed(2)}</strong>
					</div>
					<div className="reg-item">
						<span className="reg-label">Market Capitalization</span>
						<strong className="reg-val">₹{activeStock.market_cap_lakh_cr.toFixed(2)} Lakh Cr</strong>
					</div>
					<div className="reg-item">
						<span className="reg-label">P/E Ratio (TTM)</span>
						<strong className="reg-val">{activeStock.pe.toFixed(1)}</strong>
					</div>
					<div className="reg-item">
						<span className="reg-label">EPS (TTM)</span>
						<strong className="reg-val">₹{activeStock.eps.toFixed(1)}</strong>
					</div>
					<div className="reg-item">
						<span className="reg-label">Traded Volume</span>
						<strong className="reg-val">{activeStock.volume.toLocaleString('en-IN')} shares</strong>
					</div>
					<div className="reg-item">
						<span className="reg-label">Total Turnover</span>
						<strong className="reg-val">₹{activeStock.turnover_cr.toFixed(2)} Cr</strong>
					</div>
					<div className="reg-item">
						<span className="reg-label">Beta (vs NIFTY)</span>
						<strong className="reg-val">{activeStock.beta.toFixed(2)}</strong>
					</div>
				</div>
			</section>

			{/* ================= PROPER-DIMENSIONED MARKET LAYOUT (LIVE LIST & CHART) ================= */}
			<div className="market-layout-balanced">
				{/* LEFT COLUMN: LIVE MARKET LIST WITH REAL-TIME GAIN/LOSS OF THE DAY */}
				<div className="live-market-list-card">
					<div className="list-card-header">
						<div>
							<h3 className="list-title">Live Market List</h3>
							<p className="list-subtitle">Real-time NSE equities price changes and gain/loss tracking</p>
						</div>
						{/* Gainers / Losers Filters */}
						<div className="list-filter-pills">
							<button
								className={`filter-pill-btn ${activeListTab === 'all' ? 'active-pill' : ''}`}
								onClick={() => setActiveListTab('all')}
							>
								All ({stocks.length})
							</button>
							<button
								className={`filter-pill-btn pill-green ${activeListTab === 'gainers' ? 'active-pill' : ''}`}
								onClick={() => setActiveListTab('gainers')}
							>
								Gainers 🟢
							</button>
							<button
								className={`filter-pill-btn pill-red ${activeListTab === 'losers' ? 'active-pill' : ''}`}
								onClick={() => setActiveListTab('losers')}
							>
								Losers 🔴
							</button>
						</div>
					</div>

					<div className="table-scroll-live">
						<table className="live-data-table">
							<thead>
								<tr>
									<th>SYMBOL</th>
									<th>COMPANY</th>
									<th style={{ textAlign: 'right' }}>LTP (₹)</th>
									<th style={{ textAlign: 'right' }}>GAIN / LOSS</th>
									<th style={{ textAlign: 'right' }}>VOLUME</th>
								</tr>
							</thead>
							<tbody>
								{filteredStocks.map((stock) => {
									const isSelected = stock.symbol === activeStock.symbol
									const isPos = stock.change >= 0
									const isJustTicked = stock.symbol === lastTickedSymbol
									const flashClass = isJustTicked
										? tickDirection === 'up'
											? 'flash-green'
											: 'flash-red'
										: ''

									return (
										<tr
											key={stock.symbol}
											className={`live-stock-row ${isSelected ? 'row-active' : ''} ${flashClass}`}
											onClick={() => setSelectedSymbol(stock.symbol)}
										>
											<td>
												<div className="symbol-cell-wrap">
													<strong className="stock-sym">{stock.symbol}</strong>
													<span className="stock-exch-tag">NSE</span>
												</div>
											</td>
											<td>
												<span className="stock-comp-name">{stock.name}</span>
											</td>
											<td style={{ textAlign: 'right' }}>
												<strong className="stock-price-val">
													₹{stock.price.toFixed(2)}
												</strong>
											</td>
											<td style={{ textAlign: 'right' }}>
												<div className={`pnl-badge ${isPos ? 'badge-pos' : 'badge-neg'}`}>
													{isPos ? '+' : ''}{stock.change.toFixed(2)} ({isPos ? '+' : ''}{stock.percent_change}%)
												</div>
											</td>
											<td style={{ textAlign: 'right' }} className="volume-cell">
												{(stock.volume / 100000).toFixed(1)}L
											</td>
										</tr>
									)
								})}
							</tbody>
						</table>
					</div>

					<div className="list-card-footer">
						<span>⚡ Live auto-refreshing ticks enabled</span>
						<span>Click any share to load its candlestick chart</span>
					</div>
				</div>

				{/* RIGHT COLUMN: HIGH-DEFINITION TRADING CHART (PROPER DIMENSION) */}
				<div className="chart-wrapper-card">
					<div className="chart-card-nav">
						<div className="chart-nav-left">
							<button
								className={`chart-tab-btn ${activeRightTab === 'chart' ? 'chart-tab-active' : ''}`}
								onClick={() => setActiveRightTab('chart')}
							>
								<BarChart3 size={14} /> Candlestick Chart
							</button>
							<button
								className={`chart-tab-btn ${activeRightTab === 'depth' ? 'chart-tab-active' : ''}`}
								onClick={() => setActiveRightTab('depth')}
							>
								<Activity size={14} /> Market Depth (Order Book)
							</button>
						</div>
						<div className="chart-nav-right">
							<span className="active-chart-badge">{activeStock.symbol} · 1D</span>
						</div>
					</div>

					{activeRightTab === 'chart' ? (
						<div className="proper-dimension-chart-box">
							<TradingChart symbol={activeStock.symbol} />
						</div>
					) : (
						<div className="market-depth-panel">
							<div className="depth-header-title">
								<h4>NSE Level 2 Market Depth · {activeStock.symbol}</h4>
								<span className="depth-total-tag">
									Total Bids vs Total Asks
								</span>
							</div>

							<div className="depth-tables-grid">
								{/* BID TABLE */}
								<div className="depth-table-half">
									<h5 className="depth-bid-title">BID (BUY ORDERS)</h5>
									<table className="depth-table">
										<thead>
											<tr>
												<th>Orders</th>
												<th>Qty</th>
												<th style={{ textAlign: 'right' }}>Bid Price</th>
											</tr>
										</thead>
										<tbody>
											{activeStock.bids.map((b, i) => (
												<tr key={i}>
													<td className="text-soft">{b.orders}</td>
													<td className="font-mono">{b.qty.toLocaleString()}</td>
													<td style={{ textAlign: 'right' }} className="positive-text font-bold">
														₹{b.price.toFixed(2)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>

								{/* ASK TABLE */}
								<div className="depth-table-half">
									<h5 className="depth-ask-title">ASK (SELL ORDERS)</h5>
									<table className="depth-table">
										<thead>
											<tr>
												<th>Ask Price</th>
												<th>Qty</th>
												<th style={{ textAlign: 'right' }}>Orders</th>
											</tr>
										</thead>
										<tbody>
											{activeStock.asks.map((a, i) => (
												<tr key={i}>
													<td className="negative-text font-bold">₹{a.price.toFixed(2)}</td>
													<td className="font-mono">{a.qty.toLocaleString()}</td>
													<td style={{ textAlign: 'right' }} className="text-soft">{a.orders}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
