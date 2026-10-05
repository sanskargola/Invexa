import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export const THEMES = ['forest', 'midnight', 'light'] as const
export type ThemeId = (typeof THEMES)[number]

const STORAGE_KEY = 'invexia.theme'

type ThemeContextValue = {
	theme: ThemeId
	setTheme: (theme: ThemeId) => void
	cycleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readTheme(): ThemeId {
	const stored = localStorage.getItem(STORAGE_KEY)
	if (stored === 'forest' || stored === 'midnight' || stored === 'light') return stored
	return 'forest'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<ThemeId>(() => (typeof window === 'undefined' ? 'forest' : readTheme()))

	useEffect(() => {
		document.documentElement.dataset.theme = theme
		localStorage.setItem(STORAGE_KEY, theme)
		const meta = document.querySelector('meta[name="theme-color"]')
		meta?.setAttribute('content', theme === 'light' ? '#f4f6f2' : theme === 'midnight' ? '#0b1020' : '#111613')
	}, [theme])

	const value = useMemo<ThemeContextValue>(() => ({
		theme,
		setTheme: setThemeState,
		cycleTheme: () => setThemeState((current) => THEMES[(THEMES.indexOf(current) + 1) % THEMES.length]),
	}), [theme])

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
	const context = useContext(ThemeContext)
	if (!context) throw new Error('useTheme must be used within ThemeProvider')
	return context
}
