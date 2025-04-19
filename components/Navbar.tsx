"use client"

import { Bell, Menu, Search } from "lucide-react"
import type React from "react"
import { useSupabase } from "./auth/AuthProvider"

interface NavbarProps {
  toggleSidebar: () => void
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const {user }= useSupabase()
  return (
    <header className="bg-gray-800 shadow-md z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white focus:outline-none focus:text-white md:hidden"
          >
            <Menu size={24} />
          </button>
          {/* <div className="hidden md:flex items-center ml-4">
            <Shield className="h-8 w-8 text-indigo-500" />
            <span className="ml-2 text-xl font-semibold">KeySentry</span>
          </div> */}
        </div>

        <div className="flex-1 mx-4 md:mx-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for keys, providers, or domains..."
              className="block w-full pl-10 pr-3 py-2 rounded-md bg-gray-700 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center">
          <button className="p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <Bell size={20} />
          </button>
{user?.user_metadata?.name && (
          <div className="ml-4 relative flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-sm font-medium">{user?.user_metadata?.name}</span>
            </div>
          </div>
)}
        </div>
      </div>
    </header>
  )
}

export default Navbar
