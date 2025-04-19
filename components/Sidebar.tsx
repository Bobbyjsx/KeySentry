
import { AlertTriangle, BarChart, Database, LayoutDashboard, LogOut, Settings, Shield, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"
import LogoutButton from "./auth/LogoutButton"

interface SidebarProps {
  isOpen: boolean
  toggleSidebar: () => void
}

interface NavLinkProps {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
  className?: string
}

const NavLink: React.FC<NavLinkProps> = ({ href, icon, children, className }) => {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`flex items-center px-4 py-2 rounded-md group transition-colors ${
        isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
      } ${className}`}
    >
      {React.cloneElement(icon as React.ReactElement, {
        // @ts-expect-error expected error
        className: `mr-3 h-5 w-5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}`
      })}
      {children}
    </Link>
  )
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      <div
        className={`fixed inset-0 z-20 transition-opacity bg-black bg-opacity-50 lg:hidden ${
          isOpen ? "opacity-100 ease-out duration-300" : "opacity-0 ease-in duration-200 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      />

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
            <li><NavLink href="/" icon={<LayoutDashboard />}>Dashboard</NavLink></li>
            <li><NavLink href="/discoveries" icon={<Database />}>Discoveries</NavLink></li>
            <li><NavLink href="/alerts" icon={<AlertTriangle />}>Alerts</NavLink></li>
            <li><NavLink href="/analytics" icon={<BarChart />}>Analytics</NavLink></li>
          </ul>

          <div className="pt-4 mt-6 border-t border-gray-700">
            <NavLink href="/settings" icon={<Settings />}>Settings</NavLink>
          </div>
        </nav>

        <section className="absolute bottom-3 w-full px-3">
          <LogoutButton className="w-full">
            <div className="flex items-center px-4 py-2 rounded-md group transition-colors bg-gray-700 text-white">
              <LogOut size={20} className="mr-3 h-5 w-5"/>
              Sign out
            </div>
          </LogoutButton>
        </section>
      </div>
    </>
  )
}
