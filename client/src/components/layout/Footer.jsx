import React from 'react'

const Footer = () => {
  return (
    <footer className="w-full bg-slate-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-sm text-slate-300">
            © {new Date().getFullYear()} KNKO Dashboard. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
