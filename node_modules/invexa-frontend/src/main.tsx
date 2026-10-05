/// <reference types="vite/client" />

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './hooks/useAuth'
import { ThemeProvider } from './store/themeStore'
import './styles/globals.css'
import './styles/chart.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
			<ThemeProvider>
				<AuthProvider><App /></AuthProvider>
			</ThemeProvider>
		</BrowserRouter>
	</React.StrictMode>,
)
