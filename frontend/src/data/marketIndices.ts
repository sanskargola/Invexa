export type MarketIndex = {
	name: string
	symbol: string
	exchange: 'NSE' | 'BSE'
	constituents: string[]
}

export const MARKET_INDICES: MarketIndex[] = [
	{
		name: 'NIFTY 50',
		symbol: '^NSEI',
		exchange: 'NSE',
		constituents: [
			'ADANIENT', 'ADANIPORTS', 'APOLLOHOSP', 'ASIANPAINT', 'AXISBANK',
			'BAJAJ-AUTO', 'BAJFINANCE', 'BAJAJFINSV', 'BEL', 'BHARTIARTL',
			'CIPLA', 'COALINDIA', 'DRREDDY', 'EICHERMOT', 'ETERNAL',
			'GRASIM', 'HCLTECH', 'HDFCBANK', 'HDFCLIFE', 'HEROMOTOCO',
			'HINDALCO', 'HINDUNILVR', 'ICICIBANK', 'INDUSINDBK', 'INFY',
			'ITC', 'JIOFIN', 'JSWSTEEL', 'KOTAKBANK', 'LT',
			'M&M', 'MARUTI', 'NESTLEIND', 'NTPC', 'ONGC',
			'POWERGRID', 'RELIANCE', 'SBILIFE', 'SBIN', 'SHRIRAMFIN',
			'SUNPHARMA', 'TATACONSUM', 'TMCV', 'TATASTEEL', 'TCS',
			'TECHM', 'TITAN', 'TRENT', 'ULTRACEMCO', 'WIPRO',
		],
	},
	{
		name: 'SENSEX',
		symbol: '^BSESN',
		exchange: 'BSE',
		constituents: [
			'ADANIPORTS', 'ASIANPAINT', 'AXISBANK', 'BAJAJ-AUTO', 'BAJFINANCE',
			'BAJAJFINSV', 'BEL', 'BHARTIARTL', 'ETERNAL', 'HCLTECH',
			'HDFCBANK', 'HINDUNILVR', 'ICICIBANK', 'INDUSINDBK', 'INFY',
			'ITC', 'KOTAKBANK', 'LT', 'M&M', 'MARUTI',
			'NTPC', 'POWERGRID', 'RELIANCE', 'SBIN', 'SUNPHARMA',
			'TATASTEEL', 'TCS', 'TECHM', 'TITAN', 'TRENT',
		],
	},
	{
		name: 'NIFTY BANK',
		symbol: '^NSEBANK',
		exchange: 'NSE',
		constituents: [
			'AUBANK', 'AXISBANK', 'BANKBARODA', 'CANBK', 'FEDERALBNK',
			'HDFCBANK', 'ICICIBANK', 'IDFCFIRSTB', 'INDUSINDBK', 'KOTAKBANK',
			'PNB', 'SBIN', 'UNIONBANK', 'YESBANK',
		],
	},
	{
		name: 'NIFTY IT',
		symbol: '^CNXIT',
		exchange: 'NSE',
		constituents: [
			'COFORGE', 'HCLTECH', 'INFY', 'LTM', 'MPHASIS',
			'OFSS', 'PERSISTENT', 'TCS', 'TECHM', 'WIPRO',
		],
	},
]
