"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { BookOpen, Clock, Calendar, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"

interface DashboardStats {
  enrolledCourses: number
  coursesInProgress: number
  averageProgress: number
  completedCourses: number
}

interface Course {
  id: string
  title: string
  progress: number
}

interface ScheduleItem {
  id: string
  title: string
  start_time: string
  event_type: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats>({
    enrolledCourses: 0,
    coursesInProgress: 0,
    averageProgress: 0,
    completedCourses: 0,
  })
  const [recentCourses, setRecentCourses] = useState<Course[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/login")
          return
        }

        setUser(session.user)

        // Fetch user courses
        const { data: coursesData, error: coursesError } = await supabase
          .from("user_courses")
          .select(`
            course_id,
            progress,
            status,
            last_accessed,
            certifications:course_id(
              id,
              title
            )
          `)
          .eq("user_id", session.user.id)
          .order("last_accessed", { ascending: false })

        if (coursesError) throw coursesError

        // Calculate stats
        const totalCourses = coursesData.length
        const inProgressCourses = coursesData.filter((c) => c.status === "in_progress").length
        const completedCourses = coursesData.filter((c) => c.status === "completed").length
        const totalProgress = coursesData.reduce((sum, course) => sum + course.progress, 0)
        const avgProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0

        setStats({
          enrolledCourses: totalCourses,
          coursesInProgress: inProgressCourses,
          averageProgress: avgProgress,
          completedCourses: completedCourses,
        })

        // Format recent courses
        const formattedCourses = coursesData.slice(0, 3).map((item) => ({
          id: item.course_id,
          title: item.certifications.title,
          progress: item.progress,
        }))

        setRecentCourses(formattedCourses)

        // Fetch upcoming schedule items
        const { data: scheduleData, error: scheduleError } = await supabase
          .from("user_schedules")
          .select("*")
          .eq("user_id", session.user.id)
          .gte("start_time", new Date().toISOString())
          .order("start_time")
          .limit(3)

        if (scheduleError) throw scheduleError

        setUpcomingEvents(scheduleData || [])
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [router, supabase])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div>
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Enrolled Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.enrolledCourses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Courses In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.coursesInProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Average Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.averageProgress}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completed Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completedCourses}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-bold mb-4">Recent Courses</h2>
          <Card className="mb-4">
            <CardContent className="p-0">
              {recentCourses.length > 0 ? (
                <ul className="divide-y">
                  {recentCourses.map((course) => (
                    <li key={course.id} className="p-4">
                      <Link href={`/dashboard/courses/${course.id}`} className="block hover:bg-gray-50 -m-4 p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">{course.title}</h3>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="mb-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-500">You haven't enrolled in any courses yet</p>
                  <Button variant="outline" className="mt-4" onClick={() => router.push("/certifications")}>
                    Browse Courses
                  </Button>
                </div>
              )}
            </CardContent>
            {recentCourses.length > 0 && (
              <CardFooter className="border-t px-4 py-3">
                <Button
                  variant="ghost"
                  className="w-full justify-center text-blue-600"
                  onClick={() => router.push("/dashboard/courses")}
                >
                  View All Courses
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Upcoming Schedule</h2>
          <Card>
            <CardContent className="p-0">
              {upcomingEvents.length > 0 ? (
                <ul className="divide-y">
                  {upcomingEvents.map((event) => (
                    <li key={event.id} className="p-4">
                      <div className="flex items-start">
                        <div
                          className={`p-2 rounded-full mr-3 ${
                            event.event_type === "class"
                              ? "bg-blue-100 text-blue-600"
                              : event.event_type === "exam"
                                ? "bg-red-100 text-red-600"
                                : "bg-green-100 text-green-600"
                          }`}
                        >
                          {event.event_type === "class" ? (
                            <BookOpen className="h-4 w-4" />
                          ) : event.event_type === "exam" ? (
                            <Clock className="h-4 w-4" />
                          ) : (
                            <Calendar className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{event.title}</h3>
                          <p className="text-sm text-gray-500">{formatDate(event.start_time)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-500">No upcoming events</p>
                </div>
              )}
            </CardContent>
            {upcomingEvents.length > 0 && (
              <CardFooter className="border-t px-4 py-3">
                <Button
                  variant="ghost"
                  className="w-full justify-center text-blue-600"
                  onClick={() => router.push("/dashboard/schedule")}
                >
                  View Full Schedule
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
