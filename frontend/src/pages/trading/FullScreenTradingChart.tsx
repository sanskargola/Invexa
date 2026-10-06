import { useSearchParams } from 'react-router-dom'
import TradingChart from '../../components/charts/TradingChart'

export default function FullScreenTradingChart() {
	const [searchParams] = useSearchParams()
	const symbol = (searchParams.get('symbol') ?? 'NVDA').toUpperCase()

	return (
		<main className="full-screen-chart-page">
			<TradingChart symbol={symbol} fullScreen />
		</main>
	)
}
