import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <header className="w-full bg-slate-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link to="/dashboard" className="text-2xl font-bold">
            KNKO Dashboard
          </Link>
          <div className="flex gap-6">
            <Link to="/dashboard" className="hover:text-slate-300 transition-colors">
              Dashboard
            </Link>
            <Link to="/dashboard/appointment" className="hover:text-slate-300 transition-colors">
              Appointments
            </Link>
            <Link to="/dashboard/services" className="hover:text-slate-300 transition-colors">
              Services
            </Link>
            <Link to="/dashboard/wellness" className="hover:text-slate-300 transition-colors">
              Wellness
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header
