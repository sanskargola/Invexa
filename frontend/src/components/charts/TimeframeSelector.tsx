export const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W', '1M'] as const
export type Timeframe = (typeof TIMEFRAMES)[number]

type TimeframeSelectorProps = {
	value: Timeframe
	onChange: (timeframe: Timeframe) => void
}

export default function TimeframeSelector({ value, onChange }: TimeframeSelectorProps) {
	return <div className="timeframe-selector" role="group" aria-label="Chart timeframe">
		{TIMEFRAMES.map((timeframe) => <button key={timeframe} className={value === timeframe ? 'selected' : ''} onClick={() => onChange(timeframe)} aria-pressed={value === timeframe}>{timeframe}</button>)}
	</div>
}
