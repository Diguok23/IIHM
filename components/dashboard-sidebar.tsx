"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BookOpen,
  LayoutDashboard,
  GraduationCap,
  FileText,
  Settings,
  User,
  Calendar,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Certifications",
    href: "/dashboard/certifications",
    icon: GraduationCap,
  },
  {
    title: "My Courses",
    href: "/dashboard/courses",
    icon: BookOpen,
  },
  {
    title: "Applications",
    href: "/dashboard/applications",
    icon: FileText,
  },
  {
    title: "Schedule",
    href: "/dashboard/schedule",
    icon: Calendar,
  },
  {
    title: "Certificates",
    href: "/dashboard/certificates",
    icon: Award,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "relative flex flex-col border-r bg-white transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!isCollapsed && <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>}
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 w-8">
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isCollapsed ? "px-2" : "px-3",
                    isActive && "bg-primary/10 text-primary",
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isCollapsed ? "" : "mr-2")} />
                  {!isCollapsed && <span>{item.title}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-4">
        <Button variant="outline" className={cn("w-full", isCollapsed ? "px-2" : "px-3")} asChild>
          <Link href="/certifications">
            <BookOpen className={cn("h-4 w-4", isCollapsed ? "" : "mr-2")} />
            {!isCollapsed && "Browse All"}
          </Link>
        </Button>
      </div>
    </div>
  )
}
