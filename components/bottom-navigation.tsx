"use client"

import { useState } from "react"
import { ShoppingBag, Briefcase, DollarSign, Car, Calendar } from "lucide-react"

const navItems = [
  { id: "market", label: "Market", icon: ShoppingBag },
  { id: "jobs", label: "Jobs", icon: Briefcase },
  { id: "prices", label: "Prices", icon: DollarSign },
  { id: "transport", label: "Transport", icon: Car },
  { id: "events", label: "Events", icon: Calendar },
]

export function BottomNavigation() {
  const [activeTab, setActiveTab] = useState("market")

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 transition-colors ${
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
