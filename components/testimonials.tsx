import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

export default function Testimonials() {
  const testimonials = [
    {
  name: "Leonardo Martinez",
  role: "Hotel Operations Supervisor, Hilton Doha",
  image: "/images/student-pair.jpeg",
  content:
    "IIHM’s Hospitality Operations Certification reshaped my understanding of service management. The training boosted my confidence and played a key role in securing my position with Hilton.",
  initials: "LM",
    },
    {
  name: "Amina Yusuf",
  role: "Front Office Coordinator, Emirates Palace Abu Dhabi",
  image: "/images/student-woman.jpeg",
  content:
    "The Front Office Excellence Program at IIHM was a turning point in my career. The instructors brought real-life scenarios that prepared me for high-end luxury service environments.",
  initials: "AY",
    },
    {
  name: "Ethan Brooks",
  role: "Resort Guest Experience Manager, Sandals Jamaica",
  image: "/images/student-man.jpeg",
  content:
    "IIHM’s Advanced Guest Experience Certification gave me the skills to elevate guest satisfaction scores at my resort. The coursework was detailed, modern, and industry-focused.",
  initials: "EB",
    },
  ]

  return (
    <section id="testimonials" className="py-16 bg-navy-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Success Stories</h2>
          <p className="mt-4 text-lg max-w-3xl mx-auto text-gray-300">
          Discover inspiring stories from IIHM graduates who’ve elevated their careers in global cruise hospitality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-navy-800 border-none">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="italic">{testimonial.content}</p>
              </CardContent>
              <CardFooter className="flex items-center gap-4 border-t border-navy-700 pt-4">
                <Avatar>
                  <AvatarImage src={testimonial.image || "/placeholder.svg"} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-gray-300">{testimonial.role}</p>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
