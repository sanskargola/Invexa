import type { Account, User } from '../types/user'

const ACCOUNTS_KEY = 'invexa.demo.accounts'
const PENDING_KEY = 'invexa.demo.pending-account'
const SESSION_KEY = 'invexa.demo.session'
const TEMP_SESSION_KEY = 'invexa.demo.temp-session'
const RESET_KEY = 'invexa.demo.password-reset'
export const DEMO_VERIFICATION_CODE = '246810'

type PendingAccount = Account & { verificationCode: string }
type PasswordReset = { email: string; token: string; expiresAt: number }

function readJson<T>(key: string, fallback: T): T {
	try {
		const value = localStorage.getItem(key)
		return value ? JSON.parse(value) as T : fallback
	} catch {
		return fallback
	}
}

function getAccounts(): Account[] {
	return readJson<Account[]>(ACCOUNTS_KEY, [])
}

async function hashPassword(password: string): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
	return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function createAccount(name: string, email: string, password: string): Promise<void> {
	const normalizedEmail = email.trim().toLowerCase()
	if (getAccounts().some((account) => account.email === normalizedEmail)) {
		throw new Error('An account with this email already exists. Sign in instead.')
	}
	const pending: PendingAccount = {
		id: crypto.randomUUID(),
		name: name.trim(),
		email: normalizedEmail,
		passwordHash: await hashPassword(password),
		createdAt: new Date().toISOString(),
		verified: false,
		verificationCode: DEMO_VERIFICATION_CODE,
	}
	localStorage.setItem(PENDING_KEY, JSON.stringify(pending))
}

export function verifyAccount(email: string, code: string): User {
	const pending = readJson<PendingAccount | null>(PENDING_KEY, null)
	if (!pending || pending.email !== email.trim().toLowerCase()) {
		throw new Error('No pending registration was found for this email. Please register again.')
	}
	if (pending.verificationCode !== code.trim()) {
		throw new Error('That verification code is not correct. Check the demo code and try again.')
	}
	const { verificationCode: _verificationCode, ...account } = pending
	const verifiedAccount = { ...account, verified: true }
	localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...getAccounts(), verifiedAccount]))
	localStorage.removeItem(PENDING_KEY)
	const { passwordHash: _passwordHash, ...user } = verifiedAccount
	localStorage.setItem(SESSION_KEY, JSON.stringify(user))
	return user
}

export async function authenticate(email: string, password: string, remember = true): Promise<User> {
	const normalizedEmail = email.trim().toLowerCase()
	const account = getAccounts().find((item) => item.email === normalizedEmail)
	if (!account || account.passwordHash !== await hashPassword(password)) {
		throw new Error('Email or password is incorrect.')
	}
	if (!account.verified) throw new Error('Verify your email before signing in.')
	const { passwordHash: _passwordHash, ...user } = account
	localStorage.removeItem(SESSION_KEY)
	sessionStorage.removeItem(TEMP_SESSION_KEY)
	const storage = remember ? localStorage : sessionStorage
	storage.setItem(remember ? SESSION_KEY : TEMP_SESSION_KEY, JSON.stringify(user))
	return user
}

export function getCurrentUser(): User | null {
	return readJson<User | null>(SESSION_KEY, null) ?? readJson<User | null>(TEMP_SESSION_KEY, null)
}

export function clearSession(): void {
	localStorage.removeItem(SESSION_KEY)
	sessionStorage.removeItem(TEMP_SESSION_KEY)
}

export function startDemoSession(): User {
	const user: User = {
		id: 'invexa-demo-investor',
		name: 'Demo Investor',
		email: 'demo@invexa.local',
		createdAt: '2026-01-01T00:00:00.000Z',
	}
	clearSession()
	localStorage.setItem(SESSION_KEY, JSON.stringify(user))
	return user
}

export function createPasswordReset(email: string): string | null {
	const normalizedEmail = email.trim().toLowerCase()
	if (!getAccounts().some((account) => account.email === normalizedEmail)) return null
	const token = crypto.randomUUID()
	const reset: PasswordReset = { email: normalizedEmail, token, expiresAt: Date.now() + 30 * 60 * 1000 }
	localStorage.setItem(RESET_KEY, JSON.stringify(reset))
	return token
}

export async function updatePassword(email: string, token: string, password: string): Promise<void> {
	const reset = readJson<PasswordReset | null>(RESET_KEY, null)
	if (!reset || reset.email !== email.trim().toLowerCase() || reset.token !== token || reset.expiresAt < Date.now()) {
		throw new Error('This reset link is invalid or expired. Request a new one.')
	}
	const accounts = getAccounts()
	const accountIndex = accounts.findIndex((item) => item.email === reset.email)
	if (accountIndex < 0) throw new Error('Account not found. Please register again.')
	accounts[accountIndex] = { ...accounts[accountIndex], passwordHash: await hashPassword(password) }
	localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
	localStorage.removeItem(RESET_KEY)
}
