"use client"

import { useEffect, useState } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Application {
  id: string
  program_name: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchApplications = async () => {
      try {
        const supabase = createSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!mounted || !user) return

        const { data, error } = await supabase
          .from("applications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (!mounted) return

        if (error) {
          console.error("Error fetching applications:", error)
          return
        }

        setApplications(data || [])
      } catch (error) {
        console.error("Error:", error)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    fetchApplications()

    return () => {
      mounted = false
    }
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    }

    return <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>{status.toUpperCase()}</Badge>
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading your applications...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
        <p className="text-muted-foreground mt-2">Track the status of your certification applications</p>
      </div>

      {applications.length > 0 ? (
        <div className="grid gap-4">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(application.status)}
                    <div>
                      <p className="font-medium">{application.program_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Applied on {new Date(application.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(application.status)}
                    {application.status === "approved" && (
                      <Button size="sm" asChild>
                        <Link href="/dashboard/courses">View Course</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
            <p className="text-muted-foreground mb-6">You haven't submitted any applications yet.</p>
            <Button asChild>
              <Link href="/apply">Submit Application</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
