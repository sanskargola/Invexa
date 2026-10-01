import { Activity, BarChart3, CandlestickChart, LineChart } from 'lucide-react'

export type ChartType = 'candles' | 'line' | 'area' | 'bars'

const chartTypes: { value: ChartType; label: string; icon: typeof CandlestickChart }[] = [
	{ value: 'candles', label: 'Candlesticks', icon: CandlestickChart },
	{ value: 'line', label: 'Line', icon: LineChart },
	{ value: 'area', label: 'Area', icon: Activity },
	{ value: 'bars', label: 'OHLC bars', icon: BarChart3 },
]

type ChartToolbarProps = {
	type: ChartType
	onTypeChange: (type: ChartType) => void
	volume: boolean
	onVolumeChange: () => void
}

export default function ChartToolbar({ type, onTypeChange, volume, onVolumeChange }: ChartToolbarProps) {
	return <div className="chart-toolbar" role="group" aria-label="Chart display options">
		<div className="chart-type-buttons">{chartTypes.map(({ value, label, icon: Icon }) => <button key={value} title={label} aria-label={label} aria-pressed={type === value} className={type === value ? 'selected' : ''} onClick={() => onTypeChange(value)}><Icon size={15} /></button>)}</div>
		<span className="chart-toolbar-divider" />
		<button className={`chart-option${volume ? ' selected' : ''}`} aria-pressed={volume} onClick={onVolumeChange}>Volume</button>
	</div>
}
