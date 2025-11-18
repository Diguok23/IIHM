"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, BookOpen, Clock, Award } from 'lucide-react'
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

interface Course {
  id: string
  title: string
  description: string
  level: string
  category: string
  duration: string | null
  instructor: string | null
  progress?: number
}

export default function MyCoursesPage() {
  const supabase = createClientComponentClient()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        // Fetch enrollments with course details
        const response = await fetch(`/api/user-enrollments?user_id=${user.id}`)
        const data = await response.json()
        
        if (data.enrollments) {
          // Transform enrollment data to course format
          // Assuming the API returns course details within the enrollment object or we need to fetch them
          // Based on previous context, let's assume we get the course details joined
          const enrolledCourses = data.enrollments.map((enrollment: any) => ({
            id: enrollment.certification.id,
            title: enrollment.certification.title,
            description: enrollment.certification.description,
            level: enrollment.certification.level,
            category: enrollment.certification.category,
            duration: enrollment.certification.duration,
            instructor: enrollment.certification.instructor,
            progress: enrollment.progress || 0,
            enrollmentId: enrollment.id
          }))
          setCourses(enrolledCourses)
        }
      } catch (error) {
        console.error("Error loading courses:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground">Continue learning where you left off</p>
      </div>

      {courses.length === 0 ? (
        <Card className="py-12">
          <div className="text-center space-y-4">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No courses yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                You haven't enrolled in any courses yet. Browse our catalog to get started.
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/certifications">Browse Certifications</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <Badge variant="outline">{course.category}</Badge>
                  <Badge variant="secondary">{course.level}</Badge>
                </div>
                <CardTitle className="line-clamp-2 mt-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  {course.instructor && (
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <span>{course.instructor}</span>
                    </div>
                  )}
                  {course.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                  )}
                </div>

                <div className="mt-auto space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                  <Button asChild className="w-full mt-4">
                    <Link href={`/dashboard/courses/${course.id}`}>
                      Continue Learning
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
