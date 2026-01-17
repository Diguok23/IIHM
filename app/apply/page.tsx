import Footer from "@/components/footer"
import ApplicationForm from "@/components/application-form"
import { Suspense } from "react"

export const metadata = {
  title: "Apply Now | International Institute of Hospitality Management (IIHM)",
  description: "Apply for certification programs at the International Institute of Hospitality Management (IIHM).",
}

export default function Apply() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <Suspense fallback={<div className="py-16 text-center">Loading application form...</div>}>
          <ApplicationForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
