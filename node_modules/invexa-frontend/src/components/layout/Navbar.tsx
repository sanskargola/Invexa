import { Link, useLocation } from 'react-router-dom'
import { Activity, BarChart2, Bell, Cpu, LayoutDashboard, LineChart, Shield, Sliders } from 'lucide-react'

export default function Navbar() {
  const location = useLocation()

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/market', label: 'Markets', icon: BarChart2 },
    { to: '/terminal', label: 'Terminal', icon: LineChart },
    { to: '/portfolio', label: 'Portfolio', icon: Activity },
    { to: '/algo', label: 'Algorithms', icon: Cpu },
    { to: '/prediction', label: 'Predictions', icon: Sliders },
    { to: '/alerts', label: 'Alerts', icon: Bell },
    { to: '/admin', label: 'Admin', icon: Shield },
  ]

  return (
    <nav className="flex items-center space-x-1 border-b border-[#262c28] bg-[#111613] px-4 py-2">
      {links.map((link) => {
        const Icon = link.icon
        const active = location.pathname.startsWith(link.to)
        return (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              active
                ? 'bg-[#1e2621] text-[#c0dc7c]'
                : 'text-[#859288] hover:bg-[#18201b] hover:text-[#e4eae5]'
            }`}
          >
            <Icon size={14} />
            <span>{link.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
