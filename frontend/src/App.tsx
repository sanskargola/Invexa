import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import AuthPage from './pages/auth/AuthPage'
import Dashboard from './pages/dashboard/Dashboard'
import Market from './pages/market/Market'
import StockSearch from './pages/market/StockSearch'
import TradingTerminal from './pages/trading/TradingTerminal.tsx'
import WorkspacePage from './pages/WorkspacePage'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicRoute from './routes/PublicRoute'

export default function App() {
	return (
		<Routes>
			<Route element={<PublicRoute />}>
				<Route path="/auth" element={<AuthLayout />}>
					<Route index element={<Navigate to="login" replace />} />
					<Route path=":screen" element={<AuthPage />} />
				</Route>
				<Route path="/login" element={<Navigate to="/auth/login" replace />} />
				<Route path="/register" element={<Navigate to="/auth/register" replace />} />
				<Route path="/forgot-password" element={<Navigate to="/auth/forgot-password" replace />} />
				<Route path="/reset-password" element={<Navigate to="/auth/reset-password" replace />} />
			</Route>
			<Route element={<ProtectedRoute />}>
			<Route element={<MainLayout />}>
				<Route index element={<Navigate to="/dashboard" replace />} />
				<Route path="dashboard" element={<Dashboard />} />
				<Route path="market" element={<Market />} />
				<Route path="market/search" element={<StockSearch />} />
				<Route path="terminal" element={<TradingTerminal />} />
				<Route path="trading/terminal" element={<TradingTerminal />} />
				<Route path="*" element={<WorkspacePage />} />
			</Route>
			</Route>
		</Routes>
	)
}
