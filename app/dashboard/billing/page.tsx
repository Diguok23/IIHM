"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, AlertCircle, CheckCircle, DollarSign, TrendingUp, TrendingDown, Mail } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

interface Certification {
  id: string
  title: string
  price: number
}

interface Enrollment {
  id: string
  user_id: string
  certification_id: string
  status: string
  payment_status: string
  created_at: string
  due_date: string | null
}

interface EnrollmentWithDetails {
  enrollment: Enrollment
  certification: Certification | null
}

interface BillingStats {
  totalEnrollments: number
  totalCost: number
  totalPaid: number
  totalBalance: number
  dstTaxRate: number
}

export default function BillingDashboard() {
  const [loading, setLoading] = useState(true)
  const [enrollmentsData, setEnrollmentsData] = useState<EnrollmentWithDetails[]>([])
  const [stats, setStats] = useState<BillingStats>({
    totalEnrollments: 0,
    totalCost: 0,
    totalPaid: 0,
    totalBalance: 0,
    dstTaxRate: 0.16,
  })
  const [userId, setUserId] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setLoading(true)
        setError(null)

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error("Supabase configuration is missing")
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        // Get current user
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          throw new Error("Failed to get session")
        }

        if (!session?.user) {
          setError("Please log in to view billing")
          setLoading(false)
          return
        }

        setUserId(session.user.id)

        // Fetch user enrollments
        const { data: enrollmentsRaw, error: enrollmentError } = await supabase
          .from("user_enrollments")
          .select("id, user_id, certification_id, status, payment_status, created_at, due_date")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })

        if (enrollmentError) {
          console.error("Error fetching enrollments:", enrollmentError)
          throw new Error("Failed to fetch enrollments")
        }

        if (!enrollmentsRaw || enrollmentsRaw.length === 0) {
          setEnrollmentsData([])
          setStats({
            totalEnrollments: 0,
            totalCost: 0,
            totalPaid: 0,
            totalBalance: 0,
            dstTaxRate: 0.16,
          })
          setLoading(false)
          return
        }

        // Fetch certification details for each enrollment
        const certificationIds = enrollmentsRaw.map((e) => e.certification_id)
        const { data: certificationsRaw, error: certError } = await supabase
          .from("certifications")
          .select("id, title, price")
          .in("id", certificationIds)

        if (certError) {
          console.error("Error fetching certifications:", certError)
          throw new Error("Failed to fetch certification details")
        }

        // Create a map of certifications for easy lookup
        const certMap = new Map<string, Certification>()
        ;(certificationsRaw || []).forEach((cert) => {
          certMap.set(cert.id, {
            id: cert.id,
            title: cert.title || "Unknown Course",
            price: cert.price || 0,
          })
        })

        // Combine enrollments with certifications
        const enrollmentsWithDetails: EnrollmentWithDetails[] = enrollmentsRaw.map((enrollment) => ({
          enrollment,
          certification: certMap.get(enrollment.certification_id) || null,
        }))

        // Calculate stats
        let totalCost = 0
        let totalPaid = 0
        const DST_TAX_RATE = 0.16

        enrollmentsWithDetails.forEach(({ enrollment, certification }) => {
          if (certification) {
            const basePrice = certification.price || 0
            const dstTax = basePrice * DST_TAX_RATE
            const totalAmount = basePrice + dstTax

            totalCost += totalAmount

            // If payment status is "paid", add to total paid
            if (enrollment.payment_status === "paid") {
              totalPaid += totalAmount
            }
          }
        })

        const totalBalance = totalCost - totalPaid

        setEnrollmentsData(enrollmentsWithDetails)
        setStats({
          totalEnrollments: enrollmentsWithDetails.length,
          totalCost,
          totalPaid,
          totalBalance,
          dstTaxRate: DST_TAX_RATE,
        })
      } catch (err) {
        console.error("Error fetching billing data:", err)
        const errorMessage = err instanceof Error ? err.message : "Failed to load billing information"
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

    fetchBillingData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-muted-foreground font-medium">Loading billing information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Billing Dashboard</h1>
        <p className="text-muted-foreground">View your enrollment costs and payment status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Enrollments */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground mt-1">Active & Completed</p>
          </CardContent>
        </Card>

        {/* Total Cost */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">${stats.totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Including DST tax</p>
          </CardContent>
        </Card>

        {/* Total Paid */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">${stats.totalPaid.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalCost > 0 ? ((stats.totalPaid / stats.totalCost) * 100).toFixed(0) : 0}% Complete
            </p>
          </CardContent>
        </Card>

        {/* Outstanding Balance */}
        <Card className={stats.totalBalance > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Balance Due
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${stats.totalBalance > 0 ? "text-red-600" : "text-green-600"}`}>
              ${stats.totalBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalBalance > 0 ? "Amount outstanding" : "All paid up!"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Notice */}
      {stats.totalBalance > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-900 ml-2">
            <p className="font-semibold mb-1">⚠️ Outstanding Balance</p>
            <p className="text-sm mb-2">
              You have an outstanding balance of <strong>${stats.totalBalance.toFixed(2)}</strong>
            </p>
            <p className="text-sm">
              Please email <strong>finance@apmih.college</strong> to arrange payment.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Enrollments List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Enrollment Details</h2>

        {enrollmentsData.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground text-lg mb-4">No enrollments yet</p>
              <Link href="/dashboard/certifications">
                <Button>Browse Certifications</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {enrollmentsData.map(({ enrollment, certification }) => {
              if (!certification) {
                return (
                  <Card key={enrollment.id} className="border-gray-200 opacity-50">
                    <CardContent className="pt-6">
                      <p className="text-muted-foreground">Certification data unavailable</p>
                    </CardContent>
                  </Card>
                )
              }

              const basePrice = certification.price || 0
              const dstTax = basePrice * stats.dstTaxRate
              const totalAmount = basePrice + dstTax
              const isPaid = enrollment.payment_status === "paid"

              return (
                <Card
                  key={enrollment.id}
                  className={isPaid ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{certification.title}</CardTitle>
                        <CardDescription className="mt-1">
                          Enrolled on{" "}
                          {new Date(enrollment.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge
                          variant="outline"
                          className={
                            enrollment.status === "active"
                              ? "bg-blue-50 text-blue-700 border-blue-300"
                              : enrollment.status === "completed"
                                ? "bg-green-50 text-green-700 border-green-300"
                                : "bg-gray-50 text-gray-700 border-gray-300"
                          }
                        >
                          {enrollment.status}
                        </Badge>
                        <Badge
                          className={
                            isPaid
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-red-600 hover:bg-red-700 text-white"
                          }
                        >
                          {isPaid ? "Paid" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Cost Breakdown */}
                    <div className="bg-white p-4 rounded-lg space-y-2 border">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Program Fee</span>
                        <span className="font-semibold">${basePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">DST Tax (16%)</span>
                        <span className="font-semibold">${dstTax.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total Amount</span>
                        <span className="text-green-600">${totalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Status Message */}
                    {isPaid ? (
                      <Alert className="border-green-300 bg-green-100">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-900 ml-2">
                          ✓ Payment received. Thank you!
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="border-orange-300 bg-orange-100">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-900 ml-2">
                          ⚠️ Payment pending. Email finance@apmih.college to complete payment.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Due Date Info */}
                    {enrollment.due_date && (
                      <div className="text-sm text-muted-foreground bg-white p-3 rounded border">
                        <strong>Due Date:</strong>{" "}
                        {new Date(enrollment.due_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Payment Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Payment Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>To complete your payment for pending enrollments:</p>
          <ol className="list-decimal ml-5 space-y-2">
            <li>
              Email <strong className="font-mono bg-white px-2 py-1 rounded">finance@apmih.college</strong>
            </li>
            <li>Include your full name and email address</li>
            <li>List each certification with the amount due</li>
            <li>Wait for instructions on payment methods</li>
            <li>Send payment confirmation once completed</li>
          </ol>
          <p className="mt-4 text-muted-foreground border-t pt-4">
            <strong>Note:</strong> You can access course materials immediately upon enrollment, but full access requires
            payment within 7 days.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
