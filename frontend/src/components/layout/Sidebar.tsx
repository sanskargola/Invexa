import {
	Activity, Bell, Bot, ChartNoAxesCombined, ChevronDown, CircleHelp,
	Command, FileText, LayoutDashboard, LogOut, PanelLeftClose, Settings2, Shield, Wallet,
} from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const sections = [
	{ label: 'WORKSPACE', links: [
		{ label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
		{ label: 'Markets', to: '/market', icon: Activity },
		{ label: 'Trading terminal', to: '/terminal', icon: ChartNoAxesCombined },
	] },
	{ label: 'MANAGE', links: [
		{ label: 'Portfolio', to: '/portfolio', icon: Wallet, badge: '4' },
		{ label: 'Algorithms', to: '/algo/strategies', icon: Command },
		{ label: 'AI predictions', to: '/prediction', icon: Bot },
		{ label: 'Alerts', to: '/alerts', icon: Bell },
		{ label: 'AI assistant', to: '/ai', icon: Bot },
		{ label: 'Reports', to: '/reports', icon: FileText },
	] },
]


type SidebarProps = { collapsed: boolean; onToggle: () => void }

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
	const { user, logout } = useAuth()
	const navigate = useNavigate()
	function signOut() {
		logout()
		navigate('/auth/login', { replace: true })
	}
	return (
		<aside className="sidebar">
			<div className="brand"><Link className="brand-home" to="/dashboard"><span className="brand-mark"><ChartNoAxesCombined size={19} /></span><span>invexia<span className="brand-period">.</span></span></Link><button className="icon-button sidebar-collapse" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={onToggle}><PanelLeftClose size={17} /></button></div>
			<Link className="account-switcher" to="/settings/brokers"><span className="account-avatar">{user?.name?.slice(0, 1).toUpperCase() ?? 'I'}</span><span className="account-copy"><strong>Personal account</strong><small>Paper trading</small></span><ChevronDown size={15} /></Link>
			<nav className="side-navigation" aria-label="Main navigation">
				{sections.map((section) => <div className="nav-section" key={section.label}>
					<p className="nav-label">{section.label}</p>
					{section.links.map(({ label, to, icon: Icon, badge }) => <NavLink key={to} to={to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><Icon size={17} strokeWidth={1.8} /><span>{label}</span>{badge && <span className="nav-badge">{badge}</span>}</NavLink>)}
				</div>)}
			</nav>
			<div className="sidebar-bottom">
				<NavLink to="/settings" className="nav-link"><Settings2 size={17} /><span>Settings</span></NavLink>
				<NavLink to="/admin" className="nav-link"><Shield size={17} /><span>Administration</span></NavLink>
				<a className="nav-link" href="mailto:support@invexia.io"><CircleHelp size={17} /><span>Help center</span><span className="external-mark">↗</span></a>
				<div className="sidebar-user"><span className="user-avatar">{user?.name?.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() ?? 'IX'}</span><span className="account-copy"><strong>{user?.name ?? 'Invexia user'}</strong><small>{user?.email ?? ''}</small></span><Link className="icon-button profile-button" to="/settings/profile" aria-label="Profile settings"><Settings2 size={15} /></Link><button className="icon-button sign-out-button" onClick={signOut} aria-label="Sign out" title="Sign out"><LogOut size={15} /></button></div>
			</div>
		</aside>
	)
}
