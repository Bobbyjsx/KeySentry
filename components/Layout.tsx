"use client"

import React from "react"
import Navbar from "./Navbar"
import { Sidebar } from "./Sidebar"
import { useGetSettings } from "@/hooks/data/useSettings/useSettings"
import OnboardingWizard from "./onboarding/OnboardingWizard"
import { isServerError } from "@/lib/server-error"

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const { data: settings, isLoading, refetch } = useGetSettings()
  const [showOnboarding, setShowOnboarding] = React.useState(false)

  React.useEffect(() => {
    if (!isLoading && settings && !isServerError(settings) && !settings.hasGithubToken) {
      setShowOnboarding(true)
    } else {
      setShowOnboarding(false)
    }
  }, [settings, isLoading])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex h-screen bg-canvas text-white font-sans">
      {showOnboarding && (
        <OnboardingWizard onComplete={() => {
          refetch()
          setShowOnboarding(false)
        }} />
      )}

      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-canvas p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}

export default Layout
