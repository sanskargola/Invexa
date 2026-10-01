import { createContext, createElement, useContext, useState, type ReactNode } from 'react'
import type { User } from '../types/user'
import { authApi } from '../services/authApi'
import { clearSession, getCurrentUser, startDemoSession } from '../store/authStore'

type AuthContextValue = {
	user: User | null
	login: (email: string, password: string, remember: boolean) => Promise<void>
	loginAsDemo: () => void
	refreshUser: () => void
	logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(() => getCurrentUser())

	async function login(email: string, password: string, remember: boolean) {
		setUser(await authApi.login(email, password, remember))
	}

	function loginAsDemo() {
		setUser(startDemoSession())
	}

	function refreshUser() {
		setUser(getCurrentUser())
	}

	function logout() {
		clearSession()
		setUser(null)
	}

	return createElement(AuthContext.Provider, { value: { user, login, loginAsDemo, refreshUser, logout } }, children)
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (!context) throw new Error('useAuth must be used inside AuthProvider.')
	return context
}
