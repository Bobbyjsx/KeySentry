"use client"

import { Bell, Menu, Search } from "lucide-react"
import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useGetUnreadAlertsCount } from "@/hooks/data/useAlerts/useAlerts"
import { Input } from "@/components/ui/input"

interface NavbarProps {
  toggleSidebar: () => void
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { data: session } = useSession()
  const user = session?.user as any
  const { data: unreadCount = 0 } = useGetUnreadAlertsCount()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/discoveries?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleBellClick = () => {
    router.push("/alerts")
  }

  return (
    <header className="bg-canvas border-b border-hairline z-10">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white focus:outline-none focus:text-white md:hidden mr-4"
          >
            <Menu size={20} />
          </button>
        </div>

        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search for keys, providers, or domains..."
              leftNode={<Search size={16} className="text-gray-500" />}
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleBellClick}
            className="relative p-2 rounded-pill border border-hairline text-gray-400 hover:text-white focus:outline-none transition-colors"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-canvas">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
          {user?.name && (
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-pill border border-hairline bg-canvas-soft flex items-center justify-center">
                <span className="text-xs font-mono text-white">{user?.name.substring(0, 2).toUpperCase()}</span>
              </div>
              <span className="hidden sm:inline text-xs font-mono text-gray-400 uppercase tracking-wider">{user?.name}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
