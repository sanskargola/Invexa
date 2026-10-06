import { useState } from 'react'
import { Bell, Check, Info } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const notifications = [
    { id: '1', title: 'NVDA target reached', time: '5m ago', unread: true },
    { id: '2', title: 'Order ORD-109281 Filled', time: '1h ago', unread: false },
    { id: '3', title: 'Risk parameters normal', time: '3h ago', unread: false },
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[#2a342d] bg-[#161d18] text-[#a4b3a8] transition-colors hover:border-[#3d4d42] hover:text-[#fff]"
        aria-label="Notifications"
      >
        <Bell size={15} />
        <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-[#c0dc7c]" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl border border-[#2a342d] bg-[#141a16] p-3 shadow-2xl z-50">
          <div className="mb-2 flex items-center justify-between border-b border-[#242c26] pb-2">
            <span className="text-xs font-semibold text-[#e4eae5]">Notifications</span>
            <Link to="/alerts" onClick={() => setOpen(false)} className="text-[10px] text-[#c0dc7c] hover:underline">
              View alerts
            </Link>
          </div>
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-2.5 rounded-lg bg-[#18201a] p-2 text-xs transition-colors hover:bg-[#1e2721]"
              >
                <div className="mt-0.5 text-[#c0dc7c]">
                  <Info size={13} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#e4eae5]">{n.title}</p>
                  <span className="text-[10px] text-[#718075]">{n.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
