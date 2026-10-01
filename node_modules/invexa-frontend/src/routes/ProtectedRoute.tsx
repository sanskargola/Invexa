import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute() {
	const { user } = useAuth()
	const location = useLocation()
	return user ? <Outlet /> : <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
}
