import { Loader2 } from 'lucide-react'
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-xl">Payment Verification</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p>Loading verification details...</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
