export interface User {
	id: string
	name: string
	email: string
	createdAt: string
}

export interface Account extends User {
	passwordHash: string
	verified: boolean
}
