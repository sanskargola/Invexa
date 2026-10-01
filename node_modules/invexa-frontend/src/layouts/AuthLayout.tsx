import { ChartNoAxesCombined } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

export default function AuthLayout() {
	return <main className="auth-shell"><div className="auth-brand-row"><Link className="brand auth-brand" to="/dashboard"><span className="brand-mark"><ChartNoAxesCombined size={19} /></span><span>invexa<span className="brand-period">.</span></span></Link><span className="auth-secure-label"><i /> Secure account access</span></div><Outlet /><footer className="auth-footer"><span>© 2026 Invexa Markets</span><div><a href="mailto:support@invexa.io">Support</a><a href="mailto:privacy@invexa.io">Privacy</a><a href="mailto:legal@invexa.io">Terms</a></div></footer></main>
}
