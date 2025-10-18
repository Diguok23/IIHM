"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Search, Star, Users, Clock, Filter } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Certification {
  id: string
  title: string
  description: string
  price: number
  level: string
  duration: string
  rating: number
  student_count: number
}

export default function DashboardPricingPage() {
  const [loading, setLoading] = useState(true)
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [filteredCertifications, setFilteredCertifications] = useState<Certification[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterLevel, setFilterLevel] = useState("all")
  const [error, setError] = useState<string | null>(null)

  const DST_TAX_RATE = 0.16

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        setLoading(true)
        setError(null)

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error("Supabase configuration is missing")
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        const { data, error: fetchError } = await supabase
          .from("certifications")
          .select("id, title, description, price, level, duration, rating, student_count")
          .order("created_at", { ascending: false })

        if (fetchError) {
          throw new Error(fetchError.message)
        }

        setCertifications(data || [])
        setFilteredCertifications(data || [])
      } catch (err) {
        console.error("Error fetching certifications:", err)
        const errorMessage = err instanceof Error ? err.message : "Failed to load pricing information"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCertifications()
  }, [])

  useEffect(() => {
    let filtered = certifications

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (cert) =>
          cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cert.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply level filter
    if (filterLevel !== "all") {
      filtered = filtered.filter((cert) => cert.level.toLowerCase() === filterLevel.toLowerCase())
    }

    setFilteredCertifications(filtered)
  }, [searchTerm, filterLevel, certifications])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-muted-foreground font-medium">Loading pricing information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600 font-semibold">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate totals
  const totalCost = certifications.reduce((sum, cert) => sum + (cert.price || 0), 0)
  const totalWithTax = totalCost * (1 + DST_TAX_RATE)
  const totalTax = totalWithTax - totalCost

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Course Pricing</h1>
        <p className="text-muted-foreground">Browse and compare all available certification programs</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{certifications.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Available certifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bundle Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">All courses combined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">With Tax (16%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">${totalWithTax.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Including DST</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterLevel} onValueChange={setFilterLevel}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Courses Grid */}
      {filteredCertifications.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-muted-foreground text-lg">No courses found matching your criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertifications.map((cert) => {
            const basePrice = cert.price || 0
            const dstTax = basePrice * DST_TAX_RATE
            const totalPrice = basePrice + dstTax

            return (
              <Card key={cert.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Header */}
                <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight">{cert.title}</CardTitle>
                      <Badge className="mt-2">{cert.level}</Badge>
                    </div>
                  </div>
                </CardHeader>

                {/* Content */}
                <CardContent className="pt-4 space-y-4">
                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2">{cert.description}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 py-3 border-y">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-muted-foreground">{cert.duration || "Self-paced"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-muted-foreground">{cert.student_count || 0} students</span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(cert.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">{(cert.rating || 0).toFixed(1)}</span>
                  </div>

                  {/* Pricing */}
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Base Price</span>
                      <span className="font-semibold">${basePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">DST Tax (16%)</span>
                      <span className="font-semibold">${dstTax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="text-lg font-bold text-green-600">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/dashboard/billing?certification=${cert.id}`} className="flex-1">
                      <Button className="w-full bg-green-600 hover:bg-green-700">Enroll Now</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* FAQ Section */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">What is the DST tax?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                DST (Digital Services Tax) is a 16% tax applied to all course fees as per local regulations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">When is payment due?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Payment is due within 7 days of enrollment to maintain active course access.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Can I get a refund?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Refunds are available within 14 days of enrollment if you haven't started the course.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Do you offer discounts?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Contact our finance team at finance@apmih.college for information about group discounts and promotional
                offers.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
