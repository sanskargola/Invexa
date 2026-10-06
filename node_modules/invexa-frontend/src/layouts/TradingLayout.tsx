import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'

export default function TradingLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
