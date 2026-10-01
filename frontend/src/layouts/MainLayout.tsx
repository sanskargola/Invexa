import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'

export default function MainLayout() {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
	return (
		<div className={`app-shell${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
			<Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((value) => !value)} />
			<div className="workspace">
				<Header />
				<main className="page-content"><Outlet /></main>
			</div>
		</div>
	)
}
