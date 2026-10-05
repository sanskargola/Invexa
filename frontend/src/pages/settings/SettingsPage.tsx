import { useEffect, useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme, type ThemeId } from '../../store/themeStore'

const options: { id: ThemeId; title: string; copy: string; icon: typeof Moon }[] = [
	{ id: 'forest', title: 'Forest', copy: 'The Invexia default. Deep green panels with lime accents.', icon: Monitor },
	{ id: 'midnight', title: 'Midnight', copy: 'A cooler navy workspace for long trading sessions.', icon: Moon },
	{ id: 'light', title: 'Daylight', copy: 'High-contrast light surfaces for bright rooms.', icon: Sun },
]

export default function SettingsPage() {
	const { theme, setTheme } = useTheme()
	const [saved, setSaved] = useState('')

	useEffect(() => {
		if (!saved) return
		const timer = window.setTimeout(() => setSaved(''), 1600)
		return () => window.clearTimeout(timer)
	}, [saved])

	return (
		<div className="settings-page">
			<div className="page-heading">
				<div>
					<p className="eyebrow">SETTINGS <span className="eyebrow-dot">·</span> INVEXIA WORKSPACE</p>
					<h1>Appearance</h1>
					<p className="page-subtitle">Switch themes without interrupting live charts or market data.</p>
				</div>
			</div>
			{saved && <div className="workspace-notice" role="status">{saved}<button onClick={() => setSaved('')} aria-label="Dismiss">×</button></div>}
			<section className="theme-grid">
				{options.map((option) => {
					const Icon = option.icon
					return (
						<button key={option.id} className={`theme-card${theme === option.id ? ' selected' : ''}`} onClick={() => { setTheme(option.id); setSaved(`${option.title} theme applied.`) }}>
							<span className={`theme-preview theme-preview-${option.id}`} />
							<strong><Icon size={16} /> {option.title}</strong>
							<small>{option.copy}</small>
						</button>
					)
				})}
			</section>
			<section className="surface settings-notes">
				<h2>How Invexia stays fast</h2>
				<p>Quotes, news, and fundamentals come from Yahoo Finance in the background. The chart itself is a TradingView widget, so candles keep streaming even while Yahoo data refreshes.</p>
			</section>
		</div>
	)
}
