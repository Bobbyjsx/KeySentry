"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Database, Settings, Shield, AlertTriangle, BarChart, X } from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  toggleSidebar: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile sidebar backdrop */}
      <div
        className={`fixed inset-0 z-20 transition-opacity bg-black bg-opacity-50 lg:hidden ${
          isOpen ? "opacity-100 ease-out duration-300" : "opacity-0 ease-in duration-200 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 shadow-lg transform transition-transform lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? "translate-x-0 ease-out duration-300" : "-translate-x-full ease-in duration-200"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-indigo-500" />
            <span className="ml-2 text-xl font-semibold text-white">KeySentry</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="rounded-md text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white lg:hidden"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                className={`flex items-center px-4 py-2 rounded-md group transition-colors ${
                  pathname === "/" ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <LayoutDashboard
                  className={`mr-3 h-5 w-5 ${pathname === "/" ? "text-white" : "text-gray-400 group-hover:text-white"}`}
                />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/discoveries"
                className={`flex items-center px-4 py-2 rounded-md group transition-colors ${
                  pathname === "/discoveries"
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <Database
                  className={`mr-3 h-5 w-5 ${
                    pathname === "/discoveries" ? "text-white" : "text-gray-400 group-hover:text-white"
                  }`}
                />
                Discoveries
              </Link>
            </li>
            <li>
              <Link
                href="/alerts"
                className={`flex items-center px-4 py-2 rounded-md group transition-colors ${
                  pathname === "/alerts" ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <AlertTriangle
                  className={`mr-3 h-5 w-5 ${
                    pathname === "/alerts" ? "text-white" : "text-gray-400 group-hover:text-white"
                  }`}
                />
                Alerts
              </Link>
            </li>
            <li>
              <Link
                href="/analytics"
                className={`flex items-center px-4 py-2 rounded-md group transition-colors ${
                  pathname === "/analytics"
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <BarChart
                  className={`mr-3 h-5 w-5 ${
                    pathname === "/analytics" ? "text-white" : "text-gray-400 group-hover:text-white"
                  }`}
                />
                Analytics
              </Link>
            </li>
          </ul>

          <div className="pt-4 mt-6 border-t border-gray-700">
            <Link
              href="/settings"
              className={`flex items-center px-4 py-2 rounded-md group transition-colors ${
                pathname === "/settings" ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <Settings
                className={`mr-3 h-5 w-5 ${
                  pathname === "/settings" ? "text-white" : "text-gray-400 group-hover:text-white"
                }`}
              />
              Settings
            </Link>
          </div>
        </nav>
      </div>
    </>
  )
}

export default Sidebar
