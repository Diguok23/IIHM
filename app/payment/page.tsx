"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PaymentForm from "@/components/payment-form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [applicationData, setApplicationData] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const applicationId = searchParams?.get("applicationId")

    if (!applicationId) {
      setError("Application ID is missing. Please return to the application form.")
      setLoading(false)
      return
    }

    // Fetch application data only once when the component mounts or applicationId changes
    let isMounted = true
    const fetchApplicationData = async () => {
      try {
        const response = await fetch(`/api/applications/${applicationId}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch application data")
        }

        const data = await response.json()
        if (isMounted) {
          setApplicationData(data)
        }
      } catch (error) {
        console.error("Error fetching application:", error)
        if (isMounted) {
          setError(error.message || "Failed to load application details")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchApplicationData()

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading payment details...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-16">
          <div className="container mx-auto px-4">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Error</CardTitle>
                <CardDescription>There was a problem loading the payment page</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter>
                <Button onClick={() => router.push("/apply")} className="w-full">
                  Return to Application Form
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
            <p className="text-gray-600">
              Please review your information and complete the payment to finalize your application.
            </p>
          </div>

          {applicationData && (
            <PaymentForm
              applicationId={applicationData.id}
              programName={applicationData.program_name}
              amount={applicationData.program_price || 100} // Default to 100 if price not available
              email={applicationData.email}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
