export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidSymbol(symbol: string): boolean {
  return /^[A-Za-z0-9\.\-]{1,12}$/.test(symbol.trim())
}

export function isValidQuantity(quantity: number | string): boolean {
  const n = Number(quantity)
  return Number.isFinite(n) && n > 0 && Number.isInteger(n)
}

export function isValidPrice(price: number | string): boolean {
  const n = Number(price)
  return Number.isFinite(n) && n > 0
}
