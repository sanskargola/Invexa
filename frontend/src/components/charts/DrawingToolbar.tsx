import { Minus, MousePointer2, TrendingUp } from 'lucide-react'

export type DrawingTool = 'cursor' | 'horizontal' | 'trend'

type DrawingToolbarProps = { activeTool: DrawingTool; onToolChange: (tool: DrawingTool) => void }

const tools: { value: DrawingTool; label: string; icon: typeof MousePointer2 }[] = [
	{ value: 'cursor', label: 'Cursor', icon: MousePointer2 },
	{ value: 'trend', label: 'Trend line', icon: TrendingUp },
	{ value: 'horizontal', label: 'Horizontal price line', icon: Minus },
]

export default function DrawingToolbar({ activeTool, onToolChange }: DrawingToolbarProps) {
	return <div className="drawing-toolbar" role="group" aria-label="Drawing tools">{tools.map(({ value, label, icon: Icon }) => <button key={value} title={label} aria-label={label} aria-pressed={activeTool === value} className={activeTool === value ? 'selected' : ''} onClick={() => onToolChange(value)}><Icon size={15} /></button>)}</div>
}
