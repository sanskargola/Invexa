import type { User } from '../types/user'
import { authenticate, createAccount, createPasswordReset, updatePassword, verifyAccount } from '../store/authStore'
import { request } from './api'

export const authApi = {
	async register(name: string, email: string, password: string): Promise<void> {
		try {
			await request('/auth/register', {
				method: 'POST',
				json: { name, email, password },
			})
			return
		} catch {
			await createAccount(name, email, password)
		}
	},
	async verifyEmail(email: string, code: string): Promise<User> {
		try {
			const user = await request<{ id: string; name: string; email: string; createdAt: string }>('/auth/me')
			return { ...user, createdAt: user.createdAt ?? new Date().toISOString() }
		} catch {
			return verifyAccount(email, code)
		}
	},
	async login(email: string, password: string, remember = true): Promise<User> {
		try {
			await request('/auth/login', { method: 'POST', json: { email, password } })
			const user = await request<{ id: string; name: string; email: string; createdAt: string }>('/auth/me')
			return { ...user, createdAt: user.createdAt ?? new Date().toISOString() }
		} catch {
			return authenticate(email, password, remember)
		}
	},
	async requestPasswordReset(email: string): Promise<string | null> {
		const fallback = createPasswordReset(email)
		try {
			const result = await request<{ token: string } | null>('/auth/forgot-password', {
				method: 'POST',
				json: { email },
			})
			return result?.token ?? fallback
		} catch {
			return fallback
		}
	},
	async resetPassword(email: string, token: string, password: string): Promise<void> {
		try {
			await request('/auth/reset-password', {
				method: 'POST',
				json: { email, token, password },
			})
			return
		} catch {
			await updatePassword(email, token, password)
		}
	},
}
