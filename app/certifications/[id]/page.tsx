"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, BookOpen, Users, Clock, Award } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import Footer from "@/components/footer"

export default function CertificationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [certification, setCertification] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const fetchCertification = async () => {
      try {
        setIsLoading(true)
        const supabase = createSupabaseClient()

        // Check authentication
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setIsAuthenticated(!!session)

        // Fetch certification details
        const response = await fetch(`/api/certifications/${params.id}`)
        if (!response.ok) throw new Error("Failed to fetch certification")
        const data = await response.json()
        setCertification(data)
      } catch (error) {
        console.error("Error:", error)
        toast({
          title: "Error",
          description: "Failed to load certification details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchCertification()
    }
  }, [params.id, toast])

  const handleApply = () => {
    if (!isAuthenticated) {
      router.push(
        `/apply?program=${encodeURIComponent(certification?.title || "")}&category=${certification?.category || ""}`,
      )
      return
    }
    // Authenticated users also go to apply page
    router.push(
      `/apply?program=${encodeURIComponent(certification?.title || "")}&category=${certification?.category || ""}`,
    )
  }

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </>
    )
  }

  if (!certification) {
    return (
      <>
        <div className="container mx-auto px-4 py-16">
          <Card>
            <CardContent className="pt-6 text-center">
              <h2 className="text-2xl font-bold mb-4">Certification Not Found</h2>
              <p className="text-gray-600 mb-6">We couldn't find the certification you're looking for.</p>
              <Button asChild>
                <Link href="/certifications">Back to Certifications</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button variant="ghost" className="mb-6" asChild>
            <Link href="/certifications">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Certifications
            </Link>
          </Button>

          {/* Certification Details */}
          <Card className="max-w-4xl">
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Badge className="mb-4">{certification.category}</Badge>
                  <CardTitle className="text-3xl">{certification.title}</CardTitle>
                </div>
                <div className="text-3xl font-bold text-primary ml-4">${certification.price}</div>
              </div>
              <CardDescription className="text-base">{certification.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Overview */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm text-gray-500">Level</p>
                    <p className="font-semibold">{certification.level}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-semibold">{certification.duration || "Self-paced"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Format</p>
                    <p className="font-semibold">Online</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-semibold">Open</p>
                  </div>
                </div>
              </div>

              {/* What You'll Learn */}
              <div>
                <h3 className="text-xl font-semibold mb-4">What You'll Learn</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>Comprehensive knowledge of {certification.title}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>Industry-recognized certification upon completion</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>Practical skills applicable to your career</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>Access to study materials and resources</span>
                  </li>
                </ul>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Requirements</h3>
                <ul className="space-y-2 text-gray-600 list-disc list-inside">
                  <li>High school diploma or equivalent</li>
                  <li>Basic computer literacy</li>
                  <li>Commitment to complete the program</li>
                  <li>Minimum 10 hours per week availability</li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="bg-gray-50 flex gap-4">
              <Button asChild variant="outline" className="flex-1 bg-transparent">
                <Link href="/certifications">View Other Certifications</Link>
              </Button>
              <Button onClick={handleApply} className="flex-1">
                Apply Now
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  )
}
