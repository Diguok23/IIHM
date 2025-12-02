import { CheckCircle } from "lucide-react"

export default function About() {
  return (
    <section id="about" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-navy-900 mb-6">About APMIH</h2>
            <p className="text-lg mb-6">
              The International Institute of Hospitality Management (IIHM) is a premier global institution
              dedicated to excellence in hospitality education and professional development.
            </p>
            <p className="text-lg mb-6">
              Our mission is to equip students and professionals with the knowledge, skills, and experience required to thrive in the dynamic hospitality industry.
              With an international curriculum, experienced faculty, and strategic industry partnerships, IIHM is committed to nurturing leaders, innovators, and service excellence worldwide.
              At IIHM, we provide world-class training, certifications, and mentorship to shape the next generation of hospitality professionals worldwide.
            </p>
            <div className="space-y-4 mt-8">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2 flex-shrink-0 mt-1" />
                <p>Recognized by top organizations across the global hospitality sector</p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2 flex-shrink-0 mt-1" />
                <p>Curricula designed alongside industry leaders and international cruise brands</p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2 flex-shrink-0 mt-1" />
                <p>Learn from seasoned professionals with real-world hospitality expertise</p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2 flex-shrink-0 mt-1" />
                <p>Study at your pace with both virtual and on-campus training options</p>
              </div>
            </div>
          </div>
          <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
            <img src="/images/campus.jpeg" alt="APMIH Campus" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  )
}
