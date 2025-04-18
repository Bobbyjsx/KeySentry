import type React from "react"
import { AlertTriangle, Shield, Key, Database } from "lucide-react"

interface StatsCardsProps {
  stats?: {
    total: number
    highRisk: number
    providers: number
    sources: number
  }
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats = { total: 0, highRisk: 0, providers: 0, sources: 0 } }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-lg p-4 shadow-lg border border-indigo-700">
        <div className="flex justify-between">
          <div>
            <p className="text-indigo-300 text-sm font-medium">Total Discoveries</p>
            <p className="text-white text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="p-2 bg-indigo-800 rounded-lg">
            <Key className="h-6 w-6 text-indigo-300" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-indigo-300 text-xs">
            <span className="text-green-400">+12%</span> from last week
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-lg p-4 shadow-lg border border-red-700">
        <div className="flex justify-between">
          <div>
            <p className="text-red-300 text-sm font-medium">High Risk Keys</p>
            <p className="text-white text-2xl font-bold">{stats.highRisk}</p>
          </div>
          <div className="p-2 bg-red-800 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-red-300" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-red-300 text-xs">
            <span className="text-red-400">+5%</span> from last week
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-4 shadow-lg border border-green-700">
        <div className="flex justify-between">
          <div>
            <p className="text-green-300 text-sm font-medium">Protected Services</p>
            <p className="text-white text-2xl font-bold">{stats.providers}</p>
          </div>
          <div className="p-2 bg-green-800 rounded-lg">
            <Shield className="h-6 w-6 text-green-300" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-green-300 text-xs">
            <span className="text-green-400">+2</span> new this month
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-4 shadow-lg border border-purple-700">
        <div className="flex justify-between">
          <div>
            <p className="text-purple-300 text-sm font-medium">Scanned Sources</p>
            <p className="text-white text-2xl font-bold">{stats.sources}</p>
          </div>
          <div className="p-2 bg-purple-800 rounded-lg">
            <Database className="h-6 w-6 text-purple-300" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-purple-300 text-xs">
            <span className="text-green-400">+{stats.sources}</span> in the last 24h
          </p>
        </div>
      </div>
    </div>
  )
}

export default StatsCards
