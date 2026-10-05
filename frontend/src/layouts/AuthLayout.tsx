import { ChartNoAxesCombined } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

export default function AuthLayout() {
	return <main className="auth-shell"><div className="auth-brand-row"><Link className="brand auth-brand" to="/dashboard"><span className="brand-mark"><ChartNoAxesCombined size={19} /></span><span>invexia<span className="brand-period">.</span></span></Link><span className="auth-secure-label"><i /> Secure account access</span></div><Outlet /><footer className="auth-footer"><span>© 2026 Invexia Markets</span><div><a href="mailto:support@invexia.io">Support</a><a href="mailto:privacy@invexia.io">Privacy</a><a href="mailto:legal@invexia.io">Terms</a></div></footer></main>
}
