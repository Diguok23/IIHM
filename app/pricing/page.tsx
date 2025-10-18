"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Star, Users, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

interface Certification {
  id: string
  title: string
  description: string
  price: number
  level: string
  duration: string
  instructor_name: string
  rating: number
  students_count: number
}

export default function PricingPage() {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterLevel, setFilterLevel] = useState<string>("all")

  const DST_TAX_RATE = 0.16

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error("Supabase configuration is missing")
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        const { data, error: fetchError } = await supabase
          .from("certifications")
          .select("id, title, description, price, level, duration, instructor_name, rating, students_count")
          .order("created_at", { ascending: false })

        if (fetchError) {
          throw new Error("Failed to fetch certifications")
        }

        setCertifications(data || [])
      } catch (err) {
        console.error("Error fetching certifications:", err)
        setError(err instanceof Error ? err.message : "Failed to load certifications")
      } finally {
        setLoading(false)
      }
    }

    fetchCertifications()
  }, [])

  const filteredCertifications =
    filterLevel === "all"
      ? certifications
      : certifications.filter((cert) => cert.level?.toLowerCase() === filterLevel.toLowerCase())

  const totalAllCourses = certifications.reduce((sum, cert) => sum + (cert.price || 0), 0)
  const totalWithTax = totalAllCourses * (1 + DST_TAX_RATE)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-muted-foreground font-medium">Loading pricing information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Course Pricing</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transparent pricing for all our professional certifications. All prices include materials and support.
          </p>
        </div>

        {/* Bundle Summary */}
        <Card className="mb-12 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              Complete Program Bundle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Courses</p>
                <p className="text-3xl font-bold">{certifications.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Cost (Base)</p>
                <p className="text-3xl font-bold text-orange-600">${totalAllCourses.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total with DST (16%)</p>
                <p className="text-3xl font-bold text-green-600">${totalWithTax.toFixed(2)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Enroll in all courses and get access to complete professional training
            </p>
          </CardContent>
        </Card>

        {/* Filter */}
        <div className="mb-8 flex gap-2 flex-wrap">
          <Button
            variant={filterLevel === "all" ? "default" : "outline"}
            onClick={() => setFilterLevel("all")}
            className="rounded-full"
          >
            All Levels
          </Button>
          <Button
            variant={filterLevel === "beginner" ? "default" : "outline"}
            onClick={() => setFilterLevel("beginner")}
            className="rounded-full"
          >
            Beginner
          </Button>
          <Button
            variant={filterLevel === "intermediate" ? "default" : "outline"}
            onClick={() => setFilterLevel("intermediate")}
            className="rounded-full"
          >
            Intermediate
          </Button>
          <Button
            variant={filterLevel === "advanced" ? "default" : "outline"}
            onClick={() => setFilterLevel("advanced")}
            className="rounded-full"
          >
            Advanced
          </Button>
        </div>

        {/* Courses Grid */}
        {filteredCertifications.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground text-lg">No courses found for this level</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertifications.map((cert) => {
              const basePrice = cert.price || 0
              const dstTax = basePrice * DST_TAX_RATE
              const totalPrice = basePrice + dstTax

              return (
                <Card key={cert.id} className="hover:shadow-lg transition-shadow flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge
                        className={
                          cert.level?.toLowerCase() === "beginner"
                            ? "bg-green-100 text-green-800"
                            : cert.level?.toLowerCase() === "intermediate"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {cert.level || "Beginner"}
                      </Badge>
                      {cert.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">{cert.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2">{cert.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{cert.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4">
                    {/* Course Details */}
                    <div className="space-y-2 text-sm">
                      {cert.instructor_name && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span>👨‍🏫 Instructor: {cert.instructor_name}</span>
                        </div>
                      )}
                      {cert.duration && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{cert.duration}</span>
                        </div>
                      )}
                      {cert.students_count && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{cert.students_count} students enrolled</span>
                        </div>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="bg-slate-50 p-3 rounded-lg space-y-1 border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Base Price</span>
                        <span className="font-semibold">${basePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">DST (16%)</span>
                        <span className="font-semibold">${dstTax.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-1 flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-green-600">${totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>

                  <div className="p-4 pt-0">
                    <Link href="/dashboard/certifications">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">View & Enroll</Button>
                    </Link>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What is included in the course fee?</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Each course includes access to all course materials, video lessons, practical exercises, assignments,
                and instructor support.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What is the DST Tax?</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                The DST (Domestic Service Tax) at 16% is added to all course fees. The total amount includes this tax
                and is the final amount you'll pay.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I pay in installments?</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Payment arrangements can be made by contacting our finance team at{" "}
                <strong>finance@apmih.college</strong>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Please email <strong>finance@apmih.college</strong> for information about available payment methods.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Refund policy is determined on a case-by-case basis. Please contact our support team for details.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
