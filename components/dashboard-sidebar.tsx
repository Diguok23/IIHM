"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Home,
  MessageSquare,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const isActive = (path) => {
    return pathname === path || pathname?.startsWith(path + "/")
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "My Courses",
      href: "/dashboard/courses",
      icon: BookOpen,
    },
    {
      name: "Certifications",
      href: "/dashboard/certifications",
      icon: FileText,
    },
    {
      name: "Schedule",
      href: "/dashboard/schedule",
      icon: Calendar,
    },
    {
      name: "Assignments",
      href: "/dashboard/assignments",
      icon: FileText,
    },
    {
      name: "Messages",
      href: "/dashboard/messages",
      icon: MessageSquare,
    },
    {
      name: "Billing",
      href: "/dashboard/billing",
      icon: CreditCard,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  return (
    <aside
      className={cn(
        "bg-white border-r transition-all duration-300 ease-in-out h-[calc(100vh-4rem)] sticky top-16",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <item.icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4">
          <div className={cn("bg-primary/10 text-primary rounded-md p-3", collapsed ? "text-center" : "text-left")}>
            {!collapsed && (
              <>
                <h4 className="font-medium">Need Help?</h4>
                <p className="text-xs mt-1">Contact our support team for assistance.</p>
              </>
            )}
            {collapsed && <MessageSquare className="h-5 w-5 mx-auto" />}
          </div>
        </div>
      </div>
    </aside>
  )
}
