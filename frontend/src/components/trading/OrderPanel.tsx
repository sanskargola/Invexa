import type { ReactNode } from 'react'

interface OrderPanelProps {
  title: string
  children: ReactNode
  action?: ReactNode
}

export default function OrderPanel({ title, children, action }: OrderPanelProps) {
  return (
    <div className="rounded-xl border border-[#232c25] bg-[#121814] p-4">
      <div className="mb-3 flex items-center justify-between border-b border-[#212923] pb-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#9db0a1]">{title}</h4>
        {action && <div>{action}</div>}
      </div>
      <div>{children}</div>
    </div>
  )
}
