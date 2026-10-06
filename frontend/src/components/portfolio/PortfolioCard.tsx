import type { ReactNode } from 'react'

interface PortfolioCardProps {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export default function PortfolioCard({
  title,
  subtitle,
  action,
  children,
  className = '',
}: PortfolioCardProps) {
  return (
    <div className={`rounded-xl border border-[#232c25] bg-[#121814] p-5 shadow-sm ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#e4eae5]">{title}</h3>
          {subtitle && <p className="text-xs text-[#78887c]">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div>{children}</div>
    </div>
  )
}
