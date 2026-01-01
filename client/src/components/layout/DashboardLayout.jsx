import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex bg-[#f9f7f5]">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* <Header /> */}
        <main className="flex-1">
          <Outlet />
        </main>
        {/* <Footer /> */}
      </div>
    </div>
  )
}

export default DashboardLayout
