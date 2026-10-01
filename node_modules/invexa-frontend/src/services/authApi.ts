import { authenticate, createAccount, createPasswordReset, updatePassword, verifyAccount } from '../store/authStore'

export const authApi = {
	register: createAccount,
	verifyEmail: verifyAccount,
	login: authenticate,
	requestPasswordReset: createPasswordReset,
	resetPassword: updatePassword,
}
