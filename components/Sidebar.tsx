
import { AlertTriangle, BarChart, Database, LayoutDashboard, LogOut, Search, Settings, Shield, X } from "lucide-react"
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
      className={`flex items-center px-4 py-2.5 rounded-pill border font-mono text-xs uppercase tracking-caption-mono-sm transition-colors ${
        isActive
          ? "bg-white text-canvas border-white font-normal"
          : "text-gray-400 border-transparent hover:text-white hover:border-white/30"
      } ${className}`}
    >
      {React.cloneElement(icon as React.ReactElement, {
        // @ts-expect-error expected error
        className: `mr-3 h-4 w-4 ${isActive ? "text-canvas" : "text-gray-500 group-hover:text-white"}`
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
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-canvas-card border-r border-hairline transform transition-transform lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? "translate-x-0 ease-out duration-300" : "-translate-x-full ease-in duration-200"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-hairline">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-white" />
            <span className="text-xl font-light text-white tracking-display-sm">KeySentry</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="rounded-pill p-1 border border-hairline text-gray-400 hover:text-white focus:outline-none lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="p-4 flex flex-col justify-between h-[calc(100%-80px)]">
          <ul className="space-y-2">
            <div className="px-4 py-2 font-mono text-[10px] uppercase text-gray-500 tracking-widest">Navigation</div>
            <li><NavLink href="/" icon={<LayoutDashboard />}>Dashboard</NavLink></li>
            <li><NavLink href="/scan" icon={<Search />}>Scans</NavLink></li>
            <li><NavLink href="/discoveries" icon={<Database />}>Discoveries</NavLink></li>
            <li><NavLink href="/alerts" icon={<AlertTriangle />}>Alerts</NavLink></li>
            
            <div className="border-t border-hairline pt-4 mt-4">
              <li><NavLink href="/settings" icon={<Settings />}>Settings</NavLink></li>
            </div>
          </ul>

          <section className="px-2 pb-4">
            <LogoutButton className="w-full">
              <div className="flex items-center justify-center px-4 py-2.5 rounded-pill border border-hairline hover:border-white hover:text-white text-gray-400 font-mono text-xs uppercase tracking-caption-mono-sm transition-colors cursor-pointer">
                <LogOut size={14} className="mr-2"/>
                Sign out
              </div>
            </LogoutButton>
          </section>
        </nav>
      </div>
    </>
  )
}
