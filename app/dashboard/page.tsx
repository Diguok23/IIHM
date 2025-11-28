"use client"

import { useEffect, useState } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Users, TrendingUp, Award, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

interface Application {
  id: string
  program_name: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  certification_id?: string
}

interface Enrollment {
  id: string
  certification_id: string
  status: "pending" | "active" | "completed"
  progress: number
  created_at: string
  certification: {
    title: string
    category: string
  }
}

interface DashboardStats {
  totalApplications: number
  pendingApplications: number
  approvedApplications: number
  rejectedApplications: number
  activeCourses: number
  completedCourses: number
  totalProgress: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    activeCourses: 0,
    completedCourses: 0,
    totalProgress: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchDashboardData = async () => {
      try {
        const supabase = createSupabaseClient()

        // Get current user
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (!mounted || !currentUser) return

        setUser(currentUser)

        // Fetch user's applications
        const { data: applicationsData, error: applicationsError } = await supabase
          .from("applications")
          .select("*")
          .eq("email", currentUser.email)
          .order("created_at", { ascending: false })

        if (!mounted) return

        if (applicationsError) {
          console.error("Error fetching applications:", applicationsError)
        }

        const userApplications = applicationsData || []
        setApplications(userApplications)

        // Fetch user's course enrollments
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from("user_enrollments")
          .select(`
            id,
            certification_id,
            status,
            progress,
            created_at,
            certifications:certification_id (
              title,
              category
            )
          `)
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })

        if (!mounted) return

        if (enrollmentsError) {
          console.error("Error fetching enrollments:", enrollmentsError)
        }

        const userEnrollments = enrollmentsData || []
        setEnrollments(userEnrollments)

        // Calculate stats
        const totalApplications = userApplications.length
        const pendingApplications = userApplications.filter((app) => app.status === "pending").length
        const approvedApplications = userApplications.filter((app) => app.status === "approved").length
        const rejectedApplications = userApplications.filter((app) => app.status === "rejected").length

        const activeCourses = userEnrollments.filter((enrollment) => enrollment.status === "active").length
        const completedCourses = userEnrollments.filter((enrollment) => enrollment.status === "completed").length
        const totalProgress =
          userEnrollments.length > 0
            ? Math.round(
                userEnrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0) / userEnrollments.length,
              )
            : 0

        if (mounted) {
          setStats({
            totalApplications,
            pendingApplications,
            approvedApplications,
            rejectedApplications,
            activeCourses,
            completedCourses,
            totalProgress,
          })
        }
      } catch (error) {
        if (mounted) {
          console.error("Error fetching dashboard data:", error)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    fetchDashboardData()

    return () => {
      mounted = false
    }
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "approved":
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "completed":
        return <Award className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      approved: "default",
      rejected: "destructive",
      active: "default",
      completed: "secondary",
    }

    const colors: Record<string, string> = {
      pending: "text-yellow-700 bg-yellow-50 border-yellow-200",
      approved: "text-green-700 bg-green-50 border-green-200",
      rejected: "text-red-700 bg-red-50 border-red-200",
      active: "text-blue-700 bg-blue-50 border-blue-200",
      completed: "text-purple-700 bg-purple-50 border-purple-200",
    }

    return (
      <Badge variant={variants[status] || "outline"} className={`text-xs ${colors[status] || ""}`}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-12 animate-pulse mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student"}!
        </h1>
        <p className="text-muted-foreground">Here's an overview of your learning journey with APMIH.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">{stats.pendingApplications} pending approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCourses}</div>
            <p className="text-xs text-muted-foreground">Currently enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
            <p className="text-xs text-muted-foreground">Certifications earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProgress}%</div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with your learning journey</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Button asChild className="w-full">
            <Link href="/certifications">
              <BookOpen className="mr-2 h-4 w-4" />
              Browse Certifications
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full bg-transparent">
            <Link href="/apply">
              <Users className="mr-2 h-4 w-4" />
              Submit Application
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full bg-transparent">
            <Link href="/dashboard/courses">
              <Award className="mr-2 h-4 w-4" />
              My Courses
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Applications Status */}
      <Card>
        <CardHeader>
          <CardTitle>My Applications</CardTitle>
          <CardDescription>Track the status of your certification applications</CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(application.status)}
                    <div>
                      <p className="text-sm font-medium">{application.program_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Applied on {new Date(application.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(application.status)}
                    {application.status === "approved" && (
                      <Button size="sm" variant="outline" asChild>
                        <Link href="/dashboard/certifications">Start Course</Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start by browsing our certifications and submitting an application.
              </p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/certifications">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Browse Certifications
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Courses */}
      {enrollments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
            <CardDescription>Continue your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(enrollment.status)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{enrollment.certification.title}</p>
                      <p className="text-xs text-muted-foreground mb-2">{enrollment.certification.category}</p>
                      {enrollment.status === "active" && (
                        <div className="w-full max-w-xs">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{enrollment.progress}%</span>
                          </div>
                          <Progress value={enrollment.progress} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(enrollment.status)}
                    {enrollment.status === "active" && (
                      <Button size="sm" asChild>
                        <Link href={`/dashboard/courses/${enrollment.certification_id}`}>Continue</Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <div className="space-y-2 text-sm">
            <p>
              <strong>1. Apply:</strong> Submit an application for your desired certification
            </p>
            <p>
              <strong>2. Review:</strong> Our admin team will review your application
            </p>
            <p>
              <strong>3. Approval:</strong> Once approved, you can access the course materials
            </p>
            <p>
              <strong>4. Learn:</strong> Complete the course at your own pace
            </p>
            <p>
              <strong>5. Certify:</strong> Earn your professional certification upon completion
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
